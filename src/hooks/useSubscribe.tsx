import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '@/supabase';
import { toast } from '@/components/ui/use-toast';
import { getStripe } from '@/lib/stripe';
import { isError } from '@/utils/error';

export default function useSubscribe() {
  const navigate = useNavigate();

  return useCallback(
    async (planId: number, priceId: string) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          navigate('/login');
          return;
        }

        // Ensure the Stripe checkout URL is configured
        if (!import.meta.env.VITE_STRIPE_CHECKOUT_URL) {
          throw new Error('Missing STRIPE_CHECKOUT_URL');
        }

        const response = await fetch(
          import.meta.env.VITE_STRIPE_CHECKOUT_URL,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              priceId,
              userId: user.id,
            }),
          },
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
      } catch (error: unknown) {
        if (isError(error)) {
          console.error('Stripe checkout error:', error);
          toast({
            title: 'Error',
            description: error.message || 'Failed to initiate checkout',
            variant: 'destructive',
          });
        } else {
          console.error('Unknown Stripe checkout error', error);
          toast({
            title: 'Error',
            description: 'Failed to initiate checkout',
            variant: 'destructive',
          });
        }
      }
    },
    [navigate],
  );
}
