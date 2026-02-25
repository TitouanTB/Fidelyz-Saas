"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, Gift, Coins, TrendingUp, Award, Users } from "lucide-react";

interface LoyaltyStats {
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  pointsInCirculation: number;
  avgPointsPerCustomer: number;
  redemptionRate: number;
}

interface TopReward {
  name: string;
  claims: number;
  redemptions: number;
}

interface LoyaltyStatsCardProps {
  stats: LoyaltyStats;
  topRewards: TopReward[];
}

export function LoyaltyStatsCard({ stats, topRewards }: LoyaltyStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Star className="text-yellow-500" size={20} />
          Loyalty Program Stats
        </CardTitle>
        <CardDescription>Points and rewards performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <Coins className="mx-auto text-indigo-600 mb-1" size={24} />
            <p className="text-2xl font-bold text-gray-900">{stats.totalPointsIssued.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Points Issued</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Gift className="mx-auto text-green-600 mb-1" size={24} />
            <p className="text-2xl font-bold text-gray-900">{stats.totalPointsRedeemed.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Points Redeemed</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <TrendingUp className="mx-auto text-purple-600 mb-1" size={24} />
            <p className="text-2xl font-bold text-gray-900">{stats.pointsInCirculation.toLocaleString()}</p>
            <p className="text-xs text-gray-500">In Circulation</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">Avg Points/Customer</span>
            </div>
            <span className="font-semibold text-gray-900">{stats.avgPointsPerCustomer.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">Redemption Rate</span>
            </div>
            <span className="font-semibold text-gray-900">{stats.redemptionRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Top Rewards */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Top Rewards</h4>
          {topRewards.length === 0 ? (
            <p className="text-sm text-gray-500">No rewards claimed yet</p>
          ) : (
            <div className="space-y-2">
              {topRewards.map((reward, index) => (
                <div
                  key={reward.name}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{reward.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{reward.claims} claims</span>
                    <span className="text-green-600 font-medium">{reward.redemptions} redeemed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface TierDistributionProps {
  distribution: Record<string, number>;
}

export function TierDistribution({ distribution }: TierDistributionProps) {
  const tierColors: Record<string, string> = {
    Bronze: "bg-orange-500",
    Silver: "bg-gray-400",
    Gold: "bg-yellow-500",
    Platinum: "bg-purple-500",
    "No Tier": "bg-gray-200",
  };

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Customer Tiers</CardTitle>
        <CardDescription>Distribution of customers by tier level</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(distribution).map(([tier, count]) => (
            <div key={tier} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${tierColors[tier] || "bg-gray-300"}`} />
              <span className="text-sm text-gray-600 w-20">{tier}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${tierColors[tier] || "bg-gray-300"}`}
                  style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-12 text-right">{count}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">Total: {total} customers</p>
      </CardContent>
    </Card>
  );
}
