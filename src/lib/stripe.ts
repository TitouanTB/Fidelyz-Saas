import Stripe from "stripe";
import { isFeatureEnabled } from "./feature-flags";

let stripeInstance: Stripe | null = null;

// Check if Stripe is available
const isStripeEnabled = isFeatureEnabled("enableBilling") && !!process.env.STRIPE_SECRET_KEY;

/**
 * Get Stripe instance with graceful degradation
 * Returns null if Stripe is not configured or feature flag is disabled
 */
export function getStripe(): Stripe | null {
  if (!isFeatureEnabled("enableBilling")) {
    console.warn("Stripe is disabled via feature flag");
    return null;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("Stripe secret key not configured");
    return null;
  }

  if (!stripeInstance) {
    try {
      stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2026-01-28.clover",
        typescript: true,
      });
    } catch (error) {
      console.error("Failed to initialize Stripe:", error);
      return null;
    }
  }

  return stripeInstance;
}

/**
 * Wrapper for Stripe operations with graceful degradation
 */
export async function withStripe<T>(
  operation: (stripe: Stripe) => Promise<T>,
  fallback: T
): Promise<T> {
  const stripe = getStripe();
  
  if (!stripe) {
    console.warn("Stripe unavailable, using fallback");
    return fallback;
  }

  try {
    return await operation(stripe);
  } catch (error) {
    console.error("Stripe operation failed:", error);
    return fallback;
  }
}

// Legacy export for backward compatibility - prefer getStripe() in new code
// This will return null if Stripe is not available
export const stripe = getStripe();

// Plan definitions
export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null,
    features: [
      "100 customers",
      "1 campaign/month",
      "Email only",
      "Basic analytics",
    ],
  },
  STARTER: {
    name: "Starter",
    price: 29,
    priceId: process.env.STRIPE_PRICE_ID_STARTER!,
    features: [
      "1,000 customers",
      "10 campaigns/month",
      "Email + SMS",
      "Advanced analytics",
      "Priority support",
    ],
  },
  PRO: {
    name: "Pro",
    price: 99,
    priceId: process.env.STRIPE_PRICE_ID_PRO!,
    features: [
      "10,000 customers",
      "Unlimited campaigns",
      "All channels",
      "AI suggestions",
      "API access",
      "Dedicated support",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 299,
    priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE!,
    features: [
      "Unlimited customers",
      "Unlimited campaigns",
      "All channels",
      "Custom integrations",
      "SLA",
      "Account manager",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const PRICE_ID_TO_PLAN: Record<string, PlanKey> = {
  [process.env.STRIPE_PRICE_ID_STARTER || ""]: "STARTER",
  [process.env.STRIPE_PRICE_ID_PRO || ""]: "PRO",
  [process.env.STRIPE_PRICE_ID_ENTERPRISE || ""]: "ENTERPRISE",
};

export const getPlanFromPriceId = (priceId: string): PlanKey => {
  return PRICE_ID_TO_PLAN[priceId] || "FREE";
};

export const getStripePrice = (priceId: string) => {
  const prices: Record<string, { amount: number; name: string }> = {
    [process.env.STRIPE_PRICE_ID_STARTER!]: { amount: 29, name: "Starter" },
    [process.env.STRIPE_PRICE_ID_PRO!]: { amount: 99, name: "Pro" },
    [process.env.STRIPE_PRICE_ID_ENTERPRISE!]: { amount: 299, name: "Enterprise" },
  };
  return prices[priceId] || { amount: 0, name: "Unknown" };
};

export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
) => {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not available");
  }

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
};

export const createBillingPortalSession = async (
  customerId: string,
  returnUrl: string
) => {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not available");
  }

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
};

export const createOrRetrieveCustomer = async (
  organizationId: string,
  email: string,
  name?: string
) => {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not available");
  }

  const existingCustomer = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomer.data.length > 0) {
    return existingCustomer.data[0];
  }

  return stripe.customers.create({
    email,
    name,
    metadata: { organizationId },
  });
};

export const getSubscription = async (subscriptionId: string) => {
  return withStripe(
    async (stripe) => stripe.subscriptions.retrieve(subscriptionId),
    null
  );
};

export const cancelSubscription = async (subscriptionId: string) => {
  return withStripe(
    async (stripe) => stripe.subscriptions.cancel(subscriptionId),
    null
  );
};

export const updateSubscription = async (
  subscriptionId: string,
  params: Stripe.SubscriptionUpdateParams
) => {
  return withStripe(
    async (stripe) => stripe.subscriptions.update(subscriptionId, params),
    null
  );
};

export const createWebhookEvent = (payload: string, signature: string) => {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not available");
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
};

export const listInvoices = async (customerId: string, limit = 10) => {
  return withStripe(
    async (stripe) =>
      stripe.invoices.list({
        customer: customerId,
        limit,
      }),
    { object: "list", data: [], has_more: false, url: "" } as any
  );
};

export const handleWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      return { type: "checkout.completed", sessionId: session.id, data: session };
    }
    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      return { type: "subscription.created", subscriptionId: subscription.id, data: subscription };
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      return { type: "subscription.updated", subscriptionId: subscription.id, data: subscription };
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      return { type: "subscription.deleted", subscriptionId: subscription.id, data: subscription };
    }
    case "customer.subscription.paused": {
      const subscription = event.data.object as Stripe.Subscription;
      return { type: "subscription.paused", subscriptionId: subscription.id, data: subscription };
    }
    case "customer.subscription.resumed": {
      const subscription = event.data.object as Stripe.Subscription;
      return { type: "subscription.resumed", subscriptionId: subscription.id, data: subscription };
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      return { type: "invoice.paid", invoiceId: invoice.id, data: invoice };
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      return { type: "invoice.payment_succeeded", invoiceId: invoice.id, data: invoice };
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      return { type: "invoice.payment_failed", invoiceId: invoice.id, data: invoice };
    }
    case "invoice.created": {
      const invoice = event.data.object as Stripe.Invoice;
      return { type: "invoice.created", invoiceId: invoice.id, data: invoice };
    }
    default:
      return { type: event.type, data: event.data.object };
  }
};

// Check if billing is available
export const isBillingAvailable = (): boolean => {
  return isFeatureEnabled("enableBilling") && !!process.env.STRIPE_SECRET_KEY;
};
