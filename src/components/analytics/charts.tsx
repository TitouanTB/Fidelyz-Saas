"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const COLORS = ["#9317FD", "#00D9FF", "#FF6B9D", "#0D9488", "#F59E0B", "#3B82F6"];

interface ChartContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function ChartContainer({ title, description, children, className, action }: ChartContainerProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface LineChartData {
  date: string;
  [key: string]: string | number;
}

interface LineChartWidgetProps {
  title: string;
  description?: string;
  data: LineChartData[];
  lines: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  height?: number;
}

export function LineChartWidget({ title, description, data, lines, height = 300 }: LineChartWidgetProps) {
  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ fill: line.color || COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface AreaChartWidgetProps {
  title: string;
  description?: string;
  data: LineChartData[];
  areas: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  height?: number;
}

export function AreaChartWidget({ title, description, data, areas, height = 300 }: AreaChartWidgetProps) {
  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            {areas.map((area, index) => (
              <linearGradient
                key={area.dataKey}
                id={`gradient-${area.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={area.color || COLORS[index % COLORS.length]}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={area.color || COLORS[index % COLORS.length]}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color || COLORS[index % COLORS.length]}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${area.dataKey})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface BarChartWidgetProps {
  title: string;
  description?: string;
  data: Array<Record<string, string | number>>;
  bars: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  height?: number;
  layout?: "vertical" | "horizontal";
  xKey?: string;
}

export function BarChartWidget({
  title,
  description,
  data,
  bars,
  height = 300,
  layout = "horizontal",
  xKey = "date",
}: BarChartWidgetProps) {
  const isVertical = layout === "vertical";

  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: isVertical ? 80 : 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          {isVertical ? (
            <>
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis type="category" dataKey={xKey} tick={{ fontSize: 12 }} stroke="#9ca3af" width={70} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || COLORS[index % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartWidgetProps {
  title: string;
  description?: string;
  data: PieChartData[];
  height?: number;
  showLegend?: boolean;
}

export function PieChartWidget({
  title,
  description,
  data,
  height = 300,
  showLegend = true,
}: PieChartWidgetProps) {
  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: number) => [value.toLocaleString(), ""]}
          />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

interface MultiLineChartWidgetProps {
  title: string;
  description?: string;
  data: LineChartData[];
  lines: Array<{
    dataKey: string;
    name: string;
    color?: string;
    type?: "monotone" | "linear" | "step";
  }>;
  height?: number;
}

export function MultiLineChartWidget({
  title,
  description,
  data,
  lines,
  height = 300,
}: MultiLineChartWidgetProps) {
  return (
    <ChartContainer title={title} description={description}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type={line.type || "monotone"}
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export { COLORS };