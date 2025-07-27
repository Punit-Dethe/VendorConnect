export interface TrustScore {
  userId: string;
  currentScore: number;
  factors: TrustScoreFactors;
  totalOrders: number;
  successfulOrders: number;
  history: TrustScoreHistory[];
  lastUpdated: Date;
}

export interface TrustScoreFactors {
  onTimeDeliveryRate?: number;
  customerRating?: number;
  pricingCompetitiveness?: number;
  orderFulfillmentRate?: number;
  paymentTimeliness?: number;
  orderConsistency?: number;
  platformEngagement?: number;
}

export interface TrustScoreHistory {
  id: string;
  userId: string;
  score: number;
  factors: TrustScoreFactors;
  reason: string;
  createdAt: Date;
}

export interface UpdateTrustScoreRequest {
  userId: string;
  factors: Partial<TrustScoreFactors>;
  reason: string;
}

export interface SupplierRating {
  id: string;
  orderId: string;
  vendorId: string;
  supplierId: string;
  rating: number;
  review?: string;
  deliveryRating?: number;
  qualityRating?: number;
  serviceRating?: number;
  createdAt: Date;
}