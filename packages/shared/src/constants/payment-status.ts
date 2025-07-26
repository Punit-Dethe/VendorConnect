export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Payment Pending',
  [PAYMENT_STATUS.PROCESSING]: 'Processing Payment',
  [PAYMENT_STATUS.COMPLETED]: 'Payment Completed',
  [PAYMENT_STATUS.FAILED]: 'Payment Failed',
  [PAYMENT_STATUS.REFUNDED]: 'Payment Refunded'
};