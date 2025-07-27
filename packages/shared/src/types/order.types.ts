import { PaymentStatus } from './payment.types';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  vendorId: string;
  supplierId: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderType: 'one_time' | 'recurring';
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPincode: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  contractId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface RecurringOrder {
  id: string;
  vendorId: string;
  supplierId?: string;
  frequency: 'monthly' | 'weekly' | 'daily';
  nextOrderDate: Date;
  isActive: boolean;
  reminderSent: boolean;
  templateData: {
    items: OrderItem[];
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPincode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  vendorId?: string; // Make optional as it might be added by middleware
  supplierId: string;
  items: OrderItem[];
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPincode: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  notes?: string;
  orderType?: 'one_time' | 'recurring';
  recurringConfig?: RecurringOrderConfig; // Add recurring config here
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  notes?: string;
  paymentStatus?: PaymentStatus;
}

export interface RecurringOrderConfig {
  frequency: 'monthly' | 'weekly' | 'daily';
  nextOrderDate: Date;
  isActive?: boolean;
  reminderSent?: boolean;
  templateData: {
    items: OrderItem[];
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPincode: string;
    supplierId?: string; // Add supplierId here
  };
}