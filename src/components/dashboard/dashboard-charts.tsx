"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartProps {
  data: { date: string; count: number }[];
}

export function DashboardChart({ data }: ChartProps) {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#7b7b8f', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#7b7b8f', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a1f',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              color: '#f0f0f5',
            }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar 
            dataKey="count" 
            fill="#9317FD" 
            radius={[4, 4, 0, 0]}
            opacity={0.85}
            activeBar={{ opacity: 1, fill: '#a832ff' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
