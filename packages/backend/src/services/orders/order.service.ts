import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middleware/error.middleware';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  vendorId: string;
  supplierId: string;
  items: OrderItem[];
  status: 'pending' | 'accepted' | 'in_progress' | 'out_for_delivery' | 'delivered' | 'cancelled';
  totalAmount: number;
  orderDate: Date;
  expectedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderData {
  supplierId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  notes?: string;
}

export interface UpdateOrderStatusData {
  status: Order['status'];
  expectedDelivery?: Date;
  actualDelivery?: Date;
  notes?: string;
}

// In-memory storage for mock data
class MockOrderDatabase {
  private orders: Order[] = [];
  private orderCounter = 1;

  constructor() {
    // Pre-populate with sample orders
    this.orders = [
      {
        id: 'order-1',
        orderNumber: 'ORD-2024-001',
        vendorId: 'vendor-1',
        supplierId: 'supplier-1',
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            productName: 'Fresh Tomatoes',
            quantity: 10,
            unit: 'kg',
            price: 40,
            total: 400
          },
          {
            id: 'item-2',
            productId: 'prod-2',
            productName: 'Red Onions',
            quantity: 5,
            unit: 'kg',
            price: 30,
            total: 150
          }
        ],
        status: 'delivered',
        totalAmount: 550,
        orderDate: new Date('2024-01-15T10:30:00'),
        expectedDelivery: new Date('2024-01-15T14:00:00'),
        actualDelivery: new Date('2024-01-15T13:45:00'),
        paymentStatus: 'paid',
        createdAt: new Date('2024-01-15T10:30:00'),
        updatedAt: new Date('2024-01-15T13:45:00')
      },
      {
        id: 'order-2',
        orderNumber: 'ORD-2024-002',
        vendorId: 'vendor-1',
        supplierId: 'supplier-1',
        items: [
          {
            id: 'item-3',
            productId: 'prod-3',
            productName: 'Red Chili Powder',
            quantity: 2,
            unit: 'kg',
            price: 200,
            total: 400
          }
        ],
        status: 'out_for_delivery',
        totalAmount: 400,
        orderDate: new Date('2024-01-16T09:15:00'),
        expectedDelivery: new Date('2024-01-16T15:00:00'),
        paymentStatus: 'pending',
        createdAt: new Date('2024-01-16T09:15:00'),
        updatedAt: new Date('2024-01-16T12:00:00')
      }
    ];
    this.orderCounter = this.orders.length + 1;
  }

  findAll(): Order[] {
    return this.orders;
  }

  findById(id: string): Order | undefined {
    return this.orders.find(order => order.id === id);
  }

  findByVendorId(vendorId: string): Order[] {
    return this.orders.filter(order => order.vendorId === vendorId);
  }

  findBySupplierId(supplierId: string): Order[] {
    return this.orders.filter(order => order.supplierId === supplierId);
  }

  findByStatus(status: Order['status']): Order[] {
    return this.orders.filter(order => order.status === status);
  }

  create(orderData: Order): Order {
    this.orders.push(orderData);
    this.orderCounter++;
    return orderData;
  }

  update(id: string, updateData: Partial<Order>): Order | null {
    const orderIndex = this.orders.findIndex(order => order.id === id);

    if (orderIndex === -1) {
      return null;
    }

    const updatedOrder = {
      ...this.orders[orderIndex],
      ...updateData,
      updatedAt: new Date()
    };

    this.orders[orderIndex] = updatedOrder;
    return updatedOrder;
  }

  generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const orderNum = this.orderCounter.toString().padStart(3, '0');
    return `ORD-${year}-${orderNum}`;
  }
}

const mockOrderDb = new MockOrderDatabase();

export class OrderService {
  async getAllOrders(): Promise<Order[]> {
    return mockOrderDb.findAll();
  }

  async getOrderById(id: string): Promise<Order | null> {
    const order = mockOrderDb.findById(id);
    return order || null;
  }

  async getVendorOrders(vendorId: string): Promise<Order[]> {
    return mockOrderDb.findByVendorId(vendorId);
  }

  async getSupplierOrders(supplierId: string): Promise<Order[]> {
    return mockOrderDb.findBySupplierId(supplierId);
  }

