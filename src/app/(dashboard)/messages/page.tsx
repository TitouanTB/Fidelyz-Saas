import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Messages - Fidelyz" };

const STATUS_COLORS: Record<string, "default" | "success" | "warning" | "destructive" | "secondary" | "outline"> = {
  PENDING: "warning",
  SENT: "default",
  DELIVERED: "success",
  OPENED: "success",
  CLICKED: "success",
  BOUNCED: "destructive",
  FAILED: "destructive",
};

const CHANNEL_ICONS: Record<string, string> = {
  EMAIL: "📧",
  SMS: "💬",
  PUSH: "🔔",
  WHATSAPP: "💚",
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 text-sm mt-1">{messages.length} recent messages</p>
        </div>
        <Link
          href="/messages/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Send Message
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No messages yet</p>
            <p className="text-gray-400 text-sm mt-1">Send your first message to engage customers</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {messages.map((msg: any) => (
                  <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {msg.customer.firstName && msg.customer.lastName
                          ? `${msg.customer.firstName} ${msg.customer.lastName}`
                          : msg.customer.email}
                      </p>
                      <p className="text-xs text-gray-500">{msg.customer.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{CHANNEL_ICONS[msg.channel]} {msg.channel}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {msg.campaign?.name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={STATUS_COLORS[msg.status]}>{msg.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {msg.sentAt ? formatDate(msg.sentAt) : formatDate(msg.createdAt)}
                    </td>
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
