import { Link } from 'react-router-dom';

import FormChangePassword from '@/components/FormChangePassword';

const ChangePassword = () => {
  return (
    <div className="h-screen grid content-center">
      <div className="container max-w-md">
        <h1 className="text-3xl mb-8 font-semibold">Choose new password</h1>
        <FormChangePassword />
        <p className="mt-8">
          Try to login again?{' '}
          <Link to="/" className="text-blue-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
