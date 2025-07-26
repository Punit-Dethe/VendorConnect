export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatMobile = (mobile: string): string => {
  if (mobile.length === 10) {
    return `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;
  }
  return mobile;
};

export const formatOrderNumber = (orderNumber: string): string => {
  return `#${orderNumber}`;
};

export const formatTrustScore = (score: number): string => {
  return `${Math.round(score)}/100`;
};

export const formatQuantity = (quantity: number, unit: string): string => {
  return `${quantity} ${unit}${quantity > 1 ? 's' : ''}`;
};