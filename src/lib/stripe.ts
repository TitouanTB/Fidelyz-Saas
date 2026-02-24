import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null,
    features: ["100 customers", "1 campaign/month", "Email only", "Basic analytics"],
  },
  STARTER: {
    name: "Starter",
    price: 29,
    priceId: process.env.STRIPE_PRICE_ID_STARTER!,
    features: ["1,000 customers", "10 campaigns/month", "Email + SMS", "Advanced analytics", "Priority support"],
  },
  PRO: {
    name: "Pro",
    price: 99,
    priceId: process.env.STRIPE_PRICE_ID_PRO!,
    features: ["10,000 customers", "Unlimited campaigns", "All channels", "AI suggestions", "API access", "Dedicated support"],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 299,
    priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE!,
    features: ["Unlimited customers", "Unlimited campaigns", "All channels", "Custom integrations", "SLA", "Account manager"],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const getStripePrice = (priceId: string) => {
  const prices: Record<string, { amount: number; name: string }> = {
    [process.env.STRIPE_PRICE_ID_STARTER!]: { amount: 29, name: "Starter" },
    [process.env.STRIPE_PRICE_ID_PRO!]: { amount: 79, name: "Pro" },
    [process.env.STRIPE_PRICE_ID_ENTERPRISE!]: { amount: 199, name: "Enterprise" },
  };
  return prices[priceId] || { amount: 0, name: "Unknown" };
};

export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) => {
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
  });
};

export const createBillingPortalSession = async (
  customerId: string,
  returnUrl: string
) => {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
};

export const handleWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      return { type: "checkout.completed", sessionId: session.id };
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      return { type: "subscription.updated", subscriptionId: subscription.id };
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      return { type: "subscription.deleted", subscriptionId: subscription.id };
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      return { type: "invoice.paid", invoiceId: invoice.id };
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      return { type: "invoice.payment_failed", invoiceId: invoice.id };
    }
    default:
      return { type: event.type };
  }
};