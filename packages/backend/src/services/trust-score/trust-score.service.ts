import { TrustScoreRepository } from '../../database/repositories/trust-score.repository';
import { OrderRepository } from '../../database/repositories/order.repository';
import { PaymentRepository } from '../../database/repositories/payment.repository';
import { SupplierRatingRepository } from '@vendor-supplier/backend/src/database/repositories/supplier-rating.repository';
import { logger } from '../../utils/logger';
import { TrustScore, User, TrustScoreFactors as SharedTrustScoreFactors } from '@vendor-supplier/shared/src/types';

interface TrustScoreFactors extends SharedTrustScoreFactors {}

export class TrustScoreService {
  constructor(
    private trustScoreRepository: TrustScoreRepository,
    private orderRepository: OrderRepository,
    private paymentRepository: PaymentRepository,
    private supplierRatingRepository: SupplierRatingRepository
  ) {}

  public async calculateSupplierScore(supplierId: string): Promise<number> {
    logger.info(`Calculating supplier trust score for ${supplierId}`);

    const totalOrders = await this.orderRepository.countSupplierOrders(supplierId);
    const successfulOrders = await this.orderRepository.countSuccessfulSupplierOrders(supplierId);
    const onTimeDeliveries = await this.orderRepository.countOnTimeSupplierDeliveries(supplierId);
    const avgRating = await this.supplierRatingRepository.getAverageSupplierRating(supplierId);

    const onTimeDeliveryRate = totalOrders > 0 ? (onTimeDeliveries / totalOrders) : 0;
    const orderFulfillmentRate = totalOrders > 0 ? (successfulOrders / totalOrders) : 0;
    const averageVendorRating = avgRating || 0;

    const pricingCompetitiveness = 0.8; // Placeholder for pricing competitiveness

    const supplierScore = (
      onTimeDeliveryRate * 0.35 +
      averageVendorRating * 0.25 +
      pricingCompetitiveness * 0.20 +
      orderFulfillmentRate * 0.20
    ) * 100;

    await this.trustScoreRepository.updateScore(
      supplierId,
      supplierScore,
      JSON.stringify({
        onTimeDeliveryRate: onTimeDeliveryRate,
        customerRating: averageVendorRating,
        pricingCompetitiveness: pricingCompetitiveness,
        orderFulfillmentRate: orderFulfillmentRate,
      }),
      'Supplier score updated'
    );

    return supplierScore;
  }

  public async calculateVendorScore(vendorId: string): Promise<number> {
    logger.info(`Calculating vendor trust score for ${vendorId}`);

    const totalOrders = await this.orderRepository.countVendorOrders(vendorId);
    const completedPayments = await this.paymentRepository.countCompletedVendorPayments(vendorId);
    const onTimePayments = await this.paymentRepository.countOnTimeVendorPayments(vendorId);

    const paymentTimeliness = totalOrders > 0 ? (onTimePayments / totalOrders) : 0;
    const orderConsistency = totalOrders > 0 ? (completedPayments / totalOrders) : 0;
    
    const platformEngagement = 0.7; // Placeholder for platform engagement

    const vendorScore = (
      paymentTimeliness * 0.40 +
      orderConsistency * 0.30 +
      platformEngagement * 0.30
    ) * 100;

    await this.trustScoreRepository.updateScore(
      vendorId,
      vendorScore,
      JSON.stringify({
        paymentTimeliness: paymentTimeliness,
        orderConsistency: orderConsistency,
        platformEngagement: platformEngagement,
      }),
      'Vendor score updated'
    );

    return vendorScore;
  }

  public async getTrustScore(userId: string) {
    return this.trustScoreRepository.findByUserId(userId);
  }

  public async getTrustScoreHistory(userId: string) {
    return this.trustScoreRepository.findHistoryByUserId(userId);
  }

  public async updateTrustFactors(userId: string, factors: TrustScoreFactors) {
    const user = await this.trustScoreRepository.getUserRole(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'supplier') {
      return this.calculateSupplierScore(userId);
    } else if (user.role === 'vendor') {
      return this.calculateVendorScore(userId);
    }
    return null;
  }

  public async getTrustRankings(role?: 'vendor' | 'supplier') {
    return this.trustScoreRepository.getRankings(role);
  }
} 