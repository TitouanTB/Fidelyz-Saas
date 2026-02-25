"use client";

import { useState, useMemo } from "react";
import { Search, Clock, Leaf, Flame, Star, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

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
      <div className="text-center py-12">
        <p className="text-gray-500">Menu not available at the moment.</p>
      </div>
    );
  }

  const categories = menuData.categories.length > 0 
    ? menuData.categories 
    : [...new Set(menuData.products.map(p => p.category))];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Our Menu</h2>
        <p className="text-gray-600 mt-2">Discover our delicious offerings</p>
      </div>

      <div className="sticky top-[72px] bg-gray-50 py-4 z-40 -mx-4 px-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            style={selectedCategory === null ? { backgroundColor: theme.primaryColor } : {}}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              style={selectedCategory === category ? { backgroundColor: theme.primaryColor } : {}}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {categories.map((category) => {
        const categoryProducts = filteredProducts.filter((p) => p.category === category);
        if (categoryProducts.length === 0) return null;

        return (
          <section key={category} className="space-y-4">
            <h3
              className="text-xl font-bold text-gray-900 pb-2 border-b-2"
              style={{ borderColor: theme.primaryColor }}
            >
              {category}
            </h3>

            <div
              className={
                menuTheme.layout === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              }
            >
              {categoryProducts.map((product, idx) => {
                const productId = product.id || `product-${idx}`;
                const isExpanded = expandedProducts.has(productId);

                return (
                  <div
                    key={productId}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {menuTheme.showImages && product.image && (
                      <div className="relative h-48">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          {product.isNew && (
                            <Badge
                              style={{ backgroundColor: theme.accentColor }}
                            >
                              New
                            </Badge>
                          )}
                          {product.isPopular && (
                            <Badge className="bg-orange-500">Popular</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">
                              {product.name}
                            </h4>
                            {product.isVegetarian && (
                              <Leaf className="w-4 h-4 text-green-500" />
                            )}
                            {product.isSpicy && (
                              <Flame className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        {menuTheme.showPrices && (
                          <div className="text-right shrink-0">
                            <p
                              className="font-bold text-lg"
                              style={{ color: theme.primaryColor }}
                            >
                              {formatCurrency(product.price, menuData.currency)}
                            </p>
                            {product.variants && product.variants.length > 0 && (
                              <p className="text-xs text-gray-400">from</p>
                            )}
                          </div>
                        )}
                      </div>

                      {product.allergens && product.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {product.allergens.map((allergen) => (
                            <Badge
                              key={allergen}
                              variant="outline"
                              className="text-xs"
                            >
                              {allergen}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {product.variants && product.variants.length > 0 && (
                        <button
                          onClick={() => toggleProductExpand(productId)}
                          className="flex items-center gap-1 text-sm text-gray-500 mt-3 hover:text-gray-700 transition-colors"
                        >
                          <span>View options</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}

                      {isExpanded && product.variants && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          {product.variants.map((variant, vIdx) => (
                            <div
                              key={vIdx}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-600">{variant.name}</span>
                              <span
                                className="font-medium"
                                style={{ color: theme.primaryColor }}
                              >
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No products found matching your search.
          </p>
        </div>
      )}

      <div className="text-center text-sm text-gray-400 mt-8">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <Leaf className="w-4 h-4 text-green-500" />
            <span>Vegetarian</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-red-500" />
            <span>Spicy</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>Popular</span>
          </div>
        </div>
      </div>
    </div>
  );
}
