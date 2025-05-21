import SingleFieldForm from './SingleFieldForm';

import { useToast } from './ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const FormReset = () => {
  const {
    reset,
  } = useAuth();

  const { toast } = useToast();

  const navigate = useNavigate();

  const onSubmit = async (values: Record<string, string>) => {
    try {
      await reset(values);
      navigate('/login');
    } catch (error: any) {
      toast({
        description: error.message,
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
