"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reward, LoyaltyConfig } from "@prisma/client";

interface MiniSiteEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  organization: {
    name: string;
    primaryColor: string;
    description?: string | null;
  };
  loyaltyConfig: LoyaltyConfig | null;
  rewards: Reward[];
}

const iconOptions = [
  { value: "star", label: "Star" },
  { value: "gift", label: "Gift" },
  { value: "sparkles", label: "Sparkles" },
  { value: "heart", label: "Heart" },
  { value: "percent", label: "Percent" },
  { value: "ticket", label: "Ticket" },
  { value: "coffee", label: "Coffee" },
  { value: "utensils", label: "Utensils" },
  { value: "wine", label: "Wine" },
  { value: "award", label: "Award" },
];

export function MiniSiteEditor({
  content,
  onChange,
  organization,
  loyaltyConfig,
}: MiniSiteEditorProps) {
  const hero = (content.hero as Record<string, string>) || {
    headline: `Welcome to ${organization.name}`,
    subheadline: organization.description || "Join our loyalty program and start earning rewards",
    ctaText: "Join Now",
  };

  const benefits = (content.benefits as Array<{ title: string; description: string; icon: string }>) || [
    { title: "Earn Points", description: "Get points for every purchase", icon: "star" },
    { title: "Exclusive Rewards", description: "Redeem points for great rewards", icon: "gift" },
    { title: "VIP Status", description: "Unlock special privileges", icon: "sparkles" },
  ];

  const loyaltyProgram = content.loyaltyProgram as {
    programName: string;
    howItWorks: string[];
    pointsPerPurchase: number;
    welcomeBonus: number;
    tierThresholds?: Record<string, number>;
  } | null;

  const cta = (content.cta as Record<string, string>) || {
    heading: "Join our loyalty program",
    description: "Sign up today and start earning rewards with every visit",
    buttonText: "Get Started",
  };

  const testimonials = (content.testimonials as Array<{ name: string; content: string; rating: number }>) || [];

  const updateHero = (key: string, value: string) => {
    onChange({ ...content, hero: { ...hero, [key]: value } });
  };

  const updateBenefit = (index: number, key: string, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = { ...newBenefits[index], [key]: value };
    onChange({ ...content, benefits: newBenefits });
  };

  const addBenefit = () => {
    const newBenefits = [...benefits, { title: "", description: "", icon: "star" }];
    onChange({ ...content, benefits: newBenefits });
  };

  const removeBenefit = (index: number) => {
    const newBenefits = benefits.filter((_, i) => i !== index);
    onChange({ ...content, benefits: newBenefits });
  };

  const updateCta = (key: string, value: string) => {
    onChange({ ...content, cta: { ...cta, [key]: value } });
  };

  const addTestimonial = () => {
    const newTestimonials = [...testimonials, { name: "", content: "", rating: 5 }];
    onChange({ ...content, testimonials: newTestimonials });
  };

  const updateTestimonial = (index: number, key: string, value: string | number) => {
    const newTestimonials = [...testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [key]: value };
    onChange({ ...content, testimonials: newTestimonials });
  };

  const removeTestimonial = (index: number) => {
    const newTestimonials = testimonials.filter((_, i) => i !== index);
    onChange({ ...content, testimonials: newTestimonials });
  };

  const updateLoyaltyProgram = (key: string, value: string | number | string[]) => {
    const existing = loyaltyProgram || {
      programName: "Loyalty Program",
      howItWorks: ["Sign up", "Earn points", "Get rewards"],
      pointsPerPurchase: loyaltyConfig?.pointsPerEuro || 1,
      welcomeBonus: loyaltyConfig?.welcomeBonus || 0,
    };
    onChange({ ...content, loyaltyProgram: { ...existing, [key]: value } });
  };

  const updateHowItWorks = (index: number, value: string) => {
    if (!loyaltyProgram) return;
    const newHowItWorks = [...loyaltyProgram.howItWorks];
    newHowItWorks[index] = value;
    updateLoyaltyProgram("howItWorks", newHowItWorks);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input
              value={hero.headline}
              onChange={(e) => updateHero("headline", e.target.value)}
              placeholder="Welcome to..."
            />
          </div>
          <div className="space-y-2">
            <Label>Subheadline</Label>
            <Textarea
              value={hero.subheadline}
              onChange={(e) => updateHero("subheadline", e.target.value)}
              placeholder="Describe what your page offers..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input
              value={hero.ctaText}
              onChange={(e) => updateHero("ctaText", e.target.value)}
              placeholder="Join Now"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Benefits</CardTitle>
          <Button variant="outline" size="sm" onClick={addBenefit}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={benefit.title}
                    onChange={(e) => updateBenefit(index, "title", e.target.value)}
                    placeholder="Benefit title"
                  />
                  <Select
                    value={benefit.icon}
                    onValueChange={(value) => updateBenefit(index, "icon", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  value={benefit.description}
                  onChange={(e) => updateBenefit(index, "description", e.target.value)}
                  placeholder="Benefit description"
                />
              </div>
              {benefits.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeBenefit(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Loyalty Program Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Program Name</Label>
            <Input
              value={loyaltyProgram?.programName || ""}
              onChange={(e) => updateLoyaltyProgram("programName", e.target.value)}
              placeholder="My Rewards"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Points per €</Label>
              <Input
                type="number"
                value={loyaltyProgram?.pointsPerPurchase || ""}
                onChange={(e) => updateLoyaltyProgram("pointsPerPurchase", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Welcome Bonus</Label>
              <Input
                type="number"
                value={loyaltyProgram?.welcomeBonus || ""}
                onChange={(e) => updateLoyaltyProgram("welcomeBonus", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>How It Works Steps</Label>
            {(loyaltyProgram?.howItWorks || []).map((step, index) => (
              <div key={index} className="flex gap-2 items-center">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm shrink-0">
                  {index + 1}
                </span>
                <Input
                  value={step}
                  onChange={(e) => updateHowItWorks(index, e.target.value)}
                  placeholder="Step description"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Call to Action</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Heading</Label>
            <Input
              value={cta.heading}
              onChange={(e) => updateCta("heading", e.target.value)}
              placeholder="Join our loyalty program"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={cta.description}
              onChange={(e) => updateCta("description", e.target.value)}
              placeholder="Sign up today and start earning rewards"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input
              value={cta.buttonText}
              onChange={(e) => updateCta("buttonText", e.target.value)}
              placeholder="Get Started"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Testimonials</CardTitle>
          <Button variant="outline" size="sm" onClick={addTestimonial}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {testimonials.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Add testimonials to build trust with visitors
            </p>
          ) : (
            testimonials.map((testimonial, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-3">
                <div className="flex gap-3">
                  <Input
                    value={testimonial.name}
                    onChange={(e) => updateTestimonial(index, "name", e.target.value)}
                    placeholder="Customer name"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={testimonial.rating}
                    onChange={(e) => updateTestimonial(index, "rating", parseInt(e.target.value) || 5)}
                    className="w-20"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTestimonial(index)}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  value={testimonial.content}
                  onChange={(e) => updateTestimonial(index, "content", e.target.value)}
                  placeholder="Testimonial content..."
                  rows={2}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
