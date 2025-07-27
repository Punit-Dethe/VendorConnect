import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@config/jwt';
import { AppError } from '@middleware/error.middleware';
import { UserRepository } from '@repositories/user.repository';
import { pool } from '@database/connection';
import asyncHandler from '@utils/asyncHandler';
import { User } from '@vendor-supplier/shared/src/types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const userRepository = new UserRepository(pool);

export const authenticateToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('Access token is required', 401, 'UNAUTHORIZED');
  }

    const decoded = verifyToken(token);
  const user = await userRepository.findById(decoded.userId);

  if (!user) {
    throw new AppError('User not found', 401, 'UNAUTHORIZED');
  }

  req.user = user; // Assign the full user object
  next();
});

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
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