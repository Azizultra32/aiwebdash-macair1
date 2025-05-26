import SingleFieldForm from './SingleFieldForm';

import { useToast } from './ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const FormChangePassword = () => {
  const {
    changePassword
  } = useAuth();

  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (values: Record<string, string>) => {
    try {
      await changePassword(values);
      navigate('/');
    } catch (error: any) {
      toast({
        description: error.message,
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
