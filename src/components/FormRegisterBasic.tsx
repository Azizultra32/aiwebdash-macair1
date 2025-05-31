import { useEffect, useState } from 'react';
import { useForm, useFormState, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getCountryCallingCode } from 'libphonenumber-js';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from './ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import supabase from '@/supabase';
import { logger } from '@/utils/logger';
import { isError } from '@/utils/error';

const formSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  countryCode: z.string().regex(/^\+\d{1,4}$/),
  phone: z.string().regex(/^\d{10}$/),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, { message: 'OTP must be 6 digits' })
    .max(6, { message: 'OTP must be 6 digits' })
    .regex(/^\d+$/, { message: 'OTP must contain only numbers' }),
});

const FormRegisterBasic = () => {
  const [showOtp, setShowOtp] = useState(false);
  const { signUpWithPhone, verifyOtp, resendOtp } = useAuth();
  const [detectedCountryCode, setDetectedCountryCode] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isRequestCooling, setIsRequestCooling] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState(0);

  const registrationForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      countryCode: '',
      phone: '',
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
    mode: 'onBlur',
    reValidateMode: 'onSubmit',
  });

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleRegistrationSubmit = async (values: z.infer<typeof formSchema>) => {
    const phoneNumber = `${values.countryCode}${values.phone}`;
    logger.debug('Starting registration', {
      phone: phoneNumber,
      email: values.email,
    });

    try {
      await signUpWithPhone(phoneNumber, values.password);

      const registrationData = {
        phone: phoneNumber,
        password: values.password,
        email: values.email,
      };
      logger.debug('Storing registration data', registrationData);

      localStorage.setItem('registrationData', JSON.stringify(registrationData));

      setShowOtp(true);
      setOtpTimer(60);
      setCanResend(false);

      toast({
        title: 'Code Sent',
        description: 'Check your phone for the verification code',
      });
    } catch (error: unknown) {
      if (isError(error)) {
        console.error('Registration error:', error);
      } else {
        console.error('Unknown registration error', error);
      }

      // Special case: rate limit error but OTP was sent
      if (isError(error) && error.message === 'RATE_LIMIT_BUT_SENT') {
        localStorage.setItem(
          'registrationData',
          JSON.stringify({
            phone: phoneNumber,
            password: values.password,
            email: values.email,
          }),
        );

        setShowOtp(true);
        setOtpTimer(60);
        setCanResend(false);

        toast({
          title: 'Code Sent',
          description: 'Code was sent successfully. Please enter it below.',
        });
        return; // Exit early since we want to proceed with OTP verification
      }

      if (isError(error) && error.message.includes('already registered')) {
        toast({
          title: 'Account Exists',
          description: 'This phone number is already registered. Please login instead.',
          action: (
            <Button variant="outline" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          ),
        });
      } else if (isError(error) && error.message.includes('rate limit')) {
        toast({
          title: 'Please Wait',
          description: 'Please wait a few minutes before trying again',
          variant: 'destructive',
        });
      } else {
        toast({
          description: isError(error) ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
      }
    }
  };

  const handleOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    try {
      const registrationData = localStorage.getItem('registrationData');
      if (!registrationData) throw new Error('Registration data not found');

      const { phone, email, password } = JSON.parse(registrationData);
      logger.debug('Retrieved registration data', { phone, email });

      const result = await verifyOtp(phone, values.otp);

      if (result.session) {
        // Store phone and password for login
        const loginCredentials = {
          phone: phone, // Use phone instead of email
          password: password,
        };
        logger.debug('Storing login credentials');

        localStorage.setItem('loginCredentials', JSON.stringify(loginCredentials));

        // Clean up registration data
        localStorage.removeItem('registrationData');

        toast({
          title: 'Success',
          description: 'Phone verified successfully',
        });

        // Add a small delay to ensure storage is complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Log right before navigation to verify data is still in localStorage
        const savedLoginCredentials = localStorage.getItem('loginCredentials');
        logger.debug('Final login credentials stored', { present: !!savedLoginCredentials });

        navigate('/login');
      }
    } catch (error: unknown) {
      const isExpired = isError(error)
        ? error.message.toLowerCase().includes('expired')
        : false;

      if (isError(error)) {
        console.error('OTP submission error:', error);
      } else {
        console.error('Unknown OTP submission error', error);
      }

      toast({
        title: isExpired ? 'Code Expired' : 'Invalid Code',
        description: isExpired ? 'Request new code' : 'Try again',
        variant: 'destructive',
        action: isExpired ? (
          <Button variant="outline" onClick={handleResendCode}>
            Resend Code
          </Button>
        ) : undefined,
      });
    }
  };

  const handleResendCode = async () => {
    try {
      const registrationData = localStorage.getItem('registrationData');
      if (!registrationData) throw new Error('Phone number not found');

      const { phone } = JSON.parse(registrationData);

      await resendOtp(phone); // Send OTP
      setOtpTimer(60); // Reset OTP timer
      setCanResend(false); // Disable resend button temporarily

      // Start cooldown only after successful OTP resend
      setIsRequestCooling(true);
      setCooldownTimer(4);

      toast({
        title: 'Code Sent',
        description: 'New verification code sent to your phone',
      });
    } catch (error: unknown) {
      toast({
        description: isError(error) ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleReset = async () => {
    await cleanupAuthState();

    registrationForm.reset({
      name: '',
      email: '',
      password: '',
      countryCode: detectedCountryCode,
      phone: '',
    });

    setShowOtp(false);
    setOtpTimer(60);
    setCanResend(false);

    toast({
      title: 'Form Reset',
      description: 'All fields have been cleared',
    });
  };

  const cleanupAuthState = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('registrationData');
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      setIsRequestCooling(false);
      setCooldownTimer(0);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  useEffect(() => {
    const detectCountryCode = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const code = `+${getCountryCallingCode(data.country_code)}`;
        setDetectedCountryCode(code);
        registrationForm.setValue('countryCode', code);
      } catch (error) {
        console.error('Error detecting country code:', error);
      }
    };
    detectCountryCode();
  }, [registrationForm]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (showOtp && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showOtp, otpTimer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRequestCooling && cooldownTimer > 0) {
      interval = setInterval(() => {
        setCooldownTimer((prev) => {
          if (prev <= 1) {
            setIsRequestCooling(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRequestCooling, cooldownTimer]);

  useEffect(() => {
    return () => {
      cleanupAuthState();
    };
  }, []);

  return (
    <>
      <Form {...registrationForm}>
        <form
          onSubmit={registrationForm.handleSubmit(handleRegistrationSubmit)}
          className="space-y-3"
          style={{ display: showOtp ? 'none' : 'block' }}
        >
          <FormField
            control={registrationForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={registrationForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your email" {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex space-x-2">
            <FormField
              control={registrationForm.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem className="flex-shrink-0 w-16">
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="+1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registrationForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Controller
                      name="phone"
                      control={registrationForm.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="(123) 456-7890"
                          value={formatPhoneNumber(field.value)}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted.replace(/\D/g, ''));
                          }}
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={registrationForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex space-x-2">
            <Button type="submit" disabled={registrationForm.formState.isSubmitting || isRequestCooling}>
              {isRequestCooling ? `Wait ${cooldownTimer}s...` : 'Submit'}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset Form
            </Button>
          </div>
        </form>
      </Form>

      <Form {...otpForm}>
        <form
          onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
          className="space-y-3"
          style={{ display: !showOtp ? 'none' : 'block' }}
        >
          <FormField
            control={otpForm.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OTP</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    {...field}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                    onBlur={(e) => {
                      if (e.target.value.length === 6) {
                        field.onBlur();
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-sm text-gray-500 mt-2">
            {otpTimer > 0 ? (
              <span>Resend code in {otpTimer}s</span>
            ) : (
              <Button
                type="button"
                variant="link"
                onClick={handleResendCode}
                disabled={!canResend}
                className="p-0 h-auto font-normal"
              >
                Resend code
              </Button>
            )}
          </div>

          <Button type="submit" disabled={!otpForm.formState.isValid || otpForm.formState.isSubmitting}>
            {otpForm.formState.isSubmitting
              ? 'Verifying...'
              : otpForm.formState.isValid
                ? 'Verify OTP'
                : 'Enter 6-digit code'}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default FormRegisterBasic;
