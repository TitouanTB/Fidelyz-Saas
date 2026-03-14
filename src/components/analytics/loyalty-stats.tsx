"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, Gift, Coins, TrendingUp, Award, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <Card className="glass-surface border-white/5 rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div>
          <CardTitle className="text-xl font-bold font-heading text-text-primary flex items-center gap-2">
            <Star className="text-violet-default fill-violet-default" size={20} />
            Programme de Fidélité
          </CardTitle>
          <CardDescription className="text-text-tertiary mt-1">Performance des points et récompenses</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Points Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/4 border border-white/5 rounded-2xl hover:bg-white/6 transition-colors group">
            <div className="w-10 h-10 bg-violet-default/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Coins className="text-violet-default" size={20} />
            </div>
            <p className="text-xl font-bold text-text-primary font-heading tracking-tight">{stats.totalPointsIssued.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mt-1">Émis</p>
          </div>
          <div className="text-center p-4 bg-white/4 border border-white/5 rounded-2xl hover:bg-white/6 transition-colors group">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Gift className="text-success" size={20} />
            </div>
            <p className="text-xl font-bold text-text-primary font-heading tracking-tight">{stats.totalPointsRedeemed.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mt-1">Utilisés</p>
          </div>
          <div className="text-center p-4 bg-white/4 border border-white/5 rounded-2xl hover:bg-white/6 transition-colors group">
            <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="text-warning" size={20} />
            </div>
            <p className="text-xl font-bold text-text-primary font-heading tracking-tight">{stats.pointsInCirculation.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mt-1">En cours</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-white/5">
            <div className="flex items-center gap-2.5">
              <Users size={16} className="text-text-tertiary" />
              <span className="text-xs font-semibold text-text-secondary">Points Moy./Client</span>
            </div>
            <span className="text-sm font-bold text-text-primary">{stats.avgPointsPerCustomer.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-white/5">
            <div className="flex items-center gap-2.5">
              <Award size={16} className="text-text-tertiary" />
              <span className="text-xs font-semibold text-text-secondary">Taux de Rédemption</span>
            </div>
            <span className="text-sm font-bold text-success">{stats.redemptionRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Top Rewards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Récompenses Populaires</h4>
          </div>
          {topRewards.length === 0 ? (
            <div className="py-8 text-center bg-white/2 rounded-xl border border-dashed border-white/10">
              <p className="text-xs text-text-tertiary font-medium">Aucune récompense réclamée pour l'instant</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topRewards.map((reward, index) => (
                <div
                  key={reward.name}
                  className="group flex items-center justify-between p-3.5 bg-white/4 hover:bg-white/6 rounded-xl border border-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-violet-default/10 text-violet-default rounded-lg text-[10px] font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-text-primary group-hover:text-violet-default transition-colors">{reward.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter">{reward.claims} réclamations</p>
                      <p className="text-[10px] font-bold text-success uppercase tracking-tighter">{reward.redemptions} consommés</p>
                    </div>
                    <ChevronRight size={14} className="text-text-tertiary group-hover:translate-x-0.5 transition-transform" />
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
    Bronze: "from-orange-500 to-orange-400",
    Silver: "from-gray-400 to-gray-300",
    Gold: "from-yellow-500 to-yellow-400",
    Platinum: "from-purple-500 to-purple-400",
    "No Tier": "from-white/10 to-white/5",
  };

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  return (
    <Card className="glass-surface border-white/5 rounded-2xl overflow-hidden">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-bold font-heading text-text-primary">Répartition des Statuts</CardTitle>
        <CardDescription className="text-text-tertiary mt-1">Segmentation de votre base client</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(distribution).map(([tier, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={tier} className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-text-secondary">{tier}</span>
                  <div className="flex gap-2">
                    <span className="text-text-tertiary">{count} clients</span>
                    <span className="text-text-primary">{percentage.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="h-2 bg-white/5 overflow-hidden rounded-full border border-white/5">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
                      tierColors[tier] || "from-violet-default to-violet-hover"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Total</p>
          <p className="text-lg font-bold font-heading text-text-primary tracking-tight">{total} clients</p>
        </div>
      </CardContent>
    </Card>
  );
}

