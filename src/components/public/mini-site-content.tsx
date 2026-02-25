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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    headline: `Welcome to ${organization.name}`,
    subheadline: organization.description || "Join our loyalty program and start earning rewards today",
    ctaText: "Join Now",
  };

  const benefits = content.benefits || [
    { title: "Earn Points", description: "Get points for every purchase", icon: "star" },
    { title: "Exclusive Rewards", description: "Redeem points for great rewards", icon: "gift" },
    { title: "VIP Status", description: "Unlock special privileges", icon: "sparkles" },
  ];

  const loyaltyProgram = content.loyaltyProgram;
  const cta = content.cta || {
    heading: "Join our loyalty program",
    description: "Sign up today and start earning rewards with every visit",
    buttonText: "Get Started",
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
    <div className="space-y-12">
      <section className="text-center py-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">{hero.headline}</h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">{hero.subheadline}</p>
        <Button
          size="lg"
          className="mt-6 px-8"
          style={{ backgroundColor: theme.primaryColor }}
        >
          {hero.ctaText}
        </Button>
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => {
            const IconComponent = getIconComponent(benefit.icon);
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow"
              >
                <div
                  className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: theme.primaryColor + "15",
                    color: theme.primaryColor,
                  }}
                >
                  <IconComponent className="w-7 h-7" />
                </div>
                <h4 className="font-semibold text-gray-900 text-lg">{benefit.title}</h4>
                <p className="text-gray-500 mt-2">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {loyaltyProgram && (
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {loyaltyProgram.programName}
          </h3>

          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
            {loyaltyProgram.howItWorks.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {idx + 1}
                </span>
                <span className="text-gray-700">{step}</span>
                {idx < loyaltyProgram.howItWorks.length - 1 && (
                  <span className="hidden md:block text-gray-300 text-xl">→</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-12 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p
                className="text-3xl font-bold"
                style={{ color: theme.primaryColor }}
              >
                {loyaltyProgram.pointsPerPurchase}
              </p>
              <p className="text-sm text-gray-500 mt-1">pts/€ spent</p>
            </div>
            <div className="text-center">
              <p
                className="text-3xl font-bold"
                style={{ color: theme.accentColor }}
              >
                +{loyaltyProgram.welcomeBonus}
              </p>
              <p className="text-sm text-gray-500 mt-1">welcome bonus</p>
            </div>
          </div>

          {loyaltyProgram.tierThresholds && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-center font-semibold text-gray-900 mb-4">
                Membership Tiers
              </h4>
              <div className="flex flex-wrap justify-center gap-4">
                {Object.entries(loyaltyProgram.tierThresholds).map(
                  ([tier, threshold]) => (
                    <div
                      key={tier}
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: theme.secondaryColor + "20",
                        color: theme.secondaryColor,
                      }}
                    >
                      {tier}: {threshold}+ pts
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {features.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            What We Offer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-200"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            What Our Customers Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4"
                      style={{
                        fill: i < testimonial.rating ? theme.accentColor : "#e5e7eb",
                        color: i < testimonial.rating ? theme.accentColor : "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
                <p className="text-sm font-medium text-gray-900 mt-4">
                  — {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{cta.heading}</h3>
        <p className="text-gray-600 mb-6">{cta.description}</p>

        {isSuccess ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span>Thank you for signing up!</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button
              type="submit"
              loading={isSubmitting}
              style={{ backgroundColor: theme.primaryColor }}
            >
              {cta.buttonText}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
