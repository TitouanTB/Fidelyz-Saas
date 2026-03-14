"use client";

import { useState } from "react";
import {
  Star,
  Gift,
  Sparkles,
  Heart,
  Percent,
  Ticket,
  Coffee,
  Utensils,
  Wine,
  Award,
  Check,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MiniSiteContentProps {
  organization: {
    name: string;
    primaryColor: string;
    description?: string | null;
  };
  content: {
    hero?: {
      headline: string;
      subheadline: string;
      ctaText: string;
      backgroundImage?: string;
    };
    benefits?: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    loyaltyProgram?: {
      programName: string;
      howItWorks: string[];
      pointsPerPurchase: number;
      welcomeBonus: number;
      tierThresholds?: Record<string, number>;
    };
    cta?: {
      heading: string;
      description: string;
      buttonText: string;
    };
    testimonials?: Array<{
      name: string;
      content: string;
      rating: number;
    }>;
    features?: Array<{
      title: string;
      description: string;
    }>;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    star: Star,
    gift: Gift,
    sparkles: Sparkles,
    heart: Heart,
    percent: Percent,
    ticket: Ticket,
    coffee: Coffee,
    utensils: Utensils,
    wine: Wine,
    award: Award,
  };
  return icons[iconName] || Gift;
};

export function MiniSiteContent({ organization, content, theme }: MiniSiteContentProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const hero = content.hero || {
    headline: `Bienvenue chez ${organization.name}`,
    subheadline: organization.description || "Rejoignez notre programme de fidélité et transformez vos visites en récompenses exclusives.",
    ctaText: "Devenir membre",
  };

  const benefits = content.benefits || [
    { title: "Cumulez des points", description: "Gagnez des points à chaque passage en caisse simplement en présentant votre carte.", icon: "star" },
    { title: "Récompenses Exclusives", description: "Échangez vos points contre des cadeaux, des réductions ou des expériences uniques.", icon: "gift" },
    { title: "Statut VIP", description: "Débloquez des avantages premium et des offres personnalisées selon votre fidélité.", icon: "sparkles" },
  ];

  const loyaltyProgram = content.loyaltyProgram;
  const cta = content.cta || {
    heading: "Prêt à être récompensé ?",
    description: "Inscrivez-vous en quelques secondes et commencez à profiter de vos avantages dès aujourd'hui.",
    buttonText: "Rejoindre maintenant",
  };

  const testimonials = content.testimonials || [];
  const features = content.features || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/public/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSuccess(true);
        setEmail("");
      }
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative py-12 text-center md:py-20 lg:py-28 overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02]">
        <div 
          className="absolute inset-0 opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle at center, ${theme.primaryColor}, transparent)` }}
        />
        <div className="relative z-10 space-y-8 px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-default/10 border border-violet-default/20 text-violet-default text-[10px] font-bold uppercase tracking-widest mx-auto">
             <Sparkles size={12} />
             Offre de bienvenue disponible
          </div>
          <h2 className="text-4xl md:text-6xl font-bold font-heading text-text-primary tracking-tight max-w-4xl mx-auto leading-[1.1]">
            {hero.headline}
          </h2>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {hero.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="h-14 px-10 bg-violet-default hover:bg-violet-hover text-white rounded-2xl shadow-[0_20px_40px_rgba(147,23,253,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] font-bold tracking-wide"
            >
              {hero.ctaText}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-10 border-white/10 hover:bg-white/5 rounded-2xl text-text-secondary font-bold"
            >
              En savoir plus
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="space-y-16 px-4">
        <div className="text-center space-y-4">
           <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-[0.3em]">Pourquoi nous rejoindre ?</h3>
           <p className="text-2xl md:text-3xl font-bold font-heading text-text-primary">Une expérience conçue pour vous remercier</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => {
            const IconComponent = getIconComponent(benefit.icon);
            return (
              <div
                key={idx}
                className="glass-surface group relative overflow-hidden rounded-[2rem] p-8 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all hover:-translate-y-2 duration-500"
              >
                <div 
                  className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-white/10 shadow-xl transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${theme.primaryColor}10`,
                  }}
                >
                  <IconComponent className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-text-primary font-heading mb-4 tracking-tight">{benefit.title}</h4>
                <p className="text-text-tertiary leading-relaxed text-sm group-hover:text-text-secondary transition-colors italic">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works / Loyalty Program */}
      {loyaltyProgram && (
        <section className="glass-surface rounded-[2.5rem] p-10 md:p-16 border border-white/5 bg-white/[0.02] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-default/40 to-transparent" />
          
          <div className="relative z-10 space-y-16">
            <div className="text-center space-y-4">
               <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-[0.3em]">Le Programme</h3>
               <p className="text-3xl md:text-4xl font-bold font-heading text-text-primary tracking-tight">{loyaltyProgram.programName}</p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
               {/* Connector Line (Desktop) */}
               <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-px border-t border-dashed border-white/10" />
               
               {loyaltyProgram.howItWorks.map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-6 group">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white/10 shadow-2xl transition-all group-hover:border-violet-default/50"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {idx + 1}
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-text-primary font-heading tracking-tight">{step}</p>
                    <div className="w-8 h-1 bg-white/5 mx-auto rounded-full group-hover:bg-violet-default/30 transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-white/5">
              <div className="glass-surface rounded-2xl p-8 bg-white/2 border border-white/5 flex items-center justify-between group">
                <div>
                  <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1.5">Ratio de gain</p>
                  <p className="text-4xl font-bold font-heading tracking-tight" style={{ color: theme.primaryColor }}>
                    {loyaltyProgram.pointsPerPurchase}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1 font-medium italic">pts / € dépensés</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-violet-default/20 transition-all">
                   <Target size={24} className="text-text-tertiary group-hover:text-violet-default transition-colors" />
                </div>
              </div>

              <div className="glass-surface rounded-2xl p-8 bg-white/2 border border-white/5 flex items-center justify-between group">
                <div>
                  <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1.5">Bonus de bienvenue</p>
                  <p className="text-4xl font-bold font-heading tracking-tight" style={{ color: theme.accentColor }}>
                    +{loyaltyProgram.welcomeBonus}
                  </p>
                  <p className="text-xs text-text-tertiary mt-1 font-medium italic">offerts à l'inscription</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-amber-500/20 transition-all">
                   <Gift size={24} className="text-text-tertiary group-hover:text-amber-500 transition-colors" />
                </div>
              </div>
            </div>

            {/* Tiers */}
            {loyaltyProgram.tierThresholds && (
              <div className="pt-10 space-y-8">
                <h4 className="text-center text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Paliers de Membres</h4>
                <div className="flex flex-wrap justify-center gap-4">
                  {Object.entries(loyaltyProgram.tierThresholds).map(
                    ([tier, threshold]) => (
                      <div
                        key={tier}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold border border-white/5 transition-all hover:border-white/10 flex items-center gap-3 group"
                        style={{
                          backgroundColor: `${theme.secondaryColor}10`,
                          color: theme.secondaryColor,
                        }}
                      >
                        <Award size={16} />
                        <span className="font-heading">{tier}:</span>
                        <span className="text-text-primary group-hover:text-white transition-colors">{threshold}+ pts</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features List */}
      {features.length > 0 && (
        <section className="px-4">
          <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-[0.3em] text-center mb-16">Vos privilèges membres</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 glass-surface rounded-2xl p-6 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border border-white/10"
                  style={{ backgroundColor: `${theme.primaryColor}20` }}
                >
                  <Check className="w-4 h-4" style={{ color: theme.primaryColor }} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-text-primary font-heading tracking-tight">{feature.title}</h4>
                  <p className="text-sm text-text-tertiary mt-2 leading-relaxed group-hover:text-text-secondary transition-colors italic">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="px-4">
          <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-[0.3em] text-center mb-16">L'avis de nos habitués</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="glass-surface relative overflow-hidden rounded-[2rem] p-8 border border-white/5 bg-white/[0.02]"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4"
                      style={{
                        fill: i < testimonial.rating ? theme.accentColor : "transparent",
                        color: i < testimonial.rating ? theme.accentColor : "rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-text-secondary italic text-lg leading-relaxed font-medium">"{testimonial.content}"</p>
                <div className="flex items-center gap-4 mt-8">
                   <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                      <Heart size={16} className="text-text-tertiary" />
                   </div>
                   <p className="text-sm font-bold text-text-primary font-heading tracking-tight">
                    {testimonial.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA / Sign-up */}
      <section className="glass-surface relative overflow-hidden rounded-[3rem] p-12 md:p-20 border border-white/5 bg-white/[0.02] text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-default/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-10">
          <div className="space-y-4">
            <h3 className="text-3xl md:text-5xl font-bold font-heading text-text-primary tracking-tight leading-[1.1]">{cta.heading}</h3>
            <p className="text-text-secondary text-lg leading-relaxed">{cta.description}</p>
          </div>

          {isSuccess ? (
            <div className="inline-flex items-center gap-4 px-8 py-6 rounded-3xl bg-success/10 border border-success/20 text-success text-lg font-bold">
              <Check className="w-7 h-7" />
              <span>Bienvenue dans le club Fidelyz !</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            >
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-16 rounded-2xl bg-white/5 border-white/10 text-text-primary placeholder:text-text-tertiary px-6 text-lg"
              />
              <Button
                type="submit"
                loading={isSubmitting}
                className="h-16 px-10 bg-violet-default hover:bg-violet-hover text-white rounded-2xl font-bold text-lg shadow-xl shrink-0 transition-transform active:scale-95"
              >
                {cta.buttonText}
              </Button>
            </form>
          )}
          <div className="flex items-center justify-center gap-8 pt-8 opacity-40">
             <div className="flex items-center gap-2 text-xs font-bold text-text-tertiary uppercase tracking-widest">
                <ShieldCheck size={16} /> 100% Sécurisé
             </div>
             <div className="flex items-center gap-2 text-xs font-bold text-text-tertiary uppercase tracking-widest">
                <Zap size={16} /> Instantané
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Target } from "lucide-react";

