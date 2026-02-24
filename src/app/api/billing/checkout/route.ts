import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { planKey, organizationId } = await request.json();

    const plan = PLANS[planKey as keyof typeof PLANS];
    if (!plan || !plan.priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const member = await prisma.organizationMember.findFirst({
      where: { userId: user.id, organizationId },
      include: { organization: true },
    });

    if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const org = member.organization;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    let customerId = org.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { organizationId },
      });
      customerId = customer.id;
      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${appUrl}/billing?success=true`,
      cancel_url: `${appUrl}/billing?canceled=true`,
      metadata: { organizationId, planKey },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
