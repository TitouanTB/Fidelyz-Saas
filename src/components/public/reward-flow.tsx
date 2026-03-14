"use client";

import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Confetti from "react-confetti";
import { PWAInstallPrompt } from "./pwa-install-prompt";
import { PushSubscriber } from "./push-subscriber";

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPWA, setShowPWA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    email: "",
    channel: "email" as "whatsapp" | "email" | "wallet",
    consent: false,
  });

  // Review state
  const [reviewResponse, setReviewResponse] = useState<"positive" | "negative" | null>(null);
  const [feedback, setFeedback] = useState("");

  // Result state
  const [claimResult, setClaimResult] = useState<{
    code?: string;
    customerToken?: string;
    customerId?: string;
  } | null>(null);

  // Google Wallet link state
  const [googleWalletUrl, setGoogleWalletUrl] = useState<string | null>(null);

  const primaryColor = organization.primaryColor || "#9317FD";

  // Detect Android
  const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

  useEffect(() => {
    if (step === "D") {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      const timer = setTimeout(() => setShowPWA(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Generate Google Wallet URL when customer ID is available
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

  const progressPercent = step === "A" ? 25 : step === "B" ? 50 : step === "C" ? 75 : 100;

  return (
    <div className="min-h-screen bg-gray-50" style={{ "--brand-primary": primaryColor } as React.CSSProperties}>
      {showConfetti && (
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 0}
          height={typeof window !== "undefined" ? window.innerHeight : 0}
          recycle={false}
        />
      )}

      {/* Header */}
      <header
        className="sticky top-0 z-50 py-4 px-4 shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="w-10 h-10 rounded-lg object-cover bg-white/10"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
            )}
            <h1 className="text-lg font-bold text-white">{organization.name}</h1>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Étape {step}</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-8">
        {/* Step A: Display Reward */}
        {step === "A" && (
          <div className="text-center space-y-6">
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor + "20" }}
            >
              <Gift className="w-10 h-10" style={{ color: primaryColor }} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {reward?.name || "Récompense de bienvenue"}
              </h2>
              {reward?.description && (
                <p className="text-gray-600 mt-2">{reward.description}</p>
              )}
            </div>

            {reward?.value && (
              <Badge
                className="text-lg px-4 py-2"
                style={{ backgroundColor: primaryColor + "20", color: primaryColor }}
              >
                {reward.type === "DISCOUNT_PERCENT"
                  ? `${reward.value}% de réduction`
                  : `${reward.value}€ de valeur`}
              </Badge>
            )}

            {reward?.conditions && (
              <p className="text-sm text-gray-500 bg-gray-100 rounded-lg p-4">
                {reward.conditions}
              </p>
            )}

            {loyaltyConfig?.welcomeBonus !== undefined && loyaltyConfig.welcomeBonus > 0 && (
              <p className="text-sm text-gray-600">
                🎁 +{loyaltyConfig.welcomeBonus} points de bienvenue à l'inscription
              </p>
            )}

            <Button
              size="lg"
              className="w-full"
              style={{ backgroundColor: primaryColor }}
              onClick={() => setStep("B")}
            >
              Obtenir ma récompense
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Step B: Review Question */}
        {step === "B" && (
          <div className="text-center space-y-6">
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor + "20" }}
            >
              <MessageSquare className="w-8 h-8" style={{ color: primaryColor }} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Avez-vous apprécié votre visite chez {organization.name} ?
              </h2>
              <p className="text-gray-500 mt-2">Votre avis nous aide à nous améliorer</p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 py-6 text-lg"
                onClick={() => handleReviewResponse("positive")}
              >
                😊 Oui
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 py-6 text-lg"
                onClick={() => handleReviewResponse("negative")}
              >
                😕 Non
              </Button>
            </div>

            {reviewResponse === "negative" && (
              <div className="space-y-4 mt-6">
                <p className="text-sm text-gray-600">
                  Nous sommes désolés. Partagez votre feedback pour nous aider à nous améliorer :
                </p>
                <Textarea
                  placeholder="Votre feedback (privé, ne sera pas publié)..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
                <Button
                  className="w-full"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => setStep("C")}
                >
                  Continuer
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step C: Activation Form */}
        {step === "C" && (
          <div className="space-y-6">
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: primaryColor + "20" }}
              >
                <User className="w-8 h-8" style={{ color: primaryColor }} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Activez votre récompense</h2>
              <p className="text-gray-500 mt-2">Complétez vos informations pour recevoir votre récompense</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="flex items-center gap-1">
                  Prénom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Votre prénom"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-1">
                  Téléphone <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="06 12 34 56 78"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email (optionnel)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="votre@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Comment souhaitez-vous recevoir votre récompense ?</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {hasWhatsApp && (
                    <Button
                      variant={formData.channel === "whatsapp" ? "default" : "outline"}
                      className="justify-start"
                      style={formData.channel === "whatsapp" ? { backgroundColor: "#25D366" } : {}}
                      onClick={() => setFormData({ ...formData, channel: "whatsapp" })}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                  <Button
                    variant={formData.channel === "email" ? "default" : "outline"}
                    className="justify-start"
                    style={formData.channel === "email" ? { backgroundColor: primaryColor } : {}}
                    onClick={() => setFormData({ ...formData, channel: "email" })}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  {isAndroid && (
                    <Button
                      variant={formData.channel === "wallet" ? "default" : "outline"}
                      className="justify-start col-span-2"
                      style={formData.channel === "wallet" ? { backgroundColor: primaryColor } : {}}
                      onClick={() => setFormData({ ...formData, channel: "wallet" })}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Google Wallet
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => setFormData({ ...formData, consent: !!checked })}
                />
                <Label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed">
                  J'accepte de recevoir des communications de {organization.name} et j'ai lu la{" "}
                  <a href="/privacy" className="underline" style={{ color: primaryColor }}>
                    politique de confidentialité
                  </a>
                  . <span className="text-red-500">*</span>
                </Label>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{error}</p>
              )}

              <Button
                size="lg"
                className="w-full"
                style={{ backgroundColor: primaryColor }}
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? (
                  "Activation en cours..."
                ) : (
                  <>
                    Activer ma récompense 🎉
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step D: Confirmation */}
        {step === "D" && (
          <div className="text-center space-y-6">
            <div className="animate-bounce">
              <div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Check className="w-10 h-10 text-white" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">Félicitations ! 🎉</h2>
              <p className="text-gray-600 mt-2">
                Votre récompense est prête, {formData.firstName} !
              </p>
            </div>

            {claimResult?.code && (
              <div className="bg-gray-100 rounded-xl p-6">
                <p className="text-sm text-gray-500 mb-2">Votre code de validation :</p>
                <p className="text-3xl font-mono font-bold" style={{ color: primaryColor }}>
                  {claimResult.code}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {hasWhatsApp && organization.whatsappNumber && (
                <Button
                  size="lg"
                  className="w-full bg-[#25D366] hover:bg-[#25D366]/90"
                  onClick={() => {
                    const message = encodeURIComponent(`FIDELYZ-${organization.slug}`);
                    const cleanWhatsAppNumber = (organization.whatsappNumber || "").replace(/\D/g, "");
                    window.open(`https://wa.me/${cleanWhatsAppNumber}?text=${message}`, "_blank");
                  }}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Activer ma carte sur WhatsApp
                </Button>
              )}

              {isAndroid && googleWalletUrl && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                  onClick={() => window.open(googleWalletUrl, "_blank")}
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Ajouter à Google Wallet
                </Button>
              )}

              {formData.email && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Email already sent, show confirmation
                  }}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Envoyé par email ✓
                </Button>
              )}

              {claimResult?.customerToken && (
                <a
                  href={`/c/${claimResult.customerToken}`}
                  className="block text-sm text-gray-500 hover:underline mt-4"
                  style={{ color: primaryColor }}
                >
                  Voir ma page personnelle →
                </a>
              )}
            </div>
          </div>
        )}
      </main>

      {/* PWA Install Prompt */}
      {showPWA && <PWAInstallPrompt primaryColor={primaryColor} />}
    </div>
  );
}
