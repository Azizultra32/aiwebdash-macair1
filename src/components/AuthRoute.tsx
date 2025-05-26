import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import supabase from '@/supabase';
import { logger } from '@/utils/logger';

/**
 * Route guard that checks for an active Supabase session.
 * When the VITE_BYPASS_AUTH environment variable is truthy
 * authentication is skipped entirely.
 */
const AuthRoute = () => {
  // Development helper to bypass authentication.
  if (import.meta.env.VITE_BYPASS_AUTH) {
    logger.info('Authentication bypassed');
    return <Outlet />;
  }

  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setIsAuthenticated(Boolean(data.session));
      } catch (error) {
        logger.error('Failed to fetch auth session', error);
      } finally {
        setLoading(false);
      }
    };

    void checkSession();
  }, []);

  if (loading) return null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthRoute;
