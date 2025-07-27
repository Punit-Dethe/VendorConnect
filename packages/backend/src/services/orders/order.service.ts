import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middleware/error.middleware';
import { OrderRepository } from '../../database/repositories/order.repository';
import { ProductRepository } from '../../database/repositories/product.repository';
import { RecurringOrderRepository } from '../../database/repositories/recurring-order.repository'; // New import
import { Order, OrderItem, CreateOrderRequest, UpdateOrderRequest, RecurringOrder, RecurringOrderConfig } from '@vendor-supplier/shared/src/types';
// import { pool } from '../../database/connection'; // Not needed in service

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository,
    private recurringOrderRepository: RecurringOrderRepository // Inject new repository
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
      // paymentStatus and paymentMethod are typically set later or by payment service
      paymentStatus: 'pending',
      paymentMethod: '',
    };

    const createdOrder = await this.orderRepository.createOrder(newOrder);

    // If it's a recurring order, save its configuration
    if (orderData.orderType === 'recurring' && orderData.recurringConfig) {
      const recurringOrder: Partial<RecurringOrder> = {
        vendorId,
        supplierId: orderData.supplierId,
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

    if (!validTransitions[order.status].includes(statusData.status!)) {
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

  async updatePaymentStatus(orderId: string, paymentStatus: Order['paymentStatus']): Promise<Order> {
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

  // New recurring order methods
  public async createRecurringOrder(vendorId: string, recurringOrderData: RecurringOrderConfig): Promise<RecurringOrder> {
    if (!recurringOrderData.templateData.items || recurringOrderData.templateData.items.length === 0 || !recurringOrderData.templateData.deliveryAddress) {
      throw new AppError('Invalid recurring order data: missing items or deliveryAddress in templateData', 400, 'VALIDATION_ERROR');
    }

    // Basic validation for templateData items (similar to createOrder)
    for (const item of recurringOrderData.templateData.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new AppError(`Product ${item.productId} not found in recurring order template`, 404, 'PRODUCT_NOT_FOUND');
      }
      // Further checks can be added here, e.g., product availability, supplier association
    }

    const newRecurringOrder: Partial<RecurringOrder> = {
      vendorId,
      frequency: recurringOrderData.frequency,
      nextOrderDate: recurringOrderData.nextOrderDate,
      isActive: recurringOrderData.isActive !== undefined ? recurringOrderData.isActive : true,
      reminderSent: recurringOrderData.reminderSent !== undefined ? recurringOrderData.reminderSent : false,
      templateData: recurringOrderData.templateData,
      supplierId: recurringOrderData.templateData.supplierId, // Assuming supplierId can be part of templateData or determined via matching
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
    // This method would be called by a scheduled job (e.g., cron job)
    const dueOrders = await this.recurringOrderRepository.findDueOrders();

    for (const orderConfig of dueOrders) {
      try {
        // Create a new one-time order based on the recurring order template
        const newOrderData: CreateOrderRequest = {
          supplierId: orderConfig.templateData.supplierId || '', // Supplier ID from template or determined
          items: orderConfig.templateData.items,
          deliveryAddress: orderConfig.templateData.deliveryAddress,
          deliveryCity: orderConfig.templateData.deliveryCity,
          deliveryPincode: orderConfig.templateData.deliveryPincode,
          notes: `Auto-generated from recurring order ${orderConfig.id}`,
          orderType: 'one_time',
        };

        // Simulate order creation (would call createOrder internally)
        await this.createOrder(orderConfig.vendorId, newOrderData);

        // Update next_order_date and reminder_sent for the recurring order
        const nextOrderDate = this.calculateNextRecurringOrderDate(orderConfig.nextOrderDate, orderConfig.frequency);
        await this.recurringOrderRepository.updateRecurringOrder(orderConfig.id, { 
          nextOrderDate,
          reminderSent: false, // Reset reminder flag
        });
        // logger.info(`Processed recurring order ${orderConfig.id} for vendor ${orderConfig.vendorId}`); // logger is not defined
      } catch (error: any) {
        // logger.error(`Failed to process recurring order ${orderConfig.id}: ${error.message}`); // logger is not defined
        // Potentially update the recurring order status to indicate failure or send a notification
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