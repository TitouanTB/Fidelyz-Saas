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
  Trophy,
  QrCode,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Confetti from "react-confetti";
import { cn } from "@/lib/utils";

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
  const icons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties; color?: string; size?: number | string }>> = {
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
      <div className="max-w-md mx-auto space-y-8 py-12">
        <div className="text-center space-y-4">
          <div
            className="w-20 h-20 mx-auto rounded-[2rem] flex items-center justify-center mb-6 border border-white/10 shadow-2xl relative overflow-hidden group"
            style={{ backgroundColor: `${theme.primaryColor}10` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-default/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Gift className="w-10 h-10 relative z-10" style={{ color: theme.primaryColor } as React.CSSProperties} />
          </div>
          <h2 className="text-3xl font-bold font-heading text-text-primary tracking-tight">Récupérez vos cadeaux</h2>
          <p className="text-text-secondary">
            Entrez votre email pour accéder à vos points et récompenses exclusives.
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
            Accéder à mon espace
          </Button>
          <p className="text-[10px] text-center text-text-tertiary font-medium italic">
            En continuant, vous recevrez peut-être des offres de {organization.name}.
          </p>
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
  const currentTier = customerData.tier || "Membre";

  return (
    <div className="space-y-12">
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 0}
          height={typeof window !== "undefined" ? window.innerHeight : 0}
          recycle={false}
          colors={[theme.primaryColor, theme.secondaryColor, theme.accentColor, '#9317FD']}
        />
      )}

      {claimCode && (
        <div className="glass-surface border border-success/20 bg-success/5 rounded-[2.5rem] p-10 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-success/5 to-transparent pointer-events-none" />
          <div className="relative z-10 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
               <Check className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-3xl font-bold font-heading text-text-primary mb-2">Récompense Débloquée !</h3>
            <p className="text-text-secondary mb-8">Présentez ce code lors de votre prochain passage.</p>
            
            <div className="inline-flex flex-col items-center gap-4 bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-success text-white text-[10px] font-bold uppercase tracking-widest">
                 Code Valide
              </div>
              <code className="text-5xl font-mono font-bold text-success tracking-wider leading-none">
                {claimCode}
              </code>
              <div className="flex items-center gap-2 text-text-tertiary text-[10px] font-bold uppercase tracking-widest mt-2 border-t border-white/5 pt-4 w-full justify-center">
                 <QrCode size={12} /> Scanner pour valider
              </div>
            </div>

            <div className="pt-10">
              <Button
                variant="outline"
                className="rounded-2xl border-white/10 hover:bg-white/5 h-12 px-8 text-text-secondary font-bold"
                onClick={() => setClaimCode(null)}
              >
                Continuer mes achats
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Header Card */}
      <div className="glass-surface rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 md:p-12 overflow-hidden relative">
        <div 
          className="absolute -top-[20%] -right-[10%] w-[40%] h-[120%] blur-3xl opacity-5 rounded-full"
          style={{ backgroundColor: theme.primaryColor }}
        />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="space-y-1">
               <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.3em]">Tableau de bord</p>
               <h2 className="text-4xl font-bold font-heading text-text-primary tracking-tight">
                 Ravi de vous revoir, <span style={{ color: theme.primaryColor }}>{customerData.firstName || customerData.email.split("@")[0]}</span> !
               </h2>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-default/10 border border-violet-default/20">
                  <Trophy size={14} className="text-violet-default" />
                  <span className="text-[11px] font-bold text-violet-default uppercase tracking-widest">{currentTier}</span>
               </div>
               <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
               <p className="text-sm text-text-tertiary font-medium">{customerData.email}</p>
            </div>
          </div>

          <div className="glass-surface bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center min-w-[180px] shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-violet-default opacity-20" />
            <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-2">Solde actuel</p>
            <div className="flex items-baseline gap-2">
               <span className="text-6xl font-bold font-heading tracking-tighter text-text-primary group-hover:scale-110 transition-transform duration-500">
                 {customerData.points}
               </span>
               <span className="text-sm font-bold text-text-tertiary uppercase tracking-widest">PTS</span>
            </div>
          </div>
        </div>

        {nextReward && (
          <div className="mt-12 space-y-4 max-w-2xl">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
              <span className="text-text-secondary flex items-center gap-2">
                 <Zap size={14} className="text-amber-500 mb-0.5" />
                 Prochaine étape : {nextReward.name}
              </span>
              <span className="text-text-primary">
                {customerData.points} / {nextReward.pointsRequired} <span className="text-text-tertiary">pts</span>
              </span>
            </div>
            <div className="relative h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
               <div 
                 className="absolute inset-y-0 left-0 bg-violet-default shadow-[0_0_20px_rgba(147,23,253,0.5)] transition-all duration-1000 ease-out"
                 style={{ width: `${Math.min((customerData.points / nextReward.pointsRequired) * 100, 100)}%` }}
               />
            </div>
            <p className="text-xs text-text-tertiary font-medium">
              Plus que <span className="text-text-primary">{nextReward.pointsRequired - customerData.points} points</span> pour débloquer ce cadeau !
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Available Rewards */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-bold font-heading text-text-primary tracking-tight flex items-center gap-3">
               Cadeaux Disponibles 
               <span className="text-[11px] font-bold px-3 py-1 bg-white/5 border border-white/10 rounded-full text-text-tertiary uppercase tracking-widest">
                 {availableRewards.length}
               </span>
             </h3>
          </div>

          {availableRewards.length === 0 ? (
            <div className="glass-surface rounded-[2rem] border border-white/5 bg-white/[0.01] p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Gift className="w-8 h-8 text-text-tertiary opacity-30" />
              </div>
              <p className="text-text-tertiary text-lg font-medium italic">
                Pas de cadeaux disponibles pour le moment. Cumulez plus de points !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    className="glass-surface group relative flex flex-col rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 overflow-hidden"
                  >
                    {reward.imageUrl && (
                      <div className="h-44 overflow-hidden relative">
                         <img
                           src={reward.imageUrl}
                           alt={reward.name}
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-[#111114]/80 to-transparent" />
                      </div>
                    )}
                    <div className="p-8 flex-1 flex flex-col gap-6">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-xl"
                          style={{
                            backgroundColor: `${theme.primaryColor}10`,
                          }}
                        >
                          <IconComponent className="w-6 h-6" style={{ color: theme.primaryColor } as React.CSSProperties} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-lg font-bold font-heading text-text-primary tracking-tight truncate">
                            {reward.name}
                          </h4>
                          {reward.description && (
                            <p className="text-sm text-text-tertiary line-clamp-2 italic leading-relaxed group-hover:text-text-secondary transition-colors">
                              {reward.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="default" className="bg-violet-default/10 border-violet-default/20 text-violet-default font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest">
                          {reward.pointsRequired} pts
                        </Badge>
                        {reward.value && (
                          <Badge
                            className="bg-amber-500/10 border-amber-500/20 text-amber-500 font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest"
                          >
                            {reward.type === "DISCOUNT_PERCENT"
                              ? `-${reward.value}%`
                              : `Valeur ${reward.value}€`}
                          </Badge>
                        )}
                      </div>

                      <Button
                        className="w-full h-12 rounded-xl bg-text-primary hover:bg-white text-[#111114] font-bold shadow-xl transition-all active:scale-[0.98] mt-auto"
                        disabled={isDisabled}
                        loading={isLoading && selectedReward === reward.id}
                        onClick={() => {
                          setSelectedReward(reward.id);
                          handleClaimReward(reward.id);
                        }}
                      >
                        Utiliser mes points
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info or Earn Actions */}
        <div className="lg:col-span-4 space-y-12">
          {loyaltyConfig && (
            <div className="glass-surface rounded-[2rem] border border-white/5 bg-white/[0.01] p-8 space-y-8 h-full">
              <div className="space-y-4">
                 <h3 className="text-lg font-bold font-heading text-text-primary tracking-tight">Comment Gagner ?</h3>
                 <p className="text-sm text-text-tertiary italic">Remplissez votre cagnotte à chaque visite chez {organization.name}.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="glass-surface bg-white/2 border border-white/5 rounded-2xl p-6 flex items-center justify-between group">
                  <div>
                    <p className="text-4xl font-bold font-heading text-text-primary tracking-tighter transition-transform group-hover:scale-110" style={{ color: theme.primaryColor }}>
                      +{loyaltyConfig.pointsPerVisit}
                    </p>
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mt-1">Par visite</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                     <Star size={20} className="text-text-tertiary" />
                  </div>
                </div>
                <div className="glass-surface bg-white/2 border border-white/5 rounded-2xl p-6 flex items-center justify-between group">
                  <div>
                    <p className="text-4xl font-bold font-heading text-text-primary tracking-tighter transition-transform group-hover:scale-110" style={{ color: theme.primaryColor }}>
                      +{loyaltyConfig.pointsPerEuro}
                    </p>
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mt-1">Par € dépensé</p>
                  </div>
                   <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                     <span className="text-xl font-bold text-text-tertiary">€</span>
                  </div>
                </div>
              </div>

              {tierThresholds && Object.keys(tierThresholds).length > 0 && (
                <div className="pt-8 border-t border-white/5 space-y-6">
                  <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em] mb-4">Avantages par niveau</h4>
                  <div className="space-y-3">
                    {Object.entries(tierThresholds).sort((a, b) => a[1] - b[1]).map(([tier, threshold]) => (
                      <div
                        key={tier}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border transition-all",
                          customerData.points >= threshold
                            ? "bg-violet-default/10 border-violet-default/20"
                            : "bg-white/[0.01] border-white/5 opacity-50grayscale"
                        )}
                      >
                         <div className="flex items-center gap-3">
                            <Trophy size={14} className={customerData.points >= threshold ? "text-violet-default" : "text-text-tertiary"} />
                            <span className={cn("text-xs font-bold font-heading", customerData.points >= threshold ? "text-violet-default text-lg" : "text-text-secondary")}>
                               {tier}
                            </span>
                         </div>
                         <span className="text-[10px] font-bold text-text-tertiary">{threshold} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {lockedRewards.length > 0 && (
        <div className="pt-12 space-y-8 border-t border-white/5">
          <h3 className="text-xl font-bold font-heading text-text-primary tracking-tight flex items-center gap-3">
            Bientôt disponibles
            <span className="text-[11px] font-bold px-3 py-1 bg-white/5 border border-white/10 rounded-full text-text-tertiary uppercase tracking-widest">
              {lockedRewards.length}
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lockedRewards.slice(0, 8).map((reward) => {
              const IconComponent = getRewardIcon(reward.type);
              const pointsNeeded = reward.pointsRequired - customerData.points;
              const progress = (customerData.points / reward.pointsRequired) * 100;

              return (
                <div
                  key={reward.id}
                  className="glass-surface group relative flex flex-col rounded-[2rem] border border-white/5 bg-white/[0.01] opacity-60 hover:opacity-100 transition-all duration-500 overflow-hidden"
                >
                  <div className="p-8 space-y-6">
                    <div className="flex items-start justify-between">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 relative">
                          <IconComponent className="w-6 h-6 text-text-tertiary" />
                          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-[#111114] border border-white/10 rounded-full flex items-center justify-center shadow-2xl">
                             <Lock size={12} className="text-text-tertiary" />
                          </div>
                       </div>
                       <Badge variant="default" className="bg-white/5 border-white/10 text-text-tertiary text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                          {reward.pointsRequired} pts
                       </Badge>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-base font-bold font-heading text-text-primary tracking-tight truncate">
                        {reward.name}
                      </h4>
                      <div className="space-y-2">
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-text-tertiary opacity-30 transition-all duration-500"
                             style={{ width: `${progress}%` }}
                           />
                        </div>
                        <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-widest text-center">
                          Manque {pointsNeeded} pts
                        </p>
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

