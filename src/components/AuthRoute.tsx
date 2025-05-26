import { Outlet } from 'react-router-dom';
import { logger } from '@/utils/logger';

// This is a modified version of AuthRoute that bypasses authentication for development purposes
const AuthRoute = () => {
  logger.info('Development mode: Authentication bypassed');
  
  // Always render the protected routes without checking authentication
  return <Outlet />;
};

export default AuthRoute;
