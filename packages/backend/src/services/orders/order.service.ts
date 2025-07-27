import { OrderRepository } from '@repositories/order.repository';
import { ProductRepository } from '@repositories/product.repository';
import { RecurringOrderRepository } from '@repositories/recurring-order.repository';
import { pool } from '@database/connection';
import { AppError } from '@middleware/error.middleware';
import { Order, OrderItem, CreateOrderRequest, UpdateOrderRequest, RecurringOrder, PaymentStatus } from '@vendor-supplier/shared/src/types';

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private recurringOrderRepository: RecurringOrderRepository
  ) {}

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }

  async getVendorOrders(vendorId: string): Promise<Order[]> {
    return this.orderRepository.findByVendorId(vendorId);
  }

  async getSupplierOrders(supplierId: string): Promise<Order[]> {
    return this.orderRepository.findBySupplierId(supplierId);
  }

  async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    return this.orderRepository.findByStatus(status);
  }

  async createOrder(vendorId: string, orderData: CreateOrderRequest): Promise<Order> {
    if (!orderData.supplierId || !orderData.items || orderData.items.length === 0 || !orderData.deliveryAddress) {
      throw new AppError('Invalid order data: missing supplierId, items, or deliveryAddress', 400, 'VALIDATION_ERROR');
    }

    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const item of orderData.items) {
      const product = await this.productRepository.findById(item.productId);

      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 404, 'PRODUCT_NOT_FOUND');
      }

      if (product.supplierId !== orderData.supplierId) {
        throw new AppError(`Product ${item.productId} does not belong to the specified supplier`, 400, 'INVALID_SUPPLIER');
      }

      if (item.quantity <= 0) {
        throw new AppError('Quantity must be greater than 0', 400, 'VALIDATION_ERROR');
      }

      const itemTotal = product.pricePerUnit * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unit: product.unit,
        pricePerUnit: product.pricePerUnit,
        totalPrice: itemTotal,
      });
    }

    const newOrder: Partial<Order> = {
      orderNumber: `ORD-${Date.now()}`,
      vendorId,
      supplierId: orderData.supplierId,
      items: orderItems,
      status: 'pending',
      totalAmount,
      orderType: orderData.orderType || 'one_time',
      deliveryAddress: orderData.deliveryAddress,
      deliveryCity: orderData.deliveryCity,
      deliveryPincode: orderData.deliveryPincode,
      notes: orderData.notes,
      paymentStatus: 'pending',
      paymentMethod: '',
    };

    const createdOrder = await this.orderRepository.createOrder(newOrder);

    if (orderData.orderType === 'recurring' && orderData.recurringConfig) {
      const recurringOrder: Partial<RecurringOrder> = {
        vendorId,
        supplierId: orderData.recurringConfig.templateData?.supplierId,
        frequency: orderData.recurringConfig.frequency,
        nextOrderDate: orderData.recurringConfig.nextOrderDate,
        isActive: orderData.recurringConfig.isActive !== undefined ? orderData.recurringConfig.isActive : true,
        reminderSent: orderData.recurringConfig.reminderSent !== undefined ? orderData.recurringConfig.reminderSent : false,
        templateData: orderData.recurringConfig.templateData,
      };
      await this.recurringOrderRepository.createRecurringOrder(recurringOrder);
    }

    return createdOrder;
  }

  async updateOrderStatus(
    orderId: string,
    userId: string,
    userRole: 'vendor' | 'supplier',
    statusData: UpdateOrderRequest
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    if (userRole === 'vendor' && order.vendorId !== userId) {
      throw new AppError('Unauthorized to update this order', 403, 'UNAUTHORIZED');
    }

    if (userRole === 'supplier' && order.supplierId !== userId) {
      throw new AppError('Unauthorized to update this order', 403, 'UNAUTHORIZED');
    }

    const validTransitions: Record<Order['status'], Order['status'][]> = {
      'pending': ['accepted', 'cancelled'],
      'accepted': ['in_progress', 'cancelled'],
      'in_progress': ['out_for_delivery', 'cancelled'],
      'out_for_delivery': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[order.status as Order['status']].includes(statusData.status!)) {
      throw new AppError(
        `Cannot transition from ${order.status} to ${statusData.status}`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    const updatedOrder = await this.orderRepository.update(orderId, {
      status: statusData.status,
      estimatedDeliveryTime: statusData.estimatedDeliveryTime,
      actualDeliveryTime: statusData.actualDeliveryTime,
      notes: statusData.notes || order.notes
    });

    if (!updatedOrder) {
      throw new AppError('Failed to update order', 500, 'UPDATE_FAILED');
    }

    return updatedOrder;
  }

  async cancelOrder(orderId: string, userId: string, userRole: 'vendor' | 'supplier'): Promise<Order> {
    return this.updateOrderStatus(orderId, userId, userRole, { status: 'cancelled' });
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const updatedOrder = await this.orderRepository.update(orderId, { paymentStatus });

    if (!updatedOrder) {
      throw new AppError('Failed to update payment status', 500, 'UPDATE_FAILED');
    }

    return updatedOrder;
  }

  async getOrderAnalytics(userId: string, userRole: 'vendor' | 'supplier') {
    const orders = userRole === 'vendor'
      ? await this.orderRepository.findByVendorId(userId)
      : await this.orderRepository.findBySupplierId(userId);

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o: Order) => o.status === 'delivered').length;
    const pendingOrders = orders.filter((o: Order) => o.status === 'pending').length;
    const totalAmount = orders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0);
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

  public async createRecurringOrder(vendorId: string, recurringOrderData: CreateOrderRequest['recurringConfig']): Promise<RecurringOrder> {
    if (!recurringOrderData || !recurringOrderData.templateData.items || recurringOrderData.templateData.items.length === 0 || !recurringOrderData.templateData.deliveryAddress || !recurringOrderData.templateData.deliveryPincode) {
      throw new AppError('Invalid recurring order data: missing items, deliveryAddress, or deliveryPincode in templateData', 400, 'VALIDATION_ERROR');
    }

    for (const item of recurringOrderData.templateData.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new AppError(`Product ${item.productId} not found in recurring order template`, 404, 'PRODUCT_NOT_FOUND');
      }
    }

    const newRecurringOrder: Partial<RecurringOrder> = {
      vendorId,
      supplierId: recurringOrderData.templateData.supplierId,
      frequency: recurringOrderData.frequency,
      nextOrderDate: recurringOrderData.nextOrderDate,
      isActive: recurringOrderData.isActive !== undefined ? recurringOrderData.isActive : true,
      reminderSent: recurringOrderData.reminderSent !== undefined ? recurringOrderData.reminderSent : false,
      templateData: {
        items: recurringOrderData.templateData.items,
        deliveryAddress: recurringOrderData.templateData.deliveryAddress,
        deliveryCity: recurringOrderData.templateData.deliveryCity,
        deliveryPincode: recurringOrderData.templateData.deliveryPincode,
        supplierId: recurringOrderData.templateData.supplierId
      },
    };

    return this.recurringOrderRepository.createRecurringOrder(newRecurringOrder);
  }

  public async getRecurringOrders(vendorId: string): Promise<RecurringOrder[]> {
    return this.recurringOrderRepository.findByVendorId(vendorId);
  }

  public async updateRecurringOrder(recurringOrderId: string, updateData: Partial<RecurringOrder>): Promise<RecurringOrder | null> {
    const existingOrder = await this.recurringOrderRepository.findById(recurringOrderId);
    if (!existingOrder) {
      throw new AppError('Recurring order not found', 404, 'NOT_FOUND');
    }

    return this.recurringOrderRepository.updateRecurringOrder(recurringOrderId, updateData);
  }

  public async cancelRecurringOrder(recurringOrderId: string): Promise<RecurringOrder | null> {
    return this.recurringOrderRepository.updateRecurringOrder(recurringOrderId, { isActive: false });
  }

  public async processDueRecurringOrders(): Promise<void> {
    const dueOrders = await this.recurringOrderRepository.findDueOrders();

    for (const orderConfig of dueOrders) {
      try {
        const newOrderData: CreateOrderRequest = {
          supplierId: orderConfig.templateData.supplierId || '',
          items: orderConfig.templateData.items,
          deliveryAddress: orderConfig.templateData.deliveryAddress,
          deliveryCity: orderConfig.templateData.deliveryCity,
          deliveryPincode: orderConfig.templateData.deliveryPincode,
          notes: `Auto-generated from recurring order ${orderConfig.id}`,
          orderType: 'one_time',
        };

        await this.createOrder(orderConfig.vendorId, newOrderData);

        const nextOrderDate = this.calculateNextRecurringOrderDate(orderConfig.nextOrderDate, orderConfig.frequency);
        await this.recurringOrderRepository.updateRecurringOrder(orderConfig.id, { 
          nextOrderDate,
          reminderSent: false,
        });
      } catch (error: any) {
      }
    }
  }

  private calculateNextRecurringOrderDate(currentDate: Date, frequency: RecurringOrder['frequency']): Date {
    const nextDate = new Date(currentDate);
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      default:
        throw new Error('Invalid recurring frequency');
    }
    return nextDate;
  }
}