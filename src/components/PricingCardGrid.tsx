import React from 'react';
import PricingCard from './PricingCard';
import type { Plan, UserSubscription } from '@/hooks/useBillingData';

interface PricingCardGridProps {
  plans: Plan[];
  currentSubscription: UserSubscription | null;
  billingCycle: 'monthly' | 'annually';
  onSubscribe: (planId: number, priceId: string) => void;
}

const PLANS_CARD_HEIGHT_COLORS: { [key: string]: string } = {
  'SOAP Supreme': 'md:h-[80%] h-full bg-black text-white',
  'SOAP Supreme: Multi-Lingual': 'md:h-[90%]  h-full bg-white text-black',
  'ASSIST ULTRA': 'md:h-full bg-blue-600  h-full text-white',
};

const PricingCardGrid: React.FC<PricingCardGridProps> = ({
  plans,
  currentSubscription,
  billingCycle,
  onSubscribe,
}) => (
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
              billingCycle === 'monthly' ? plan.monthly_price : plan.yearly_price || '0',
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
              onSubscribe(
                plan.id,
                billingCycle === 'annually' ? plan.yearly_price_id : plan.monthly_price_id,
              )
            }
            currentPlan={currentSubscription?.plan_id === plan.id}
          />
        </div>
      ))}
  </div>
);

export default PricingCardGrid;
