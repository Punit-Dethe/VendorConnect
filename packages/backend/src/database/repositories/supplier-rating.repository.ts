import { query } from 'src/config/database';
import { SupplierRating } from '@vendor-supplier/shared/src/types';

export class SupplierRatingRepository {
  constructor() {}

  public async getAverageSupplierRating(supplierId: string): Promise<number | null> {
    const q = `
      SELECT AVG(rating) as average_rating
      FROM supplier_ratings
      WHERE supplier_id = $1;
    `;
    const result = await query(q, [supplierId]);
    return result.rows[0]?.average_rating || null;
  }

  public async findBySupplierId(supplierId: string): Promise<SupplierRating[]> {
    const q = `
      SELECT * FROM supplier_ratings
      WHERE supplier_id = $1;
    `;
    const result = await query(q, [supplierId]);
    return result.rows;
  }

  // Add other methods as needed, e.g., addRating, updateRating, deleteRating
} 