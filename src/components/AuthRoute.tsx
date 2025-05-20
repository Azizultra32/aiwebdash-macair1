import { Outlet } from 'react-router-dom';

// This is a modified version of AuthRoute that bypasses authentication for development purposes
const AuthRoute = () => {
  console.log('Development mode: Authentication bypassed');
  
  // Always render the protected routes without checking authentication
  return <Outlet />;
};

export default AuthRoute;
