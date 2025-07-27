import { Request, Response, NextFunction } from 'express';
import { TrustScoreService } from '../services/trust-score/trust-score.service';
import { AppError } from '../middleware/error.middleware';

export class TrustScoreController {
  private trustScoreService: TrustScoreService;

  constructor() {
    this.trustScoreService = new TrustScoreService();
  }

  public async getTrustScore(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const trustScore = await this.trustScoreService.getTrustScore(userId);
      if (!trustScore) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trust score not found for this user.' } });
      }
      return res.status(200).json({ success: true, data: trustScore });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to retrieve trust score.', details: error.message } });
    }
  }

  public async getTrustScoreHistory(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const history = await this.trustScoreService.getTrustScoreHistory(userId);
      return res.status(200).json({ success: true, data: history });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to retrieve trust score history.', details: error.message } });
    }
  }

  public async updateTrustFactors(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const { factors } = req.body;
      const updatedScore = await this.trustScoreService.updateTrustFactors(userId, factors);
      return res.status(200).json({ success: true, data: updatedScore, message: 'Trust factors updated and score recalculated.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update trust factors.', details: error.message } });
    }
  }

  public async getTrustRankings(req: Request, res: Response): Promise<Response> {
    try {
      const { role } = req.query; // 'vendor' or 'supplier'
      const rankings = await this.trustScoreService.getTrustRankings(role as 'vendor' | 'supplier');
      return res.status(200).json({ success: true, data: rankings });
    }  catch (error: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to retrieve trust rankings.', details: error.message } });
    }
  }

  public async triggerScoreRecalculation(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.body; // Expect userId only, service will determine role internally
      if (!userId) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'userId is required.' } });
      }

      const updatedScore = await this.trustScoreService.updateTrustFactors(userId, { recalculate: true }); // Trigger recalculation in service

      return res.status(200).json({ success: true, data: updatedScore.currentScore, message: 'Trust score recalculation triggered successfully.' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to trigger score recalculation.', details: error.message } });
    }
  }
} 