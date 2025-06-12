import SingleFieldForm from './SingleFieldForm';

import { useToast } from './ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { isError } from '@/utils/error';
import type { UserData } from '@/types/types';

const FormReset = () => {
  const {
    reset,
  } = useAuth();

  const { toast } = useToast();

  const navigate = useNavigate();

  const onSubmit = async (values: Record<string, string>) => {
    try {
      await reset(values as unknown as UserData);
      navigate('/login');
    } catch (error: unknown) {
      toast({
        description: isError(error) ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <SingleFieldForm
      fieldName="email"
      label="Email"
      type="email"
      onSubmit={onSubmit}
    />
  );
};

export default FormReset;
