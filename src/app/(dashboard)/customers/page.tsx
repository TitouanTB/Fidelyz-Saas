import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Users, Star, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Customers - Fidelyz" };

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const member = await prisma.organizationMember.findFirst({
    where: { userId: user.id },
  });

  if (!member) redirect("/onboarding");

  const customers = await prisma.customer.findMany({
    where: { organizationId: member.organizationId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{customers.length} total customers</p>
        </div>
        <Link
          href="/customers/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Add Customer
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {customers.length === 0 ? (
          <div className="text-center py-16">
            <Users size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No customers yet</p>
            <p className="text-gray-400 text-sm mt-1">Start by adding your first customer</p>
            <Link
              href="/customers/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors mt-4"
            >
              <Plus size={16} />
              Add Customer
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spend</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {customer.firstName && customer.lastName
                            ? `${customer.firstName} ${customer.lastName}`
                            : customer.email}
                        </p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={14} />
                        <span className="text-sm font-medium text-gray-700">{customer.points}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      €{customer.totalSpend.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{customer.visits}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {customer.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                        {customer.tags.length > 2 && (
                          <Badge variant="outline">+{customer.tags.length - 2}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(customer.createdAt)}</td>
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
