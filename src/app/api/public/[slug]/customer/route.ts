import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const customerLookupSchema = z.object({
  email: z.string().email(),
});

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = customerLookupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const page = await prisma.publicPage.findFirst({
      where: { slug, isActive: true },
      include: { organization: true },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        organizationId_email: {
          organizationId: page.organizationId,
          email: parsed.data.email,
        },
      },
      include: {
        pointsHistory: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        rewardClaims: {
          include: { reward: true },
          orderBy: { claimedAt: "desc" },
          take: 20,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const loyaltyConfig = await prisma.loyaltyConfig.findUnique({
      where: { organizationId: page.organizationId },
    });

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        points: customer.points,
        tier: customer.tier,
        totalSpend: customer.totalSpend,
        visits: customer.visits,
        createdAt: customer.createdAt,
        lastVisitAt: customer.lastVisitAt,
      },
      pointsHistory: customer.pointsHistory,
      rewardClaims: customer.rewardClaims,
      loyaltyConfig: loyaltyConfig ? {
        pointsPerVisit: loyaltyConfig.pointsPerVisit,
        pointsPerEuro: loyaltyConfig.pointsPerEuro,
        welcomeBonus: loyaltyConfig.welcomeBonus,
        tierThresholds: loyaltyConfig.tierThresholds as Record<string, number> | null,
      } : null,
    });
  } catch (error) {
    console.error("Customer lookup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}