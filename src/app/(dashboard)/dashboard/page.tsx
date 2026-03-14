import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Users, Megaphone, MessageSquare, Star, BarChart3, TrendingUp, CheckCircle, UtensilsCrossed, QrCode } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getAuthContext } from "@/lib/auth";
import { DashboardChart } from "@/components/dashboard/dashboard-charts";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard - Fidelyz" };

async function getDashboardData(orgId: string) {
  const [customers, campaigns, messages, recentCustomers] = await Promise.all([
    prisma.customer.count({ where: { organizationId: orgId } }),
    prisma.campaign.count({ where: { organizationId: orgId } }),
    prisma.message.count({ where: { organizationId: orgId } }),
    prisma.customer.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const openedMessages = await prisma.message.count({
    where: { organizationId: orgId, status: "OPENED" },
  });

  const openRate = messages > 0 ? Math.round((openedMessages / messages) * 100) : 0;

  // Mock data for the chart
  const chartData = [
    { date: "01/03", count: 12 },
    { date: "05/03", count: 18 },
    { date: "10/03", count: 15 },
    { date: "15/03", count: 25 },
    { date: "20/03", count: 32 },
    { date: "25/03", count: 28 },
    { date: "30/03", count: 40 },
  ];

  return {
    stats: { customers, campaigns, messages, openRate },
    recentCustomers,
    chartData,
  };
}

export default async function DashboardPage() {
  const { user, organization } = await getAuthContext({ redirectIfNotFound: true });
  
  if (!organization) return null;

  const data = await getDashboardData(organization.id);
  const { stats, recentCustomers, chartData } = data;

  const firstName = user?.user_metadata?.first_name || "Admin";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold font-heading text-text-primary tracking-tight">
          Bonjour, {firstName} 👋
        </h1>
        <p className="text-text-secondary text-base">
          Voici le résumé de votre programme de fidélité pour aujourd'hui.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Clients total" value={stats.customers} icon={Users} change={12} />
        <StatsCard title="Visites ce mois" value={stats.messages * 2} icon={BarChart3} change={8} />
        <StatsCard title="Récompenses" value={stats.campaigns * 5} icon={Star} change={-2} />
        <StatsCard title="Taux de retour" value={`${stats.openRate}%`} icon={TrendingUp} change={3} />
      </div>

      <div className="glass-surface p-8 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-heading text-text-primary">Visites (30 derniers jours)</h2>
          <span className="text-xs font-medium text-text-tertiary uppercase tracking-widest">Temps réel</span>
        </div>
        <DashboardChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-surface p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-heading text-text-primary">Derniers clients</h2>
            <Link href="/customers" className="text-sm text-violet-default hover:underline">Voir tout</Link>
          </div>
          
          {recentCustomers.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <p>Aucun client pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCustomers.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-violet-default/10 flex items-center justify-center text-violet-default font-bold border border-violet-default/20">
                      {c.firstName?.[0] || c.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {c.firstName && c.lastName ? `${c.firstName} ${c.lastName}` : c.email}
                      </p>
                      <p className="text-xs text-text-tertiary">{c.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Star size={14} className="text-violet-default" />
                      <span className="text-sm font-bold text-text-primary">{c.points} pts</span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-0.5">{formatDate(c.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-surface p-6 rounded-2xl">
          <h2 className="text-xl font-bold font-heading text-text-primary mb-6">Actions rapides</h2>
          <div className="space-y-3">
            {[
              { label: "Valider une visite", href: "/dashboard/validate", icon: CheckCircle },
              { label: "Partager QR Code", href: "/dashboard/qr-code", icon: QrCode },
              { label: "Menu digital", href: "/dashboard/menu", icon: UtensilsCrossed },
              { label: "Personnaliser", href: "/dashboard/apparence", icon: Megaphone },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-white/4 hover:bg-violet-default/10 hover:border-violet-default/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-violet-default/20 transition-colors">
                  <action.icon size={20} className="text-text-secondary group-hover:text-violet-default" />
                </div>
                <span className="text-sm font-semibold text-text-secondary group-hover:text-text-primary">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

