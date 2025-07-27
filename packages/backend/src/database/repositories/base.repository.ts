import { Pool, QueryResult } from 'pg';

export class BaseRepository {
  protected pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  protected async query(text: string, params: any[] = []): Promise<QueryResult> {
    try {
      const res = await this.pool.query(text, params);
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error('Database query failed');
    }
  }
} 