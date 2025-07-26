import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        mobile: string;
        name: string;
        email?: string;
        role: 'vendor' | 'supplier';
        trust_score: number;
        is_verified: boolean;
      };
    }
  }
}