"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

export function CohortTable({ data, title = "Cohort Analysis", description = "Customer retention by signup month" }: CohortTableProps) {
  const months = ["Month 0", "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6", "Month 7", "Month 8", "Month 9", "Month 10", "Month 11"];

  const getRetentionColor = (rate: number | null) => {
    if (rate === null) return "bg-gray-50 text-gray-400";
    if (rate >= 70) return "bg-green-100 text-green-700";
    if (rate >= 50) return "bg-emerald-100 text-emerald-700";
    if (rate >= 30) return "bg-yellow-100 text-yellow-700";
    if (rate >= 10) return "bg-orange-100 text-orange-700";
    return "bg-red-100 text-red-700";
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No cohort data available yet</p>
            <p className="text-sm mt-1">Cohort analysis will appear once you have more customer data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left font-semibold text-gray-600 p-2 border-b">Cohort</th>
                <th className="text-center font-semibold text-gray-600 p-2 border-b">Customers</th>
                {months.map((month, index) => (
                  <th key={index} className="text-center font-semibold text-gray-600 p-2 border-b text-xs">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={row.cohortMonth} className={rowIndex % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="p-2 font-medium text-gray-900">{row.cohortMonth}</td>
                  <td className="p-2 text-center font-medium text-gray-700">{row.customers}</td>
                  {row.retentionRates.map((rate, colIndex) => (
                    <td key={colIndex} className="p-1">
                      <div
                        className={`text-center py-1 px-2 rounded text-xs font-medium ${getRetentionColor(rate)}`}
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
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span>Retention rate:</span>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-green-100"></span>
            <span>70%+</span>
            <span className="w-4 h-4 rounded bg-yellow-100"></span>
            <span>30-50%</span>
            <span className="w-4 h-4 rounded bg-red-100"></span>
            <span>&lt;10%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CohortHeatmapProps {
  data: CohortRow[];
}

export function CohortHeatmap({ data }: CohortHeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No cohort data available</p>
      </div>
    );
  }

  const getHeatColor = (rate: number | null) => {
    if (rate === null) return "bg-gray-100";
    const intensity = Math.min(rate / 100, 1);
    const hue = 145; // Green hue
    const saturation = 70;
    const lightness = 100 - intensity * 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className="space-y-2">
      {data.slice(0, 8).map((row) => (
        <div key={row.cohortMonth} className="flex items-center gap-2">
          <span className="text-xs text-gray-600 w-20">{row.cohortMonth}</span>
          <div className="flex gap-1">
            {row.retentionRates.slice(0, 12).map((rate, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded flex items-center justify-center text-xs font-medium"
                style={{ backgroundColor: getHeatColor(rate) }}
                title={`${row.cohortMonth} - Month ${index}: ${rate !== null ? `${rate}%` : "N/A"}`}
              >
                {rate !== null ? rate : "-"}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
