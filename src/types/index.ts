export type { Organization, Customer, Campaign, Message, PublicPage, AnalyticsEvent, OrganizationMember } from "@prisma/client";
export { Plan, MemberRole, CampaignType, CampaignStatus, Channel, MessageStatus, PointsType } from "@prisma/client";

export interface DashboardStats {
  totalCustomers: number;
  totalCampaigns: number;
  totalMessages: number;
  openRate: number;
  clickRate: number;
  totalPoints: number;
  recentGrowth: number;
}

export interface OnboardingData {
  organizationName: string;
  industry: string;
  description: string;
  primaryColor: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface PublicPageContent {
  sections: PageSection[];
  theme: PageTheme;
}

export interface PageSection {
  id: string;
  type: "hero" | "benefits" | "loyalty" | "cta" | "custom";
  content: Record<string, unknown>;
}

export interface PageTheme {
  primaryColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface MessageTemplate {
  subject?: string;
  content: string;
  channel: "EMAIL" | "SMS" | "PUSH" | "WHATSAPP";
}

export interface AnalyticsPeriod {
  start: Date;
  end: Date;
  label: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
