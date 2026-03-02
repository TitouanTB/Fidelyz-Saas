import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RewardFlow } from "@/components/public";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const organization = await prisma.organization.findUnique({
    where: { slug },
    select: { name: true },
  });

  if (!organization) {
    return { title: "Non trouvé" };
  }

  return {
    title: `Récompense | ${organization.name}`,
    description: `Obtenez votre récompense chez ${organization.name}`,
  };
}

export default async function RewardPage({ params }: Props) {
  const { slug } = await params;

  const organization = await prisma.organization.findUnique({
    where: { slug },
    include: {
      rewards: {
        where: { isActive: true },
        orderBy: { pointsRequired: "asc" },
        take: 1,
      },
      loyaltyConfigs: {
        where: { isActive: true },
        take: 1,
      },
      integrations: {
        where: { type: "GOOGLE_BUSINESS", isActive: true },
        take: 1,
      },
    },
  });

  if (!organization) {
    notFound();
  }

  const reward = organization.rewards[0] ? {
    id: organization.rewards[0].id,
    name: organization.rewards[0].name,
    description: organization.rewards[0].description,
    pointsRequired: organization.rewards[0].pointsRequired,
    type: organization.rewards[0].type,
    value: organization.rewards[0].value,
  } : null;

  const loyaltyConfig = organization.loyaltyConfigs[0] ? {
    welcomeBonus: organization.loyaltyConfigs[0].welcomeBonus,
  } : null;

  // Check if WhatsApp is enabled for this organization
  const hasWhatsApp = !!organization.whatsappNumber && process.env.ENABLE_WHATSAPP === "true";

  // Get Google Review URL from integration
  const googleIntegration = organization.integrations[0];
  const integrationConfig = googleIntegration?.config as Record<string, unknown> | null;
  const googleReviewUrl = integrationConfig?.googleReviewUrl as string | undefined;

  return (
    <RewardFlow
      organization={{
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.logoUrl,
        primaryColor: organization.primaryColor,
        whatsappNumber: organization.whatsappNumber,
      }}
      reward={reward}
      loyaltyConfig={loyaltyConfig}
      hasWhatsApp={hasWhatsApp}
      googleReviewUrl={googleReviewUrl}
    />
  );
}