  async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    return mockOrderDb.findByStatus(status);
  }

  async createOrder(vendorId: string, orderData: CreateOrderData): Promise<Order> {
    // Validate order data
    if (!orderData.supplierId || !orderData.items || orderData.items.length === 0) {
      throw new AppError('Invalid order data', 400, 'VALIDATION_ERROR');
    }

    // Mock product lookup (in real implementation, fetch from product service)
    const mockProducts = [
      { id: 'prod-1', name: 'Fresh Tomatoes', price: 40, unit: 'kg', supplierId: orderData.supplierId },
      { id: 'prod-2', name: 'Red Onions', price: 30, unit: 'kg', supplierId: orderData.supplierId },
      { id: 'prod-3', name: 'Red Chili Powder', price: 200, unit: 'kg', supplierId: orderData.supplierId },
      { id: 'prod-4', name: 'Basmati Rice', price: 120, unit: 'kg', supplierId: orderData.supplierId }
    ];

    // Process order items
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const item of orderData.items) {
      const product = mockProducts.find(p => p.id === item.productId);

      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 404, 'PRODUCT_NOT_FOUND');
      }

      if (product.supplierId !== orderData.supplierId) {
        throw new AppError(`Product ${item.productId} does not belong to the specified supplier`, 400, 'INVALID_SUPPLIER');
      }

      if (item.quantity <= 0) {
        throw new AppError('Quantity must be greater than 0', 400, 'VALIDATION_ERROR');
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        id: uuidv4(),
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unit: product.unit,
        price: product.price,
        total: itemTotal
      });
    }

    // Create order
    const newOrder: Order = {
      id: uuidv4(),
      orderNumber: mockOrderDb.generateOrderNumber(),
      vendorId,
      supplierId: orderData.supplierId,
      items: orderItems,
      status: 'pending',
      totalAmount,
      orderDate: new Date(),
      notes: orderData.notes,
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return mockOrderDb.create(newOrder);
  }

  async updateOrderStatus(
    orderId: string,
    userId: string,
    userRole: 'vendor' | 'supplier',
    statusData: UpdateOrderStatusData
  ): Promise<Order> {
    const order = mockOrderDb.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Check authorization
    if (userRole === 'vendor' && order.vendorId !== userId) {
      throw new AppError('Unauthorized to update this order', 403, 'UNAUTHORIZED');
    }

    if (userRole === 'supplier' && order.supplierId !== userId) {
      throw new AppError('Unauthorized to update this order', 403, 'UNAUTHORIZED');
    }

    // Validate status transitions
    const validTransitions: Record<Order['status'], Order['status'][]> = {
      'pending': ['accepted', 'cancelled'],
      'accepted': ['in_progress', 'cancelled'],
      'in_progress': ['out_for_delivery', 'cancelled'],
      'out_for_delivery': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[order.status].includes(statusData.status)) {
      throw new AppError(
        `Cannot transition from ${order.status} to ${statusData.status}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    // Update order
    const updateData: Partial<Order> = {
      status: statusData.status,
      expectedDelivery: statusData.expectedDelivery,
      actualDelivery: statusData.actualDelivery,
      notes: statusData.notes || order.notes
    };

    // Auto-update payment status when delivered
    if (statusData.status === 'delivered') {
      updateData.actualDelivery = new Date();
    }

    const updatedOrder = mockOrderDb.update(orderId, updateData);

    if (!updatedOrder) {
      throw new AppError('Failed to update order', 500, 'UPDATE_FAILED');
    }

    return updatedOrder;
  }

  async cancelOrder(orderId: string, userId: string, userRole: 'vendor' | 'supplier'): Promise<Order> {
    return this.updateOrderStatus(orderId, userId, userRole, { status: 'cancelled' });
  }

  async updatePaymentStatus(orderId: string, paymentStatus: Order['paymentStatus']): Promise<Order> {
    const order = mockOrderDb.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const updatedOrder = mockOrderDb.update(orderId, { paymentStatus });

    if (!updatedOrder) {
      throw new AppError('Failed to update payment status', 500, 'UPDATE_FAILED');
    }

    return updatedOrder;
  }

  async getOrderAnalytics(userId: string, userRole: 'vendor' | 'supplier') {
    const orders = userRole === 'vendor'
      ? mockOrderDb.findByVendorId(userId)
      : mockOrderDb.findBySupplierId(userId);

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      totalAmount,
      avgOrderValue,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0
    };
  }
}