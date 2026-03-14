import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Megaphone, Plus, Search, Filter, MoreVertical, Send, Calendar, Clock, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Campaign, Channel } from "@prisma/client";

type CampaignWithCount = Campaign & { _count: { messages: number } };

export const metadata: Metadata = { title: "Campagnes - Fidelyz" };

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "violet" | "outline"; icon?: any }> = {
  DRAFT: { label: "Brouillon", variant: "outline" },
  SCHEDULED: { label: "Planifié", variant: "warning", icon: Clock },
  ACTIVE: { label: "Actif", variant: "success", icon: Send },
  PAUSED: { label: "En pause", variant: "outline" },
  COMPLETED: { label: "Terminé", variant: "violet" },
  CANCELLED: { label: "Annulé", variant: "destructive" },
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
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-text-primary tracking-tight">Campagnes</h1>
          <p className="text-text-secondary text-base mt-1">
            Engagez vos clients avec des messages ciblés et automatisés.
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button className="gap-2 glow-violet">
            <Plus size={16} />
            Nouvelle campagne
          </Button>
        </Link>
      </div>

      <div className="glass-surface p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input 
              placeholder="Rechercher une campagne..." 
              className="pl-11 h-12 bg-white/4 border-white/5 focus:border-violet-default/50"
            />
          </div>
          <Button variant="outline" className="gap-2 h-12 px-6 border-white/5 bg-white/4 text-text-secondary">
            <Filter size={16} />
            Filtres
          </Button>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-24 bg-white/2 rounded-2xl border border-dashed border-white/10">
            <div className="w-16 h-16 bg-violet-default/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Megaphone size={32} className="text-violet-default" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Aucune campagne pour le moment</h3>
            <p className="text-text-tertiary mb-8">Créez votre première campagne pour booster votre engagement.</p>
            <Link href="/campaigns/new">
              <Button size="lg" className="glow-violet">
                Lancer ma première campagne
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-4 text-left text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Campagne</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Statut</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Canaux</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Audiences</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Messages</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Créé le</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaigns.map((campaign) => {
                  const status = STATUS_CONFIG[campaign.status] || { label: campaign.status, variant: "outline" };
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={campaign.id} className="group hover:bg-white/4 transition-all duration-200">
                      <td className="px-4 py-5">
                        <p className="text-sm font-semibold text-text-primary group-hover:text-violet-default transition-colors">
                          {campaign.name}
                        </p>
                        {campaign.description && (
                          <p className="text-xs text-text-tertiary mt-1 line-clamp-1">{campaign.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-5">
                        <Badge variant={status.variant} className="gap-1.5 py-1">
                          {StatusIcon && <StatusIcon size={12} />}
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex gap-1.5 flex-wrap">
                          {campaign.channels.map((ch: Channel) => (
                            <Badge key={ch} variant="outline" className="text-[10px] bg-white/5 border-white/5 text-text-secondary">
                              {ch === 'WHATSAPP' ? 'WhatsApp' : ch}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-5 text-sm text-text-secondary">
                        <div className="flex items-center gap-1.5">
                           <Users size={14} className="text-text-tertiary" />
                           <span>Toute la base</span>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <span className="text-sm font-mono text-text-primary bg-white/5 px-2 py-1 rounded-md border border-white/5">
                          {campaign._count.messages}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-sm text-text-tertiary">
                        {formatDate(campaign.createdAt)}
                      </td>
                      <td className="px-4 py-5 text-right">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-text-tertiary transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

