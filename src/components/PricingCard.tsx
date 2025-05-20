import React from 'react';
import { CheckIcon } from 'lucide-react';

interface PricingCardProps {
  name: string;
  level: string;
  className: string;
  description: string;
  price: number;
  features: string[];
  isAnnual: boolean;
  onSubscribe: () => void;
  onStartFreeTrial?: () => void;
  currentPlan: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  name,
  level,
  className,
  description,
  price,
  features,
  isAnnual,
  onSubscribe,
  onStartFreeTrial,
  currentPlan,
}) => {
  return (
    <div className={`rounded-lg shadow-md p-4 sm:p-6 w-full ${className}`}>
      <div className="h-full flex flex-col justify-between">
        <div>
          {onStartFreeTrial && (
            <button
              onClick={onStartFreeTrial}
              className="float-right mb-4 bg-cyan-400 hover:bg-cyan-500 text-black font-bold py-2 px-4 rounded text-sm sm:text-base"
            >
              Start Free Trial NOW
            </button>
          )}
          <h3 className="text-xl sm:text-2xl font-bold mb-1">{name}</h3>
          <p className="text-lg sm:text-xl mb-2">{level}</p>
          <h4 className="text-lg sm:text-xl mb-4">
            {name.split(':')[0].split(' ')[1]} Class
          </h4>
          <p className="mb-4 text-sm sm:text-base">{description}</p>
        </div>
        <div>
          <p className="text-3xl sm:text-5xl font-bold mb-6">
            ${price}
            <span className="text-sm sm:text-base font-normal">
              /{isAnnual ? 'year' : 'mo'}
            </span>
          </p>
          <button
            onClick={onSubscribe}
            disabled={currentPlan}
            className={`w-full py-2 sm:py-3 px-4 rounded-md text-base sm:text-lg font-semibold mb-6 ${
              currentPlan
                ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                : 'bg-black text-white hover:bg-opacity-90'
            }`}
          >
            {currentPlan ? 'Current Plan' : 'Upgrade | Purchase'}
          </button>
          <h4 className="font-semibold mb-2">Features</h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-1" />
                <span className="text-xs sm:text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
