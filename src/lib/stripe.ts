import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null,
    features: [
      "Up to 100 customers",
      "1 campaign per month",
      "Email channel only",
      "Basic analytics",
    ],
    limits: { customers: 100, campaigns: 1 },
  },
  STARTER: {
    name: "Starter",
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: [
      "Up to 1,000 customers",
      "10 campaigns per month",
      "Email + SMS channels",
      "Advanced analytics",
      "Custom public pages",
    ],
    limits: { customers: 1000, campaigns: 10 },
  },
  PRO: {
    name: "Pro",
    price: 99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      "Up to 10,000 customers",
      "Unlimited campaigns",
      "All channels",
      "AI-powered insights",
      "Priority support",
    ],
    limits: { customers: 10000, campaigns: -1 },
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 299,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      "Unlimited customers",
      "Unlimited campaigns",
      "All channels",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
    limits: { customers: -1, campaigns: -1 },
  },
} as const;
