export const USER_ROLES = {
  VENDOR: 'vendor',
  SUPPLIER: 'supplier'
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.VENDOR]: 'Vendor',
  [USER_ROLES.SUPPLIER]: 'Supplier'
};