"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BillingPlanCardProps {
  planKey: string;
  plan: {
    name: string;
    price: number;
    priceId?: string | null | undefined;
    features: readonly string[];
  };
  isCurrentPlan: boolean;
  organizationId: string;
}

export function BillingPlanCard({ planKey, plan, isCurrentPlan, organizationId }: BillingPlanCardProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (planKey === "FREE" || isCurrentPlan) return;
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, organizationId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isPopular = planKey === "PRO";

  return (
    <div className={cn(
      "bg-white rounded-xl border p-6 shadow-sm relative",
      isPopular ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-gray-200",
      isCurrentPlan && "bg-indigo-50"
    )}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Popular
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-bold text-gray-900">€{plan.price}</span>
          {plan.price > 0 && <span className="text-gray-500 text-sm">/month</span>}
        </div>
      </div>

      <ul className="space-y-2 mb-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
            <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        onClick={handleSubscribe}
        loading={loading}
        variant={isCurrentPlan ? "secondary" : isPopular ? "default" : "outline"}
        className="w-full"
        disabled={isCurrentPlan || planKey === "FREE"}
      >
        {isCurrentPlan ? "Current Plan" : planKey === "FREE" ? "Free Plan" : "Upgrade"}
      </Button>
    </div>
  );
}
