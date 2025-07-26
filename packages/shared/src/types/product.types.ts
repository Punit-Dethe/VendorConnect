export interface Product {
  id: string;
  supplierId: string;
  categoryId: string;
  name: string;
  description: string;
  unit: string;
  pricePerUnit: number;
  stockQuantity: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  isAvailable: boolean;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
}

export type ProductCategoryName =
  | 'vegetables'
  | 'grains'
  | 'spices'
  | 'dairy'
  | 'oils'
  | 'pulses'
  | 'meat'
  | 'seafood';

export interface CreateProductRequest {
  categoryId: string;
  name: string;
  description: string;
  unit: string;
  pricePerUnit: number;
  stockQuantity: number;
  minOrderQuantity: number;
  maxOrderQuantity?: number;
  images?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  isAvailable?: boolean;
}

export interface InventoryAlert {
  id: string;
  supplierId: string;
  productId: string;
  alertType: 'low_stock' | 'out_of_stock';
  thresholdQuantity: number;
  currentQuantity: number;
  isResolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}