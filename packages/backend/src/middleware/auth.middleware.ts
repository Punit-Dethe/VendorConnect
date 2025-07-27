import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { AppError } from './error.middleware';

interface AuthenticatedRequest extends Request {
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

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    throw new AppError('Access token is required', 401, 'UNAUTHORIZED');
  }

  try {
    const decoded = verifyToken(token);
    // Use the token data directly for now
    req.user = {
      id: parseInt(decoded.userId.replace(/\D/g, '')) || 1, // Extract number from userId
      mobile: decoded.mobile,
      name: decoded.mobile, // Use mobile as name for now
      email: undefined,
      role: decoded.role,
      trust_score: 75, // Default trust score
      is_verified: true
    };
    next();
  } catch (error) {
    throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
    }

    next();
  };
};