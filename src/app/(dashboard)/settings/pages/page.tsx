import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PagesList } from "@/components/pages/pages-list";

export const metadata: Metadata = { title: "Public Pages - Fidelyz" };

export default async function PagesSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
    include: { organization: true },
  });
  if (!member) redirect("/onboarding");

  const pages = await prisma.publicPage.findMany({
    where: { organizationId: member.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Public Pages</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create and manage custom pages for your loyalty program
        </p>
      </div>
      <PagesList
        pages={pages}
        organizationSlug={member.organization.slug}
        primaryColor={member.organization.primaryColor}
      />
    </div>
  );
}
