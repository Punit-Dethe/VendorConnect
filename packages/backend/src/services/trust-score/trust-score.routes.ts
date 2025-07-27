import { Router } from 'express';
import { TrustScoreController } from './trust-score.controller';
import { TrustScoreService } from './trust-score.service';
import { TrustScoreRepository } from '../../database/repositories/trust-score.repository';
import { OrderRepository } from '../../database/repositories/order.repository';
import { PaymentRepository } from '../../database/repositories/payment.repository';
import { SupplierRatingRepository } from '../../database/repositories/supplier-rating.repository';
import { pool } from '../../database/connection';

const router = Router();

const trustScoreRepository = new TrustScoreRepository(pool);
const orderRepository = new OrderRepository(pool);
const paymentRepository = new PaymentRepository(pool);
const supplierRatingRepository = new SupplierRatingRepository(pool);

const trustScoreService = new TrustScoreService(
  trustScoreRepository,
  orderRepository,
  paymentRepository,
  supplierRatingRepository
);

const trustScoreController = new TrustScoreController(trustScoreService);

router.get('/score/:userId', trustScoreController.getTrustScore.bind(trustScoreController));
router.get('/history/:userId', trustScoreController.getTrustScoreHistory.bind(trustScoreController));
router.post('/update-factors/:userId', trustScoreController.updateTrustFactors.bind(trustScoreController));
router.get('/rankings', trustScoreController.getTrustRankings.bind(trustScoreController));
router.post('/recalculate', trustScoreController.triggerScoreRecalculation.bind(trustScoreController));

export default router;
 