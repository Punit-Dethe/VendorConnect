import { Request, Response } from 'express';
import { TrustScoreService } from './trust-score.service';
import { logger } from '../../utils/logger';

export class TrustScoreController {
  constructor(private trustScoreService: TrustScoreService) {}

  public async getTrustScore(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const trustScore = await this.trustScoreService.getTrustScore(userId);
      if (!trustScore) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trust score not found for this user.' } });
      }
      return res.status(200).json({ success: true, data: trustScore });
    } catch (error: any) {
      logger.error(`Error getting trust score: ${error.message}`);
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to retrieve trust score.', details: error.message } });
    }
  }

  public async getTrustScoreHistory(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const history = await this.trustScoreService.getTrustScoreHistory(userId);
      return res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      logger.error(`Error getting trust score history: ${error.message}`);
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to retrieve trust score history.', details: error.message } });
    }
  }

  public async updateTrustFactors(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const { factors } = req.body;
      // In a real scenario, you'd likely want to ensure only authenticated
      // services or internal triggers call this, not direct user input.
      const updatedScore = await this.trustScoreService.updateTrustFactors(userId, factors);
      return res.status(200).json({ success: true, message: 'Trust factors updated and score recalculated.', data: { newScore: updatedScore } });
    } catch (error: any) {
      logger.error(`Error updating trust factors: ${error.message}`);
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update trust factors.', details: error.message } });
    }
  }

  public async getTrustRankings(req: Request, res: Response): Promise<Response> {
    try {
      const { role } = req.query; // 'vendor' or 'supplier'
      const rankings = await this.trustScoreService.getTrustRankings(role as 'vendor' | 'supplier');
      return res.status(200).json({ success: true, data: rankings });
    } catch (error: any) {
      logger.error(`Error getting trust rankings: ${error.message}`);
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to retrieve trust rankings.', details: error.message } });
    }
  }

  // Method to trigger score recalculation (e.g., after an order is delivered or payment made)
  public async triggerScoreRecalculation(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, role } = req.body; // Expect userId and role to trigger specific score calculation
      if (!userId || !role) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'userId and role are required.' } });
      }

      let newScore: number | null = null;
      if (role === 'supplier') {
        newScore = await this.trustScoreService.calculateSupplierScore(userId);
      } else if (role === 'vendor') {
        newScore = await this.trustScoreService.calculateVendorScore(userId);
      }

      if (newScore === null) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid role provided.' } });
      }

      return res.status(200).json({ success: true, message: 'Trust score recalculation triggered successfully.', data: { newScore } });
    } catch (error: any) {
      logger.error(`Error triggering score recalculation: ${error.message}`);
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to trigger score recalculation.', details: error.message } });
    }
  }
} 