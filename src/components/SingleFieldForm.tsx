import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface SingleFieldFormProps {
  fieldName: string;
  label: string;
  type: string;
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
}

const SingleFieldForm = ({ fieldName, label, type, onSubmit }: SingleFieldFormProps) => {
  const schema = type === 'email' ? z.string().email() : z.string();
  const formSchema = z.object({ value: schema });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { value: '' },
  });

  const { isSubmitting } = useFormState({ control: form.control });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit({ [fieldName]: values.value });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} type={type} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default SingleFieldForm;
