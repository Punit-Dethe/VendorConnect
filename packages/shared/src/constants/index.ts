export * from './order-status';
export * from './user-roles';
export * from './payment-status';

export const PRODUCT_CATEGORIES = [
  'vegetables',
  'grains',
  'spices',
  'dairy',
  'oils',
  'pulses',
  'meat',
  'seafood'
] as const;

export const TRUST_SCORE_WEIGHTS = {
  SUPPLIER: {
    ON_TIME_DELIVERY: 0.35,
    CUSTOMER_RATING: 0.25,
    PRICING_COMPETITIVENESS: 0.20,
    ORDER_FULFILLMENT: 0.20
  },
  VENDOR: {
    PAYMENT_TIMELINESS: 0.40,
    ORDER_CONSISTENCY: 0.30,
    PLATFORM_ENGAGEMENT: 0.30
  }
};

export const DEFAULT_TRUST_SCORE = 50;
export const MAX_TRUST_SCORE = 100;
export const MIN_TRUST_SCORE = 0;