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
  frequency: 'monthly';
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
  items: Omit<OrderItem, 'totalPrice'>[];
  orderType: 'one_time' | 'recurring';
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPincode: string;
  supplierId?: string;
  notes?: string;
}