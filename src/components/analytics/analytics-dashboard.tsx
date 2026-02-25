"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Target,
  Mail,
  MousePointer,
  Star,
  BarChart3,
  Coins,
  Gift,
} from "lucide-react";
import {
  KPICardsGrid,
  LineChartWidget,
  AreaChartWidget,
  BarChartWidget,
  PieChartWidget,
  CohortTable,
  ROICalculator,
  ExportButtons,
  DateRangeFilter,
  QuickPeriodSelector,
  LoyaltyStatsCard,
  TierDistribution,
  type Period,
} from "@/components/analytics";
import { AnalyticsLoadingSkeleton } from "@/components/analytics/loading-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeDisplay } from "./date-range-filter";

interface AnalyticsData {
  period: {
    start: string;
    end: string;
    label: string;
  };
  kpis: {
    customers: { total: number; new: number; growth: number };
    messages: { total: number; deliveryRate: number; openRate: number; clickRate: number };
    revenue: { total: number; growth: number };
    visits: { total: number; growth: number };
    points: { earned: number; redeemed: number; growth: number };
  };
  charts: {
    customerGrowth: Array<{ date: string; newCustomers: number }>;
    messages: Array<{ date: string; sent: number; delivered: number; opened: number; clicked: number }>;
    revenue: Array<{ date: string; revenue: number; visits: number }>;
    campaignPerformance: Array<{ name: string; sent: number; delivered: number; opened: number; clicked: number }>;
  };
  cohorts: Array<{
    cohortMonth: string;
    customers: number;
    retentionRates: (number | null)[];
  }>;
  roi: {
    totalInvestment: number;
    totalRevenue: number;
    customerLifetimeValue: number;
    acquisitionCost: number;
    retentionRate: number;
    roi: number;
    paybackPeriod: number;
  };
  tierDistribution: Record<string, number>;
  topRewards: Array<{ name: string; claims: number; redemptions: number }>;
  loyalty: {
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    pointsInCirculation: number;
    avgPointsPerCustomer: number;
    redemptionRate: number;
  };
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("30d");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ period });
      if (period === "custom" && customStartDate) {
        params.append("startDate", customStartDate.toISOString());
      }
      if (period === "custom" && customEndDate) {
        params.append("endDate", customEndDate.toISOString());
      }

      const response = await fetch(`/api/analytics?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [period, customStartDate, customEndDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePeriodChange = (newPeriod: Period, startDate?: Date, endDate?: Date) => {
    setPeriod(newPeriod);
    if (startDate) setCustomStartDate(startDate);
    if (endDate) setCustomEndDate(endDate);
  };

  if (loading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        No data available
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Customers",
      value: data.kpis.customers.total,
      change: data.kpis.customers.growth,
      icon: Users,
      iconColor: "text-blue-600",
    },
    {
      title: "New Customers",
      value: data.kpis.customers.new,
      changeLabel: "this period",
      icon: TrendingUp,
      iconColor: "text-green-600",
    },
    {
      title: "Total Revenue",
      value: data.kpis.revenue.total,
      change: data.kpis.revenue.growth,
      format: "currency" as const,
      icon: DollarSign,
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Visits",
      value: data.kpis.visits.total,
      change: data.kpis.visits.growth,
      icon: Target,
      iconColor: "text-indigo-600",
    },
    {
      title: "Messages Sent",
      value: data.kpis.messages.total,
      icon: MessageSquare,
      iconColor: "text-purple-600",
    },
    {
      title: "Delivery Rate",
      value: data.kpis.messages.deliveryRate.toFixed(1),
      format: "percent" as const,
      icon: Mail,
      iconColor: "text-cyan-600",
    },
    {
      title: "Open Rate",
      value: data.kpis.messages.openRate.toFixed(1),
      format: "percent" as const,
      icon: Mail,
      iconColor: "text-orange-600",
    },
    {
      title: "Click Rate",
      value: data.kpis.messages.clickRate.toFixed(1),
      format: "percent" as const,
      icon: MousePointer,
      iconColor: "text-pink-600",
    },
  ];

  const tierData = Object.entries(data.tierDistribution).map(([name, value], index) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <DateRangeDisplay
            startDate={new Date(data.period.start)}
            endDate={new Date(data.period.end)}
            period={period}
          />
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter
            value={period}
            onChange={handlePeriodChange}
            startDate={customStartDate}
            endDate={customEndDate}
          />
          <ExportButtons period={period} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          <TabsTrigger value="roi">ROI</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <KPICardsGrid kpis={kpis} />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaChartWidget
              title="Customer Growth"
              description="New customers over time"
              data={data.charts.customerGrowth}
              areas={[{ dataKey: "newCustomers", name: "New Customers", color: "#9317FD" }]}
            />
            <BarChartWidget
              title="Revenue & Visits"
              description="Daily revenue and visit count"
              data={data.charts.revenue}
              bars={[
                { dataKey: "revenue", name: "Revenue (€)", color: "#00D9FF" },
                { dataKey: "visits", name: "Visits", color: "#9317FD" },
              ]}
            />
          </div>

          {/* Loyalty and Tier Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LoyaltyStatsCard stats={data.loyalty} topRewards={data.topRewards} />
            <TierDistribution distribution={data.tierDistribution} />
          </div>

          {/* Campaign Performance */}
          {data.charts.campaignPerformance.length > 0 && (
            <BarChartWidget
              title="Campaign Performance"
              description="Top campaigns by engagement"
              data={data.charts.campaignPerformance}
              bars={[
                { dataKey: "sent", name: "Sent", color: "#3B82F6" },
                { dataKey: "opened", name: "Opened", color: "#10B981" },
                { dataKey: "clicked", name: "Clicked", color: "#F59E0B" },
              ]}
            />
          )}
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{data.kpis.customers.total}</p>
                <p className="text-sm text-green-600 mt-1">+{data.kpis.customers.growth.toFixed(1)}% growth</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">New This Period</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{data.kpis.customers.new}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Points/Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{data.loyalty.avgPointsPerCustomer.toFixed(0)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaChartWidget
              title="Customer Acquisition"
              description="New customers over time"
              data={data.charts.customerGrowth}
              areas={[{ dataKey: "newCustomers", name: "New Customers", color: "#9317FD" }]}
            />
            <TierDistribution distribution={data.tierDistribution} />
          </div>

          <LoyaltyStatsCard stats={data.loyalty} topRewards={data.topRewards} />
        </TabsContent>

        {/* Messaging Tab */}
        <TabsContent value="messaging" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Messages Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{data.kpis.messages.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Delivery Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{data.kpis.messages.deliveryRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{data.kpis.messages.openRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{data.kpis.messages.clickRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          <LineChartWidget
            title="Message Performance Over Time"
            description="Sent, delivered, opened, and clicked messages"
            data={data.charts.messages}
            lines={[
              { dataKey: "sent", name: "Sent", color: "#3B82F6" },
              { dataKey: "delivered", name: "Delivered", color: "#10B981" },
              { dataKey: "opened", name: "Opened", color: "#F59E0B" },
              { dataKey: "clicked", name: "Clicked", color: "#EF4444" },
            ]}
          />

          {data.charts.campaignPerformance.length > 0 && (
            <BarChartWidget
              title="Campaign Performance"
              description="Top campaigns by engagement"
              data={data.charts.campaignPerformance}
              bars={[
                { dataKey: "sent", name: "Sent", color: "#3B82F6" },
                { dataKey: "opened", name: "Opened", color: "#10B981" },
                { dataKey: "clicked", name: "Clicked", color: "#F59E0B" },
              ]}
            />
          )}
        </TabsContent>

        {/* Cohorts Tab */}
        <TabsContent value="cohorts" className="space-y-6">
          <CohortTable data={data.cohorts} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-medium text-indigo-900">What is Cohort Analysis?</h4>
                    <p className="text-sm text-indigo-700 mt-1">
                      Cohort analysis groups customers by their signup month and tracks their behavior over time.
                      This helps you understand retention patterns and identify which customer groups are most valuable.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Avg Retention (Month 1)</p>
                      <p className="text-xl font-bold text-gray-900">
                        {data.cohorts.length > 0
                          ? `${(
                              data.cohorts
                                .filter((c) => c.retentionRates[1] !== null)
                                .reduce((sum, c) => sum + (c.retentionRates[1] || 0), 0) /
                              data.cohorts.filter((c) => c.retentionRates[1] !== null).length
                            ).toFixed(0)}%`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Avg Retention (Month 3)</p>
                      <p className="text-xl font-bold text-gray-900">
                        {data.cohorts.length > 0
                          ? `${(
                              data.cohorts
                                .filter((c) => c.retentionRates[3] !== null)
                                .reduce((sum, c) => sum + (c.retentionRates[3] || 0), 0) /
                              data.cohorts.filter((c) => c.retentionRates[3] !== null).length
                            ).toFixed(0)}%`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>Send personalized offers to customers at risk of churning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>Implement a welcome series for new customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>Offer milestone rewards to encourage repeat visits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>Use multi-channel communication to stay top of mind</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ROI Tab */}
        <TabsContent value="roi" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ROICalculator data={data.roi} />
            <Card>
              <CardHeader>
                <CardTitle>Understanding Your ROI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-medium text-indigo-900">How is ROI Calculated?</h4>
                  <p className="text-sm text-indigo-700 mt-1">
                    ROI = ((Total Revenue - Total Investment) / Total Investment) × 100%
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">1</div>
                    <div>
                      <h5 className="font-medium text-gray-900">Investment</h5>
                      <p className="text-sm text-gray-600">Platform costs, rewards, messaging fees</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">2</div>
                    <div>
                      <h5 className="font-medium text-gray-900">Revenue</h5>
                      <p className="text-sm text-gray-600">Total spend from loyalty program members</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">3</div>
                    <div>
                      <h5 className="font-medium text-gray-900">Payback Period</h5>
                      <p className="text-sm text-gray-600">Time to recover your investment</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Loyalty Member Spend</span>
                    <span className="font-semibold">€{data.kpis.revenue.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Transaction Value</span>
                    <span className="font-semibold">
                      €{data.kpis.visits.total > 0 ? (data.kpis.revenue.total / data.kpis.visits.total).toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Points Redemption Value</span>
                    <span className="font-semibold">€{(data.loyalty.totalPointsRedeemed * 0.01).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Value Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Customer Lifetime Value</span>
                    <span className="font-semibold">€{data.roi.customerLifetimeValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Retention Rate</span>
                    <span className="font-semibold">{data.roi.retentionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Visits/Customer</span>
                    <span className="font-semibold">
                      {data.kpis.customers.total > 0 ? (data.kpis.visits.total / data.kpis.customers.total).toFixed(1) : "0"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
