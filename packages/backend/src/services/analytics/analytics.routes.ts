import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { OrderRepository } from '../../database/repositories/order.repository';
import { PaymentRepository } from '../../database/repositories/payment.repository';
import { TrustScoreRepository } from '../../database/repositories/trust-score.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { pool } from '../../database/connection';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

const orderRepository = new OrderRepository(pool);
const paymentRepository = new PaymentRepository(pool);
const trustScoreRepository = new TrustScoreRepository(pool);
const userRepository = new UserRepository(pool);

const analyticsController = new AnalyticsController();

// All analytics routes require authentication
router.use(authenticateToken);

// Public/Overall Analytics
router.get('/overall', analyticsController.getOverallAnalytics);

// User-specific Analytics (vendor/supplier dashboard)
router.get('/me/vendor', analyticsController.getVendorAnalytics); // Authenticated vendor's analytics
router.get('/me/supplier', analyticsController.getSupplierAnalytics); // Authenticated supplier's analytics
router.get('/trust-trend/:userId', analyticsController.getTrustScoreTrend);

// Rankings
router.get('/top-suppliers', analyticsController.getTopSuppliers);
router.get('/top-vendors', analyticsController.getTopVendors);

export default router; 