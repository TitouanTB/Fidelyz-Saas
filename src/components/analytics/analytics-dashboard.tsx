"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Target,
  Mail,
  MousePointer,
  Star,
  BarChart3,
  Calendar,
  Filter,
  Download,
  LayoutGrid,
  Coins,
  Clock,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  KPICardsGrid,
  LineChartWidget,
  AreaChartWidget,
  BarChartWidget,
  PieChartWidget,
  CohortTable,
  ROICalculator,
  ExportButtons,
  DateRangeFilter,
  LoyaltyStatsCard,
  TierDistribution,
  type Period,
} from "@/components/analytics";
import { AnalyticsLoadingSkeleton } from "@/components/analytics/loading-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeDisplay } from "./date-range-filter";
import { Button } from "@/components/ui/button";

interface AnalyticsData {
  period: {
    start: string;
    end: string;
    label: string;
  };
  kpis: {
    customers: { total: number; new: number; growth: number };
    messages: { total: number; deliveryRate: number; openRate: number; clickRate: number };
    revenue: { total: number; growth: number };
    visits: { total: number; growth: number };
    points: { earned: number; redeemed: number; growth: number };
  };
  charts: {
    customerGrowth: Array<{ date: string; newCustomers: number }>;
    messages: Array<{ date: string; sent: number; delivered: number; opened: number; clicked: number }>;
    revenue: Array<{ date: string; revenue: number; visits: number }>;
    campaignPerformance: Array<{ name: string; sent: number; delivered: number; opened: number; clicked: number }>;
  };
  cohorts: Array<{
    cohortMonth: string;
    customers: number;
    retentionRates: (number | null)[];
  }>;
  roi: {
    totalInvestment: number;
    totalRevenue: number;
    customerLifetimeValue: number;
    acquisitionCost: number;
    retentionRate: number;
    roi: number;
    paybackPeriod: number;
  };
  tierDistribution: Record<string, number>;
  topRewards: Array<{ name: string; claims: number; redemptions: number }>;
  loyalty: {
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    pointsInCirculation: number;
    avgPointsPerCustomer: number;
    redemptionRate: number;
  };
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("30d");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ period });
      if (period === "custom" && customStartDate) {
        params.append("startDate", customStartDate.toISOString());
      }
      if (period === "custom" && customEndDate) {
        params.append("endDate", customEndDate.toISOString());
      }

      const response = await fetch(`/api/analytics?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError("Impossible de charger les données analytiques. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, [period, customStartDate, customEndDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePeriodChange = (newPeriod: Period, startDate?: Date, endDate?: Date) => {
    setPeriod(newPeriod);
    if (startDate) setCustomStartDate(startDate);
    if (endDate) setCustomEndDate(endDate);
  };

  if (loading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-24 glass-surface rounded-2xl border border-white/5 max-w-2xl mx-auto mt-20">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Target size={32} className="text-destructive" />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">Erreur de chargement</h3>
        <p className="text-text-tertiary mb-8 px-8">{error}</p>
        <Button onClick={fetchData} className="glow-violet">
          Réessayer
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-24 glass-surface rounded-2xl border border-white/5">
        <LayoutGrid size={48} className="mx-auto text-text-tertiary mb-4 opacity-20" />
        <p className="text-text-secondary">Aucune donnée disponible pour cette période.</p>
      </div>
    );
  }

  const kpis = [
    {
      title: "Clients totaux",
      value: data.kpis.customers.total,
      change: data.kpis.customers.growth,
      icon: Users,
    },
    {
      title: "Nouveaux clients",
      value: data.kpis.customers.new,
      changeLabel: "cette période",
      icon: TrendingUp,
    },
    {
      title: "Revenu Total",
      value: data.kpis.revenue.total,
      change: data.kpis.revenue.growth,
      format: "currency" as const,
      icon: DollarSign,
    },
    {
      title: "Visites Totales",
      value: data.kpis.visits.total,
      change: data.kpis.visits.growth,
      icon: Target,
    },
    {
      title: "Messages Envoyés",
      value: data.kpis.messages.total,
      icon: MessageSquare,
    },
    {
      title: "Taux de Délivrance",
      value: data.kpis.messages.deliveryRate.toFixed(1),
      format: "percent" as const,
      icon: Mail,
    },
    {
      title: "Taux d'Ouverture",
      value: data.kpis.messages.openRate.toFixed(1),
      format: "percent" as const,
      icon: Mail,
    },
    {
      title: "Taux de Clic",
      value: data.kpis.messages.clickRate.toFixed(1),
      format: "percent" as const,
      icon: MousePointer,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-text-primary tracking-tight">Analytiques</h1>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-full backdrop-blur-md">
            <Calendar size={14} className="text-violet-default" />
            <DateRangeDisplay
              startDate={new Date(data.period.start)}
              endDate={new Date(data.period.end)}
              period={period}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter
            value={period}
            onChange={handlePeriodChange}
            startDate={customStartDate}
            endDate={customEndDate}
          />
          <ExportButtons period={period} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-8">
        <div className="flex justify-center sm:justify-start">
          <TabsList className="bg-white/4 border border-white/5 p-1 h-12 rounded-xl backdrop-blur-xl">
            <TabsTrigger value="overview" className="px-6 rounded-lg data-[state=active]:bg-violet-default data-[state=active]:text-white">Général</TabsTrigger>
            <TabsTrigger value="customers" className="px-6 rounded-lg data-[state=active]:bg-violet-default data-[state=active]:text-white">Clients</TabsTrigger>
            <TabsTrigger value="messaging" className="px-6 rounded-lg data-[state=active]:bg-violet-default data-[state=active]:text-white">Messages</TabsTrigger>
            <TabsTrigger value="cohorts" className="px-6 rounded-lg data-[state=active]:bg-violet-default data-[state=active]:text-white">Cohortes</TabsTrigger>
            <TabsTrigger value="roi" className="px-6 rounded-lg data-[state=active]:bg-violet-default data-[state=active]:text-white">ROI</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8 outline-none">
          <KPICardsGrid kpis={kpis} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AreaChartWidget
              title="Croissance Clients"
              description="Nouveaux clients sur la période"
              data={data.charts.customerGrowth}
              areas={[{ dataKey: "newCustomers", name: "Nouveaux Clients", color: "#9317FD" }]}
            />
            <BarChartWidget
              title="Revenus & Visites"
              description="Recettes journalières et fréquentation"
              data={data.charts.revenue}
              bars={[
                { dataKey: "revenue", name: "Revenu (€)", color: "#00D9FF" },
                { dataKey: "visits", name: "Visites", color: "#9317FD" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LoyaltyStatsCard stats={data.loyalty} topRewards={data.topRewards} />
            <TierDistribution distribution={data.tierDistribution} />
          </div>

          {data.charts.campaignPerformance.length > 0 && (
            <BarChartWidget
              title="Performance des Campagnes"
              description="Top campagnes par engagement"
              data={data.charts.campaignPerformance}
              bars={[
                { dataKey: "sent", name: "Envoyés", color: "#3B82F6" },
                { dataKey: "opened", name: "Ouverts", color: "#10B981" },
                { dataKey: "clicked", name: "Cliqués", color: "#F59E0B" },
              ]}
            />
          )}
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-8 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-surface border-white/5 rounded-2xl p-6">
               <p className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mb-2">Total Clients</p>
               <div className="flex items-baseline gap-3">
                 <p className="text-4xl font-bold font-heading text-text-primary tracking-tight">{data.kpis.customers.total}</p>
                 <span className="text-xs font-bold text-success">+{data.kpis.customers.growth.toFixed(1)}%</span>
               </div>
            </Card>
            <Card className="glass-surface border-white/5 rounded-2xl p-6">
               <p className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mb-2">Nouveaux (Période)</p>
               <p className="text-4xl font-bold font-heading text-text-primary tracking-tight">{data.kpis.customers.new}</p>
            </Card>
            <Card className="glass-surface border-white/5 rounded-2xl p-6">
               <p className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mb-2">Points Moy./Client</p>
               <p className="text-4xl font-bold font-heading text-text-primary tracking-tight">{data.loyalty.avgPointsPerCustomer.toFixed(0)}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AreaChartWidget
              title="Acquisition Clients"
              description="Nouveaux clients sur la période"
              data={data.charts.customerGrowth}
              areas={[{ dataKey: "newCustomers", name: "Nouveaux Clients", color: "#9317FD" }]}
            />
            <TierDistribution distribution={data.tierDistribution} />
          </div>

          <LoyaltyStatsCard stats={data.loyalty} topRewards={data.topRewards} />
        </TabsContent>

        {/* Messaging Tab */}
        <TabsContent value="messaging" className="space-y-8 outline-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-surface border-white/5 rounded-2xl p-6">
               <p className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mb-2">Messages Envoyés</p>
               <p className="text-4xl font-bold font-heading text-text-primary tracking-tight">{data.kpis.messages.total}</p>
            </Card>
            <Card className="glass-surface border-white/5 rounded-2xl p-6">
               <p className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mb-2">Délivrance</p>
               <p className="text-4xl font-bold font-heading text-text-primary tracking-tight">{data.kpis.messages.deliveryRate.toFixed(1)}%</p>
            </Card>
            <Card className="glass-surface border-white/5 rounded-2xl p-6">
               <p className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mb-2">Ouverture</p>
               <p className="text-4xl font-bold font-heading text-text-primary tracking-tight">{data.kpis.messages.openRate.toFixed(1)}%</p>
            </Card>
            <Card className="glass-surface border-white/5 rounded-2xl p-6">
               <p className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mb-2">Clics</p>
               <p className="text-4xl font-bold font-heading text-text-primary tracking-tight">{data.kpis.messages.clickRate.toFixed(1)}%</p>
            </Card>
          </div>

          <LineChartWidget
            title="Performance des Messages"
            description="Envois, délivrance, ouvertures et clics"
            data={data.charts.messages}
            lines={[
              { dataKey: "sent", name: "Envoyés", color: "#3B82F6" },
              { dataKey: "delivered", name: "Délivrés", color: "#10B981" },
              { dataKey: "opened", name: "Ouverts", color: "#F59E0B" },
              { dataKey: "clicked", name: "Cliqués", color: "#EF4444" },
            ]}
          />

          {data.charts.campaignPerformance.length > 0 && (
            <BarChartWidget
              title="Campagnes Performantes"
              description="Engagement par campagne"
              data={data.charts.campaignPerformance}
              bars={[
                { dataKey: "sent", name: "Envoyés", color: "#3B82F6" },
                { dataKey: "opened", name: "Ouverts", color: "#10B981" },
                { dataKey: "clicked", name: "Cliqués", color: "#F59E0B" },
              ]}
            />
          )}
        </TabsContent>

        {/* Cohorts Tab */}
        <TabsContent value="cohorts" className="space-y-8 outline-none">
          <CohortTable data={data.cohorts} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-surface border-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-bold font-heading text-text-primary mb-4">Analyse de Cohorte</h3>
              <div className="space-y-6">
                <div className="p-5 bg-violet-default/5 border border-violet-default/10 rounded-xl">
                  <h4 className="font-bold text-violet-default text-sm uppercase tracking-wider mb-2">Qu'est-ce qu'une cohorte ?</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    L'analyse de cohorte regroupe les clients par mois d'inscription et suit leur comportement. 
                    C'est l'outil indispensable pour piloter votre rétention.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/4 rounded-xl border border-white/5">
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Rétention M1</p>
                    <p className="text-2xl font-bold font-heading text-text-primary">
                      {data.cohorts.length > 0
                        ? `${(
                            data.cohorts
                              .filter((c) => c.retentionRates[1] !== null)
                              .reduce((sum, c) => sum + (c.retentionRates[1] || 0), 0) /
                            data.cohorts.filter((c) => c.retentionRates[1] !== null).length
                          ).toFixed(0)}%`
                        : "--"}
                    </p>
                  </div>
                  <div className="p-4 bg-white/4 rounded-xl border border-white/5">
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Rétention M3</p>
                    <p className="text-2xl font-bold font-heading text-text-primary">
                      {data.cohorts.length > 0
                        ? `${(
                            data.cohorts
                              .filter((c) => c.retentionRates[3] !== null)
                              .reduce((sum, c) => sum + (c.retentionRates[3] || 0), 0) /
                            data.cohorts.filter((c) => c.retentionRates[3] !== null).length
                          ).toFixed(0)}%`
                        : "--"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass-surface border-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-bold font-heading text-text-primary mb-6">Optimisation de la Rétention</h3>
              <ul className="space-y-5">
                {[
                  "Envoyez des offres ciblées aux clients à risque (Churn)",
                  "Automatisez une séquence de bienvenue (S1 à S4)",
                  "Offrez des récompenses surprises après 3 visites",
                  "Utilisez le multi-canal pour rester présent à l'esprit"
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-violet-default/20 flex items-center justify-center flex-shrink-0">
                      <Star size={12} className="text-violet-default fill-violet-default" />
                    </div>
                    <span className="text-sm text-text-secondary">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </TabsContent>

        {/* ROI Tab */}
        <TabsContent value="roi" className="space-y-8 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ROICalculator data={data.roi} />
            <Card className="glass-surface border-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-bold font-heading text-text-primary mb-6">Comprendre votre ROI</h3>
              <div className="space-y-6">
                <div className="p-5 bg-violet-default/5 border border-violet-default/10 rounded-xl">
                  <h4 className="font-bold text-violet-default text-sm uppercase tracking-wider mb-2">Formule Fondamentale</h4>
                  <p className="text-sm font-mono text-text-secondary">
                    ROI = ((Revenu - Investissement) / Investissement) × 100
                  </p>
                </div>
                <div className="space-y-5">
                  {[
                    { title: "Investissement", desc: "Abonnement, récompenses, frais de messagerie", icon: Coins, color: "text-blue-400" },
                    { title: "Revenu", desc: "Volume d'affaires généré par les membres Fidelyz", icon: DollarSign, color: "text-success" },
                    { title: "Point Mort", desc: "Délai moyen pour rentabiliser l'investissement", icon: Clock, color: "text-warning" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className={cn("mt-1 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0", item.color)}>
                        {item.icon && <item.icon size={20} />}
                      </div>
                      <div>
                        <h5 className="font-bold text-text-primary text-sm">{item.title}</h5>
                        <p className="text-xs text-text-tertiary mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-surface border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-bold font-heading text-text-primary mb-6">Répartition des Revenus</h3>
              <div className="space-y-4">
                {[
                  { label: "Dépenses Membres", value: `${data.kpis.revenue.total.toFixed(2)} €` },
                  { label: "Panier Moyen", value: `${data.kpis.visits.total > 0 ? (data.kpis.revenue.total / data.kpis.visits.total).toFixed(2) : "0.00"} €` },
                  { label: "Valeur Points Utilisés", value: `${(data.loyalty.totalPointsRedeemed * 0.01).toFixed(2)} €` }
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                    <span className="text-sm text-text-secondary">{row.label}</span>
                    <span className="font-bold text-text-primary">{row.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass-surface border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-bold font-heading text-text-primary mb-6">Métriques Valeur Client</h3>
              <div className="space-y-4">
                {[
                  { label: "Customer Lifetime Value", value: `${data.roi.customerLifetimeValue.toFixed(2)} €` },
                  { label: "Taux de Rétention", value: `${data.roi.retentionRate.toFixed(1)} %` },
                  { label: "Fréquence de Visite", value: `${data.kpis.customers.total > 0 ? (data.kpis.visits.total / data.kpis.customers.total).toFixed(1) : "0"}` }
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                    <span className="text-sm text-text-secondary">{row.label}</span>
                    <span className="font-bold text-text-primary">{row.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

