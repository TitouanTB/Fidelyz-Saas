"use client";

import { JourneyConfig } from "./config";
import { JourneyStats } from "./types";
import { LucideIcon, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface JourneyBlockProps {
  config: JourneyConfig;
  stat?: JourneyStats;
  icon: LucideIcon;
  onClick: () => void;
  onSimulate: () => void;
  index: number;
  isMobile?: boolean;
}

export function JourneyBlock({
  config,
  stat,
  icon: Icon,
  onClick,
  onSimulate,
  index,
  isMobile = false,
}: JourneyBlockProps) {
  if (isMobile) {
    return (
      <div
        className="glass-surface border border-white/5 rounded-2xl p-5 cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all relative overflow-hidden group"
        onClick={onClick}
      >
        <div className="flex items-start gap-5">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform group-hover:scale-110", config.iconBg)}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-text-primary">{config.title}</h3>
              {stat && (
                <span className="text-xl font-bold font-heading text-violet-default">
                  {stat.count}
                </span>
              )}
            </div>
            <p className="text-xs text-text-tertiary mt-1.5 leading-relaxed">{config.description}</p>
            {stat && (
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000", config.iconBg)}
                    style={{ width: `${stat.rate}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">{stat.rate}%</span>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSimulate();
          }}
          className="mt-4 w-full h-10 rounded-xl bg-white/4 border border-white/5 hover:bg-violet-default/10 hover:border-violet-default/20 text-text-secondary hover:text-violet-default text-xs font-bold uppercase tracking-widest gap-2"
        >
          <Play size={12} fill="currentColor" />
          Simuler l'entrée
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center group">
      {/* Icon Circle */}
      <button
        onClick={onClick}
        className="relative z-10 p-5 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl cursor-pointer hover:scale-110 hover:border-violet-default/50 hover:shadow-[0_0_30px_rgba(147,23,253,0.3)] transition-all duration-500 active:scale-95 group"
      >
        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:rotate-6", config.iconBg)}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        {stat && (
          <div className="absolute -top-3 -right-3 bg-violet-default text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg border-2 border-[#111114]">
            {stat.count}
          </div>
        )}
      </button>

      {/* Label */}
      <div className="mt-6 text-center">
        <h3 className="text-sm font-bold font-heading text-text-primary tracking-tight transition-colors group-hover:text-violet-default">{config.title}</h3>
        <p className="text-[10px] text-text-tertiary mt-2 font-medium max-w-[120px] mx-auto leading-relaxed group-hover:text-text-secondary transition-colors">{config.description}</p>
      </div>

      {/* Progress Bar */}
      {stat && (
        <div className="mt-4 w-full px-2 max-w-[100px]">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className={cn("h-full rounded-full transition-all duration-1000", config.iconBg)}
              style={{ width: `${stat.rate}%` }}
            />
          </div>
          <p className="text-[9px] font-bold text-text-tertiary text-center mt-2 tracking-widest">{stat.rate}%</p>
        </div>
      )}

      {/* Simulate Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSimulate}
        className="mt-4 h-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-[10px] font-bold uppercase tracking-widest text-text-tertiary hover:text-violet-default hover:bg-violet-default/10"
      >
        Simuler
      </Button>
    </div>
  );
}

