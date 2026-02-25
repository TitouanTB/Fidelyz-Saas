"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { format, subDays } from "date-fns";

export type Period = "7d" | "30d" | "90d" | "1y" | "custom";

interface DateRangeFilterProps {
  value: Period;
  onChange: (period: Period, startDate?: Date, endDate?: Date) => void;
  startDate?: Date;
  endDate?: Date;
}

const periodLabels: Record<Period, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "1y": "Last year",
  custom: "Custom range",
};

export function DateRangeFilter({ value, onChange, startDate, endDate }: DateRangeFilterProps) {
  const [customStart, setCustomStart] = useState(startDate ? format(startDate, "yyyy-MM-dd") : "");
  const [customEnd, setCustomEnd] = useState(endDate ? format(endDate, "yyyy-MM-dd") : "");

  const handlePeriodChange = (period: Period) => {
    if (period !== "custom") {
      onChange(period);
    }
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      onChange("custom", new Date(customStart), new Date(customEnd));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(v) => handlePeriodChange(v as Period)}>
        <SelectTrigger className="w-[180px]">
          <Calendar className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="1y">Last year</SelectItem>
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>

      {value === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button size="sm" onClick={handleCustomApply} disabled={!customStart || !customEnd}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}

interface QuickPeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
}

export function QuickPeriodSelector({ value, onChange }: QuickPeriodSelectorProps) {
  const periods: Period[] = ["7d", "30d", "90d", "1y"];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === period
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {period === "1y" ? "1 Year" : period.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

interface DateRangeDisplayProps {
  startDate: Date;
  endDate: Date;
  period: Period;
}

export function DateRangeDisplay({ startDate, endDate, period }: DateRangeDisplayProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Calendar size={14} />
      <span>
        {period === "custom"
          ? `${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`
          : periodLabels[period]}
      </span>
    </div>
  );
}
