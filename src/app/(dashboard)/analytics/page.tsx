import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/dashboard/stats-card";
import { BarChart3, Users, MessageSquare, TrendingUp, MousePointer, Mail } from "lucide-react";

export const metadata: Metadata = { title: "Analytics - Fidelyz" };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const member = await prisma.organizationMember.findFirst({ where: { userId: user.id } });
  if (!member) redirect("/onboarding");

  const orgId = member.organizationId;

  const [
    totalCustomers,
    totalMessages,
    sentMessages,
    deliveredMessages,
    openedMessages,
    clickedMessages,
    newCustomersThisMonth,
    totalCampaigns,
    activeCampaigns,
  ] = await Promise.all([
    prisma.customer.count({ where: { organizationId: orgId } }),
    prisma.message.count({ where: { organizationId: orgId } }),
    prisma.message.count({ where: { organizationId: orgId, status: { in: ["SENT", "DELIVERED", "OPENED", "CLICKED"] } } }),
    prisma.message.count({ where: { organizationId: orgId, status: { in: ["DELIVERED", "OPENED", "CLICKED"] } } }),
    prisma.message.count({ where: { organizationId: orgId, status: { in: ["OPENED", "CLICKED"] } } }),
    prisma.message.count({ where: { organizationId: orgId, status: "CLICKED" } }),
    prisma.customer.count({
      where: {
        organizationId: orgId,
        createdAt: { gte: new Date(new Date().setDate(1)) },
      },
    }),
    prisma.campaign.count({ where: { organizationId: orgId } }),
    prisma.campaign.count({ where: { organizationId: orgId, status: "ACTIVE" } }),
  ]);

  const openRate = sentMessages > 0 ? ((openedMessages / sentMessages) * 100).toFixed(1) : "0";
  const clickRate = openedMessages > 0 ? ((clickedMessages / openedMessages) * 100).toFixed(1) : "0";
  const deliveryRate = sentMessages > 0 ? ((deliveredMessages / sentMessages) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Track your loyalty program performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Customers" value={totalCustomers} icon={Users} iconColor="text-blue-600" />
        <StatsCard title="New This Month" value={newCustomersThisMonth} icon={TrendingUp} iconColor="text-green-600" />
        <StatsCard title="Total Campaigns" value={totalCampaigns} icon={BarChart3} iconColor="text-purple-600" />
        <StatsCard title="Total Messages" value={totalMessages} icon={MessageSquare} iconColor="text-indigo-600" />
        <StatsCard title="Open Rate" value={`${openRate}%`} icon={Mail} iconColor="text-orange-600" />
        <StatsCard title="Click Rate" value={`${clickRate}%`} icon={MousePointer} iconColor="text-pink-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Performance</h2>
          <div className="space-y-3">
            {[
              { label: "Sent", value: sentMessages, color: "bg-blue-500" },
              { label: "Delivered", value: deliveredMessages, color: "bg-green-500" },
              { label: "Opened", value: openedMessages, color: "bg-yellow-500" },
              { label: "Clicked", value: clickedMessages, color: "bg-orange-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-20">{item.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${sentMessages > 0 ? (item.value / sentMessages) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total campaigns</span>
              <span className="text-sm font-semibold text-gray-900">{totalCampaigns}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active campaigns</span>
              <span className="text-sm font-semibold text-green-600">{activeCampaigns}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Delivery rate</span>
              <span className="text-sm font-semibold text-gray-900">{deliveryRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Open rate</span>
              <span className="text-sm font-semibold text-gray-900">{openRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Click rate</span>
              <span className="text-sm font-semibold text-gray-900">{clickRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
