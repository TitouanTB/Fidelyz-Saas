"use client";

import { useState, useMemo } from "react";
import { Search, Clock, Leaf, Flame, Star, ChevronDown, UtensilsCrossed, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";

interface DigitalMenuContentProps {
  organization: {
    name: string;
    primaryColor: string;
  };
  content: {
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
        isNew?: boolean;
        isPopular?: boolean;
        allergens?: string[];
        variants?: Array<{ name: string; price: number }>;
      }>;
      categories: string[];
      currency: string;
      averagePrice?: number;
    };
    theme?: {
      layout: "grid" | "list";
      showImages: boolean;
      showPrices: boolean;
    };
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export function DigitalMenuContent({ organization, content, theme }: DigitalMenuContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const menuData = content.menuData;
  const menuTheme = content.theme || {
    layout: "grid",
    showImages: true,
    showPrices: true,
  };

  const filteredProducts = useMemo(() => {
    if (!menuData) return [];
    
    return menuData.products.filter((product) => {
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuData, searchQuery, selectedCategory]);

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

  if (!menuData) {
    return (
      <div className="glass-surface rounded-[2rem] border border-white/5 bg-white/[0.02] p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
           <UtensilsCrossed size={32} className="text-text-tertiary" />
        </div>
        <p className="text-text-secondary text-lg font-medium">Le menu n'est pas disponible pour le moment.</p>
      </div>
    );
  }

  const categories = menuData.categories.length > 0 
    ? menuData.categories 
    : [...new Set(menuData.products.map(p => p.category))];

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold font-heading text-text-primary tracking-tight">Notre Carte</h2>
        <div className="w-12 h-1 bg-violet-default/30 mx-auto rounded-full" />
        <p className="text-text-secondary max-w-lg mx-auto italic">Explorez nos créations culinaires et nos sélections exclusives.</p>
      </div>

      <div className="sticky top-[88px] z-40 -mx-6 px-6 py-4 backdrop-blur-xl bg-[#111114]/60 border-y border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary group-focus-within:text-violet-default transition-colors" />
            <Input
              type="text"
              placeholder="Rechercher un plat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 bg-white/5 border-white/10 text-text-primary placeholder:text-text-tertiary rounded-xl focus:ring-violet-default/20 focus:border-violet-default"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "h-10 px-6 rounded-xl border border-white/5 font-bold transition-all shrink-0",
                selectedCategory === null 
                  ? "bg-violet-default text-white border-violet-default/50 shadow-lg shadow-violet-default/20" 
                  : "bg-white/2 text-text-tertiary hover:bg-white/10 hover:text-text-primary"
              )}
            >
              Tous
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "h-10 px-6 rounded-xl border border-white/5 font-bold transition-all shrink-0",
                  selectedCategory === category 
                    ? "bg-violet-default text-white border-violet-default/50 shadow-lg shadow-violet-default/20" 
                    : "bg-white/2 text-text-tertiary hover:bg-white/10 hover:text-text-primary"
                )}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-20">
        {categories.map((category) => {
          const categoryProducts = filteredProducts.filter((p) => p.category === category);
          if (categoryProducts.length === 0) return null;

          return (
            <section key={category} className="space-y-8">
              <div className="flex items-center gap-4">
                 <h3 className="text-2xl font-bold text-text-primary font-heading tracking-tight">{category}</h3>
                 <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
              </div>

              <div
                className={cn(
                  menuTheme.layout === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    : "space-y-6"
                )}
              >
                {categoryProducts.map((product, idx) => {
                  const productId = product.id || `${category}-product-${idx}`;
                  const isExpanded = expandedProducts.has(productId);

                  return (
                    <div
                      key={productId}
                      className="glass-surface group relative flex flex-col rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 overflow-hidden"
                    >
                      {menuTheme.showImages && product.image && (
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#111114]/80 via-transparent to-transparent opacity-60" />
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                            {product.isNew && (
                              <Badge
                                className="bg-violet-default/80 backdrop-blur-md border border-violet-default/50 text-white font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest shadow-xl"
                              >
                                Nouveau
                              </Badge>
                            )}
                            {product.isPopular && (
                              <Badge className="bg-amber-500/80 backdrop-blur-md border border-amber-500/50 text-white font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest shadow-xl">
                                Populaire
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="p-8 flex-1 flex flex-col gap-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xl font-bold text-text-primary font-heading tracking-tight">
                                {product.name}
                              </h4>
                              <div className="flex gap-1.5 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                {product.isVegetarian && (
                                  <Leaf size={14} className="text-success" />
                                )}
                                {product.isSpicy && (
                                  <Flame size={14} className="text-danger" />
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-text-tertiary leading-relaxed italic group-hover:text-text-secondary transition-colors line-clamp-2">
                              {product.description}
                            </p>
                          </div>

                          {menuTheme.showPrices && (
                            <div className="text-right shrink-0 bg-white/5 rounded-xl px-3 py-2 border border-white/5 group-hover:bg-violet-default/10 group-hover:border-violet-default/20 transition-all">
                              <p className="font-bold text-lg text-text-primary group-hover:text-violet-default transition-colors">
                                {formatCurrency(product.price, menuData.currency)}
                              </p>
                              {product.variants && product.variants.length > 0 && (
                                <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-tighter">Dès</p>
                              )}
                            </div>
                          )}
                        </div>

                        {product.allergens && product.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {product.allergens.map((allergen) => (
                              <div
                                key={allergen}
                                className="px-2 py-0.5 rounded-lg bg-white/2 border border-white/5 text-[9px] font-bold text-text-tertiary uppercase tracking-wider"
                              >
                                {allergen}
                              </div>
                            ))}
                          </div>
                        )}

                        {product.variants && product.variants.length > 0 && (
                          <button
                            onClick={() => toggleProductExpand(productId)}
                            className="flex items-center gap-2 text-xs font-bold text-text-tertiary uppercase tracking-widest mt-auto group/btn"
                          >
                            <span>Options</span>
                            <ChevronDown
                              size={14}
                              className={cn(
                                "transition-transform duration-300",
                                isExpanded ? "rotate-180" : ""
                              )}
                            />
                          </button>
                        )}

                        {isExpanded && product.variants && (
                          <div className="mt-2 space-y-2 p-4 rounded-2xl bg-white/2 border border-white/5">
                            {product.variants.map((variant, vIdx) => (
                              <div
                                key={vIdx}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="text-text-secondary font-medium">{variant.name}</span>
                                <span className="font-bold text-text-primary">
                                  {formatCurrency(variant.price, menuData.currency)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="glass-surface rounded-[2rem] border border-white/5 bg-white/[0.02] p-20 text-center">
           <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-text-tertiary" />
           </div>
           <p className="text-text-secondary text-lg font-medium">Aucun résultat ne correspond à votre recherche.</p>
           <Button 
             variant="link" 
             onClick={() => {setSearchQuery(""); setSelectedCategory(null);}}
             className="text-violet-default mt-2"
           >
             Réinitialiser les filtres
           </Button>
        </div>
      )}

      <div className="glass-surface rounded-2xl p-6 border border-white/5 bg-white/[0.01]">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          <div className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center transition-transform group-hover:scale-110">
               <Leaf size={16} className="text-success" />
            </div>
            <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Végétarien</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center transition-transform group-hover:scale-110">
               <Flame size={16} className="text-danger" />
            </div>
            <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Épicé</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center transition-transform group-hover:scale-110">
               <Star size={16} className="text-amber-500" />
            </div>
            <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Populaire</span>
          </div>
        </div>
      </div>
    </div>
  );
}

