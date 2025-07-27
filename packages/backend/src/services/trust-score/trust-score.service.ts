import { TrustScoreRepository } from '@repositories/trust-score.repository';
import { OrderRepository } from '@repositories/order.repository';
import { PaymentRepository } from '@repositories/payment.repository';
import { SupplierRatingRepository } from '@repositories/supplier-rating.repository';
import { pool } from '@database/connection';
import { logger } from '@utils/logger';
import { TrustScore, Order, Payment, SupplierRating, TrustScoreHistory } from '@vendor-supplier/shared/src/types';

export class TrustScoreService {
  constructor(
    private trustScoreRepository: TrustScoreRepository,
    private orderRepository: OrderRepository,
    private paymentRepository: PaymentRepository,
    private supplierRatingRepository: SupplierRatingRepository,
  ) {}

  public async getTrustScore(userId: string): Promise<TrustScore | null> {
    logger.info(`Fetching trust score for user: ${userId}`);
    return this.trustScoreRepository.findByUserId(userId);
  }

  public async getTrustScoreHistory(userId: string) {
    logger.info(`Fetching trust score history for user: ${userId}`);
    return this.trustScoreRepository.findHistoryByUserId(userId);
  }

  public async updateTrustFactors(userId: string, factors: any): Promise<TrustScore> {
    logger.info(`Updating trust factors for user: ${userId}`);
    // This is a simplified example. In a real scenario, factors would be validated and processed.
    // For instance, calculating new score based on recent orders, payments, etc.
    let currentScore = factors.currentScore || 0; // Placeholder for logic

    // Recalculate score based on actual data if needed
    if (factors.recalculate) {
      currentScore = await this.recalculateTrustScore(userId);
    }

    const updatedScore = await this.trustScoreRepository.upsert({
      userId,
      currentScore,
      lastRecalculated: new Date(),
      // Other factor updates
    });

    // Log history
    await this.trustScoreRepository.addHistory(userId, currentScore);

    return updatedScore;
  }

  public async getTrustRankings(role?: 'vendor' | 'supplier') {
    logger.info(`Fetching trust rankings for role: ${role || 'all'}`);
    return this.trustScoreRepository.getRankings(role);
  }

  public async triggerRecalculationForAll(): Promise<void> {
    logger.info('Triggering trust score recalculation for all users');
    const userIds = await this.trustScoreRepository.findAllUserIds();
    for (const userId of userIds) {
      await this.recalculateTrustScore(userId);
    }
  }

  private async recalculateTrustScore(userId: string): Promise<number> {
    // Placeholder for complex trust score calculation logic
    // This would involve fetching data from various repositories (orders, payments, ratings, etc.)
    // and applying a predefined algorithm.
    logger.info(`Recalculating trust score for user: ${userId}`);

    const orders = await this.orderRepository.findByUserId(userId);
    const payments = await this.paymentRepository.findByUserId(userId);
    const supplierRatings = await this.supplierRatingRepository.findBySupplierId(userId); // Assuming this method exists or similar

    let score = 0;
    // Example: based on order completion, timely payments, supplier ratings

    // Order completion rate
    const completedOrders = orders.filter((o: Order) => o.status === 'delivered').length;
    const totalOrders = orders.length;
    if (totalOrders > 0) {
      score += (completedOrders / totalOrders) * 40; // 40% weight
    }

    // Payment timeliness (simplified)
    const completedPayments = payments.filter((p: Payment) => p.paymentStatus === 'completed').length;
    const onTimePayments = payments.filter((p: Payment) => p.paymentStatus === 'completed' && p.paidAt && p.paidAt <= p.dueDate).length;
    if (completedPayments > 0) {
      score += (onTimePayments / completedPayments) * 30; // 30% weight
    }

    // Supplier ratings (if user is a supplier)
    if (supplierRatings && supplierRatings.length > 0) {
      const avgRating = supplierRatings.reduce((sum: number, r: SupplierRating) => sum + r.rating, 0) / supplierRatings.length;
      score += (avgRating / 5) * 30; // 30% weight, assuming 5-star rating
    }

    return Math.min(Math.max(score, 0), 100); // Ensure score is between 0 and 100
  }

  public async initializeTrustScore(userId: string): Promise<TrustScore> {
    logger.info(`Initializing trust score for new user: ${userId}`);
    return this.trustScoreRepository.upsert({ userId, currentScore: 50, lastRecalculated: new Date() });
  }
} 