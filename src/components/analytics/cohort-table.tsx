"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CohortRow {
  cohortMonth: string;
  customers: number;
  retentionRates: (number | null)[];
}

interface CohortTableProps {
  data: CohortRow[];
  title?: string;
  description?: string;
}

export function CohortTable({ data, title = "Analyse de Cohorte", description = "Rétention client par mois d'inscription" }: CohortTableProps) {
  const months = ["M0", "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11"];

  const getRetentionColor = (rate: number | null) => {
    if (rate === null) return "bg-white/2 text-text-tertiary opacity-20";
    if (rate >= 70) return "bg-violet-default text-white shadow-[0_0_15px_rgba(147,23,253,0.3)]";
    if (rate >= 50) return "bg-violet-default/70 text-white/90";
    if (rate >= 30) return "bg-violet-default/40 text-text-primary";
    if (rate >= 10) return "bg-violet-default/20 text-text-secondary";
    return "bg-violet-default/5 text-text-tertiary";
  };

  if (!data || data.length === 0) {
    return (
      <Card className="glass-surface border-white/5 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold font-heading text-text-primary">{title}</CardTitle>
          <CardDescription className="text-text-tertiary">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 bg-white/2 rounded-xl border border-dashed border-white/10">
            <p className="text-sm text-text-secondary font-medium">Données de cohorte insuffisantes</p>
            <p className="text-xs text-text-tertiary mt-2">L'analyse apparaîtra avec l'accumulation de données clients.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-surface border-white/5 rounded-2xl overflow-hidden">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-bold font-heading text-text-primary">{title}</CardTitle>
        <CardDescription className="text-text-tertiary">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="text-left font-bold text-[10px] text-text-tertiary uppercase tracking-widest p-2">Cohorte</th>
                <th className="text-center font-bold text-[10px] text-text-tertiary uppercase tracking-widest p-2 px-4">Clients</th>
                {months.map((month, index) => (
                  <th key={index} className="text-center font-bold text-[10px] text-text-tertiary uppercase tracking-widest p-2">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.cohortMonth}>
                  <td className="p-2 py-3 text-xs font-bold text-text-primary border-t border-white/5">{row.cohortMonth}</td>
                  <td className="p-2 py-3 text-center text-xs font-semibold text-text-secondary border-t border-white/5 bg-white/2 rounded-lg">{row.customers}</td>
                  {row.retentionRates.map((rate, colIndex) => (
                    <td key={colIndex} className="p-0.5">
                      <div
                        className={cn(
                          "text-center py-2 px-1 rounded-md text-[10px] font-bold transition-all duration-300 hover:scale-110 cursor-default",
                          getRetentionColor(rate)
                        )}
                      >
                        {rate !== null ? `${rate}%` : "-"}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex items-center gap-6 text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-1">
          <span>Légende Rétention :</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-violet-default shadow-[0_0_8px_rgba(147,23,253,0.4)]"></span>
              <span>Légendaire (70%+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-violet-default/40"></span>
              <span>Solide (30-50%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-violet-default/5 border border-white/5"></span>
              <span>Faible (&lt;10%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CohortHeatmap({ data }: { data: CohortRow[] }) {
  if (!data || data.length === 0) return null;

  const getHeatColor = (rate: number | null) => {
    if (rate === null) return "rgba(255, 255, 255, 0.02)";
    const opacity = Math.min(Math.max(rate / 100, 0.05), 1);
    return `rgba(147, 23, 253, ${opacity})`;
  };

  return (
    <div className="space-y-3">
      {data.slice(0, 8).map((row) => (
        <div key={row.cohortMonth} className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter w-14">{row.cohortMonth}</span>
          <div className="flex gap-1 flex-1">
            {row.retentionRates.slice(0, 12).map((rate, index) => (
              <div
                key={index}
                className="flex-1 aspect-square rounded-sm border border-white/5 flex items-center justify-center text-[8px] font-bold text-white transition-all hover:border-white/20"
                style={{ backgroundColor: getHeatColor(rate) }}
                title={`${row.cohortMonth} - Mois ${index}: ${rate !== null ? `${rate}%` : "N/A"}`}
              >
                {rate !== null && rate > 20 ? rate : ""}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

