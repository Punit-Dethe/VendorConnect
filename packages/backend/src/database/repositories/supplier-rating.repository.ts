import { BaseRepository } from './base.repository';
import { pool } from '../connection';

export class SupplierRatingRepository extends BaseRepository {
  constructor() {
    super(pool);
  }

  public async getAverageSupplierRating(supplierId: string): Promise<number | null> {
    const query = `
      SELECT AVG(rating) as average_rating
      FROM supplier_ratings
      WHERE supplier_id = $1;
    `;
    const result = await this.query(query, [supplierId]);
    return result.rows[0]?.average_rating || null;
  }
} 