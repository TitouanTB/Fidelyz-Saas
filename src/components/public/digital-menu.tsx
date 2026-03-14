"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Leaf, Flame, Star, ChevronDown, MapPin, Phone, Gift, X } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StickyRewardBanner } from "./sticky-reward-banner";
import { RewardPopup } from "./reward-popup";
import { PWAInstallPrompt } from "./pwa-install-prompt";
import { PushSubscriber } from "./push-subscriber";
import { formatCurrency } from "@/lib/utils";

interface DigitalMenuProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    primaryColor: string;
  };
  menuData?: {
    products: Array<{
      id?: string;
      name: string;
      description: string;
      price: number;
      category: string;
      image?: string;
      isVegetarian?: boolean;
      isSpicy?: boolean;
      isGlutenFree?: boolean;
      isNew?: boolean;
      isPopular?: boolean;
      allergens?: string[];
      variants?: Array<{ name: string; price: number }>;
    }>;
    categories: string[];
    currency: string;
  };
  contact?: {
    address?: string;
    phone?: string;
  };
  activeReward?: {
    name: string;
    pointsRequired: number;
  } | null;
}

export function DigitalMenu({ organization, menuData, contact, activeReward }: DigitalMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [showPWA, setShowPWA] = useState(false);
  const primaryColor = organization.primaryColor || "#9317FD";

  useEffect(() => {
    const timer = setTimeout(() => setShowPWA(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const products = menuData?.products || [];
  const categories = (menuData?.categories && menuData.categories.length > 0)
    ? menuData.categories
    : Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const toggleProductExpand = (productId: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" style={{ "--brand-primary": primaryColor } as React.CSSProperties}>
      <PushSubscriber organizationId={organization.id} />

      {/* Sticky Header */}
      <header
        className="sticky top-0 z-50 py-3 px-4 shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href={`/${organization.slug}`} className="flex items-center gap-3">
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
            <div>
              <h1 className="text-lg font-bold text-white">{organization.name}</h1>
              <span className="text-xs text-white/70">Menu</span>
            </div>
          </Link>

          <Link
            href={`/r/${organization.slug}`}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-full px-4 py-2 text-white text-sm font-medium transition-colors"
          >
            <Gift className="w-4 h-4" />
            <span className="hidden sm:inline">Récompense</span>
          </Link>
        </div>
      </header>

      {/* Search and Categories */}
      <div className="sticky top-[60px] bg-gray-50 py-4 z-40 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher dans le menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              style={selectedCategory === null ? { backgroundColor: primaryColor } : {}}
            >
              Tout
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                style={selectedCategory === category ? { backgroundColor: primaryColor } : {}}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {categories.map((category) => {
          const categoryProducts = filteredProducts.filter((p) => p.category === category);
          if (categoryProducts.length === 0) return null;

          return (
            <section key={category} className="mb-8">
              <h2
                className="text-xl font-bold text-gray-900 pb-2 mb-4 border-b-2"
                style={{ borderColor: primaryColor }}
              >
                {category}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryProducts.map((product, idx) => {
                  const productId = product.id || `product-${idx}`;
                  const isExpanded = expandedProducts.has(productId);

                  return (
                    <div
                      key={productId}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {product.image && (
                        <div className="relative h-48">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            {product.isNew && (
                              <Badge style={{ backgroundColor: primaryColor }}>Nouveau</Badge>
                            )}
                            {product.isPopular && (
                              <Badge className="bg-orange-500">Populaire</Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900">{product.name}</h3>
                              {product.isVegetarian && (
                                <Leaf className="w-4 h-4 text-green-500" />
                              )}
                              {product.isSpicy && (
                                <Flame className="w-4 h-4 text-red-500" />
                              )}
                              {product.isGlutenFree && (
                                <span className="text-xs text-amber-600 font-medium">Sans gluten</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="font-bold text-lg" style={{ color: primaryColor }}>
                              {formatCurrency(product.price, menuData?.currency || "EUR")}
                            </p>
                            {product.variants && product.variants.length > 0 && (
                              <p className="text-xs text-gray-400">à partir de</p>
                            )}
                          </div>
                        </div>

                        {product.allergens && product.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {product.allergens.map((allergen) => (
                              <Badge key={allergen} variant="outline" className="text-xs">
                                {allergen}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {product.variants && product.variants.length > 0 && (
                          <>
                            <button
                              onClick={() => toggleProductExpand(productId)}
                              className="flex items-center gap-1 text-sm text-gray-500 mt-3 hover:text-gray-700 transition-colors"
                            >
                              <span>Voir les options</span>
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </button>

                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                {product.variants.map((variant, vIdx) => (
                                  <div key={vIdx} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{variant.name}</span>
                                    <span className="font-medium" style={{ color: primaryColor }}>
                                      {formatCurrency(variant.price, menuData?.currency || "EUR")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun produit trouvé.</p>
          </div>
        )}

        {/* Legend */}
        <div className="text-center text-sm text-gray-400 mt-8 py-4 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-1">
              <Leaf className="w-4 h-4 text-green-500" />
              <span>Végétarien</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-red-500" />
              <span>Épicé</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Populaire</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-4">
              {contact?.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{contact.address}</span>
                </div>
              )}
              {contact?.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-white">
                  <Phone className="w-4 h-4" />
                  <span>{contact.phone}</span>
                </a>
              )}
            </div>
            <span>Propulsé par <span style={{ color: primaryColor }}>Fidelyz</span></span>
          </div>
        </div>
      </footer>

      {/* Sticky Reward Banner */}
      {activeReward && (
        <StickyRewardBanner
          slug={organization.slug}
          primaryColor={primaryColor}
          rewardName={activeReward.name}
          pointsRequired={activeReward.pointsRequired}
        />
      )}

      {/* Reward Popup */}
      <RewardPopup
        slug={organization.slug}
        primaryColor={primaryColor}
        rewardName={activeReward?.name}
      />

      {/* PWA Install Prompt */}
      {showPWA && <PWAInstallPrompt primaryColor={primaryColor} />}
    </div>
  );
}
