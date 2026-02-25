"use client";

import { useState } from "react";
import {
  Star,
  Gift,
  History,
  Award,
  TrendingUp,
  Calendar,
  MapPin,
  ChevronRight,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CustomerPortalContentProps {
  organization: {
    name: string;
    primaryColor: string;
    logoUrl?: string | null;
  };
  customer?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    phone?: string | null;
    points: number;
    tier?: string | null;
    totalSpend: number;
    visitCount: number;
    createdAt: string;
    lastVisitAt?: string | null;
  } | null;
  pointsHistory?: Array<{
    id: string;
    points: number;
    type: string;
    source?: string | null;
    description?: string | null;
    createdAt: string;
  }>;
  rewardClaims?: Array<{
    id: string;
    status: string;
    code?: string | null;
    claimedAt: string;
    redeemedAt?: string | null;
    expiresAt?: string | null;
    reward: {
      name: string;
      description?: string | null;
      type: string;
      value?: number | null;
    };
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

export function CustomerPortalContent({
  organization,
  customer,
  pointsHistory = [],
  rewardClaims = [],
  loyaltyConfig,
  theme,
  slug,
}: CustomerPortalContentProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customerData, setCustomerData] = useState(customer);

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
        window.location.reload();
      }
    } catch (error) {
      console.error("Login error:", error);
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
            <Award className="w-8 h-8" style={{ color: theme.primaryColor }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Your Account</h2>
          <p className="text-gray-600 mt-2">
            Sign in to view your points and rewards
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
            Sign In
          </Button>
        </form>
      </div>
    );
  }

  const customerName =
    [customerData.firstName, customerData.lastName].filter(Boolean).join(" ") ||
    customerData.email.split("@")[0];

  const tierThresholds = loyaltyConfig?.tierThresholds as Record<string, number> | undefined;
  const currentTier = customerData.tier || "Member";

  const stats = [
    {
      label: "Points",
      value: customerData.points,
      icon: Star,
      color: theme.primaryColor,
    },
    {
      label: "Visits",
      value: customerData.visitCount,
      icon: Calendar,
      color: theme.secondaryColor,
    },
    {
      label: "Total Spent",
      value: formatCurrency(customerData.totalSpend),
      icon: TrendingUp,
      color: theme.accentColor,
    },
  ];

  const activeRewards = rewardClaims.filter(
    (r) => r.status === "PENDING" && (!r.expiresAt || new Date(r.expiresAt) > new Date())
  );

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {customerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{customerName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  style={{
                    backgroundColor: theme.secondaryColor + "20",
                    color: theme.secondaryColor,
                  }}
                >
                  {currentTier}
                </Badge>
                <span className="text-sm text-gray-500">
                  Member since {formatDate(customerData.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p
              className="text-4xl font-bold"
              style={{ color: theme.primaryColor }}
            >
              {customerData.points}
            </p>
            <p className="text-sm text-gray-500">points</p>
          </div>
        </div>

        {tierThresholds && Object.keys(tierThresholds).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Tier Progress
            </h4>
            <div className="space-y-4">
              {Object.entries(tierThresholds).map(([tier, threshold]) => {
                const isAchieved = customerData.points >= threshold;
                const isCurrent = customerData.tier === tier;

                return (
                  <div key={tier} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isAchieved
                          ? "text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                      style={
                        isAchieved
                          ? { backgroundColor: theme.primaryColor }
                          : {}
                      }
                    >
                      {isAchieved ? (
                        <Award className="w-4 h-4" />
                      ) : (
                        <Award className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={
                            isAchieved ? "font-medium text-gray-900" : "text-gray-500"
                          }
                        >
                          {tier}
                        </span>
                        <span className="text-gray-500">{threshold} pts</span>
                      </div>
                      {isCurrent && (
                        <Progress
                          value={100}
                          className="h-1 mt-1"
                          style={
                            {
                              "--progress-background": theme.primaryColor,
                            } as React.CSSProperties
                          }
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p
                    className="text-2xl font-bold mt-1"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: stat.color + "15", color: stat.color }}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="rewards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rewards">My Rewards</TabsTrigger>
          <TabsTrigger value="history">Points History</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-4">
          <h3 className="font-semibold text-gray-900">
            Active Rewards ({activeRewards.length})
          </h3>

          {activeRewards.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No active rewards</p>
              <Button
                className="mt-4"
                style={{ backgroundColor: theme.primaryColor }}
                onClick={() => (window.location.href = `/${slug}/rewards`)}
              >
                Browse Rewards
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRewards.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {claim.reward.name}
                      </h4>
                      {claim.reward.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {claim.reward.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {claim.reward.type.replace("_", " ")}
                        </Badge>
                        {claim.code && (
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {claim.code}
                          </code>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  {claim.expiresAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      Expires: {formatDate(claim.expiresAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <h3 className="font-semibold text-gray-900 mt-8">Recent Claims</h3>
          {rewardClaims.length > 0 ? (
            <div className="space-y-3">
              {rewardClaims.slice(0, 5).map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{claim.reward.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(claim.claimedAt)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      claim.status === "REDEEMED"
                        ? "default"
                        : claim.status === "EXPIRED"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {claim.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No claims yet</p>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {pointsHistory.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {pointsHistory.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.points > 0
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {transaction.points > 0 ? "+" : "-"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description || transaction.source || "Points"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      transaction.points > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.points > 0 ? "+" : ""}
                    {transaction.points}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No points history yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">First Name</label>
                  <p className="font-medium">{customerData.firstName || "-"}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Last Name</label>
                  <p className="font-medium">{customerData.lastName || "-"}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">{customerData.email}</p>
              </div>
              {customerData.phone && (
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="font-medium">{customerData.phone}</p>
                </div>
              )}
              {customerData.lastVisitAt && (
                <div>
                  <label className="text-sm text-gray-500">Last Visit</label>
                  <p className="font-medium">{formatDate(customerData.lastVisitAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Notifications</span>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
