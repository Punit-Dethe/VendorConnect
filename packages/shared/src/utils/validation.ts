export const validateMobile = (mobile: string): boolean => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validatePositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && value > 0;
};

export const validateQuantity = (quantity: number, min: number = 1, max?: number): boolean => {
  if (!validatePositiveNumber(quantity) || quantity < min) {
    return false;
  }
  if (max && quantity > max) {
    return false;
  }
  return true;
};