import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Star, Gift, Sparkles, Heart, Percent, Ticket, Coffee } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    star: Star,
    gift: Gift,
    sparkles: Sparkles,
    heart: Heart,
    percent: Percent,
    ticket: Ticket,
    coffee: Coffee,
  };
  return icons[iconName] || Gift;
};

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
  const content = page.content as {
    hero?: { headline: string; subheadline: string; ctaText: string };
    benefits?: Array<{ title: string; description: string; icon: string }>;
    loyaltyProgram?: {
      programName: string;
      howItWorks: string[];
      pointsPerPurchase: number;
      welcomeBonus: number;
    };
    cta?: { heading: string; description: string; buttonText: string };
    theme?: { primaryColor: string; secondaryColor: string; accentColor: string };
    menuData?: {
      products: Array<{ name: string; description: string; price: number; category: string }>;
      categories: string[];
      currency: string;
      averagePrice: number;
    };
  } | null;

  const hero = content?.hero || {
    headline: page.title,
    subheadline: page.description || `Join ${organization.name}'s loyalty program`,
    ctaText: "Join Now",
  };

  const benefits = content?.benefits || [
    { title: "Earn Points", description: "Get points for every purchase", icon: "star" },
    { title: "Exclusive Rewards", description: "Redeem points for great rewards", icon: "gift" },
    { title: "VIP Status", description: "Unlock special privileges", icon: "sparkles" },
  ];

  const loyaltyProgram = content?.loyaltyProgram;
  const cta = content?.cta || {
    heading: "Join our loyalty program",
    description: "Sign up today and start earning rewards with every visit",
    buttonText: "Get Started",
  };

  const theme = content?.theme || {
    primaryColor: organization.primaryColor,
    secondaryColor: "#8b5cf6",
    accentColor: "#f59e0b",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="py-6 px-4" style={{ backgroundColor: theme.primaryColor }}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {organization.logoUrl && (
            <img src={organization.logoUrl} alt={organization.name} className="w-10 h-10 rounded-lg" />
          )}
          <h1 className="text-2xl font-bold text-white">{organization.name}</h1>
          {loyaltyProgram && (
            <span className="ml-auto px-3 py-1 bg-white/20 rounded-full text-white text-sm">
              {loyaltyProgram.programName}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">{hero.headline}</h2>
          <p className="text-gray-600 text-lg mt-3 max-w-2xl mx-auto">{hero.subheadline}</p>
          <button
            className="mt-6 px-8 py-3 text-white rounded-xl font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {hero.ctaText}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {benefits.map((benefit, idx) => {
            const IconComponent = getIconComponent(benefit.icon);
            return (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div 
                  className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.primaryColor + "20", color: theme.primaryColor }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-gray-900 mt-3">{benefit.title}</h4>
                <p className="text-gray-500 text-sm mt-1">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {loyaltyProgram && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">{loyaltyProgram.programName}</h3>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              {loyaltyProgram.howItWorks.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                  {idx < loyaltyProgram.howItWorks.length - 1 && (
                    <span className="hidden md:block text-gray-300">→</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
                  {loyaltyProgram.pointsPerPurchase}
                </p>
                <p className="text-sm text-gray-500">pts/€ spent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: theme.accentColor }}>
                  +{loyaltyProgram.welcomeBonus}
                </p>
                <p className="text-sm text-gray-500">welcome bonus</p>
              </div>
            </div>
          </div>
        )}

        {organization.description && !loyaltyProgram && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">About our loyalty program</h3>
            <p className="text-gray-600">{organization.description}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{cta.heading}</h3>
          <p className="text-gray-600 mb-6">{cta.description}</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              className="px-6 py-3 text-white rounded-xl font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {cta.buttonText}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
