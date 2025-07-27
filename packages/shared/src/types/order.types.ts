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
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPincode: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  contractId?: string;
  notes?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: string;
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
  frequency: 'daily' | 'weekly' | 'monthly';
  nextOrderDate: Date;
  isActive: boolean;
  reminderSent: boolean;
  templateData: {
    items: OrderItem[];
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPincode: string;
    supplierId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  items: Omit<OrderItem, 'totalPrice'>[];
  orderType: 'one_time' | 'recurring';
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPincode: string;
  supplierId?: string;
  notes?: string;
  recurringConfig?: Omit<RecurringOrder, 'id' | 'vendorId' | 'createdAt' | 'updatedAt'> & { templateData: Omit<RecurringOrder['templateData'], 'supplierId' | 'deliveryPincode'> & { supplierId?: string, deliveryPincode: string } }; // Added for recurring orders
}

export type UpdateOrderRequest = Partial<Omit<Order, 'id' | 'vendorId' | 'orderNumber' | 'totalAmount' | 'createdAt' | 'updatedAt' | 'items' | 'orderType' | 'deliveryAddress' | 'deliveryCity' | 'deliveryPincode' | 'contractId'>>;