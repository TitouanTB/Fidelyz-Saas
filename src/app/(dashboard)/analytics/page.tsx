import { Metadata } from "next";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export const metadata: Metadata = { 
  title: "Analytics - Fidelyz",
  description: "Comprehensive analytics dashboard with KPIs, charts, ROI calculation, cohort analysis, and export functionality"
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
