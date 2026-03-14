"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Gift,
  Check,
  ChevronRight,
  ChevronLeft,
  Star,
  MessageSquare,
  User,
  Phone,
  Mail,
  MessageCircle,
  Wallet,
  Sparkles,
  Heart,
  Smartphone,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import confetti from "canvas-confetti";
import { PWAInstallPrompt } from "./pwa-install-prompt";

type Step = "A" | "B" | "C" | "D";

interface RewardFlowProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    primaryColor: string;
    whatsappNumber?: string | null;
  };
  reward?: {
    id: string;
    name: string;
    description?: string | null;
    pointsRequired: number;
    type: string;
    value?: number | null;
    conditions?: string;
  } | null;
  loyaltyConfig?: {
    welcomeBonus: number;
  } | null;
  hasWhatsApp?: boolean;
  googleReviewUrl?: string;
}

export function RewardFlow({
  organization,
  reward,
  loyaltyConfig,
  hasWhatsApp = false,
  googleReviewUrl,
}: RewardFlowProps) {
  const [step, setStep] = useState<Step>("A");
  const [showPWA, setShowPWA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    email: "",
    channel: "email" as "whatsapp" | "email" | "wallet",
    consent: false,
  });

  const [reviewResponse, setReviewResponse] = useState<"positive" | "negative" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [claimResult, setClaimResult] = useState<{
    code?: string;
    customerToken?: string;
    customerId?: string;
  } | null>(null);

  const [googleWalletUrl, setGoogleWalletUrl] = useState<string | null>(null);

  const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
  const primaryColor = organization.primaryColor || "#9317FD";

  useEffect(() => {
    if (step === "D") {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#9317FD", "#c77dff", "#ffffff"],
      });

      const timer = setTimeout(() => setShowPWA(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (claimResult?.customerId && isAndroid && formData.channel === "wallet") {
      const fetchGoogleWalletUrl = async () => {
        try {
          const response = await fetch("/api/wallet/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerId: claimResult.customerId }),
          });
          const data = await response.json();
          if (data.success && data.url) {
            setGoogleWalletUrl(data.url);
          }
        } catch (error) {
          console.error("Error generating Google Wallet URL:", error);
        }
      };
      fetchGoogleWalletUrl();
    }
  }, [claimResult?.customerId, isAndroid, formData.channel]);

  const handleReviewResponse = useCallback((response: "positive" | "negative") => {
    setReviewResponse(response);
    if (response === "positive" && googleReviewUrl) {
      window.open(googleReviewUrl, "_blank");
    }
    setTimeout(() => setStep("C"), response === "positive" ? 500 : 0);
  }, [googleReviewUrl]);

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.phone || !formData.consent) {
      setError("Veuillez remplir tous les champs obligatoires et accepter les conditions.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: organization.id,
          rewardId: reward?.id,
          firstName: formData.firstName,
          phone: formData.phone,
          email: formData.email || undefined,
          channel: formData.channel,
          feedback: reviewResponse === "negative" ? feedback : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'activation");
      }

      const data = await response.json();
      setClaimResult({
        code: data.code,
        customerToken: data.customerToken,
        customerId: data.customerId,
      });
      setStep("D");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const stepDescription = {
    A: "Offre exclusive",
    B: "Votre avis",
    C: "Activation",
    D: "Terminé",
  };

  return (
    <div className="min-h-screen bg-bg-base relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background immersive layers */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-violet-default/20 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-default/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-violet-default/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Logo / Org Name */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 p-2 shadow-2xl backdrop-blur-xl"
          >
            {organization.logoUrl ? (
              <img src={organization.logoUrl} alt={organization.name} className="w-full h-full object-contain" />
            ) : (
              <UtensilsCrossed className="w-8 h-8 text-violet-default" />
            )}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold font-heading text-text-primary tracking-tight"
          >
            {organization.name}
          </motion.h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-xs text-text-tertiary uppercase tracking-widest font-medium">Programme Fidélité</span>
          </div>
        </div>

        {/* Floating Glass Card */}
        <div className="glass-surface shadow-[0_24px_48px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden min-h-[500px] flex flex-col">
          {/* Progress Bar */}
          <div className="bg-white/5 px-6 py-3 flex items-center justify-between border-b border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary">
              {stepDescription[step]}
            </span>
            <div className="flex gap-1.5">
              {(["A", "B", "C", "D"] as Step[]).map((s) => (
                <div
                  key={s}
                  className={cn(
                    "w-6 h-1 rounded-full transition-all duration-300",
                    s === step ? "bg-violet-default w-12" : "bg-white/10"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="p-8 flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {/* Step A: Preview */}
              {step === "A" && (
                <motion.div
                  key="step-a"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-8 flex-1 flex flex-col"
                >
                  <div className="flex-1 flex flex-col justify-center text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-violet-default/10 border border-violet-default/20 mb-6 glow-violet">
                      <Gift className="w-10 h-10 text-violet-default" />
                    </div>
                    <h2 className="text-3xl font-bold font-heading text-text-primary leading-tight mb-3">
                      Cadeau de bienvenue offert !
                    </h2>
                    <p className="text-text-secondary">
                      {reward?.name || "Votre première récompense vous attend chez nous."}
                    </p>
                    
                    {reward?.description && (
                      <div className="mt-6 px-4 py-3 bg-white/4 border border-white/5 rounded-2xl text-sm text-text-tertiary">
                        {reward.description}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-text-secondary bg-violet-default/5 p-4 rounded-xl border border-violet-default/10">
                      <Sparkles className="w-5 h-5 text-violet-default shrink-0" />
                      <span>Incroyable ! Vous recevez directement <b>{loyaltyConfig?.welcomeBonus || 50} pts</b> après activation.</span>
                    </div>

                    <Button
                      size="lg"
                      className="w-full h-14 text-lg font-bold glow-violet"
                      onClick={() => setStep("B")}
                    >
                      En profiter maintenant
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step B: Feedback */}
              {step === "B" && (
                <motion.div
                  key="step-b"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-8 flex-1 flex flex-col justify-center"
                >
                  <div className="text-center">
                    <Heart className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-30 fill-red-500" />
                    <h2 className="text-2xl font-bold font-heading text-text-primary mb-3">
                      Un petit retour sur votre visite ?
                    </h2>
                    <p className="text-text-secondary">
                      Votre avis est précieux pour nous aider à rester au top !
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleReviewResponse("positive")}
                      className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-violet-default/10 hover:border-violet-default/30 transition-all group"
                    >
                      <span className="text-4xl group-hover:scale-125 transition-transform duration-300">😍</span>
                      <span className="font-bold text-text-primary">Génial !</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewResponse("negative")}
                      className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                    >
                      <span className="text-4xl group-hover:scale-125 transition-transform duration-300">😕</span>
                      <span className="font-bold text-text-secondary">Moyen...</span>
                    </button>
                  </div>

                  {reviewResponse === "negative" && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4">
                      <Textarea
                        placeholder="Qu'est-ce qu'on peut améliorer ? (Privé)..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="bg-white/4 border-white/10 h-32 rounded-2xl focus:border-violet-default/50"
                      />
                      <Button className="w-full h-14" onClick={() => setStep("C")}>
                        Continuer
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step C: Form */}
              {step === "C" && (
                <motion.div
                  key="step-c"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-violet-default/10 flex items-center justify-center border border-violet-default/20">
                      <Smartphone className="w-6 h-6 text-violet-default" />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary text-lg">Finalisez l'activation</h3>
                      <p className="text-xs text-text-secondary">Presque fini !</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-text-tertiary">Votre Prénom</Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="John"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest text-text-tertiary">Numéro de Téléphone</Label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="06 00 00 00 00"
                          className="pl-12 h-12"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-2">
                       <Label className="text-xs uppercase tracking-widest text-text-tertiary block">Recevoir ma carte sur :</Label>
                       <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, channel: 'email'})}
                            className={cn("flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2", 
                              formData.channel === 'email' ? "bg-white/10 border-violet-default" : "bg-white/4 border-white/5 opacity-60")}
                          >
                            <Mail size={18} className={formData.channel === 'email' ? "text-violet-default" : ""} />
                            <span className="text-[10px] font-bold">EMAIL</span>
                          </button>
                          {hasWhatsApp && (
                            <button 
                              type="button"
                              onClick={() => setFormData({...formData, channel: 'whatsapp'})}
                              className={cn("flex-1 p-4 rounded-2xl border transition-all flex flex-col items-center gap-2", 
                                formData.channel === 'whatsapp' ? "bg-green-500/10 border-green-500/50" : "bg-white/4 border-white/5 opacity-60")}
                            >
                              <MessageCircle size={18} className={formData.channel === 'whatsapp' ? "text-green-500" : ""} />
                              <span className="text-[10px] font-bold">WHATSAPP</span>
                            </button>
                          )}
                       </div>
                    </div>

                    <div className="flex items-start gap-3 mt-4">
                      <Checkbox
                        id="consent"
                        checked={formData.consent}
                        onCheckedChange={(c) => setFormData({ ...formData, consent: !!c })}
                        className="mt-1 border-white/20 data-[state=checked]:bg-violet-default"
                      />
                      <label htmlFor="consent" className="text-[11px] text-text-secondary leading-tight cursor-pointer">
                        J'accepte de rejoindre le programme de {organization.name} et de recevoir mes récompenses par message.
                      </label>
                    </div>

                    {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{error}</div>}

                    <Button
                      size="lg"
                      className="w-full h-14 text-lg font-bold mt-4 glow-violet"
                      disabled={isLoading}
                      onClick={handleSubmit}
                    >
                      {isLoading ? "Envoi en cours..." : "C'est parti ! 🎉"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step D: Done */}
              {step === "D" && (
                <motion.div
                  key="step-d"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-8 flex-1 flex flex-col justify-center"
                >
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-success/20 rounded-full border border-success/30 flex items-center justify-center">
                      <Check className="w-12 h-12 text-success" />
                    </div>
                    <h2 className="text-3xl font-bold font-heading text-text-primary mb-2">Bravo {formData.firstName} !</h2>
                    <p className="text-text-secondary">Votre carte est maintenant active.</p>
                  </div>

                  {claimResult?.code && (
                    <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 text-center relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-violet-default shadow-[0_0_15px_rgba(147,23,253,0.5)]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-tertiary block mb-4">Code à présenter en caisse</span>
                      <div className="text-5xl font-mono font-bold text-text-primary tracking-widest group-hover:scale-110 transition-transform duration-500">
                        {claimResult.code}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                     {isAndroid && googleWalletUrl && (
                       <Button variant="secondary" className="w-full h-14 gap-4 bg-black border-white/10 hover:bg-white/20 transition-all" onClick={() => window.open(googleWalletUrl, '_blank')}>
                         <Wallet size={20} />
                         <span>Add to Google Wallet</span>
                       </Button>
                     )}
                     
                     <Link href={`/c/${claimResult?.customerToken || ''}`}>
                        <Button variant="outline" className="w-full h-14 border-white/10 hover:bg-white/5">
                           Voir mon espace client
                        </Button>
                     </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Footer brand */}
          <div className="py-4 text-center border-t border-white/5 bg-black/20">
             <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Powered by Fidelyz</span>
          </div>
        </div>

        {/* Support */}
        <p className="mt-8 text-center text-xs text-text-tertiary">
          Un problème ? <a href="#" className="underline hover:text-text-secondary">Besoins d'aide</a>
        </p>
      </div>

      <PWAInstallPrompt primaryColor={primaryColor} />
    </div>
  );
}
