import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const page = await prisma.publicPage.findFirst({
      where: { slug, isActive: true },
      include: { organization: true },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const [rewards, loyaltyConfig] = await Promise.all([
      prisma.reward.findMany({
        where: {
          organizationId: page.organizationId,
          isActive: true,
          OR: [
            { validFrom: null },
            { validFrom: { lte: new Date() } },
          ],
          OR: [
            { validUntil: null },
            { validUntil: { gte: new Date() } },
          ],
        },
        orderBy: { pointsRequired: "asc" },
      }),
      prisma.loyaltyConfig.findUnique({
        where: { organizationId: page.organizationId },
      }),
    ]);

    return NextResponse.json({
      organization: {
        name: page.organization.name,
        primaryColor: page.organization.primaryColor,
        logoUrl: page.organization.logoUrl,
      },
      rewards: rewards.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        pointsRequired: r.pointsRequired,
        type: r.type,
        value: r.value,
        imageUrl: r.imageUrl,
        isActive: r.isActive,
        quantity: r.quantity,
        claimedCount: r.claimedCount,
      })),
      loyaltyConfig: loyaltyConfig ? {
        pointsPerVisit: loyaltyConfig.pointsPerVisit,
        pointsPerEuro: loyaltyConfig.pointsPerEuro,
        welcomeBonus: loyaltyConfig.welcomeBonus,
        tierThresholds: loyaltyConfig.tierThresholds as Record<string, number> | null,
      } : null,
    });
  } catch (error) {
    console.error("Get public rewards error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}