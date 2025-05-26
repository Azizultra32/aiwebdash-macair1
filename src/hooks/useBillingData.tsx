import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/supabase';
import { toast } from '@/components/ui/use-toast';

export interface Plan {
  id: number;
  name: string;
  description: string;
  features: {
    line1: string;
    line2: string;
    features_new: string[];
    features_old: string[];
  };
  is_active: boolean;
  permissions: string;
  monthly_price: string;
  monthly_price_id: string;
  yearly_price: string;
  yearly_price_id: string;
}

export interface UserSubscription {
  id: number;
  user_id: string;
  plan_id: number;
  stripe_subscription_id: string;
  status: string;
  current_period_end: string;
}

export default function useBillingData() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const [plansResponse, subscriptionResponse] = await Promise.all([
        supabase.from('Plans').select('*'),
        supabase
          .from('UserSubscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single(),
      ]);

      if (plansResponse.error) throw plansResponse.error;
      if (subscriptionResponse.error && subscriptionResponse.error.code !== 'PGRST116') {
        throw subscriptionResponse.error;
      }

      setPlans(plansResponse.data);
      setCurrentSubscription(subscriptionResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load billing information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    plans,
    currentSubscription,
    loading,
    fetchData,
  };
}
