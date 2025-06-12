import SingleFieldForm from './SingleFieldForm';

import { useToast } from './ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { isError } from '@/utils/error';
import type { PasswordData } from '@/types/types';

const FormChangePassword = () => {
  const {
    changePassword
  } = useAuth();

  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (values: Record<string, string>) => {
    try {
      await changePassword(values as unknown as PasswordData);
      navigate('/');
    } catch (error: unknown) {
      toast({
        description: isError(error) ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <SingleFieldForm
      fieldName="password"
      label="Password"
      type="password"
      onSubmit={onSubmit}
    />
  );
};

export default FormChangePassword;
