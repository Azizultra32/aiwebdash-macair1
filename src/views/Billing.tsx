import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '@/supabase';
import { toast } from '@/components/ui/use-toast';
import { Loading } from '@/components/Loading';
import DashboardLayout from '@/components/DashboardLayout';
import { useMediaQuery } from 'usehooks-ts';
import PricingCard from '@/components/PricingCard';
// import { useGlobalState } from '@/context/GlobalStateContext';
import { getStripe } from '@/lib/stripe';

interface Plan {
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

interface UserSubscription {
  id: number;
  user_id: string;
  plan_id: number;
  stripe_subscription_id: string;
  status: string;
  current_period_end: string;
}

const Billing = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  // const { state } = useGlobalState();
  // const mapid = useId();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // const TRIAL_LIMIT = 105;
  // const transcriptCount = state.clientTranscripts?.length || 0;
  // const isTrialLimitReached = transcriptCount >= TRIAL_LIMIT;

  const toggleSidebar = useCallback(() => {
    // Empty function since sidebar is always hidden in billing
  }, []);

  const handleSubscribe = async (planId: number, priceId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const response = await fetch(
        'https://ooctgxeqdjvscpdcqvan.supabase.co/functions/v1/stripe-checkout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': import.meta.env.VITE_APP_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            priceId,
            userId: user.id,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Checkout error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const { sessionId, error } = await response.json();
      if (error) throw new Error(error);

      const stripe = await getStripe();
      const { error: stripeError } = await stripe!.redirectToCheckout({ sessionId });
      
      if (stripeError) {
        throw stripeError;
      }
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate checkout',
        variant: 'destructive',
      });
    }
  };

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
      if (
        subscriptionResponse.error &&
        subscriptionResponse.error.code !== 'PGRST116'
      ) {
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

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');
    const error = queryParams.get('error');

    if (status === 'success') {
      toast({
        title: 'Success',
        description: 'Your subscription has been updated successfully!',
      });
    } else if (status === 'pending') {
      toast({
        title: 'Pending',
        description: 'Your payment is being processed.',
      });
    } else if (error) {
      toast({
        title: 'Error',
        description: `There was an error processing your subscription: ${error}`,
        variant: 'destructive',
      });
    }
  }, [location.search]);

  // Check for successful payment
  useEffect(() => {
    const checkPaymentSuccess = async () => {
      const searchParams = new URLSearchParams(location.search);
      const success = searchParams.get('success');
      
      if (success === 'true') {
        // Clear the URL parameters
        navigate('/billing', { replace: true });
        
        // Force reload the page to refresh subscription status
        window.location.reload();
      }
    };

    checkPaymentSuccess();
  }, [location, navigate]);

  if (loading) {
    return <Loading />;
  }

  const PLANS_CARD_HEIGHT_COLORS: { [key: string]: string } = {
    'SOAP Supreme': 'md:h-[80%] h-full bg-black text-white',
    'SOAP Supreme: Multi-Lingual': 'md:h-[90%]  h-full bg-white text-black',
    'ASSIST ULTRA': 'md:h-full bg-blue-600  h-full text-white',
  };

  const billingContent = (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ marginLeft: 0 }}>
      <h1
        className="mt-100000 font-normal text-black text-3xl sm:text-4xl md:text-[40px] leading-tight sm:leading-[1.1] text-center mb-10 sm:mb-20"
        style={{
          fontFamily: '"Alata", "Alata Placeholder", sans-serif',
          letterSpacing: '0em',
        }}
      >
        Your SuperPowers Await.
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 my-8 min-h-[800px] place-items-center mx-auto">
        {plans
          .filter((plan) => plan.is_active)
          .map((plan) => (
            <div key={plan.id} className="flex items-end h-full w-full">
              <PricingCard
                key={plan.id}
                name={plan.name}
                level={plan.features?.line1 || ''}
                className={PLANS_CARD_HEIGHT_COLORS[plan.name]}
                description={plan.description || ''}
                price={parseFloat(
                  billingCycle === 'monthly'
                    ? plan.monthly_price
                    : plan.yearly_price || '0'
                )}
                features={
                  plan.features
                    ? [
                      ...(plan.features.features_new || []),
                      ...(plan.features.features_old || []),
                    ]
                    : ['No features listed']
                }
                isAnnual={billingCycle === 'annually'}
                onSubscribe={() =>
                  handleSubscribe(
                    plan.id,
                    billingCycle === 'annually'
                      ? plan.yearly_price_id
                      : plan.monthly_price_id
                  )
                }
                currentPlan={currentSubscription?.plan_id === plan.id}
              />
            </div>
          ))}
      </div>

      <div className="flex justify-center items-center mb-8">
        <div className="flex items-center space-x-2 bg-gray-200 rounded-full p-1">
          <label
            className={`px-3 sm:px-4 py-2 rounded-full cursor-pointer text-sm sm:text-base ${billingCycle === 'annually'
                ? 'bg-black text-white'
                : 'text-gray-700'
              }`}
          >
            <input
              type="radio"
              value="annually"
              checked={billingCycle === 'annually'}
              onChange={() => setBillingCycle('annually')}
              className="sr-only"
            />
            Annually
          </label>
          <label
            className={`px-3 sm:px-4 py-2 rounded-full cursor-pointer text-sm sm:text-base ${billingCycle === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'text-gray-700'
              }`}
          >
            <input
              type="radio"
              value="monthly"
              checked={billingCycle === 'monthly'}
              onChange={() => setBillingCycle('monthly')}
              className="sr-only"
            />
            Monthly
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout
      showSidebar={false}
      isDesktop={isDesktop}
      sidebar={<div></div>}
      recording={false}
      toggleSidebar={toggleSidebar}
    >
      <div className="w-full flex justify-center">
        {billingContent}
      </div>
    </DashboardLayout>
  );
};

export default Billing;
