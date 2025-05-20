import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';

const formSchema = z.object({
  patient_code: z.string(),
  language: z.string(),
});

const formProps = z.object({
  patient_code: z.string(),
  status: z.string(),
  onUpdate: z.function(z.tuple([z.string(), z.string()])),
  disabled: z.boolean(),
})

const FormCreateTranscript = (props: z.infer<typeof formProps>) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_code: props.patient_code,
      language: 'auto',
    },
  });

  useEffect(() => {
    form.reset({
      patient_code: props.patient_code,
      language: form.getValues('language'),
    });
  }, [props.patient_code]);

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="patient_code"
          render={({ field }) => (
            <FormItem>
              <div className="relative">
                <FormControl>
                  <Input defaultValue={props.patient_code} maxLength={12} placeholder="New Patient Label" {...field} onKeyUp={() => props.onUpdate(field.value, form.getValues('language'))} disabled={props.disabled} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grow min-h-0 flex justify-center items-center">
          <span>{props.status}</span>
          <span className="grow"></span>
          {/*
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <div>
                  <FormControl>
                    <select {...field} onMouseUp={() => props.onUpdate(form.getValues('patient_code'), form.getValues('language'))}>
                      <option value="auto">All Languages</option>
                      <option value="en">English</option>
                    </select>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
            */}
        </div>
      </form>
    </Form>
  );
};

export default FormCreateTranscript;
