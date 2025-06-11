import supabase from '@/supabase';
import { logger } from '@/utils/logger';
import { isError } from '@/utils/error';
import { LoginData, UserData, PasswordData } from '@/types/types';
import { User, Session } from '@supabase/supabase-js';
import { UseQueryResult, UseMutationResult, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

interface AuthContextType {
  /** login mutation returned from useMutation */
  login: UseMutationResult<{ user: User | null; session: Session | null }, Error, { phone: string; password: string }>;
  /** register mutation returned from useMutation */
  register: UseMutationResult<{ user: User | null; session: Session | null }, Error, LoginData>;
  /** logout the current user */
  logout: () => Promise<void>;
  /** currently logged in user */
  getUser: UseQueryResult<User | null, unknown>;
  /** request password reset */
  reset: (data: UserData) => Promise<void>;
  /** change the current user's password */
  changePassword: (data: PasswordData) => Promise<void>;
  signUpWithPhone: (
    phone: string,
    password: string,
  ) => Promise<{
    user: User | null;
    session: Session | null;
  }>;
  verifyOtp: (
    phone: string,
    token: string,
  ) => Promise<{
    user: User | null;
    session: Session | null;
  }>;
  resendOtp: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  login: {} as UseMutationResult<
    { user: User | null; session: Session | null },
    Error,
    { phone: string; password: string }
  >,
  register: {} as UseMutationResult<{ user: User | null; session: Session | null }, Error, LoginData>,
  logout: async () => {},
  getUser: {} as UseQueryResult<User | null, unknown>,
  reset: async () => {},
  changePassword: async () => {},
  signUpWithPhone: () => Promise.resolve({ user: null, session: null }),
  verifyOtp: () => Promise.resolve({ user: null, session: null }),
  resendOtp: () => Promise.resolve(),
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }: Props) => {
  const queryClient = useQueryClient();
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  const getUser = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      if (isDemoMode) {
        // Return a demo user in demo mode
        return {
          id: 'demo-user-id',
          email: 'demo@assistmd.ai',
          phone: '+1234567890',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: { name: 'Demo User' },
        } as User;
      }
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const login = useMutation<{ user: User | null; session: Session | null }, Error, { phone: string; password: string }>(
    {
      mutationFn: async (credentials: { phone: string; password: string }) => {
        if (isDemoMode) {
          // Simulate login delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          const demoUser = {
            id: 'demo-user-id',
            email: 'demo@assistmd.ai',
            phone: credentials.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            aud: 'authenticated',
            role: 'authenticated',
            app_metadata: {},
            user_metadata: { name: 'Demo User' },
          } as User;

          const demoSession = {
            access_token: 'demo-access-token',
            refresh_token: 'demo-refresh-token',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: demoUser,
          } as Session;

          // Update query cache with demo user
          queryClient.setQueryData(['user'], demoUser);

          return { user: demoUser, session: demoSession };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          phone: credentials.phone,
          password: credentials.password,
        });

        if (error) throw error;
        return data;
      },
    },
  );

  const register = useMutation<{ user: User | null; session: Session | null }, Error, LoginData>(
    async ({ email, password }: LoginData) => {
      if (isDemoMode) {
        // Simulate registration delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demoUser = {
          id: 'demo-user-id',
          email: email,
          phone: '+1234567890',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: { name: 'Demo User' },
        } as User;

        const demoSession = {
          access_token: 'demo-access-token',
          refresh_token: 'demo-refresh-token',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: demoUser,
        } as Session;

        // Update query cache with demo user
        queryClient.setQueryData(['user'], demoUser);

        return { user: demoUser, session: demoSession };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
  );

  const logout = async () => {
    if (isDemoMode) {
      // Clear demo user from cache
      queryClient.setQueryData(['user'], null);
      queryClient.removeQueries();
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const reset = async ({ email }: UserData) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://app.assistmd.ai/password',
    });
    if (error) throw error;
  };

  const changePassword = async ({ password }: PasswordData) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const signUpWithPhone = async (phone: string, password: string) => {
    try {
      logger.debug('Starting new phone signup process...');

      await supabase.auth.signOut();
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');

      await new Promise((resolve) => setTimeout(resolve, 1000));

      logger.debug('Attempting signup', { phone });

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: { phone_confirmed: false },
        },
      });

      logger.debug('Signup response', { signUpData, signUpError });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          const { data: sessionData } = await supabase.auth.getSession();
          const isPhoneConfirmed = sessionData?.session?.user?.phone_confirmed_at;

          if (isPhoneConfirmed) {
            throw new Error('already registered');
          }
        }
      }

      logger.debug('Attempting to send OTP...');
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: false,
        },
      });

      logger.debug('OTP response', { otpError });

      if (otpError?.status === 429) {
        throw new Error('RATE_LIMIT_BUT_SENT');
      } else if (otpError) {
        throw otpError;
      }

      return signUpData;
    } catch (error: unknown) {
      if (isError(error)) {
        console.error('Final error:', error);
      } else {
        console.error('Unknown final error', error);
      }
      throw error as Error;
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    try {
      logger.debug('Starting OTP verification...');

      // Clear existing session
      await supabase.auth.signOut();
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');

      // Wait for cleanup
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error) {
        console.error('OTP verification error:', error);
        throw error;
      }

      if (!data.session) {
        throw new Error('No session created after OTP verification');
      }

      // Set new session
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      // Update query cache
      queryClient.setQueryData(['user'], data.session.user);

      return data;
    } catch (error: unknown) {
      if (isError(error)) {
        console.error('Final verification error:', error);
      } else {
        console.error('Unknown final verification error', error);
      }
      throw error as Error;
    }
  };

  const resendOtp = async (phone: string) => {
    try {
      logger.debug('Starting OTP resend...');

      // Clear existing session
      await supabase.auth.signOut();
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');

      // Wait for cleanup
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: false,
          captchaToken: undefined,
        },
      });

      if (error) {
        console.error('Resend OTP error:', error);
        throw error;
      }
    } catch (error: unknown) {
      if (isError(error)) {
        console.error('Final resend error:', error);
      } else {
        console.error('Unknown final resend error', error);
      }
      throw error as Error;
    }
  };

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        queryClient.setQueryData(['user'], session?.user);
      } else if (event === 'SIGNED_OUT') {
        queryClient.removeQueries();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        login,
        register,
        logout,
        getUser,
        reset,
        changePassword,
        signUpWithPhone,
        verifyOtp,
        resendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
