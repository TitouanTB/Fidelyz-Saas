"use client";

import { ReactNode } from "react";
import { MapPin, Phone, Clock, Instagram, Facebook, Globe, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicPageLayoutProps {
  children: ReactNode;
  organization: {
    name: string;
    logoUrl?: string | null;
    primaryColor: string;
    description?: string | null;
    websiteUrl?: string | null;
  };
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily?: string;
    borderRadius?: string;
  };
  showFooter?: boolean;
  contactInfo?: {
    address?: string;
    phone?: string;
    hours?: string;
    instagram?: string;
    facebook?: string;
  };
}

export function PublicPageLayout({
  children,
  organization,
  theme,
  showFooter = true,
  contactInfo,
}: PublicPageLayoutProps) {
  const colors = theme || {
    primaryColor: organization.primaryColor,
    secondaryColor: "#9317FD", // Default violet if not specified
    accentColor: "#f59e0b",
  };

  return (
    <div
      className="min-h-screen bg-[#111114] text-text-primary selection:bg-violet-default/30"
      style={
        {
          "--brand-primary": colors.primaryColor,
          "--brand-secondary": colors.secondaryColor,
          "--brand-accent": colors.accentColor,
          "--radius": colors.borderRadius || "1rem",
        } as React.CSSProperties
      }
    >
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
         <div 
           className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10"
           style={{ backgroundColor: colors.primaryColor }}
         />
         <div 
           className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-5"
           style={{ backgroundColor: colors.secondaryColor }}
         />
      </div>

      <header
        className="sticky top-0 z-50 py-4 px-6 border-b border-white/5 backdrop-blur-xl bg-[#111114]/80"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="w-10 h-10 rounded-xl object-cover bg-white/5 border border-white/10 p-1 shadow-lg"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: `${colors.primaryColor}20`, borderColor: `${colors.primaryColor}40` }}
              >
                <span 
                  className="font-bold text-xl font-heading"
                  style={{ color: colors.primaryColor }}
                >
                  {organization.name.charAt(0)}
                </span>
              </div>
            )}
            <h1 className="text-xl font-bold text-text-primary font-heading tracking-tight">{organization.name}</h1>
          </div>

          {organization.websiteUrl && (
            <a
              href={organization.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/2 border border-white/5 transition-all hover:bg-white/5 hover:border-white/10"
            >
              <Globe className="w-4 h-4 text-text-tertiary group-hover:text-text-primary transition-colors" />
              <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors hidden sm:inline">Visiter le site</span>
              <ArrowUpRight className="w-3 h-3 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10 transition-all duration-500">
        {children}
      </main>

      {showFooter && (
        <footer className="relative z-10 border-t border-white/5 bg-[#0c0c0e] py-20 mt-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
              <div className="md:col-span-5 space-y-6">
                <div className="flex items-center gap-4">
                  {organization.logoUrl ? (
                    <img
                      src={organization.logoUrl}
                      alt={organization.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                      style={{ backgroundColor: `${colors.primaryColor}10` }}
                    >
                      <span className="font-bold text-lg" style={{ color: colors.primaryColor }}>
                        {organization.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-xl font-bold font-heading text-text-primary">{organization.name}</span>
                </div>
                {organization.description && (
                  <p className="text-text-secondary text-sm leading-relaxed max-w-md">{organization.description}</p>
                )}
                <div className="flex gap-4 pt-2">
                  {contactInfo?.instagram && (
                    <a
                      href={contactInfo.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/10 transition-all"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {contactInfo?.facebook && (
                    <a
                      href={contactInfo.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/10 transition-all"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-12">
                {contactInfo && (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em]">Localisation</h4>
                    <div className="space-y-4">
                      {contactInfo.address && (
                        <div className="flex items-start gap-4 group">
                          <div className="w-8 h-8 rounded-lg bg-white/2 border border-white/5 flex items-center justify-center mt-1">
                             <MapPin className="w-4 h-4 text-violet-default" />
                          </div>
                          <span className="text-sm text-text-secondary leading-snug">{contactInfo.address}</span>
                        </div>
                      )}
                      {contactInfo.phone && (
                        <div className="flex items-center gap-4 group">
                          <div className="w-8 h-8 rounded-lg bg-white/2 border border-white/5 flex items-center justify-center">
                             <Phone className="w-4 h-4 text-violet-default" />
                          </div>
                          <a
                            href={`tel:${contactInfo.phone}`}
                            className="text-sm text-text-secondary hover:text-text-primary transition-colors font-medium"
                          >
                            {contactInfo.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em]">Horaires d'ouverture</h4>
                  {contactInfo?.hours ? (
                     <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/2 border border-white/5 flex items-center justify-center mt-1">
                           <Clock className="w-4 h-4 text-violet-default" />
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{contactInfo.hours}</p>
                     </div>
                  ) : (
                    <p className="text-sm text-text-tertiary">Horaires non disponibles</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 mt-20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-text-tertiary font-medium">
                © {new Date().getFullYear()} {organization.name}. Tous droits réservés.
              </p>
              <div className="flex items-center gap-2">
                 <span className="text-[11px] text-text-tertiary">Powered by</span>
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-default/10 rounded-full border border-violet-default/20">
                    <div className="w-1.5 h-1.5 bg-violet-default rounded-full animate-pulse" />
                    <span className="text-[11px] font-bold text-violet-default uppercase tracking-widest">Fidelyz</span>
                 </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

