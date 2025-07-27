import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFoundHandler } from '@middleware/error.middleware';

// Import routes
import authRoutes from '@services/auth/auth.routes';
import productRoutes from '@services/products/product.routes';
import orderRoutes from '@services/orders/order.routes';
import supplierRoutes from '@services/suppliers/supplier.routes';
import trustScoreRoutes from '@services/trust-score/trust-score.routes'; // Import TrustScore routes
import analyticsRoutes from '@services/analytics/analytics.routes'; // Import Analytics routes

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date()
    }
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/trust', trustScoreRoutes); // Use TrustScore routes
app.use('/api/analytics', analyticsRoutes); // Use Analytics routes

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;