"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Percent, Clock, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ROIData {
  totalInvestment: number;
  totalRevenue: number;
  customerLifetimeValue: number;
  acquisitionCost: number;
  retentionRate: number;
  roi: number;
  paybackPeriod: number;
}

interface ROICalculatorProps {
  data: ROIData;
}

export function ROICalculator({ data }: ROICalculatorProps) {
  const formatCurrency = (value: number) => `€${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const formatDays = (value: number) => value < 30 ? `${value.toFixed(0)} j` : `${(value / 30).toFixed(1)} m`;

  const isPositive = data.roi >= 0;
  const isExcellent = data.roi >= 100;

  return (
    <Card className="glass-surface border-white/5 rounded-2xl overflow-hidden">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold font-heading text-text-primary flex items-center gap-2">
              <Target className="text-violet-default" size={20} />
              Analyse du ROI
            </CardTitle>
            <CardDescription className="text-text-tertiary mt-1">Retour sur investissement du programme</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Main ROI Display */}
        <div className={cn(
          "relative p-8 rounded-2xl border border-white/5 text-center transition-all overflow-hidden",
          isPositive ? "bg-violet-default/5" : "bg-destructive/5"
        )}>
          {/* Decorative Glow */}
          <div className={cn(
            "absolute -top-24 -left-24 w-48 h-48 blur-[80px] rounded-full opacity-30",
            isPositive ? "bg-violet-default" : "bg-destructive"
          )} />
          
          <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.2em] mb-3">Retour sur Investissement</p>
          <div className="flex items-center justify-center gap-3">
             {isPositive ? <ArrowUpRight className="text-success" size={24} /> : <ArrowDownRight className="text-destructive" size={24} />}
             <p className={cn(
               "text-5xl font-bold font-heading tracking-tight",
               isPositive ? "text-text-primary" : "text-destructive"
             )}>
               {isPositive ? "+" : ""}{formatPercent(data.roi)}
             </p>
          </div>
          <p className="text-xs text-text-secondary mt-4 font-medium max-w-[250px] mx-auto leading-relaxed">
            {isExcellent
              ? "Exceptionnel ! Votre programme génère des rendements très solides."
              : isPositive
                ? "Progression positive. Continuez d'optimiser pour booster vos marges."
                : "Ajustez votre stratégie pour améliorer la rentabilité du programme."}
          </p>
        </div>

        {/* ROI Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <ROIMetric
            icon={DollarSign}
            label="Investissement Total"
            value={formatCurrency(data.totalInvestment)}
            color="text-blue-400"
          />
          <ROIMetric
            icon={TrendingUp}
            label="Revenu Total"
            value={formatCurrency(data.totalRevenue)}
            color="text-success"
          />
          <ROIMetric
            icon={DollarSign}
            label="LTV Client"
            value={formatCurrency(data.customerLifetimeValue)}
            color="text-violet-default"
          />
          <ROIMetric
            icon={Clock}
            label="Temps de retour"
            value={formatDays(data.paybackPeriod)}
            color="text-warning"
          />
        </div>

        {/* ROI Breakdown */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Détails de l'Investissement</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white/2 p-3 rounded-xl border border-white/5">
              <span className="text-xs font-semibold text-text-secondary">Logiciel & Plateforme</span>
              <span className="text-xs font-bold text-text-primary">49.00 €</span>
            </div>
            <div className="flex justify-between items-center bg-white/2 p-3 rounded-xl border border-white/5">
              <span className="text-xs font-semibold text-text-secondary">Récompenses & Offres</span>
              <span className="text-xs font-bold text-text-primary">{(data.totalInvestment - 49).toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Performance ROI</span>
            <span className={cn("text-xs font-bold", isPositive ? "text-success" : "text-destructive")}>{formatPercent(data.roi)}</span>
          </div>
          <div className="w-full bg-white/5 overflow-hidden rounded-full h-1.5 border border-white/5">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                isExcellent ? "bg-success" : isPositive ? "bg-violet-default" : "bg-destructive"
              )}
              style={{ width: `${Math.min(Math.max(data.roi, 0), 200) / 2}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-bold text-text-tertiary uppercase tracking-tighter">
            <span>0%</span>
            <span>100% (Seuil)</span>
            <span>200%+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ROIMetricProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: string;
}

function ROIMetric({ icon: Icon, label, value, color = "text-text-tertiary" }: ROIMetricProps) {
  return (
    <div className="flex flex-col items-center p-4 bg-white/2 rounded-2xl border border-white/5 group hover:bg-white/4 transition-all">
      <div className={cn("mb-2 p-2 rounded-lg bg-white/5 border border-white/5 group-hover:scale-110 transition-transform", color)}>
        <Icon size={16} />
      </div>
      <p className="text-sm font-bold text-text-primary font-heading tracking-tight">{value}</p>
      <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider mt-1 text-center">{label}</p>
    </div>
  );
}

export function ROIOverTime({ data }: { data: any[] }) {
  return (
    <Card className="glass-surface border-white/5 rounded-2xl overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-bold font-heading text-text-primary">Évolution du ROI</CardTitle>
        <CardDescription className="text-text-tertiary mt-1">Progression historique de votre rentabilité</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.month} className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-text-secondary">{item.month}</span>
                <span className={cn(item.cumulativeROI >= 0 ? "text-success" : "text-destructive")}>
                  {item.cumulativeROI >= 0 ? "+" : ""}{item.cumulativeROI.toFixed(0)}%
                </span>
              </div>
              <div className="relative h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="absolute left-0 h-full bg-blue-500/40 rounded-full"
                  style={{ width: `${Math.min((item.investment / 1000) * 100, 100)}%` }}
                />
                <div
                  className="absolute left-0 h-full bg-violet-default rounded-full"
                  style={{ width: `${Math.min((item.revenue / 2000) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center gap-6 text-[9px] font-bold text-text-tertiary uppercase tracking-widest px-1">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-500/40 rounded-sm"></span>
            Investissement
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-violet-default rounded-sm"></span>
            Revenu
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

