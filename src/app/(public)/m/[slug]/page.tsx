import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DigitalMenu } from "@/components/public";

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
    title: `Menu | ${organization.name}`,
    description: `Découvrez le menu de ${organization.name}`,
  };
}

export default async function MenuPage({ params }: Props) {
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

  // Track QR scan
  const trackQRScan = async () => {
    "use server";
    try {
      await prisma.analyticsEvent.create({
        data: {
          organizationId: organization.id,
          eventType: "qr_scan",
          eventName: "menu_qr_scan",
          properties: { page: "menu", slug },
        },
      });
    } catch (error) {
      console.error("Failed to track QR scan:", error);
    }
  };

  // Track the scan (fire and forget)
  trackQRScan();

  // Get menu data from page content
  const pageContent = organization.pages[0]?.content as Record<string, unknown> | null;
  const menuData = pageContent?.menuData as {
    products: Array<{
      id?: string;
      name: string;
      description: string;
      price: number;
      category: string;
      image?: string;
      isVegetarian?: boolean;
      isSpicy?: boolean;
      isGlutenFree?: boolean;
      isNew?: boolean;
      isPopular?: boolean;
      allergens?: string[];
      variants?: Array<{ name: string; price: number }>;
    }>;
    categories: string[];
    currency: string;
  } | undefined;

  const contact = pageContent?.contactInfo as {
    address?: string;
    phone?: string;
  } | undefined;

  const activeReward = organization.rewards[0] ? {
    name: organization.rewards[0].name,
    pointsRequired: organization.rewards[0].pointsRequired,
  } : null;

  return (
    <DigitalMenu
      organization={{
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.logoUrl,
        primaryColor: organization.primaryColor,
      }}
      menuData={menuData}
      contact={contact}
      activeReward={activeReward}
    />
  );
}
