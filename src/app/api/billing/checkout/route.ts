import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planKey, organizationId } = body;

    if (!planKey || !organizationId) {
      return NextResponse.json(
        { error: "Missing required fields: planKey and organizationId" },
        { status: 400 }
      );
    }

    const plan = PLANS[planKey as keyof typeof PLANS];
    
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (planKey === "FREE") {
      return NextResponse.json(
        { error: "Cannot checkout for free plan" },
        { status: 400 }
      );
    }

    if (!plan.priceId) {
      return NextResponse.json(
        { error: "Plan does not have a valid price ID" },
        { status: 400 }
      );
    }

    const member = await prisma.organizationMember.findFirst({
      where: { userId: user.id, organizationId },
      include: { organization: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    const org = member.organization;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let customerId = org.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: org.name,
        metadata: { organizationId },
      });
      customerId = customer.id;
      
      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customerId },
      });
    }

    const existingSubscription = org.stripeSubscriptionId;
    let subscriptionUpdate = false;
    
    if (existingSubscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(existingSubscription);
        
        if (subscription.status === "active" || subscription.status === "trialing") {
          subscriptionUpdate = true;
        }
      } catch (error) {
        console.log("No existing subscription found or subscription inactive");
      }
    }

    if (subscriptionUpdate && existingSubscription) {
      const subscription = await stripe.subscriptions.retrieve(existingSubscription);
      
      await stripe.subscriptions.update(existingSubscription, {
        items: [{
          id: subscription.items.data[0].id,
          price: plan.priceId,
        }],
        proration_behavior: "always_invoice",
      });

      return NextResponse.json({ 
        url: `${appUrl}/billing?success=true&plan=${planKey}` 
      });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/billing?success=true&plan=${planKey}`,
      cancel_url: `${appUrl}/billing?canceled=true`,
      metadata: {
        organizationId,
        planKey,
      },
    };

    if (process.env.STRIPE_ALLOW_TRIAL === "true") {
      sessionParams.subscription_data = {
        trial_period_days: 14,
        metadata: {
          organizationId,
        },
      };
    } else {
      sessionParams.subscription_data = {
        metadata: {
          organizationId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Stripe error: ${error.message}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    plans: Object.entries(PLANS).map(([key, plan]) => ({
      key,
      name: plan.name,
      price: plan.price,
      features: plan.features,
    })),
  });
}
