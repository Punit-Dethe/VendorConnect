export * from './user.types';
export * from './order.types';
export * from './product.types';
export * from './contract.types';
export * from './payment.types';
export * from './trust-score.types';
export * from './chat.types';
export * from './notification.types';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp: Date;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}