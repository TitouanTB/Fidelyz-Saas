import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const onboardingSchema = z.object({
  organizationName: z.string().min(2),
  industry: z.string().min(1),
  description: z.string().optional(),
  primaryColor: z.string().default("#6366f1"),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  slug: z.string().min(2),
  menuData: z.object({
    products: z.array(z.object({
      name: z.string(),
      description: z.string(),
      price: z.number(),
      category: z.string(),
    })).optional(),
    categories: z.array(z.string()).optional(),
    currency: z.string().optional(),
    averagePrice: z.number().optional(),
  }).optional(),
  miniSiteContent: z.object({
    hero: z.object({
      headline: z.string(),
      subheadline: z.string(),
      ctaText: z.string(),
    }),
    benefits: z.array(z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string(),
    })),
    loyaltyProgram: z.object({
      programName: z.string(),
      howItWorks: z.array(z.string()),
      pointsPerPurchase: z.number(),
      welcomeBonus: z.number(),
    }),
    cta: z.object({
      heading: z.string(),
      description: z.string(),
      buttonText: z.string(),
    }),
  }).optional(),
  rewards: z.array(z.object({
    name: z.string(),
    description: z.string(),
    type: z.string(),
    pointsRequired: z.number(),
    value: z.number().nullable(),
    icon: z.string(),
    tier: z.string(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { 
      organizationName, 
      industry, 
      description, 
      primaryColor, 
      secondaryColor,
      accentColor,
      websiteUrl, 
      slug, 
      menuData,
      miniSiteContent,
      rewards 
    } = parsed.data;

    const existingMember = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
    });

    if (existingMember) {
      return NextResponse.json({ error: "Already belongs to an organization" }, { status: 409 });
    }

    let uniqueSlug = slug;
    let counter = 0;
    while (await prisma.organization.findUnique({ where: { slug: uniqueSlug } })) {
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug: uniqueSlug,
        industry,
        description,
        primaryColor,
        websiteUrl: websiteUrl || null,
        onboardingDone: true,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    if (miniSiteContent) {
      await prisma.publicPage.create({
        data: {
          organizationId: organization.id,
          slug: uniqueSlug,
          title: miniSiteContent.hero.headline,
          description: miniSiteContent.hero.subheadline,
          content: {
            hero: miniSiteContent.hero,
            benefits: miniSiteContent.benefits,
            loyaltyProgram: miniSiteContent.loyaltyProgram,
            cta: miniSiteContent.cta,
            theme: {
              primaryColor,
              secondaryColor: secondaryColor || "#8b5cf6",
              accentColor: accentColor || "#f59e0b",
            },
            menuData: menuData || null,
          },
          isPublished: true,
          publishedAt: new Date(),
        },
      });
    }

    if (rewards && rewards.length > 0) {
      await prisma.reward.createMany({
        data: rewards.map((reward) => ({
          organizationId: organization.id,
          name: reward.name,
          description: reward.description,
          type: reward.type as "DISCOUNT_PERCENT" | "DISCOUNT_FIXED" | "FREE_PRODUCT" | "FREE_ITEM" | "CASHBACK" | "CUSTOM",
          pointsRequired: reward.pointsRequired,
          value: reward.value ?? null,
          isActive: true,
        })),
      });
    }

    await prisma.loyaltyConfig.create({
      data: {
        organizationId: organization.id,
        pointsPerVisit: miniSiteContent?.loyaltyProgram?.pointsPerPurchase || 10,
        pointsPerEuro: 1,
        welcomeBonus: miniSiteContent?.loyaltyProgram?.welcomeBonus || 100,
        isActive: true,
      },
    });

    return NextResponse.json({ organization }, { status: 201 });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
