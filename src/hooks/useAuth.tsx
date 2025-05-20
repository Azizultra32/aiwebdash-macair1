import supabase from '@/supabase';
import { LoginData, UserData, PasswordData } from '@/types/types';
import { User, Session } from '@supabase/supabase-js';
import { UseQueryResult, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect } from 'react';

type Props = {
  children: React.ReactNode;
};

type AuthContextType = {
  login: any;
  register: any;
  logout: any;
  getUser: UseQueryResult<User | null, unknown>;
  reset: any;
  changePassword: any;
  signUpWithPhone: (phone: string, password: string) => Promise<{
    user: User | null;
    session: Session | null;
  }>;
  verifyOtp: (phone: string, token: string) => Promise<{
    user: User | null;
    session: Session | null;
  }>;
  resendOtp: (phone: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  login: () => {},
  register: () => {},
  logout: () => {},
  getUser: {} as UseQueryResult<User | null, unknown>,
  reset: () => {},
  changePassword: () => {},
  signUpWithPhone: () => Promise.resolve({ user: null, session: null }),
  verifyOtp: () => Promise.resolve({ user: null, session: null }),
  resendOtp: () => Promise.resolve(),
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }: Props) => {
  const queryClient = useQueryClient();

  const getUser = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const login = useMutation({
    mutationFn: async (credentials: { phone: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: credentials.phone,
        password: credentials.password,
      });

      if (error) throw error;
      return data;
    }
  });

  const register = useMutation(async ({ email, password }: LoginData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  });

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const reset = async ({ email }: UserData) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://app.assistmd.ai/password'
    });
    if (error) throw error;
  };

  const changePassword = async ({ password }: PasswordData) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const signUpWithPhone = async (phone: string, password: string) => {
    try {
      console.log("Starting new phone signup process...");
      
      await supabase.auth.signOut();
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Attempting signup for:", phone);
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: { phone_confirmed: false }
        }
      });
      
      console.log("Signup response:", { signUpData, signUpError });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          const { data: sessionData } = await supabase.auth.getSession();
          const isPhoneConfirmed = sessionData?.session?.user?.phone_confirmed_at;
          
          if (isPhoneConfirmed) {
            throw new Error('already registered');
          }
        }
      }

      console.log("Attempting to send OTP...");
      const { error: otpError } = await supabase.auth.signInWithOtp({ 
        phone,
        options: {
          shouldCreateUser: false
        }
      });
      
      console.log("OTP response:", { otpError });
      
      if (otpError?.status === 429) {
        throw new Error('RATE_LIMIT_BUT_SENT');
      } else if (otpError) {
        throw otpError;
      }
      
      return signUpData;
    } catch (error: any) {
      console.error("Final error:", error);
      throw error;
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    try {
      console.log("Starting OTP verification...");
      
      // Clear existing session
      await supabase.auth.signOut();
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      });

      if (error) {
        console.error("OTP verification error:", error);
        throw error;
      }

      if (!data.session) {
        throw new Error('No session created after OTP verification');
      }

      // Set new session
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });

      // Update query cache
      queryClient.setQueryData(['user'], data.session.user);

      return data;
    } catch (error: any) {
      console.error("Final verification error:", error);
      throw error;
    }
  };

  const resendOtp = async (phone: string) => {
    try {
      console.log("Starting OTP resend...");
      
      // Clear existing session
      await supabase.auth.signOut();
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { error } = await supabase.auth.signInWithOtp({ 
        phone,
        options: {
          shouldCreateUser: false,
          captchaToken: undefined
        }
      });
      
      if (error) {
        console.error("Resend OTP error:", error);
        throw error;
      }
    } catch (error: any) {
      console.error("Final resend error:", error);
      throw error;
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
    <AuthContext.Provider value={{
      login,
      register,
      logout,
      getUser,
      reset,
      changePassword,
      signUpWithPhone,
      verifyOtp,
      resendOtp,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;