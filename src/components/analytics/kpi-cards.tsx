"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  format?: "number" | "currency" | "percent";
}

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-violet-default",
  format = "number",
}: KPICardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === 0;

  const formattedValue = (() => {
    if (typeof value === "string") return value;
    if (format === "currency") return `${value.toLocaleString()} €`;
    if (format === "percent") return `${value}%`;
    return value.toLocaleString();
  })();

  return (
    <div className="glass-surface p-6 rounded-2xl group hover:border-violet-default/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl bg-violet-default/10 border border-violet-default/20 text-violet-default", iconColor)}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
              isPositive && "bg-success/10 text-success border border-success/20",
              isNegative && "bg-destructive/10 text-destructive border border-destructive/20",
              isNeutral && "bg-white/5 text-text-tertiary border border-white/10"
            )}
          >
            {isPositive && <TrendingUp size={12} />}
            {isNegative && <TrendingDown size={12} />}
            {isNeutral && <Minus size={12} />}
            {isPositive && "+"}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-text-primary font-heading tracking-tight">{formattedValue}</p>
          {changeLabel && <span className="text-[10px] text-text-tertiary font-medium">{changeLabel}</span>}
        </div>
      </div>
    </div>
  );
}

interface KPICardsGridProps {
  kpis: KPICardProps[];
}

export function KPICardsGrid({ kpis }: KPICardsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}

