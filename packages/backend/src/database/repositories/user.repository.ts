import { BaseRepository } from './base.repository';
import { pool } from '../connection';
import { User } from '@vendor-supplier/shared/src/types';

export class UserRepository extends BaseRepository {
  constructor(pool: any) { // Explicitly accept pool
    super(pool);
  }

  public async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0] ? this.mapUserRowToUser(result.rows[0]) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.query(query, [email]);
    return result.rows[0] ? this.mapUserRowToUser(result.rows[0]) : null;
  }

  public async findByMobile(mobile: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE mobile = $1';
    const result = await this.query(query, [mobile]);
    return result.rows[0] ? this.mapUserRowToUser(result.rows[0]) : null;
  }

  public async createUser(user: Partial<User>): Promise<User> {
    const query = `
      INSERT INTO users (
        name, mobile, email, password_hash, role, business_type, address, city, state, pincode,
        latitude, longitude, is_active, is_verified, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    const result = await this.query(query, [
      user.name,
      user.mobile,
      user.email || null,
      (user as any).passwordHash || null, // Use (user as any).passwordHash
      user.role,
      user.businessType,
      user.location?.address,
      user.location?.city,
      user.location?.state,
      user.location?.pincode,
      user.location?.coordinates?.lat || null,
      user.location?.coordinates?.lng || null,
      user.isActive !== undefined ? user.isActive : true,
      user.isVerified !== undefined ? user.isVerified : false,
    ]);
    return this.mapUserRowToUser(result.rows[0]);
  }

  public async updateUser(id: string, updateData: Partial<User>): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const key in updateData) {
      if (updateData.hasOwnProperty(key)) {
        if (key === 'location') {
          if (updateData.location?.address !== undefined) { fields.push(`address = $${paramIndex++}`); values.push(updateData.location.address); }
          if (updateData.location?.city !== undefined) { fields.push(`city = $${paramIndex++}`); values.push(updateData.location.city); }
          if (updateData.location?.state !== undefined) { fields.push(`state = $${paramIndex++}`); values.push(updateData.location.state); }
          if (updateData.location?.pincode !== undefined) { fields.push(`pincode = $${paramIndex++}`); values.push(updateData.location.pincode); }
          if (updateData.location?.coordinates?.lat !== undefined) { fields.push(`latitude = $${paramIndex++}`); values.push(updateData.location.coordinates.lat); }
          if (updateData.location?.coordinates?.lng !== undefined) { fields.push(`longitude = $${paramIndex++}`); values.push(updateData.location.coordinates.lng); }
        } else if (key === 'passwordHash') {
          fields.push(`password_hash = $${paramIndex++}`);
          values.push((updateData as any).passwordHash); // Use (updateData as any).passwordHash
        } else {
          const dbColumnName = this.toSnakeCase(key);
          fields.push(`${dbColumnName} = $${paramIndex++}`);
          values.push((updateData as any)[key]);
        }
      }
    }
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id); // Add user id for WHERE clause

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await this.query(query, values);
    return result.rows[0] ? this.mapUserRowToUser(result.rows[0]) : null;
  }

  public async countUsers(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM users';
    const result = await this.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  public async countUsersByRole(role: 'vendor' | 'supplier'): Promise<number> {
    const query = 'SELECT COUNT(*) FROM users WHERE role = $1';
    const result = await this.query(query, [role]);
    return parseInt(result.rows[0].count, 10);
  }

  private mapUserRowToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      mobile: row.mobile,
      email: row.email || undefined,
      role: row.role,
      location: {
        address: row.address,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        coordinates: {
          lat: row.latitude,
          lng: row.longitude,
        },
      },
      businessType: row.business_type,
      trustScore: row.trust_score,
      isActive: row.is_active,
      isVerified: row.is_verified,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
