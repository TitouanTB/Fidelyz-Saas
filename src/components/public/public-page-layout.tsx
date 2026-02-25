"use client";

import { ReactNode } from "react";
import { MapPin, Phone, Clock, Instagram, Facebook, Globe } from "lucide-react";

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
    secondaryColor: "#8b5cf6",
    accentColor: "#f59e0b",
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={
        {
          "--brand-primary": colors.primaryColor,
          "--brand-secondary": colors.secondaryColor,
          "--brand-accent": colors.accentColor,
          "--radius": colors.borderRadius || "0.75rem",
        } as React.CSSProperties
      }
    >
      <header
        className="sticky top-0 z-50 py-4 px-4 shadow-sm"
        style={{ backgroundColor: colors.primaryColor }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="w-10 h-10 rounded-lg object-cover bg-white/10"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {organization.name.charAt(0)}
                </span>
              </div>
            )}
            <h1 className="text-xl font-bold text-white">{organization.name}</h1>
          </div>

          {organization.websiteUrl && (
            <a
              href={organization.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Website</span>
            </a>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

      {showFooter && (
        <footer className="bg-gray-900 text-white py-12 mt-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {organization.logoUrl ? (
                    <img
                      src={organization.logoUrl}
                      alt={organization.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: colors.primaryColor }}
                    >
                      <span className="text-white font-bold">
                        {organization.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="font-semibold">{organization.name}</span>
                </div>
                {organization.description && (
                  <p className="text-gray-400 text-sm">{organization.description}</p>
                )}
              </div>

              {contactInfo && (
                <div>
                  <h4 className="font-semibold mb-4">Contact</h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    {contactInfo.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{contactInfo.address}</span>
                      </div>
                    )}
                    {contactInfo.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <a
                          href={`tel:${contactInfo.phone}`}
                          className="hover:text-white transition-colors"
                        >
                          {contactInfo.phone}
                        </a>
                      </div>
                    )}
                    {contactInfo.hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{contactInfo.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-4">Follow Us</h4>
                <div className="flex gap-4">
                  {contactInfo?.instagram && (
                    <a
                      href={contactInfo.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {contactInfo?.facebook && (
                    <a
                      href={contactInfo.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
              Powered by Fidelyz
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
