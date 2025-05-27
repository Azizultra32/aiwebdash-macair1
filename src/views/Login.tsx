import { Link } from 'react-router-dom';
import FormSignin from '@/components/FormLogin';

const Login = () => {
  return (
    <div className='min-h-screen bg-background'>
      <div className="flex flex-col items-center p-4 mt-24">
        <div className="relative mb-8 w-52 mx-auto">
          <img src="/globe.gif" alt="AMD" className="w-full" />
        </div>
        <div className="flex flex-col items-center">
          <h1 className="mb-6 text-center font-heading font-bold text-foreground text-[28px] tracking-[0.06em] leading-[1.2]">
            Welcome Back
          </h1>
          <FormSignin />
          <div className="flex flex-col gap-2 mt-6">
            <div className=" text-center flex flex-row gap-3 mt-3 text-xs">
              <p className="text-primary font-bold text-xs">Not Registered? </p>
              <Link
                to="/register"
                className="font-sans font-black text-ring text-[12px] tracking-[0.04em] leading-[1.2]"
              >
                Register Now
              </Link>
            </div>
            <div className="text-center flex flex-row gap-3 mt-3 text-xs">
              <p className="text-primary font-bold">Forgot Password? </p>
              <Link
                to="/reset"
                className="font-sans font-black text-ring text-[12px] tracking-[0.04em] leading-[1.2]"
              >
                Reset Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;