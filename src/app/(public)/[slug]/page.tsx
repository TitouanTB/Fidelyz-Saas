import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RestaurantMiniSite } from "@/components/public";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const organization = await prisma.organization.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!organization) {
    return { title: "Non trouvé" };
  }

  return {
    title: `${organization.name} | Programme de fidélité`,
    description: organization.description || `Rejoignez le programme de fidélité de ${organization.name} et gagnez des récompenses`,
    openGraph: {
      title: organization.name,
      description: organization.description || undefined,
    },
  };
}

export default async function RestaurantPage({ params }: Props) {
  const { slug } = await params;

  const organization = await prisma.organization.findUnique({
    where: { slug },
    include: {
      rewards: {
        where: { isActive: true },
        orderBy: { pointsRequired: "asc" },
        take: 1,
      },
      pages: {
        where: { isPublished: true },
        take: 1,
      },
    },
  });

  if (!organization) {
    notFound();
  }

  // Get page content if exists
  const pageContent = organization.pages[0]?.content as Record<string, unknown> | null;

  const content = {
    hero: pageContent?.hero as {
      headline?: string;
      subheadline?: string;
      backgroundImage?: string;
    } | undefined,
    story: pageContent?.story as {
      title?: string;
      content?: string;
    } | undefined,
    specialties: pageContent?.specialties as Array<{
      name: string;
      description: string;
      price?: number;
      image?: string;
    }> | undefined,
    contact: pageContent?.contactInfo as {
      address?: string;
      phone?: string;
      hours?: string;
    } | undefined,
  };

  const activeReward = organization.rewards[0] ? {
    name: organization.rewards[0].name,
    pointsRequired: organization.rewards[0].pointsRequired,
  } : null;

  return (
    <RestaurantMiniSite
      organization={{
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.logoUrl,
        primaryColor: organization.primaryColor,
        description: organization.description,
        industry: organization.industry,
      }}
      content={content}
      activeReward={activeReward}
    />
  );
}
