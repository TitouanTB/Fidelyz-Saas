"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Gift,
  History,
  Award,
  Calendar,
  ChevronRight,
  Wallet,
  QrCode,
  X,
  ExternalLink,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PushSubscriber } from "./push-subscriber";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CustomerPortalProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    primaryColor: string;
  };
  customer: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    phone?: string | null;
    points: number;
    tier?: string | null;
    totalSpend: number;
    visits: number;
    createdAt: string;
    lastVisitAt?: string | null;
  };
  pointsHistory: Array<{
    id: string;
    points: number;
    type: string;
    source?: string | null;
    description?: string | null;
    createdAt: string;
  }>;
  rewardClaims: Array<{
    id: string;
    status: string;
    code?: string | null;
    claimedAt: string;
    redeemedAt?: string | null;
    expiresAt?: string | null;
    reward: {
      id: string;
      name: string;
      description?: string | null;
      type: string;
      value?: number | null;
    };
  }>;
  badges: Array<{
    id: string;
    badgeType: string;
    earnedAt: string;
    metadata?: {
      icon?: string;
      description?: string;
    } | null;
  }>;
  loyaltyConfig?: {
    pointsPerVisit: number;
    pointsPerEuro: number;
    welcomeBonus: number;
    tierThresholds?: Record<string, number> | null;
  } | null;
  nextReward?: {
    id: string;
    name: string;
    pointsRequired: number;
  } | null;
}

export function CustomerPortal({
  organization,
  customer,
  pointsHistory,
  rewardClaims,
  badges,
  loyaltyConfig,
  nextReward,
}: CustomerPortalProps) {
  const [showQR, setShowQR] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const primaryColor = organization.primaryColor || "#9317FD";

  const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

  const customerName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
    customer.email.split("@")[0];

  const tierThresholds = loyaltyConfig?.tierThresholds as Record<string, number> | undefined;
  const currentTier = customer.tier || "Membre";

  const activeRewards = rewardClaims.filter(
    (r) => r.status === "PENDING" && (!r.expiresAt || new Date(r.expiresAt) > new Date())
  );

  const progressPercent = nextReward
    ? Math.min((customer.points / nextReward.pointsRequired) * 100, 100)
    : 100;

  const hasGoogleWallet = rewardClaims.some(r => r.status === "PENDING" && r.code);

  return (
    <div className="min-h-screen bg-gray-50" style={{ "--brand-primary": primaryColor } as React.CSSProperties}>
      <PushSubscriber organizationId={organization.id} customerId={customer.id} />

      {/* QR Code Modal */}
      {showQR && selectedClaimId && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowQR(false)}
        >
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <QrCode className="w-24 h-24 text-gray-400" />
            </div>

            <p className="text-lg font-bold text-gray-900">
              {rewardClaims.find(r => r.id === selectedClaimId)?.reward.name}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Montrez ce QR code en caisse
            </p>
            {rewardClaims.find(r => r.id === selectedClaimId)?.code && (
              <p className="text-xl font-mono font-bold mt-4" style={{ color: primaryColor }}>
                {rewardClaims.find(r => r.id === selectedClaimId)?.code}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className="sticky top-0 z-40 py-4 px-4 shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="w-10 h-10 rounded-lg object-cover bg-white/10"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-white">{organization.name}</h1>
              <span className="text-xs text-white/70">Mon espace fidélité</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{customerName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    style={{
                      backgroundColor: primaryColor + "20",
                      color: primaryColor,
                    }}
                  >
                    {currentTier}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold" style={{ color: primaryColor }}>
                {customer.points}
              </p>
              <p className="text-sm text-gray-500">points</p>
            </div>
          </div>

          {/* Progress to next reward */}
          {nextReward && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Prochaine récompense : {nextReward.name}</span>
                <span>{customer.points} / {nextReward.pointsRequired} pts</span>
              </div>
              <Progress
                value={progressPercent}
                className="h-3"
              />
              <p className="text-xs text-gray-500 mt-2">
                {nextReward.pointsRequired - customer.points} points restants
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{customer.visits}</p>
              <p className="text-xs text-gray-500">visites</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{loyaltyConfig?.pointsPerVisit || 10}</p>
              <p className="text-xs text-gray-500">pts/visite</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Gift className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{activeRewards.length}</p>
              <p className="text-xs text-gray-500">récompenses</p>
            </div>
          </div>
        </div>

        {/* Active Rewards */}
        {activeRewards.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5" style={{ color: primaryColor }} />
              Mes récompenses actives
            </h3>

            <div className="space-y-3">
              {activeRewards.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{claim.reward.name}</p>
                    {claim.reward.description && (
                      <p className="text-sm text-gray-500 mt-1">{claim.reward.description}</p>
                    )}
                    {claim.expiresAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        Expire le {formatDate(claim.expiresAt)}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => {
                      setSelectedClaimId(claim.id);
                      setShowQR(true);
                    }}
                  >
                    <QrCode className="w-4 h-4 mr-1" />
                    QR
                  </Button>
                </div>
              ))}
            </div>

            {isAndroid && hasGoogleWallet && (
              <Button
                variant="outline"
                className="w-full mt-4"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Ajouter à Google Wallet
              </Button>
            )}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            {pointsHistory.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {pointsHistory.slice(0, 10).map((transaction) => (
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
                <p className="text-gray-500">Aucun historique de points</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 text-center"
                  >
                    <div
                      className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2"
                      style={{ backgroundColor: primaryColor + "20" }}
                    >
                      <Trophy className="w-6 h-6" style={{ color: primaryColor }} />
                    </div>
                    <p className="font-medium text-gray-900">{badge.badgeType}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(badge.earnedAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun badge gagné pour le moment</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Prénom</label>
                    <p className="font-medium">{customer.firstName || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Nom</label>
                    <p className="font-medium">{customer.lastName || "-"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{customer.email}</p>
                </div>
                {customer.phone && (
                  <div>
                    <label className="text-sm text-gray-500">Téléphone</label>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-500">Membre depuis</label>
                  <p className="font-medium">{formatDate(customer.createdAt)}</p>
                </div>
                {customer.lastVisitAt && (
                  <div>
                    <label className="text-sm text-gray-500">Dernière visite</label>
                    <p className="font-medium">{formatDate(customer.lastVisitAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 px-4 mt-12">
        <div className="max-w-2xl mx-auto text-center text-sm text-gray-400">
          Propulsé par <span style={{ color: primaryColor }}>Fidelyz</span>
        </div>
      </footer>
    </div>
  );
}
