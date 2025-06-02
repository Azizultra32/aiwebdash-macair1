import { useEffect } from 'react';
import { useForm, useFormState, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { useDetectCountryCode } from '@/hooks/useDetectCountryCode';
import { formatPhoneNumber, unformatPhoneNumber } from '@/utils/phone';
import { isError } from '@/utils/error';

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      countryCode: '',
      phone: '',
      password: '',
    },
  });

  // const detectedCodeFromHook = useDetectCountryCode((code) => form.setValue('countryCode', code)); // Old way
  const detectedCodeFromHook = useDetectCountryCode();

  useEffect(() => {
    if (detectedCodeFromHook) {
      form.setValue('countryCode', detectedCodeFromHook, { shouldValidate: true });
    } else {
      // If hook returns empty (initial or error) and form field is empty, set default
      if (!form.getValues('countryCode')) {
        form.setValue('countryCode', '+1', { shouldValidate: true });
      }
    }
  }, [detectedCodeFromHook, form]);

  const { isSubmitting } = useFormState({
    control: form.control,
  });


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


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const fullPhone = `${values.countryCode}${values.phone}`;
      await login({ phone: fullPhone, password: values.password });
      navigate('/');
    } catch (error: unknown) {
      toast({
        description: isError(error) ? error.message : 'An unknown error occurred',
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
                <p className="font-bold text-xs tracking-[0.04em] leading-[1.2]">
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
                <p className="font-bold text-xs tracking-[0.04em] leading-[1.2]">
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
              <p className="font-bold text-xs tracking-[0.04em] leading-[1.2]">
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
          className="w-full bg-primary text-primary-foreground text-center m-4 p-2 -ml-[2px] rounded-md h-12 mt-4 font-bold text-base tracking-[0.04em] leading-[1.2]"
        >
          Submit
        </button>
      </form>
    </Form>
  );
};

export default FormLogin;
