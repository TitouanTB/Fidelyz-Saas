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
    <Card className={`glass-surface border-white/5 rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div>
          <CardTitle className="text-xl font-bold font-heading text-text-primary">{title}</CardTitle>
          {description && <CardDescription className="text-text-tertiary mt-1">{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1f]/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl">
        <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-sm font-medium text-text-secondary">{entry.name}:</span>
              <span className="text-sm font-bold text-text-primary ml-auto">
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

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
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#7b7b8f' }} 
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#7b7b8f' }} 
            axisLine={false}
            tickLine={false}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 'bold', color: '#7b7b8f' }}
          />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || COLORS[index % COLORS.length]}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: line.color || COLORS[index % COLORS.length] }}
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
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7b7b8f' }} axisLine={false} tickLine={false} dy={10} />
          <YAxis tick={{ fontSize: 10, fill: '#7b7b8f' }} axisLine={false} tickLine={false} dx={-10} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 'bold' }} />
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color || COLORS[index % COLORS.length]}
              strokeWidth={3}
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
          margin={{ top: 5, right: 10, left: isVertical ? 40 : 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} horizontal={!isVertical} />
          {isVertical ? (
            <>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#7b7b8f' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey={xKey} tick={{ fontSize: 10, fill: '#7b7b8f' }} axisLine={false} tickLine={false} width={80} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#7b7b8f' }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 10, fill: '#7b7b8f' }} axisLine={false} tickLine={false} dx={-10} />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 'bold' }} />
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || COLORS[index % COLORS.length]}
              radius={[4, 4, 0, 0]}
              barSize={isVertical ? 20 : 32}
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
            paddingAngle={4}
            dataKey="value"
            label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend verticalAlign="bottom" align="center" iconType="circle" />}
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
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7b7b8f' }} axisLine={false} tickLine={false} dy={10} />
          <YAxis tick={{ fontSize: 10, fill: '#7b7b8f' }} axisLine={false} tickLine={false} dx={-10} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 'bold' }} />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type={line.type || "monotone"}
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || COLORS[index % COLORS.length]}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: line.color || COLORS[index % COLORS.length] }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export { COLORS };