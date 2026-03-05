import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, PLANS, isBillingAvailable } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";

const SUBSCRIPTION_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
];

const INVOICE_EVENTS = [
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_succeeded",
  "invoice.created",
  "invoice.upcoming",
];

const mapStripeStatusToPlan = (priceId: string | null): Plan => {
  const priceIdToPlan: Record<string, Plan> = {
    [process.env.STRIPE_PRICE_ID_STARTER || ""]: "STARTER",
    [process.env.STRIPE_PRICE_ID_PRO || ""]: "PRO",
    [process.env.STRIPE_PRICE_ID_ENTERPRISE || ""]: "ENTERPRISE",
  };
  
  if (!priceId) return "FREE";
  return priceIdToPlan[priceId] || "FREE";
};

const getPlanFromSubscription = (subscription: any): Plan => {
  const priceId = subscription?.items?.data?.[0]?.price?.id;
  return mapStripeStatusToPlan(priceId);
};

const getPeriodEnd = (subscription: any): Date => {
  return new Date((subscription?.current_period_end || 0) * 1000);
};

const getSubscriptionId = (invoice: any): string | null => {
  return invoice?.subscription as string | null;
};

export async function POST(request: NextRequest) {
  if (!isBillingAvailable()) {
    return NextResponse.json({ error: "Billing is not available" }, { status: 503 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organizationId;
        const subscriptionId = session.subscription as string;

        if (organizationId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
          
          await prisma.organization.update({
            where: { id: organizationId },
            data: {
              stripeSubscriptionId: subscriptionId,
              stripePriceId: subscription?.items?.data?.[0]?.price?.id,
              plan: getPlanFromSubscription(subscription),
              stripeCurrentPeriodEnd: getPeriodEnd(subscription),
            },
          });

          console.log(`Checkout completed for organization ${organizationId}, plan: ${getPlanFromSubscription(subscription)}`);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const organizationId = subscription?.metadata?.organizationId;

        if (organizationId) {
          await prisma.organization.update({
            where: { id: organizationId },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription?.items?.data?.[0]?.price?.id,
              plan: getPlanFromSubscription(subscription),
              stripeCurrentPeriodEnd: getPeriodEnd(subscription),
            },
          });

          console.log(`Subscription ${event.type} for organization ${organizationId}, status: ${subscription.status}`);
        } else {
          const org = await prisma.organization.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });

          if (org) {
            await prisma.organization.update({
              where: { id: org.id },
              data: {
                stripePriceId: subscription?.items?.data?.[0]?.price?.id,
                plan: getPlanFromSubscription(subscription),
                stripeCurrentPeriodEnd: getPeriodEnd(subscription),
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const organizationId = subscription?.metadata?.organizationId;

        if (organizationId) {
          await prisma.organization.update({
            where: { id: organizationId },
            data: {
              plan: "FREE",
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
            },
          });
          console.log(`Subscription deleted for organization ${organizationId}`);
        } else {
          const org = await prisma.organization.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });

          if (org) {
            await prisma.organization.update({
              where: { id: org.id },
              data: {
                plan: "FREE",
                stripeSubscriptionId: null,
                stripePriceId: null,
                stripeCurrentPeriodEnd: null,
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.paused": {
        const subscription = event.data.object as any;
        const org = await prisma.organization.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (org) {
          await prisma.organization.update({
            where: { id: org.id },
            data: {
              stripeCurrentPeriodEnd: getPeriodEnd(subscription),
            },
          });
          console.log(`Subscription paused for organization ${org.id}`);
        }
        break;
      }

      case "customer.subscription.resumed": {
        const subscription = event.data.object as any;
        const org = await prisma.organization.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (org) {
          await prisma.organization.update({
            where: { id: org.id },
            data: {
              plan: getPlanFromSubscription(subscription),
              stripeCurrentPeriodEnd: getPeriodEnd(subscription),
            },
          });
          console.log(`Subscription resumed for organization ${org.id}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any;
        const subscriptionId = getSubscriptionId(invoice);

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
          const org = await prisma.organization.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });

          if (org) {
            await prisma.organization.update({
              where: { id: org.id },
              data: {
                stripeCurrentPeriodEnd: getPeriodEnd(subscription),
              },
            });
            console.log(`Payment succeeded for organization ${org.id}, period end: ${getPeriodEnd(subscription)}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const subscriptionId = getSubscriptionId(invoice);

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
          const org = await prisma.organization.findFirst({
            where: { stripeSubscriptionId: subscription.id },
          });

          if (org) {
            console.log(`Payment failed for organization ${org.id}, subscription status: ${subscription.status}`);
          }
        }
        break;
      }

      case "invoice.created": {
        const invoice = event.data.object as any;
        console.log(`Invoice created: ${invoice.id}, amount: ${invoice.amount_paid}`);
        break;
      }

      case "invoice.upcoming": {
        const invoice = event.data.object as any;
        const subscriptionId = getSubscriptionId(invoice);
        
        if (subscriptionId) {
          console.log(`Upcoming invoice for subscription ${subscriptionId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    message: "Stripe webhook endpoint",
    supportedEvents: [...SUBSCRIPTION_EVENTS, ...INVOICE_EVENTS]
  });
}
