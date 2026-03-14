import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Users, Megaphone, MessageSquare, Star, BarChart3, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getAuthContext } from "@/lib/auth";

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

  return {
    stats: { customers, campaigns, messages, openRate },
    recentCustomers,
  };
}

export default async function DashboardPage() {
  const { user, organization } = await getAuthContext({ redirectIfNotFound: true });
  
  // organization is guaranteed to be non-null here due to redirectIfNotFound: true
  // but we add a check for TypeScript safety
  if (!organization) return null;

  const data = await getDashboardData(organization.id);

  if (!data) {
    // This should technically not happen if getAuthContext worked as expected
    // but we'll leave a failsafe
    return <div>Failed to load dashboard data</div>;
  }

  const { stats, recentCustomers } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {organization.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Customers" value={stats.customers} icon={Users} iconColor="text-blue-600" change={12} />
        <StatsCard title="Campaigns" value={stats.campaigns} icon={Megaphone} iconColor="text-purple-600" />
        <StatsCard title="Messages Sent" value={stats.messages} icon={MessageSquare} iconColor="text-green-600" change={8} />
        <StatsCard title="Open Rate" value={`${stats.openRate}%`} icon={BarChart3} iconColor="text-orange-600" change={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Customers</h2>
            <a href="/customers" className="text-sm text-indigo-600 hover:underline">View all</a>
          </div>
          {recentCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No customers yet</p>
              <a href="/customers" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">Import customers</a>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCustomers.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {c.firstName && c.lastName ? `${c.firstName} ${c.lastName}` : c.email}
                    </p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={12} />
                      <span className="text-xs font-medium text-gray-700">{c.points} pts</span>
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(c.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Create Campaign", href: "/campaigns/new", icon: Megaphone, color: "bg-purple-50 text-purple-700" },
              { label: "Add Customer", href: "/customers/new", icon: Users, color: "bg-blue-50 text-blue-700" },
              { label: "View Analytics", href: "/analytics", icon: TrendingUp, color: "bg-green-50 text-green-700" },
              { label: "Send Message", href: "/messages/new", icon: MessageSquare, color: "bg-orange-50 text-orange-700" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} hover:opacity-80 transition-opacity`}
              >
                <action.icon size={24} />
                <span className="text-sm font-medium text-center">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
