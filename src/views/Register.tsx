import { Link } from 'react-router-dom';
import FormRegisterBasic from '@/components/FormRegisterBasic';

const Register = () => {
  return (
    <div className="h-screen grid content-center">
      <div className="container max-w-md">
        <h1 className="text-3xl mb-8 font-semibold">Create an account</h1>
        <FormRegisterBasic />
        <p className="mt-8">
          Already have an account?{' '}
          <Link to="/" className="text-blue-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
