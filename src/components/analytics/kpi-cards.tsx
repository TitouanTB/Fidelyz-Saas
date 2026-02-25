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
  iconColor = "text-indigo-600",
  format = "number",
}: KPICardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === 0;

  const formattedValue = (() => {
    if (typeof value === "string") return value;
    if (format === "currency") return `€${value.toLocaleString()}`;
    if (format === "percent") return `${value}%`;
    return value.toLocaleString();
  })();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-lg bg-gray-50", iconColor)}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isPositive && "text-green-600",
              isNegative && "text-red-600",
              isNeutral && "text-gray-500"
            )}
          >
            {isPositive && <TrendingUp size={14} />}
            {isNegative && <TrendingDown size={14} />}
            {isNeutral && <Minus size={14} />}
            {isPositive && "+"}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
      <p className="text-sm text-gray-500 mt-1">
        {title}
        {changeLabel && <span className="text-gray-400 ml-1">({changeLabel})</span>}
      </p>
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
