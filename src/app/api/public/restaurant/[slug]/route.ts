import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;

    const organization = await prisma.organization.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        primaryColor: true,
        description: true,
        industry: true,
        websiteUrl: true,
        rewards: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            pointsRequired: true,
            type: true,
            value: true,
            imageUrl: true,
          },
          orderBy: { pointsRequired: "asc" },
        },
        loyaltyConfigs: {
          where: { isActive: true },
          select: {
            pointsPerVisit: true,
            pointsPerEuro: true,
            welcomeBonus: true,
            tierThresholds: true,
          },
        },
        pages: {
          where: { isPublished: true },
          select: {
            content: true,
          },
          take: 1,
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Restaurant non trouvé" }, { status: 404 });
    }

    const pageContent = organization.pages[0]?.content as Record<string, unknown> | null;

    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.logoUrl,
        primaryColor: organization.primaryColor,
        description: organization.description,
        industry: organization.industry,
        websiteUrl: organization.websiteUrl,
      },
      rewards: organization.rewards,
      loyaltyConfig: organization.loyaltyConfigs[0] || null,
      content: pageContent || null,
    });
  } catch (error) {
    console.error("Error fetching restaurant data:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
