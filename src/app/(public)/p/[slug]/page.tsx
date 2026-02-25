import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  PublicPageLayout,
  MiniSiteContent,
  DigitalMenuContent,
  RewardFlowContent,
  CustomerPortalContent,
} from "@/components/public";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.publicPage.findFirst({ where: { slug, isActive: true } });
  if (!page) return { title: "Not found" };
  return { title: page.title, description: page.description || undefined };
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params;

  const page = await prisma.publicPage.findFirst({
    where: { slug, isActive: true },
    include: { organization: true },
  });

  if (!page) notFound();

  const { organization } = page;
  const content = page.content as Record<string, unknown> | null;

  const theme = {
    primaryColor: (content?.theme as Record<string, string>)?.primaryColor || organization.primaryColor,
    secondaryColor: (content?.theme as Record<string, string>)?.secondaryColor || "#8b5cf6",
    accentColor: (content?.theme as Record<string, string>)?.accentColor || "#f59e0b",
  };

  const pageType = (content?.pageType as string) || "mini-site";

  const contactInfo = content?.contactInfo as {
    address?: string;
    phone?: string;
    hours?: string;
    instagram?: string;
    facebook?: string;
  } | undefined;

  const renderContent = () => {
    switch (pageType) {
      case "menu":
        return (
          <DigitalMenuContent
            organization={organization}
            content={{
              menuData: content?.menuData as {
                products: Array<{
                  id?: string;
                  name: string;
                  description: string;
                  price: number;
                  category: string;
                  image?: string;
                  isVegetarian?: boolean;
                  isSpicy?: boolean;
                  isNew?: boolean;
                  isPopular?: boolean;
                  allergens?: string[];
                  variants?: Array<{ name: string; price: number }>;
                }>;
                categories: string[];
                currency: string;
                averagePrice?: number;
              } | undefined,
              theme: content?.menuTheme as {
                layout: "grid" | "list";
                showImages: boolean;
                showPrices: boolean;
              } | undefined,
            }}
            theme={theme}
          />
        );

      case "rewards":
        return (
          <RewardFlowContent
            organization={organization}
            rewards={[]}
            loyaltyConfig={null}
            theme={theme}
            slug={slug}
          />
        );

      case "portal":
        return (
          <CustomerPortalContent
            organization={organization}
            customer={null}
            pointsHistory={[]}
            rewardClaims={[]}
            loyaltyConfig={null}
            theme={theme}
            slug={slug}
          />
        );

      case "mini-site":
      default:
        return (
          <MiniSiteContent
            organization={organization}
            content={{
              hero: content?.hero as {
                headline: string;
                subheadline: string;
                ctaText: string;
                backgroundImage?: string;
              } | undefined,
              benefits: content?.benefits as Array<{
                title: string;
                description: string;
                icon: string;
              }> | undefined,
              loyaltyProgram: content?.loyaltyProgram as {
                programName: string;
                howItWorks: string[];
                pointsPerPurchase: number;
                welcomeBonus: number;
                tierThresholds?: Record<string, number>;
              } | undefined,
              cta: content?.cta as {
                heading: string;
                description: string;
                buttonText: string;
              } | undefined,
              testimonials: content?.testimonials as Array<{
                name: string;
                content: string;
                rating: number;
              }> | undefined,
              features: content?.features as Array<{
                title: string;
                description: string;
              }> | undefined,
            }}
            theme={theme}
          />
        );
    }
  };

  return (
    <PublicPageLayout
      organization={organization}
      theme={theme}
      contactInfo={contactInfo}
    >
      {renderContent()}
    </PublicPageLayout>
  );
}
