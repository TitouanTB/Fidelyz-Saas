import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PLANS } from "@/lib/stripe";
import { BillingPlanCard } from "@/components/billing/billing-plan-card";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = { title: "Billing - Fidelyz" };

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  });
  if (!member) redirect("/onboarding");

  const { organization } = member;
  const currentPlan = organization.plan;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your subscription and billing</p>
      </div>

      {organization.stripeSubscriptionId && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">Active subscription</p>
            <p className="text-xs text-green-600">
              Current plan: {currentPlan}
              {organization.stripeCurrentPeriodEnd && ` · Renews ${new Date(organization.stripeCurrentPeriodEnd).toLocaleDateString()}`}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => (
          <BillingPlanCard
            key={key}
            planKey={key}
            plan={plan}
            isCurrentPlan={currentPlan === key}
            organizationId={organization.id}
          />
        ))}
      </div>
    </div>
  );
}
