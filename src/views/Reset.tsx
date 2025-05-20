import { Link } from 'react-router-dom';

import FormReset from '@/components/FormReset';

const Reset = () => {
  return (
    <div className="h-screen grid content-center">
      <div className="container max-w-md">
        <h1 className="text-3xl mb-8 font-semibold">Reset your password</h1>
        <FormReset />
        <p className="mt-8">
          Want to login again?{' '}
          <Link to="/" className="text-blue-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Reset;
