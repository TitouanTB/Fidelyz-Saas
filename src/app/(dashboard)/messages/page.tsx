import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate, cn } from "@/lib/utils";
import { MessageSquare, Plus, Mail, MessageCircle, Send, CheckCheck, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Historique des Messages - Fidelyz" };

const STATUS_CONFIG: Record<string, { label: string, icon: any, color: string }> = {
  PENDING: { label: "En attente", icon: Clock, color: "text-warning bg-warning/10" },
  SENT: { label: "Envoyé", icon: Send, color: "text-blue-400 bg-blue-400/10" },
  DELIVERED: { label: "Délivré", icon: CheckCheck, color: "text-success bg-success/10" },
  OPENED: { label: "Ouvert", icon: CheckCheck, color: "text-success bg-success/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]" },
  CLICKED: { label: "Cliqué", icon: CheckCheck, color: "text-success bg-success/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]" },
  BOUNCED: { label: "NPAI", icon: AlertCircle, color: "text-destructive bg-destructive/10" },
  FAILED: { label: "Échec", icon: AlertCircle, color: "text-destructive bg-destructive/20" },
};

const CHANNEL_CONFIG: Record<string, { icon: any, label: string }> = {
  EMAIL: { icon: Mail, label: "Email" },
  SMS: { icon: MessageSquare, label: "SMS" },
  PUSH: { icon: Send, label: "Push" },
  WHATSAPP: { icon: MessageCircle, label: "WhatsApp" },
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const member = await prisma.organizationMember.findFirst({ where: { userId: user.id } });
  if (!member) redirect("/onboarding");

  const messages = await prisma.message.findMany({
    where: { organizationId: member.organizationId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      customer: { select: { email: true, firstName: true, lastName: true } },
      campaign: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-text-primary tracking-tight">Historique des Messages</h1>
          <p className="text-text-secondary text-base mt-2">{messages.length} communications récentes</p>
        </div>
        <Button asChild className="bg-violet-default hover:bg-violet-hover text-white gap-2 shadow-[0_10px_20px_rgba(147,23,253,0.3)] h-12 rounded-xl px-6">
          <Link href="/messages/new">
            <Plus size={18} />
            Nouvelle Campagne
          </Link>
        </Button>
      </div>

      <div className="glass-surface border border-white/5 rounded-2xl overflow-hidden bg-white/[0.01]">
        {messages.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-white/2 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5">
               <MessageSquare size={40} className="text-text-tertiary opacity-20" />
            </div>
            <p className="text-lg font-bold font-heading text-text-primary">Aucun message envoyé</p>
            <p className="text-text-tertiary text-sm mt-2 max-w-xs mx-auto">Commencez à engager vos clients en créant votre première campagne.</p>
            <Button asChild variant="outline" className="mt-8 border-white/10 hover:bg-white/5">
               <Link href="/messages/new">Démarrer maintenant</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 text-left text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em]">Client</th>
                  <th className="px-8 py-5 text-left text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em]">Canal</th>
                  <th className="px-8 py-5 text-left text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em]">Campagne</th>
                  <th className="px-8 py-5 text-left text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em]">Statut</th>
                  <th className="px-8 py-5 text-right text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em]">Date d'envoi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {messages.map((msg: any) => {
                  const status = STATUS_CONFIG[msg.status] || { label: msg.status, icon: Clock, color: "bg-white/5 text-text-tertiary" };
                  const channel = CHANNEL_CONFIG[msg.channel] || { icon: MessageSquare, label: msg.channel };
                  const StatusIcon = status.icon;
                  const ChannelIcon = channel.icon;

                  return (
                    <tr key={msg.id} className="hover:bg-white/[0.03] transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-violet-default/10 flex items-center justify-center text-violet-default font-bold border border-violet-default/20 transition-transform group-hover:scale-110">
                              {msg.customer.firstName?.[0] || msg.customer.email?.[0]?.toUpperCase()}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-text-primary tracking-tight">
                                {msg.customer.firstName && msg.customer.lastName
                                  ? `${msg.customer.firstName} ${msg.customer.lastName}`
                                  : msg.customer.email}
                              </p>
                              <p className="text-xs text-text-tertiary font-medium">{msg.customer.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-text-secondary">
                           <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                              <ChannelIcon size={14} className="text-violet-default" />
                           </div>
                           <span className="text-xs font-bold uppercase tracking-wider">{channel.label}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-text-tertiary uppercase tracking-widest">
                        {msg.campaign?.name || "—"}
                      </td>
                      <td className="px-8 py-5">
                        <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/5", status.color)}>
                           <StatusIcon size={12} />
                           {status.label}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <p className="text-sm font-bold text-text-secondary font-heading">
                           {msg.sentAt ? formatDate(msg.sentAt) : formatDate(msg.createdAt)}
                        </p>
                        <p className="text-[10px] text-text-tertiary uppercase tracking-tighter mt-1">il y a {msg.createdAt ? "quelques instants" : ""}</p>
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

