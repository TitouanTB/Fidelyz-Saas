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
  User,
  Zap,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

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
    visits: number;
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
      <div className="max-w-md mx-auto space-y-8 py-12">
        <div className="text-center space-y-4">
          <div
            className="w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center mb-6 border border-white/10 shadow-2xl relative overflow-hidden group"
            style={{ backgroundColor: `${theme.primaryColor}10` }}
          >
            <Award className="w-10 h-10 relative z-10" style={{ color: theme.primaryColor } as React.CSSProperties} />
          </div>
          <h2 className="text-3xl font-bold font-heading text-text-primary tracking-tight">Votre Espace Fidélité</h2>
          <p className="text-text-secondary">
            Connectez-vous pour consulter vos points et avantages.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 glass-surface p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
          <div className="space-y-2">
             <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest ml-1">Adresse Email</label>
             <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 rounded-xl bg-white/5 border-white/10 text-text-primary placeholder:text-text-tertiary px-6"
             />
          </div>
          <Button
            type="submit"
            className="w-full h-14 rounded-xl bg-violet-default hover:bg-violet-hover text-white font-bold text-lg shadow-lg shadow-violet-default/20 transition-all active:scale-[0.98]"
            loading={isLoading}
          >
            Se connecter
          </Button>
        </form>
      </div>
    );
  }

  const customerName =
    [customerData.firstName, customerData.lastName].filter(Boolean).join(" ") ||
    customerData.email.split("@")[0];

  const tierThresholds = loyaltyConfig?.tierThresholds as Record<string, number> | undefined;
  const currentTier = customerData.tier || "Membre";

  const stats = [
    {
      label: "Points Fidélité",
      value: customerData.points,
      icon: Star,
      color: theme.primaryColor,
    },
    {
      label: "Visites Totales",
      value: customerData.visits,
      icon: Calendar,
      color: theme.secondaryColor,
    },
    {
      label: "Dépenses Totales",
      value: formatCurrency(customerData.totalSpend),
      icon: TrendingUp,
      color: theme.accentColor,
    },
  ];

  const activeRewards = rewardClaims.filter(
    (r) => r.status === "PENDING" && (!r.expiresAt || new Date(r.expiresAt) > new Date())
  );

  return (
    <div className="space-y-12">
      {/* Immersive Header Card */}
      <div className="glass-surface rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 md:p-12 overflow-hidden relative">
        <div 
          className="absolute -top-[20%] -right-[10%] w-[40%] h-[120%] blur-3xl opacity-5 rounded-full"
          style={{ backgroundColor: theme.primaryColor }}
        />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-5">
               <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-bold font-heading shadow-2xl border border-white/10"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {customerName.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.3em]">Profil Fidélité</p>
                   <h2 className="text-4xl font-bold font-heading text-text-primary tracking-tight">{customerName}</h2>
                   <div className="flex items-center gap-3 mt-2">
                     <Badge className="bg-violet-default/10 border-violet-default/20 text-violet-default font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest">
                        {currentTier}
                     </Badge>
                     <span className="text-xs text-text-tertiary font-medium">
                       Client depuis {formatDate(customerData.createdAt)}
                     </span>
                   </div>
                </div>
            </div>
          </div>

          <div className="glass-surface bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center min-w-[200px] shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-violet-default shadow-[0_0_20px_rgba(147,23,253,0.5)]" />
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-3">Solde de Points</p>
            <div className="flex items-baseline gap-2">
               <span className="text-6xl font-bold font-heading tracking-tighter text-text-primary group-hover:scale-110 transition-transform duration-500">
                 {customerData.points}
               </span>
               <span className="text-sm font-bold text-text-tertiary uppercase tracking-widest">PTS</span>
            </div>
          </div>
        </div>

        {tierThresholds && Object.keys(tierThresholds).length > 0 && (
          <div className="mt-16 pt-10 border-t border-white/5 space-y-8">
            <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.3em]">Progression du Niveau</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(tierThresholds).sort((a, b) => a[1] - b[1]).map(([tier, threshold]) => {
                const isAchieved = customerData.points >= threshold;
                const isCurrent = customerData.tier === tier;

                return (
                  <div 
                    key={tier} 
                    className={cn(
                      "glass-surface rounded-2xl p-5 border transition-all relative overflow-hidden",
                      isAchieved ? "bg-white/[0.04] border-white/10" : "bg-white/[0.01] border-white/5 opacity-50 grayscale"
                    )}
                  >
                    {isCurrent && (
                       <div className="absolute top-0 right-0 p-2">
                          <Zap size={14} className="text-violet-default animate-pulse" />
                       </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          isAchieved ? "bg-violet-default text-white" : "bg-white/5 text-text-tertiary"
                        )}
                      >
                         <Award size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={cn("text-sm font-bold font-heading tracking-tight", isAchieved ? "text-text-primary" : "text-text-tertiary")}>
                            {tier}
                          </span>
                          <span className="text-[10px] font-bold text-text-tertiary">{threshold} pts</span>
                        </div>
                        {isCurrent && (
                          <div className="mt-3 relative h-1 bg-white/5 rounded-full overflow-hidden">
                             <div 
                               className="absolute inset-y-0 left-0 bg-violet-default shadow-[0_0_10px_rgba(147,23,253,0.5)]" 
                               style={{ width: '100%' }}
                             />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-surface p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] group hover:bg-white/[0.03] transition-all">
             <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-bold font-heading text-text-primary tracking-tight transition-transform group-hover:scale-105" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 transition-colors group-hover:border-white/10"
                  style={{ backgroundColor: `${stat.color}10`, color: stat.color }}
                >
                  <stat.icon className="w-6 h-6" style={{ color: stat.color } as React.CSSProperties} />
                </div>
             </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="rewards" className="space-y-10">
        <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/5 w-full md:w-auto h-auto grid grid-cols-3">
          <TabsTrigger value="rewards" className="rounded-xl py-3 data-[state=active]:bg-violet-default data-[state=active]:text-white transition-all font-bold text-xs uppercase tracking-widest">Mes Cadeaux</TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl py-3 data-[state=active]:bg-violet-default data-[state=active]:text-white transition-all font-bold text-xs uppercase tracking-widest">Historique</TabsTrigger>
          <TabsTrigger value="profile" className="rounded-xl py-3 data-[state=active]:bg-violet-default data-[state=active]:text-white transition-all font-bold text-xs uppercase tracking-widest">Mon Profil</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-10 animate-in fade-in duration-500">
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-heading text-text-primary tracking-tight flex items-center gap-3">
              Récompenses Actives
              <span className="text-[11px] font-bold px-3 py-1 bg-white/5 border border-white/10 rounded-full text-text-tertiary uppercase tracking-widest">
                {activeRewards.length}
              </span>
            </h3>

            {activeRewards.length === 0 ? (
              <div className="glass-surface rounded-[2rem] border border-white/5 bg-white/[0.01] p-16 text-center">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                  <Gift className="w-10 h-10 text-text-tertiary opacity-30" />
                </div>
                <p className="text-text-tertiary text-lg font-medium italic mb-8">Vous n'avez pas de récompenses en attente.</p>
                <Button
                  className="rounded-xl bg-violet-default hover:bg-violet-hover h-12 px-8 font-bold shadow-lg shadow-violet-default/20"
                  onClick={() => (window.location.href = `/${slug}/rewards`)}
                >
                  Découvrir les cadeaux
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeRewards.map((claim) => (
                  <div
                    key={claim.id}
                    className="glass-surface rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between relative z-10">
                      <div className="space-y-6 flex-1">
                        <div className="space-y-2">
                          <h4 className="text-xl font-bold font-heading text-text-primary tracking-tight">
                            {claim.reward.name}
                          </h4>
                          {claim.reward.description && (
                            <p className="text-sm text-text-tertiary italic leading-relaxed group-hover:text-text-secondary transition-colors">
                              {claim.reward.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant="default" className="bg-violet-default/10 border-violet-default/20 text-violet-default font-bold px-3 py-1 rounded-full text-[9px] uppercase tracking-widest">
                            {claim.reward.type.replace("_", " ")}
                          </Badge>
                          {claim.code && (
                            <div className="flex items-center gap-2 bg-success/10 border border-success/20 px-4 py-1 rounded-full">
                               <span className="text-[9px] font-bold text-success uppercase tracking-widest">Code :</span>
                               <code className="text-sm font-mono font-bold text-success tracking-widest">
                                 {claim.code}
                               </code>
                            </div>
                          )}
                        </div>

                        {claim.expiresAt && (
                          <div className="flex items-center gap-2 text-[10px] text-text-tertiary font-medium border-t border-white/5 pt-4">
                             <Clock size={12} />
                             Expire le {formatDate(claim.expiresAt)}
                          </div>
                        )}
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110">
                         <ChevronRight className="w-6 h-6 text-text-tertiary" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 pt-10 border-t border-white/5">
            <h3 className="text-xl font-bold font-heading text-text-primary tracking-tight">Dernières Utilisation</h3>
            {rewardClaims.length > 0 ? (
              <div className="space-y-4">
                {rewardClaims.slice(0, 5).map((claim) => (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between glass-surface bg-white/[0.01] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.03] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                          <Gift size={18} className="text-text-tertiary" />
                       </div>
                       <div>
                         <p className="font-bold text-text-primary tracking-tight">{claim.reward.name}</p>
                         <p className="text-xs text-text-tertiary font-medium">
                           {formatDate(claim.claimedAt)}
                         </p>
                       </div>
                    </div>
                    <Badge
                      className={cn(
                        "font-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-full",
                        claim.status === "REDEEMED"
                          ? "bg-success/10 text-success border-success/20"
                          : claim.status === "EXPIRED"
                          ? "bg-danger/10 text-danger border-danger/20"
                          : "bg-white/5 text-text-tertiary border-white/10"
                      )}
                    >
                      {claim.status === "REDEEMED" ? "Validé" : claim.status === "EXPIRED" ? "Expiré" : "En attente"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-tertiary text-sm italic font-medium">Aucun historique de cadeaux.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6 animate-in fade-in duration-500">
          <h3 className="text-xl font-bold font-heading text-text-primary tracking-tight">Historique des points</h3>
          {pointsHistory.length > 0 ? (
            <div className="glass-surface rounded-[2rem] border border-white/5 overflow-hidden">
              <div className="divide-y divide-white/5">
                {pointsHistory.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center gap-5">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110",
                          transaction.points > 0
                            ? "bg-success/10 border-success/20 text-success"
                            : "bg-danger/10 border-danger/20 text-danger"
                        )}
                      >
                        {transaction.points > 0 ? <TrendingUp size={20} /> : <TrendingUp size={20} className="rotate-180" />}
                      </div>
                      <div>
                        <p className="text-base font-bold text-text-primary tracking-tight">
                          {transaction.description || transaction.source || "Points fidélité"}
                        </p>
                        <p className="text-xs text-text-tertiary font-medium">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span
                        className={cn(
                          "text-xl font-bold font-heading tabular-nums",
                          transaction.points > 0 ? "text-success" : "text-danger"
                        )}
                      >
                        {transaction.points > 0 ? "+" : ""}
                        {transaction.points}
                      </span>
                      <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest mt-0.5">Points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-surface rounded-[2rem] border border-white/5 bg-white/[0.01] p-16 text-center">
              <History className="w-12 h-12 text-text-tertiary opacity-30 mx-auto mb-6" />
              <p className="text-text-tertiary font-medium italic">Aucun historique de points pour le moment.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-surface rounded-[2rem] border border-white/5 bg-white/[0.01] p-10 space-y-10 group">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                   <h3 className="text-xl font-bold font-heading text-text-primary tracking-tight">Détails Personnels</h3>
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                      <User size={18} className="text-text-tertiary" />
                   </div>
                </div>
                <div className="grid grid-cols-1 gap-8">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Prénom</label>
                        <p className="text-lg font-bold text-text-primary tracking-tight font-heading">{customerData.firstName || "-"}</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Nom</label>
                        <p className="text-lg font-bold text-text-primary tracking-tight font-heading">{customerData.lastName || "-"}</p>
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Adresse Email</label>
                      <p className="text-lg font-bold text-text-primary tracking-tight font-heading">{customerData.email}</p>
                   </div>
                   {customerData.phone && (
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Téléphone</label>
                        <p className="text-lg font-bold text-text-primary tracking-tight font-heading">{customerData.phone}</p>
                     </div>
                   )}
                   {customerData.lastVisitAt && (
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Dernière Visite</label>
                        <p className="text-lg font-bold text-text-primary tracking-tight font-heading">{formatDate(customerData.lastVisitAt)}</p>
                     </div>
                   )}
                </div>
              </div>

              <div className="glass-surface rounded-[2rem] border border-white/5 bg-white/[0.01] p-10 space-y-10 group flex flex-col">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                   <h3 className="text-xl font-bold font-heading text-text-primary tracking-tight">Préférences</h3>
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                      <Settings size={18} className="text-text-tertiary" />
                   </div>
                </div>
                <div className="flex-1 space-y-10">
                   <div className="flex items-center justify-between glass-surface bg-white/2 border border-white/5 rounded-2xl p-6 transition-all hover:bg-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-default/10 border border-violet-default/20 flex items-center justify-center">
                           <Bell size={18} className="text-violet-default" />
                        </div>
                        <div className="space-y-1">
                           <span className="text-text-primary font-bold tracking-tight">Notifications</span>
                           <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest">Activées par email</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[11px] font-bold text-text-tertiary hover:text-text-primary uppercase tracking-widest">
                         Gérer
                      </Button>
                   </div>
                </div>
                <div className="pt-10">
                   <Button variant="ghost" className="w-full h-14 rounded-2xl border border-white/5 text-danger font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-danger/10 hover:border-danger/20 transition-all">
                      <LogOut size={18} />
                      Déconnexion
                   </Button>
                </div>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

