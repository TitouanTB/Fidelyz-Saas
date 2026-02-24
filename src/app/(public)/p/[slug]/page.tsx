import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="py-6 px-4" style={{ backgroundColor: organization.primaryColor }}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {organization.logoUrl && (
            <img src={organization.logoUrl} alt={organization.name} className="w-10 h-10 rounded-lg" />
          )}
          <h1 className="text-2xl font-bold text-white">{organization.name}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">{page.title}</h2>
          {page.description && (
            <p className="text-gray-600 text-lg mt-3 max-w-2xl mx-auto">{page.description}</p>
          )}
        </div>

        {organization.description && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">About our loyalty program</h3>
            <p className="text-gray-600">{organization.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: "⭐", title: "Earn Points", desc: "Get points for every purchase" },
            { icon: "🎁", title: "Exclusive Rewards", desc: "Redeem points for great rewards" },
            { icon: "🏆", title: "VIP Status", desc: "Unlock special privileges" },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
              <span className="text-3xl">{item.icon}</span>
              <h4 className="font-semibold text-gray-900 mt-2">{item.title}</h4>
              <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Join our loyalty program</h3>
          <p className="text-gray-600 mb-6">Sign up today and start earning rewards with every visit</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              className="px-6 py-3 text-white rounded-xl font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: organization.primaryColor }}
            >
              Join Now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
