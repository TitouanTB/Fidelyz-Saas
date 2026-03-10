import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomerPortal } from "@/components/public";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;

  const customer = await prisma.customer.findFirst({
    where: { id: token },
    include: { organization: true },
  });

  if (!customer) {
    return { title: "Non trouvé" };
  }

  return {
    title: `Mon espace | ${customer.organization.name}`,
    description: "Votre espace fidélité personnel",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function CustomerPortalPage({ params }: Props) {
  const { token } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id: token },
    include: {
      organization: true,
      pointsHistory: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      rewardClaims: {
        include: { reward: true },
        orderBy: { claimedAt: "desc" },
        take: 10,
      },
      badges: {
        orderBy: { earnedAt: "desc" },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  // Get loyalty config
  const loyaltyConfig = await prisma.loyaltyConfig.findUnique({
    where: { organizationId: customer.organizationId },
  });

  // Get next reward
  const nextReward = await prisma.reward.findFirst({
    where: {
      organizationId: customer.organizationId,
      isActive: true,
      pointsRequired: { gt: customer.points },
    },
    orderBy: { pointsRequired: "asc" },
  });

  return (
    <CustomerPortal
      organization={{
        id: customer.organization.id,
        name: customer.organization.name,
        slug: customer.organization.slug,
        logoUrl: customer.organization.logoUrl,
        primaryColor: customer.organization.primaryColor,
      }}
      customer={{
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        points: customer.points,
        tier: customer.tier,
        totalSpend: customer.totalSpend,
        visits: customer.visits,
        createdAt: customer.createdAt.toISOString(),
        lastVisitAt: customer.lastVisitAt?.toISOString(),
      }}
      pointsHistory={customer.pointsHistory.map((t) => ({
        id: t.id,
        points: t.points,
        type: t.type,
        source: t.source,
        description: t.description,
        createdAt: t.createdAt.toISOString(),
      }))}
      rewardClaims={customer.rewardClaims.map((c) => ({
        id: c.id,
        status: c.status,
        code: c.code,
        claimedAt: c.claimedAt.toISOString(),
        redeemedAt: c.redeemedAt?.toISOString(),
        expiresAt: c.expiresAt?.toISOString(),
        reward: {
          id: c.reward.id,
          name: c.reward.name,
          description: c.reward.description,
          type: c.reward.type,
          value: c.reward.value,
        },
      }))}
      badges={customer.badges.map((b) => ({
        id: b.id,
        badgeType: b.badgeType,
        earnedAt: b.earnedAt.toISOString(),
        metadata: b.metadata as { icon?: string; description?: string } | null,
      }))}
      loyaltyConfig={loyaltyConfig ? {
        pointsPerVisit: loyaltyConfig.pointsPerVisit,
        pointsPerEuro: loyaltyConfig.pointsPerEuro,
        welcomeBonus: loyaltyConfig.welcomeBonus,
        tierThresholds: loyaltyConfig.tierThresholds as Record<string, number> | null,
      } : null}
      nextReward={nextReward ? {
        id: nextReward.id,
        name: nextReward.name,
        pointsRequired: nextReward.pointsRequired,
      } : null}
    />
  );
}
