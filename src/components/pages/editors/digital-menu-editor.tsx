"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Image, Leaf, Flame, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DigitalMenuEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

interface MenuItem {
  id: string;
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
}

const currencies = [
  { value: "EUR", label: "€ Euro" },
  { value: "USD", label: "$ US Dollar" },
  { value: "GBP", label: "£ British Pound" },
  { value: "MAD", label: "MAD Moroccan Dirham" },
];

const allergenOptions = [
  "Gluten", "Dairy", "Nuts", "Peanuts", "Eggs", "Soy", "Fish", "Shellfish", "Sesame",
];

export function DigitalMenuEditor({ content, onChange }: DigitalMenuEditorProps) {
  const menuData = content.menuData as {
    products: MenuItem[];
    categories: string[];
    currency: string;
    averagePrice?: number;
  } | null;

  const menuTheme = content.menuTheme as {
    layout: "grid" | "list";
    showImages: boolean;
    showPrices: boolean;
  } | null;

  const products = menuData?.products || [];
  const categories = menuData?.categories || [];
  const currency = menuData?.currency || "EUR";

  const layout = menuTheme?.layout || "grid";
  const showImages = menuTheme?.showImages ?? true;
  const showPrices = menuTheme?.showPrices ?? true;

  const updateMenuData = (updates: Partial<typeof menuData>) => {
    onChange({
      ...content,
      menuData: {
        products,
        categories,
        currency,
        ...menuData,
        ...updates,
      },
    });
  };

  const updateMenuTheme = (updates: Partial<typeof menuTheme>) => {
    onChange({
      ...content,
      menuTheme: {
        layout,
        showImages,
        showPrices,
        ...menuTheme,
        ...updates,
      },
    });
  };

  const addCategory = () => {
    const newCategory = `Category ${categories.length + 1}`;
    updateMenuData({ categories: [...categories, newCategory] });
  };

  const updateCategory = (index: number, value: string) => {
    const newCategories = [...categories];
    const oldCategory = newCategories[index];
    newCategories[index] = value;

    const newProducts = products.map((p) =>
      p.category === oldCategory ? { ...p, category: value } : p
    );

    updateMenuData({ categories: newCategories, products: newProducts });
  };

  const removeCategory = (index: number) => {
    const categoryToRemove = categories[index];
    const newCategories = categories.filter((_, i) => i !== index);
    const newProducts = products.filter((p) => p.category !== categoryToRemove);
    updateMenuData({ categories: newCategories, products: newProducts });
  };

  const addProduct = (category: string) => {
    const newProduct: MenuItem = {
      id: `product-${Date.now()}`,
      name: "",
      description: "",
      price: 0,
      category,
    };
    updateMenuData({ products: [...products, newProduct] });
  };

  const updateProduct = (id: string, updates: Partial<MenuItem>) => {
    const newProducts = products.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    updateMenuData({ products: newProducts });
  };

  const removeProduct = (id: string) => {
    updateMenuData({ products: products.filter((p) => p.id !== id) });
  };

  const toggleProductFlag = (id: string, flag: "isVegetarian" | "isSpicy" | "isNew" | "isPopular") => {
    const product = products.find((p) => p.id === id);
    if (product) {
      updateProduct(id, { [flag]: !product[flag] });
    }
  };

  const addVariant = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const variants = product.variants || [];
      updateProduct(productId, {
        variants: [...variants, { name: "", price: product.price }],
      });
    }
  };

  const updateVariant = (productId: string, variantIndex: number, updates: { name?: string; price?: number }) => {
    const product = products.find((p) => p.id === productId);
    if (product?.variants) {
      const newVariants = [...product.variants];
      newVariants[variantIndex] = { ...newVariants[variantIndex], ...updates };
      updateProduct(productId, { variants: newVariants });
    }
  };

  const removeVariant = (productId: string, variantIndex: number) => {
    const product = products.find((p) => p.id === productId);
    if (product?.variants) {
      const newVariants = product.variants.filter((_, i) => i !== variantIndex);
      updateProduct(productId, { variants: newVariants });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Menu Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(value) => updateMenuData({ currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Layout</Label>
              <Select value={layout} onValueChange={(value: "grid" | "list") => updateMenuTheme({ layout: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={showImages} onCheckedChange={(checked) => updateMenuTheme({ showImages: checked })} />
              <Label>Show Images</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={showPrices} onCheckedChange={(checked) => updateMenuTheme({ showPrices: checked })} />
              <Label>Show Prices</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Categories</CardTitle>
          <Button variant="outline" size="sm" onClick={addCategory}>
            <Plus className="w-4 h-4 mr-1" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Add categories to organize your menu
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                  <Input
                    value={category}
                    onChange={(e) => updateCategory(index, e.target.value)}
                    className="w-32 h-8 border-none bg-transparent px-0"
                  />
                  <button
                    onClick={() => removeCategory(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {categories.map((category) => (
        <Card key={category}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{category}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => addProduct(category)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {products.filter((p) => p.category === category).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No items in this category
              </p>
            ) : (
              products
                .filter((p) => p.category === category)
                .map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            value={product.name}
                            onChange={(e) => updateProduct(product.id, { name: e.target.value })}
                            placeholder="Item name"
                          />
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={product.price}
                              onChange={(e) => updateProduct(product.id, { price: parseFloat(e.target.value) || 0 })}
                              placeholder="Price"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <Textarea
                          value={product.description}
                          onChange={(e) => updateProduct(product.id, { description: e.target.value })}
                          placeholder="Description"
                          rows={2}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={product.isVegetarian ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleProductFlag(product.id, "isVegetarian")}
                          >
                            <Leaf className="w-3 h-3 mr-1" />
                            Vegetarian
                          </Badge>
                          <Badge
                            variant={product.isSpicy ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleProductFlag(product.id, "isSpicy")}
                          >
                            <Flame className="w-3 h-3 mr-1" />
                            Spicy
                          </Badge>
                          <Badge
                            variant={product.isNew ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleProductFlag(product.id, "isNew")}
                          >
                            New
                          </Badge>
                          <Badge
                            variant={product.isPopular ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleProductFlag(product.id, "isPopular")}
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      </div>
                      <div className="w-24">
                        <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                          {product.image ? (
                            <img src={product.image} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Image className="w-8 h-8 text-gray-300" />
                          )}
                        </div>
                        <Input
                          value={product.image || ""}
                          onChange={(e) => updateProduct(product.id, { image: e.target.value })}
                          placeholder="Image URL"
                          className="mt-2 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Variants</Label>
                        <Button variant="ghost" size="sm" onClick={() => addVariant(product.id)}>
                          <Plus className="w-3 h-3 mr-1" />
                          Add Variant
                        </Button>
                      </div>
                      {product.variants?.map((variant, vIndex) => (
                        <div key={vIndex} className="flex gap-2 items-center">
                          <Input
                            value={variant.name}
                            onChange={(e) => updateVariant(product.id, vIndex, { name: e.target.value })}
                            placeholder="Size, option..."
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) => updateVariant(product.id, vIndex, { price: parseFloat(e.target.value) || 0 })}
                            className="w-24"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeVariant(product.id, vIndex)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => removeProduct(product.id)} className="text-red-500">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}