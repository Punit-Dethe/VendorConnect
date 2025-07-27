import { BaseRepository } from './base.repository';
import { pool } from '../connection';
import { TrustScore, TrustScoreHistory, User } from '@vendor-supplier/shared/src/types';

export class TrustScoreRepository extends BaseRepository {
  constructor() {
    super(pool);
  }

  public async findByUserId(userId: string): Promise<TrustScore | null> {
    const query = 'SELECT * FROM trust_scores WHERE user_id = $1';
    const result = await this.query(query, [userId]);
    return result.rows[0] ? this.mapRowToTrustScore(result.rows[0]) : null;
  }

  public async updateScore(userId: string, newScore: number, factors: string, reason: string): Promise<TrustScore> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const updateQuery = `
        INSERT INTO trust_scores (user_id, current_score, on_time_delivery_rate, customer_rating, pricing_competitiveness, order_fulfillment_rate, payment_timeliness, order_consistency, platform_engagement, last_updated)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET
          current_score = EXCLUDED.current_score,
          on_time_delivery_rate = EXCLUDED.on_time_delivery_rate,
          customer_rating = EXCLUDED.customer_rating,
          pricing_competitiveness = EXCLUDED.pricing_competitiveness,
          order_fulfillment_rate = EXCLUDED.order_fulfillment_rate,
          payment_timeliness = EXCLUDED.payment_timeliness,
          order_consistency = EXCLUDED.order_consistency,
          platform_engagement = EXCLUDED.platform_engagement,
          last_updated = EXCLUDED.last_updated
        RETURNING *;
      `;

      const parsedFactors = JSON.parse(factors);
      const { onTimeDelivery, customerRating, pricingCompetitiveness, orderFulfillment, paymentTimeliness, orderConsistency, platformEngagement } = parsedFactors;

      const updateResult = await client.query(updateQuery, [
        userId,
        newScore,
        onTimeDelivery,
        customerRating,
        pricingCompetitiveness,
        orderFulfillment,
        paymentTimeliness,
        orderConsistency,
        platformEngagement,
      ]);

      const historyQuery = `
        INSERT INTO trust_score_history (user_id, score, factors, reason)
        VALUES ($1, $2, $3::jsonb, $4) RETURNING *;
      `;
      await client.query(historyQuery, [userId, newScore, factors, reason]);

      await client.query('COMMIT');
      return this.mapRowToTrustScore(updateResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async findHistoryByUserId(userId: string): Promise<TrustScoreHistory[]> {
    const query = 'SELECT * FROM trust_score_history WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await this.query(query, [userId]);
    return result.rows.map(this.mapRowToTrustScoreHistory);
  }

  public async getUserRole(userId: string): Promise<User | null> {
    const query = 'SELECT id, role FROM users WHERE id = $1';
    const result = await this.query(query, [userId]);
    return result.rows[0] ? { id: result.rows[0].id, role: result.rows[0].role } as User : null; // Cast to User to satisfy type, only return relevant fields
  }

  public async getRankings(role?: 'vendor' | 'supplier'): Promise<TrustScore[]> {
    let query = 'SELECT * FROM trust_scores ORDER BY current_score DESC';
    const params: string[] = [];

    if (role) {
      query = `SELECT ts.*, u.role FROM trust_scores ts JOIN users u ON ts.user_id = u.id WHERE u.role = $1 ORDER BY ts.current_score DESC`;
      params.push(role);
    }

    const result = await this.query(query, params);
    return result.rows.map(this.mapRowToTrustScore);
  }

  private mapRowToTrustScore(row: any): TrustScore {
    return {
      userId: row.user_id,
      currentScore: parseFloat(row.current_score),
      factors: {
        onTimeDelivery: row.on_time_delivery_rate,
        customerRating: row.customer_rating,
        pricingCompetitiveness: row.pricing_competitiveness,
        orderFulfillment: row.order_fulfillment_rate,
        paymentTimeliness: row.payment_timeliness,
        orderConsistency: row.order_consistency,
        platformEngagement: row.platform_engagement,
      },
      history: [], // History is fetched separately
      lastUpdated: new Date(row.last_updated),
    };
  }

  private mapRowToTrustScoreHistory(row: any): TrustScoreHistory {
    return {
      score: parseFloat(row.score),
      factors: row.factors,
      reason: row.reason,
      timestamp: new Date(row.created_at),
    };
  }
} 