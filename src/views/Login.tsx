import { Link } from 'react-router-dom';

import FormSignin from '@/components/FormLogin';

const Login = () => {
  return (
    <div className='min-h-screen bg-background'>
      <div className="flex flex-col items-center p-4 mt-24">
        <div className="relative mb-8 w-52 mx-auto">
          <img src="/globe.gif" alt="AMD" className="w-full" />
          <img
            src="../1ASSIST_LOGO.svg"
            alt="AssistMD Logo"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40"
          />
        </div>
        <div className="w-full max-w-md z-10 ">
          <h1
            className="mb-6 text-center font-bold"
            style={{
              fontWeight: 700,
              fontFamily: 'Panchang, Panchang Placeholder, sans-serif',
              color: 'hsl(var(--foreground))',
              fontSize: '28px',
              letterSpacing: '0.06em',
              lineHeight: 1.2,
            }}
          >
            Login
          </h1>

          <FormSignin />
          <div className="flex flex-col gap-2 mt-6">
            <div className=" text-center flex flex-row gap-3 mt-3 text-xs">
              <p className="text-primary font-bold text-xs">Not Registered? </p>
              <Link
                to="/register"
                style={{
                  fontWeight: 900,
                  fontFamily: 'Satoshi, sans-serif',
                  color: 'hsl(var(--ring))',
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                  lineHeight: 1.2,
                }}
              >
                Create an account
              </Link>
            </div>
            <div className="text-center flex flex-row gap-3 mt-3 text-xs">
              <p className="text-primary font-bold">Forgot Password? </p>
              <Link
                to="/reset"
                style={{
                  fontWeight: 900,
                  fontFamily: 'Satoshi, sans-serif',
                  color: 'hsl(var(--ring))',
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                  lineHeight: 1.2,
                }}
              >
                Reset password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
