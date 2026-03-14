import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Users, Star, Plus, Search, Filter, MoreVertical, Download } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Clients - Fidelyz" };

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
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-text-primary tracking-tight">Clients</h1>
          <p className="text-text-secondary text-base mt-1">
            Gérez votre base de données clients et suivez leur engagement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-white/5 bg-white/4">
            <Download size={16} />
            Exporter
          </Button>
          <Link href="/customers/new">
            <Button className="gap-2 glow-violet">
              <Plus size={16} />
              Nouveau client
            </Button>
          </Link>
        </div>
      </div>

      <div className="glass-surface p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input 
              placeholder="Rechercher un client..." 
              className="pl-11 h-12 bg-white/4 border-white/5 focus:border-violet-default/50"
            />
          </div>
          <Button variant="outline" className="gap-2 h-12 px-6 border-white/5 bg-white/4 text-text-secondary">
            <Filter size={16} />
            Filtres
          </Button>
        </div>

        {customers.length === 0 ? (
          <div className="text-center py-24 bg-white/2 rounded-2xl border border-dashed border-white/10">
            <div className="w-16 h-16 bg-violet-default/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={32} className="text-violet-default" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Aucun client pour le moment</h3>
            <p className="text-text-tertiary mb-8">Commencez par ajouter votre premier client pour lancer votre programme.</p>
            <Link href="/customers/new">
              <Button size="lg" className="glow-violet">
                Ajouter mon premier client
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-4 text-left text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Client</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Points</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Valeur Vie</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Visites</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Segments</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-text-tertiary uppercase tracking-[0.2em]">Inscription</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((customer: any) => (
                  <tr key={customer.id} className="group hover:bg-white/4 transition-all duration-200">
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-violet-default/10 border border-violet-default/20 flex items-center justify-center text-violet-default font-bold">
                          {(customer.firstName?.[0] || customer.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary group-hover:text-violet-default transition-colors">
                            {customer.firstName && customer.lastName
                              ? `${customer.firstName} ${customer.lastName}`
                              : customer.email}
                          </p>
                          <p className="text-xs text-text-tertiary">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-violet-default/10 flex items-center justify-center">
                          <Star size={12} className="text-violet-default fill-violet-default" />
                        </div>
                        <span className="text-sm font-bold text-text-primary">{customer.points}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 font-mono text-sm text-text-secondary">
                      {customer.totalSpend.toFixed(2)} €
                    </td>
                    <td className="px-4 py-5">
                       <Badge variant="outline" className="bg-white/5 border-white/5 text-text-secondary">
                          {customer.visits} visites
                       </Badge>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-wrap gap-1.5">
                        {customer.tags.length > 0 ? (
                           customer.tags.slice(0, 2).map((tag: string) => (
                            <Badge key={tag} className="bg-violet-default/10 border-violet-default/20 text-violet-default font-medium">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-text-tertiary italic">Aucun segment</span>
                        )}
                        {customer.tags.length > 2 && (
                          <Badge variant="outline" className="border-white/10 text-text-tertiary">
                            +{customer.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-5 text-sm text-text-tertiary">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-4 py-5 text-right">
                      <button className="p-2 hover:bg-white/5 rounded-lg text-text-tertiary transition-colors">
                        <MoreVertical size={18} />
                      </button>
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

