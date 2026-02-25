"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Percent, Clock, Target } from "lucide-react";

interface ROIData {
  totalInvestment: number;
  totalRevenue: number;
  customerLifetimeValue: number;
  acquisitionCost: number;
  retentionRate: number;
  roi: number;
  paybackPeriod: number;
}

interface ROICalculatorProps {
  data: ROIData;
}

export function ROICalculator({ data }: ROICalculatorProps) {
  const formatCurrency = (value: number) => `€${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const formatDays = (value: number) => value < 30 ? `${value.toFixed(0)} days` : `${(value / 30).toFixed(1)} months`;

  const roiColor = data.roi >= 100 ? "text-green-600" : data.roi >= 0 ? "text-yellow-600" : "text-red-600";
  const roiBg = data.roi >= 100 ? "bg-green-50 border-green-200" : data.roi >= 0 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="text-indigo-600" size={20} />
          ROI Analysis
        </CardTitle>
        <CardDescription>Return on investment for your loyalty program</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main ROI Display */}
        <div className={`p-6 rounded-xl border-2 ${roiBg} text-center`}>
          <p className="text-sm text-gray-600 mb-2">Return on Investment</p>
          <p className={`text-4xl font-bold ${roiColor}`}>
            {data.roi >= 0 ? "+" : ""}{formatPercent(data.roi)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {data.roi >= 100
              ? "Excellent! Your loyalty program is generating strong returns"
              : data.roi >= 0
                ? "Good progress! Continue optimizing for better returns"
                : "Consider adjusting your strategy to improve returns"}
          </p>
        </div>

        {/* ROI Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ROIMetric
            icon={DollarSign}
            label="Total Investment"
            value={formatCurrency(data.totalInvestment)}
            color="text-blue-600"
          />
          <ROIMetric
            icon={TrendingUp}
            label="Total Revenue"
            value={formatCurrency(data.totalRevenue)}
            color="text-green-600"
          />
          <ROIMetric
            icon={DollarSign}
            label="Customer Lifetime Value"
            value={formatCurrency(data.customerLifetimeValue)}
            color="text-purple-600"
          />
          <ROIMetric
            icon={Users}
            label="Acquisition Cost"
            value={formatCurrency(data.acquisitionCost)}
            color="text-orange-600"
          />
          <ROIMetric
            icon={Percent}
            label="Retention Rate"
            value={formatPercent(data.retentionRate)}
            color="text-teal-600"
          />
          <ROIMetric
            icon={Clock}
            label="Payback Period"
            value={formatDays(data.paybackPeriod)}
            color="text-indigo-600"
          />
        </div>

        {/* ROI Breakdown */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700">Investment Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Platform & Software</span>
              <span className="font-medium">€49.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Rewards & Redemptions</span>
              <span className="font-medium">€{(data.totalInvestment - 49).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Messaging Costs</span>
              <span className="font-medium">Included</span>
            </div>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">ROI Performance</span>
            <span className={`font-medium ${roiColor}`}>{formatPercent(data.roi)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${data.roi >= 100 ? "bg-green-500" : data.roi >= 50 ? "bg-yellow-500" : data.roi >= 0 ? "bg-orange-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(Math.max(data.roi, 0), 200) / 2}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>0%</span>
            <span>100%</span>
            <span>200%+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ROIMetricProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}

function ROIMetric({ icon: Icon, label, value, color = "text-gray-700" }: ROIMetricProps) {
  return (
    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
      <Icon size={20} className={color} />
      <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-500 text-center">{label}</p>
    </div>
  );
}

interface ROIChartProps {
  data: Array<{
    month: string;
    investment: number;
    revenue: number;
    cumulativeROI: number;
  }>;
}

export function ROIOverTime({ data }: ROIChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">ROI Over Time</CardTitle>
        <CardDescription>How your return on investment has evolved</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.month} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-16">{item.month}</span>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-3 relative">
                  <div
                    className="absolute left-0 top-0 h-3 bg-blue-500 rounded-full"
                    style={{ width: `${Math.min((item.investment / 1000) * 100, 100)}%` }}
                  />
                  <div
                    className="absolute left-0 top-0 h-3 bg-green-500 rounded-full opacity-50"
                    style={{ width: `${Math.min((item.revenue / 2000) * 100, 100)}%` }}
                  />
                </div>
                <span
                  className={`text-sm font-medium w-16 text-right ${
                    item.cumulativeROI >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.cumulativeROI >= 0 ? "+" : ""}
                  {item.cumulativeROI.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-500 rounded"></span>
            Investment
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded opacity-50"></span>
            Revenue
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
