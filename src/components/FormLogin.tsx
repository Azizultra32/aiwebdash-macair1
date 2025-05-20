import { useEffect, useState } from 'react';
import { useForm, useFormState, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getCountryCallingCode } from 'libphonenumber-js';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from './ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const countryCodeRegex = /^\+\d{1,4}$/;

const formSchema = z.object({
  countryCode: z
    .string()
    .regex(countryCodeRegex, 'Invalid country code. Format: +X to +XXXX'),
  phone: z
    .string()
    .min(10, 'Invalid phone number. Must be at least 10 digits.'),
  password: z.string(),
});

const FormLogin = () => {
  const {
    login: { mutateAsync: login },
  } = useAuth();

  const navigate = useNavigate();
  const { toast } = useToast();
  const [detectedCountryCode, setDetectedCountryCode] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      countryCode: '',
      phone: '',
      password: '',
    },
  });

  const { isSubmitting } = useFormState({
    control: form.control,
  });

  useEffect(() => {
    const detectCountryCode = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = getCountryCallingCode(data.country_code);
        setDetectedCountryCode(`+${countryCode}`);
        form.setValue('countryCode', `+${countryCode}`);
      } catch (error) {
        console.error('Error detecting country code:', error);
      }
    };

    detectCountryCode();
  }, [form]);

  useEffect(() => {
    const savedCredentials = localStorage.getItem('loginCredentials');
    if (savedCredentials) {
      const { phone, password } = JSON.parse(savedCredentials);
      const countryCode = phone.slice(0, phone.length - 10);
      const phoneNumber = phone.slice(-10);
      form.setValue('countryCode', countryCode);
      form.setValue('phone', phoneNumber);
      form.setValue('password', password);
      localStorage.removeItem('loginCredentials');
    }
  }, [form]);

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  };

  const unformatPhoneNumber = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const fullPhone = `${values.countryCode}${values.phone}`;
      await login({ phone: fullPhone, password: values.password });
      navigate('/');
    } catch (error: any) {
      toast({
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="flex space-x-2">
          <FormField
            control={form.control}
            name="countryCode"
            render={({ field }) => (
              <FormItem className="flex-shrink-0 w-24">
                <p
                  style={{
                    fontWeight: 900,
                    fontFamily: 'Satoshi", sans-serif',
                    fontSize: '12px',
                    letterSpacing: '0.04em',
                    lineHeight: 1.2,
                  }}
                >
                  Code
                </p>
                <FormControl>
                  <Input className="text-black" placeholder="+1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <p
                  style={{
                    fontWeight: 900,
                    fontFamily: 'Satoshi", sans-serif',
                    fontSize: '12px',
                    letterSpacing: '0.04em',
                    lineHeight: 1.2,
                  }}
                >
                  Phone
                </p>
                <FormControl>
                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="(123) 456-7890"
                        value={formatPhoneNumber(field.value)}
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          const unformatted = unformatPhoneNumber(formatted);
                          field.onChange(unformatted);
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
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <p
                style={{
                  fontWeight: 900,
                  fontFamily: 'Satoshi", sans-serif',
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                  lineHeight: 1.2,
                }}
              >
                Password
              </p>
              <FormControl>
                <Input placeholder="" {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            fontWeight: 900,
            fontFamily: 'Satoshi", sans-serif',
            fontSize: '16px',
            letterSpacing: '0.04em',
            lineHeight: 1.2,
          }}
          className="w-full bg-[#20226D] text-white text-center m-4 p-2 -ml-[2px] rounded-md h-12 mt-4"
        >
          Submit
        </button>
      </form>
    </Form>
  );
};

export default FormLogin;
