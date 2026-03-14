import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatsCard({ title, value, change, icon: Icon }: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="glass-surface p-6 rounded-2xl group cursor-default transition-all duration-300 hover:border-violet-default/30">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium tracking-widest uppercase text-text-secondary">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-violet-default/8 flex items-center justify-center group-hover:bg-violet-default/15 transition-colors border border-violet-default/10">
          <Icon className="w-4 h-4 text-violet-default" />
        </div>
      </div>
      <div className="text-3xl font-bold font-heading text-text-primary tracking-tight mb-1">
        {value}
      </div>
      {change !== undefined && (
        <div className={cn("text-xs flex items-center gap-1", isPositive ? "text-success" : "text-danger")}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{isPositive ? "+" : ""}{change}%</span>
          <span className="text-text-tertiary ml-1">vs mois dernier</span>
        </div>
      )}
    </div>
  );
}
