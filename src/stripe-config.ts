export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price: string;
  period?: string;
  popular?: boolean;
  savings?: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SWmIqVQm9L3krl',
    priceId: 'price_1RbijS4JrlJotBXLm4zsLCC8',
    name: 'Weekly Plan',
    description: 'Perfect for trying out premium features',
    mode: 'subscription',
    price: '₹49',
    period: '/week',
    popular: false,
  },
  {
    id: 'prod_SWmLDQsYM0uDFM',
    priceId: 'price_1RbinE4JrlJotBXLZ1G7UIQg',
    name: 'Monthly Plan',
    description: 'Great for regular users',
    mode: 'subscription',
    price: '₹199',
    period: '/month',
    popular: true,
  },
  {
    id: 'prod_SWmKFLTJWR35i1',
    priceId: 'price_1Rbilr4JrlJotBXLRbsUk0PG',
    name: 'Yearly Plan',
    description: 'Best value - Save 50%!',
    mode: 'subscription',
    price: '₹1,199',
    period: '/year',
    popular: false,
    savings: 'Save ₹1,189',
  },
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}