"use client";

import { useState, useEffect } from "react";
import { MapPin, Phone, Clock, ChevronRight, Gift, Menu, Sparkles, Utensils } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StickyRewardBanner } from "./sticky-reward-banner";
import { PWAInstallPrompt } from "./pwa-install-prompt";
import { PushSubscriber } from "./push-subscriber";

interface RestaurantMiniSiteProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    primaryColor: string;
    description?: string | null;
    industry?: string | null;
  };
  content?: {
    hero?: {
      headline?: string;
      subheadline?: string;
      backgroundImage?: string;
    };
    story?: {
      title?: string;
      content?: string;
    };
    specialties?: Array<{
      name: string;
      description: string;
      price?: number;
      image?: string;
    }>;
    contact?: {
      address?: string;
      phone?: string;
      hours?: string;
    };
  };
  activeReward?: {
    name: string;
    pointsRequired: number;
  } | null;
}

export function RestaurantMiniSite({ organization, content, activeReward }: RestaurantMiniSiteProps) {
  const [showPWA, setShowPWA] = useState(false);
  const primaryColor = organization.primaryColor || "#9317FD";

  useEffect(() => {
    const timer = setTimeout(() => setShowPWA(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const hero = content?.hero || {};
  const story = content?.story || {};
  const specialties = content?.specialties || [];
  const contact = content?.contact || {};

  const headline = hero.headline || `Bienvenue chez ${organization.name}`;
  const subheadline = hero.subheadline || organization.description || "Découvrez nos saveurs authentiques et rejoignez notre programme de fidélité";

  return (
    <div className="min-h-screen bg-gray-50" style={{ "--brand-primary": primaryColor } as React.CSSProperties}>
      <PushSubscriber organizationId={organization.id} />

      {/* Hero Section */}
      <section
        className="relative py-20 px-4 text-white overflow-hidden"
        style={{
          background: hero.backgroundImage
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${hero.backgroundImage})`
            : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {organization.logoUrl ? (
            <img
              src={organization.logoUrl}
              alt={organization.name}
              className="w-20 h-20 mx-auto rounded-xl object-cover bg-white/10 mb-6"
            />
          ) : (
            <div className="w-20 h-20 mx-auto rounded-xl bg-white/20 flex items-center justify-center mb-6">
              <Utensils className="w-10 h-10 text-white" />
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4">{headline}</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">{subheadline}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/m/${organization.slug}`}>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8">
                <Menu className="w-5 h-5 mr-2" />
                Voir le menu
              </Button>
            </Link>
            <Link href={`/r/${organization.slug}`}>
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                <Gift className="w-5 h-5 mr-2" />
                Obtenir ma récompense
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
      </section>

      {/* Notre histoire */}
      {(story.title || story.content) && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Sparkles className="w-8 h-8 mx-auto mb-4" style={{ color: primaryColor }} />
              <h2 className="text-3xl font-bold text-gray-900">{story.title || "Notre histoire"}</h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed text-center max-w-2xl mx-auto">
              {story.content}
            </p>
          </div>
        </section>
      )}

      {/* Nos spécialités */}
      {specialties.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Nos spécialités</h2>
              <p className="text-gray-600 mt-2">Découvrez nos plats signature</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {specialties.slice(0, 3).map((specialty, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  {specialty.image ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={specialty.image}
                        alt={specialty.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div
                      className="h-48 flex items-center justify-center"
                      style={{ backgroundColor: primaryColor + "10" }}
                    >
                      <Utensils className="w-12 h-12" style={{ color: primaryColor + "40" }} />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 text-lg">{specialty.name}</h3>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{specialty.description}</p>
                    {specialty.price !== undefined && (
                      <p className="mt-3 font-bold" style={{ color: primaryColor }}>
                        {specialty.price.toFixed(2)} €
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Programme fidélité CTA */}
      <section
        className="py-16 px-4"
        style={{ background: `linear-gradient(135deg, ${primaryColor}10, ${primaryColor}05)` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <Gift className="w-12 h-12 mx-auto mb-4" style={{ color: primaryColor }} />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Programme de fidélité</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Gagnez des points à chaque visite et obtenez des récompenses exclusives
          </p>
          <Link href={`/r/${organization.slug}`}>
            <Button size="lg" style={{ backgroundColor: primaryColor }}>
              Rejoindre le programme
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              {organization.logoUrl ? (
                <img
                  src={organization.logoUrl}
                  alt={organization.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-white font-bold text-xl">
                    {organization.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg">{organization.name}</h3>
                {organization.industry && (
                  <p className="text-gray-400 text-sm">{organization.industry}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 text-gray-400">
              {contact.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{contact.address}</span>
                </div>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{contact.phone}</span>
                </a>
              )}
              {contact.hours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{contact.hours}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            Propulsé par <span style={{ color: primaryColor }}>Fidelyz</span>
          </div>
        </div>
      </footer>

      {/* Sticky banner */}
      {activeReward && (
        <StickyRewardBanner
          slug={organization.slug}
          primaryColor={primaryColor}
          rewardName={activeReward.name}
          pointsRequired={activeReward.pointsRequired}
        />
      )}

      {/* PWA Install Prompt */}
      {showPWA && <PWAInstallPrompt primaryColor={primaryColor} />}
    </div>
  );
}
