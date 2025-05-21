import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loading } from '@/components/Loading';
import DashboardLayout from '@/components/DashboardLayout';
import { useMediaQuery } from 'usehooks-ts';
import PricingCardGrid from '@/components/PricingCardGrid';
import useBillingData from '@/hooks/useBillingData';
import useSubscribe from '@/hooks/useSubscribe';
import { toast } from '@/components/ui/use-toast';

const Billing = () => {
  const { plans, currentSubscription, loading } = useBillingData();
  const handleSubscribe = useSubscribe();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  // const { state } = useGlobalState();
  // const mapid = useId();
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // const TRIAL_LIMIT = 105;
  // const transcriptCount = state.clientTranscripts?.length || 0;
  // const isTrialLimitReached = transcriptCount >= TRIAL_LIMIT;

  const toggleSidebar = useCallback(() => {
    // Empty function since sidebar is always hidden in billing
  }, []);


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

      <PricingCardGrid
        plans={plans}
        currentSubscription={currentSubscription}
        billingCycle={billingCycle}
        onSubscribe={handleSubscribe}
      />

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
