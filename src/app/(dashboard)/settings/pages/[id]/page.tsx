import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { PageEditor } from "@/components/pages/page-editor";

export const metadata: Metadata = { title: "Edit Page - Fidelyz" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPagePage({ params }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  });
  if (!member) redirect("/onboarding");

  const { id } = await params;
  const page = await prisma.publicPage.findFirst({
    where: { id, organizationId: member.organizationId },
  });

  if (!page) notFound();

  const [rewards, loyaltyConfig] = await Promise.all([
    prisma.reward.findMany({
      where: { organizationId: member.organizationId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.loyaltyConfig.findUnique({
      where: { organizationId: member.organizationId },
    }),
  ]);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Page</h1>
        <p className="text-gray-500 text-sm mt-1">
          Customize your page content and branding
        </p>
      </div>
      <PageEditor
        page={page}
        organization={{
          name: member.organization.name,
          slug: member.organization.slug,
          primaryColor: member.organization.primaryColor,
          logoUrl: member.organization.logoUrl,
          description: member.organization.description,
        }}
        rewards={rewards}
        loyaltyConfig={loyaltyConfig}
      />
    </div>
  );
}
