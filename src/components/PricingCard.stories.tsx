import type { Meta, StoryObj } from '@storybook/react';
import PricingCard from './PricingCard';

const meta: Meta<typeof PricingCard> = {
  title: 'Components/PricingCard',
  component: PricingCard,
};
export default meta;

export const Basic: StoryObj<typeof PricingCard> = {
  args: {
    name: 'Plan A',
    level: 'Basic',
    className: '',
    description: 'Great for starters',
    price: 10,
    features: ['Feature one', 'Feature two'],
    isAnnual: false,
    onSubscribe: () => {},
    currentPlan: false,
  },
};
