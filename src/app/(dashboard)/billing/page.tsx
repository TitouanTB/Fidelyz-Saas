import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PLANS } from "@/lib/stripe";
import { BillingPlanCard } from "@/components/billing/billing-plan-card";
import { SubscriptionStatus } from "@/components/billing/subscription-status";
import { InvoiceHistory } from "@/components/billing/invoice-history";
import { CustomerPortalButton } from "@/components/billing/customer-portal-button";

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
  const hasActiveSubscription = !!organization.stripeSubscriptionId;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your subscription and billing</p>
      </div>

      <SubscriptionStatus
        plan={currentPlan}
        hasActiveSubscription={hasActiveSubscription}
        stripeCurrentPeriodEnd={organization.stripeCurrentPeriodEnd}
        stripeCustomerId={organization.stripeCustomerId}
      />

      {hasActiveSubscription && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Manage Subscription</h2>
            <CustomerPortalButton
              organizationId={organization.id}
              hasCustomerId={!!organization.stripeCustomerId}
            />
          </div>
          <p className="text-sm text-gray-500">
            Access the Stripe Customer Portal to update your payment method, view invoices, 
            or change your subscription plan.
          </p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>
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

      {hasActiveSubscription && (
        <InvoiceHistory organizationId={organization.id} />
      )}
    </div>
  );
}
