"use client";

import { useState, useEffect } from "react";
import {
  Gift,
  Star,
  Check,
  Lock,
  Sparkles,
  ChevronRight,
  Clock,
  Ticket,
  Percent,
  Coffee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Confetti from "react-confetti";

interface RewardFlowContentProps {
  organization: {
    name: string;
    primaryColor: string;
  };
  customer?: {
    id: string;
    firstName?: string | null;
    email: string;
    points: number;
    tier?: string | null;
  } | null;
  rewards: Array<{
    id: string;
    name: string;
    description?: string | null;
    pointsRequired: number;
    type: string;
    value?: number | null;
    imageUrl?: string | null;
    isActive: boolean;
    quantity?: number | null;
    claimedCount: number;
  }>;
  loyaltyConfig?: {
    pointsPerVisit: number;
    pointsPerEuro: number;
    welcomeBonus: number;
    tierThresholds?: Record<string, number> | null;
  } | null;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  slug: string;
}

const getRewardIcon = (type: string) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    DISCOUNT_PERCENT: Percent,
    DISCOUNT_FIXED: Ticket,
    FREE_PRODUCT: Coffee,
    FREE_ITEM: Gift,
    CASHBACK: Star,
    CUSTOM: Sparkles,
  };
  return icons[type] || Gift;
};

export function RewardFlowContent({
  organization,
  customer,
  rewards,
  loyaltyConfig,
  theme,
  slug,
}: RewardFlowContentProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customerData, setCustomerData] = useState(customer);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [claimCode, setClaimCode] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/public/${slug}/customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setCustomerData(data.customer);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    if (!customerData) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/public/${slug}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId, customerId: customerData.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setClaimCode(data.code);
        setShowConfetti(true);
        setSelectedReward(null);
        
        setCustomerData((prev) =>
          prev ? { ...prev, points: prev.points - data.pointsUsed } : null
        );

        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      console.error("Claim error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!customerData) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: theme.primaryColor + "20" }}
          >
            <Gift className="w-8 h-8" style={{ color: theme.primaryColor }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Claim Your Rewards</h2>
          <p className="text-gray-600 mt-2">
            Enter your email to access your rewards
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            style={{ backgroundColor: theme.primaryColor }}
          >
            Continue
          </Button>
        </form>
      </div>
    );
  }

  const availableRewards = rewards.filter(
    (r) => r.isActive && r.pointsRequired <= customerData.points
  );

  const lockedRewards = rewards.filter(
    (r) => r.isActive && r.pointsRequired > customerData.points
  );

  const nextReward = lockedRewards.sort(
    (a, b) => a.pointsRequired - b.pointsRequired
  )[0];

  const tierThresholds = loyaltyConfig?.tierThresholds as Record<string, number> | undefined;
  const currentTier = customerData.tier || "Member";

  return (
    <div className="space-y-8">
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 0}
          height={typeof window !== "undefined" ? window.innerHeight : 0}
          recycle={false}
        />
      )}

      {claimCode && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-800">Reward Claimed!</h3>
          <p className="text-green-600 mt-2">Your redemption code:</p>
          <div className="mt-4 inline-block bg-white px-6 py-3 rounded-lg border border-green-200">
            <code className="text-2xl font-mono font-bold text-green-700">
              {claimCode}
            </code>
          </div>
          <p className="text-sm text-green-600 mt-4">
            Show this code at {organization.name} to redeem your reward
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setClaimCode(null)}
          >
            Claim Another Reward
          </Button>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Welcome, {customerData.firstName || customerData.email.split("@")[0]}!
            </h2>
            <Badge
              className="mt-2"
              style={{ backgroundColor: theme.secondaryColor + "20", color: theme.secondaryColor }}
            >
              {currentTier}
            </Badge>
          </div>
          <div className="text-right">
            <p
              className="text-3xl font-bold"
              style={{ color: theme.primaryColor }}
            >
              {customerData.points}
            </p>
            <p className="text-sm text-gray-500">points</p>
          </div>
        </div>

        {nextReward && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Next reward: {nextReward.name}</span>
              <span>
                {customerData.points} / {nextReward.pointsRequired} pts
              </span>
            </div>
            <Progress
              value={(customerData.points / nextReward.pointsRequired) * 100}
              className="h-2"
              style={
                {
                  "--progress-background": theme.primaryColor,
                } as React.CSSProperties
              }
            />
            <p className="text-xs text-gray-500 mt-2">
              {nextReward.pointsRequired - customerData.points} more points needed
            </p>
          </div>
        )}
      </div>

      {loyaltyConfig && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">How to Earn Points</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 rounded-xl p-4">
              <p
                className="text-2xl font-bold"
                style={{ color: theme.primaryColor }}
              >
                +{loyaltyConfig.pointsPerVisit}
              </p>
              <p className="text-sm text-gray-500 mt-1">per visit</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p
                className="text-2xl font-bold"
                style={{ color: theme.primaryColor }}
              >
                +{loyaltyConfig.pointsPerEuro}
              </p>
              <p className="text-sm text-gray-500 mt-1">per € spent</p>
            </div>
          </div>

          {tierThresholds && Object.keys(tierThresholds).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="font-medium text-gray-900 mb-3">Tier Benefits</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(tierThresholds).map(([tier, threshold]) => (
                  <div
                    key={tier}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      customerData.points >= threshold
                        ? "font-medium"
                        : "text-gray-400"
                    }`}
                    style={
                      customerData.points >= threshold
                        ? {
                            backgroundColor: theme.primaryColor + "20",
                            color: theme.primaryColor,
                          }
                        : {}
                    }
                  >
                    {tier} ({threshold}+ pts)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Available Rewards ({availableRewards.length})
        </h3>

        {availableRewards.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No rewards available yet. Keep earning points!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableRewards.map((reward) => {
              const IconComponent = getRewardIcon(reward.type);
              const isDisabled =
                customerData.points < reward.pointsRequired ||
                (reward.quantity !== null &&
                  reward.quantity !== undefined &&
                  reward.claimedCount >= reward.quantity);

              return (
                <div
                  key={reward.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {reward.imageUrl && (
                    <img
                      src={reward.imageUrl}
                      alt={reward.name}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: theme.primaryColor + "15",
                          color: theme.primaryColor,
                        }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {reward.name}
                        </h4>
                        {reward.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {reward.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            {reward.pointsRequired} pts
                          </Badge>
                          {reward.value && (
                            <Badge
                              style={{
                                backgroundColor: theme.accentColor + "20",
                                color: theme.accentColor,
                              }}
                            >
                              {reward.type === "DISCOUNT_PERCENT"
                                ? `${reward.value}% off`
                                : `€${reward.value} value`}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4"
                      disabled={isDisabled}
                      loading={isLoading && selectedReward === reward.id}
                      onClick={() => {
                        setSelectedReward(reward.id);
                        handleClaimReward(reward.id);
                      }}
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      Claim Reward
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {lockedRewards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Locked Rewards ({lockedRewards.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lockedRewards.slice(0, 4).map((reward) => {
              const IconComponent = getRewardIcon(reward.type);
              const pointsNeeded = reward.pointsRequired - customerData.points;

              return (
                <div
                  key={reward.id}
                  className="bg-gray-100 rounded-xl border border-gray-200 overflow-hidden opacity-75"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-300 text-gray-500">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center">
                          <Lock className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-600 truncate">
                          {reward.name}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Need {pointsNeeded} more points
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          {reward.pointsRequired} pts
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
