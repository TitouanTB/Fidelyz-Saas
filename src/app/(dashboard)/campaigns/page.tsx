import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Megaphone, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Campaign, Channel } from "@prisma/client";
import { CampaignType, CampaignStatus } from "@prisma/client";

type CampaignWithCount = Campaign & { _count: { messages: number } };

export const metadata: Metadata = { title: "Campaigns - Fidelyz" };

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "destructive" | "secondary" | "outline"> = {
  DRAFT: "secondary",
  SCHEDULED: "warning",
  ACTIVE: "success",
  PAUSED: "outline",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

export default async function CampaignsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const member = await prisma.organizationMember.findFirst({ where: { userId: user.id } });
  if (!member) redirect("/onboarding");

  const campaigns: CampaignWithCount[] = await prisma.campaign.findMany({
    where: { organizationId: member.organizationId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 text-sm mt-1">{campaigns.length} total campaigns</p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          New Campaign
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="text-center py-16">
            <Megaphone size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No campaigns yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first campaign to engage your customers</p>
            <Link
              href="/campaigns/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors mt-4"
            >
              <Plus size={16} />
              New Campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channels</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                      {campaign.description && <p className="text-xs text-gray-500 mt-0.5">{campaign.description}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{campaign.type}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={STATUS_COLORS[campaign.status]}>{campaign.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {campaign.channels.map((ch) => (
                          <Badge key={ch} variant="outline" className="text-xs">
                {ch}
              </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{campaign._count.messages}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(campaign.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
