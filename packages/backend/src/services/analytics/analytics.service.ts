import { OrderRepository } from '../../database/repositories/order.repository';
import { PaymentRepository } from '../../database/repositories/payment.repository';
import { TrustScoreRepository } from '../../database/repositories/trust-score.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { logger } from '../../utils/logger';
import { Order, Payment, TrustScore, User, TrustScoreHistory } from '@vendor-supplier/shared/src/types';

export class AnalyticsService {
  constructor(
    private orderRepository: OrderRepository,
    private paymentRepository: PaymentRepository,
    private trustScoreRepository: TrustScoreRepository,
    private userRepository: UserRepository
  ) {}

  public async getOverallPlatformAnalytics() {
    logger.info('Fetching overall platform analytics');
    const totalUsers = await this.userRepository.countUsers();
    const totalVendors = await this.userRepository.countUsersByRole('vendor');
    const totalSuppliers = await this.userRepository.countUsersByRole('supplier');
    const totalOrders = await this.orderRepository.countAllOrders();
    const completedOrders = await this.orderRepository.countOrdersByStatus('delivered');
    const totalRevenue = await this.paymentRepository.sumCompletedPayments();

    return {
      totalUsers,
      totalVendors,
      totalSuppliers,
      totalOrders,
      completedOrders,
      totalRevenue,
      orderCompletionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
    };
  }

  public async getVendorAnalytics(vendorId: string) {
    logger.info(`Fetching analytics for vendor ${vendorId}`);
    const vendorOrders = await this.orderRepository.findByVendorId(vendorId);
    const totalOrders = vendorOrders.length;
    const completedOrders = vendorOrders.filter(o => o.status === 'delivered').length;
    const totalSpending = vendorOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const trustScore = await this.trustScoreRepository.findByUserId(vendorId);
    const paymentTimeliness = await this.paymentRepository.countOnTimeVendorPayments(vendorId);
    const totalPayments = await this.paymentRepository.countCompletedVendorPayments(vendorId);

    return {
      totalOrders,
      completedOrders,
      totalSpending,
      orderCompletionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      trustScore: trustScore?.currentScore || 0,
      paymentTimelinessRate: totalPayments > 0 ? (paymentTimeliness / totalPayments) * 100 : 0,
    };
  }

  public async getSupplierAnalytics(supplierId: string) {
    logger.info(`Fetching analytics for supplier ${supplierId}`);
    const supplierOrders = await this.orderRepository.findBySupplierId(supplierId);
    const totalOrders = supplierOrders.length;
    const completedOrders = supplierOrders.filter(o => o.status === 'delivered').length;
    const totalEarnings = supplierOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const trustScore = await this.trustScoreRepository.findByUserId(supplierId);
    const onTimeDeliveries = await this.orderRepository.countOnTimeSupplierDeliveries(supplierId);
    const totalDeliveries = await this.orderRepository.countSuccessfulSupplierOrders(supplierId);

    return {
      totalOrders,
      completedOrders,
      totalEarnings,
      orderCompletionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      trustScore: trustScore?.currentScore || 0,
      onTimeDeliveryRate: totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0,
    };
  }

  public async getTrustScoreTrend(userId: string) {
    logger.info(`Fetching trust score trend for ${userId}`);
    const history: TrustScoreHistory[] = await this.trustScoreRepository.findHistoryByUserId(userId);
    return history.map(item => ({ score: item.score, timestamp: item.createdAt }));
  }

  public async getTopSuppliers(limit: number = 5) {
    logger.info(`Fetching top ${limit} suppliers`);
    const rankings = await this.trustScoreRepository.getRankings('supplier');
    return rankings.slice(0, limit);
  }

  public async getTopVendors(limit: number = 5) {
    logger.info(`Fetching top ${limit} vendors`);
    const rankings = await this.trustScoreRepository.getRankings('vendor');
    return rankings.slice(0, limit);
  }
} 