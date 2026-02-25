export interface AnalyticsKPI {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface CustomerGrowthData {
  date: string;
  newCustomers: number;
  totalCustomers: number;
  activeCustomers: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  pointsIssued: number;
  pointsRedeemed: number;
}

export interface CampaignPerformanceData {
  name: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
}

export interface CohortData {
  cohort: string;
  customers: number;
  retention: number[];
  revenue: number[];
}

export interface CohortRow {
  cohortMonth: string;
  customers: number;
  retentionRates: (number | null)[];
}

export interface ROIData {
  totalInvestment: number;
  totalRevenue: number;
  customerLifetimeValue: number;
  acquisitionCost: number;
  retentionRate: number;
  roi: number;
  paybackPeriod: number;
}

export interface AnalyticsFilters {
  period: "7d" | "30d" | "90d" | "1y" | "custom";
  startDate?: Date;
  endDate?: Date;
  campaignId?: string;
  channel?: string;
}

export interface MessageAnalytics {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export interface CustomerAnalytics {
  total: number;
  new: number;
  active: number;
  churned: number;
  avgPoints: number;
  avgVisits: number;
  avgSpend: number;
  byTier: Record<string, number>;
  byTag: Record<string, number>;
}

export interface LoyaltyAnalytics {
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  pointsInCirculation: number;
  avgPointsPerCustomer: number;
  redemptionRate: number;
  topRewards: Array<{
    name: string;
    claims: number;
    redemptions: number;
  }>;
}

export interface ExportData {
  kpis: AnalyticsKPI[];
  customerGrowth: CustomerGrowthData[];
  revenue: RevenueData[];
  campaignPerformance: CampaignPerformanceData[];
  cohorts: CohortRow[];
  roi: ROIData;
  messageAnalytics: MessageAnalytics;
  customerAnalytics: CustomerAnalytics;
  loyaltyAnalytics: LoyaltyAnalytics;
  generatedAt: string;
  period: string;
}
