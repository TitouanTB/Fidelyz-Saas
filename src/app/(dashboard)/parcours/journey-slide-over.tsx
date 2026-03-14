"use client";

import { JourneyStage } from "./types";
import { JOURNEY_CONFIG } from "./config";
import { X, ChevronRight, Clock, User, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface JourneySlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  stage: JourneyStage | null;
  details: Record<string, unknown> | null;
  stats?: {
    stage: JourneyStage;
    count: number;
    rate: number;
  };
}

export function JourneySlideOver({
  isOpen,
  onClose,
  stage,
  details,
  stats,
}: JourneySlideOverProps) {
  if (!stage) return null;

  const config = JOURNEY_CONFIG.find(c => c.stage === stage);
  if (!config) return null;

  const getRecentItems = (d: Record<string, unknown>): Record<string, unknown>[] | null => {
    const val =
      d.recentScans ??
      d.recentActivations ??
      d.recentWelcomeMessages ??
      d.customers ??
      d.recentVisits ??
      d.recentClaims ??
      d.recentExpirations;
    return Array.isArray(val) ? (val as Record<string, unknown>[]) : null;
  };

  const SKIPPED_KEYS = new Set([
    "recentScans",
    "recentActivations",
    "recentWelcomeMessages",
    "customers",
    "recentVisits",
    "recentClaims",
    "recentExpirations",
  ]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Slide Over Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-lg bg-[#111114]/90 backdrop-blur-2xl border-l border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[101] transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="relative border-b border-white/5 px-8 py-10">
           {/* Section Glow */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-violet-default blur-[80px] opacity-10" />
           
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl", config.iconBg)}>
                 <BarChart3 className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-heading text-text-primary tracking-tight">
                  {config.title}
                </h2>
                <p className="text-sm text-text-tertiary mt-1 max-w-[280px]">
                  {config.description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-xl hover:bg-white/5 text-text-tertiary hover:text-text-primary h-12 w-12 border border-white/5"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Stats Summary Area */}
          {stats && (
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="glass-surface rounded-2xl p-5 border border-white/5 bg-white/2">
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1.5">Engagement Total</p>
                <p className="text-3xl font-bold font-heading text-text-primary">
                  {stats.count.toLocaleString()}
                </p>
              </div>
              <div className="glass-surface rounded-2xl p-5 border border-white/5 bg-violet-default/5">
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1.5">Taux de passage</p>
                <div className="flex items-end gap-2">
                   <p className="text-3xl font-bold font-heading text-violet-default">
                    {stats.rate}%
                  </p>
                  <div className="h-2 w-12 bg-white/5 rounded-full overflow-hidden mb-1.5 border border-white/5">
                    <div className="h-full bg-violet-default rounded-full" style={{ width: `${stats.rate}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto h-[calc(100%-350px)] custom-scrollbar">
          {details ? (
            <div className="space-y-10">
              {/* Secondary Metrics */}
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(details)
                  .filter(([key]) => !SKIPPED_KEYS.has(key))
                  .map(([key, value]) => (
                    <div key={key} className="bg-white/2 rounded-2xl p-5 border border-white/5 group hover:bg-white/4 transition-all">
                      <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest mb-2 truncate">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </p>
                      <p className="text-xl font-bold font-heading text-text-secondary group-hover:text-text-primary transition-colors">
                        {typeof value === "number"
                          ? value.toLocaleString()
                          : String(value ?? "-")}
                      </p>
                    </div>
                  ))}
              </div>

              {/* Recent Activity List */}
              {(() => {
                const items = getRecentItems(details);
                if (!items) return null;
                return (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-2">
                        <Clock size={14} className="text-violet-default" />
                        Activités Récentes
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {items.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl border border-dashed border-white/10 opacity-40">
                          <p className="text-sm text-text-tertiary">Aucune activité enregistrée</p>
                        </div>
                      ) : (
                        items.slice(0, 10).map((row, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/5 hover:border-violet-default/20 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-violet-default/10 transition-colors">
                                <User size={18} className="text-text-tertiary group-hover:text-violet-default transition-colors" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-text-primary tracking-tight">
                                  {String(row.email ?? row.firstName ?? `Membre #${idx + 1}`)}
                                </p>
                                <p className="text-[10px] text-text-tertiary mt-0.5 font-medium">
                                  {row.scannedAt
                                    ? new Date(row.scannedAt as string).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                                    : row.claimedAt
                                    ? new Date(row.claimedAt as string).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                                    : row.createdAt
                                    ? new Date(row.createdAt as string).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                                    : ""}
                                </p>
                              </div>
                            </div>
                            
                            {!!row.status && (
                              <div className={cn(
                                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                                row.status === "PENDING"
                                  ? "bg-warning/10 border-warning/20 text-warning"
                                  : row.status === "REDEEMED"
                                  ? "bg-success/10 border-success/20 text-success"
                                  : "bg-white/5 border-white/10 text-text-tertiary"
                              )}>
                                {String(row.status)}
                              </div>
                            )}
                            
                            <ChevronRight size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
               <div className="relative">
                  <div className="w-12 h-12 rounded-full border-t-2 border-violet-default animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-violet-default/20 animate-pulse" />
                  </div>
               </div>
               <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest animate-pulse">Synchronisation...</p>
            </div>
          )}
        </div>
        
        {/* Footer actions */}
        <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-white/5 bg-white/2 backdrop-blur-xl">
           <Button className="w-full h-14 bg-violet-default hover:bg-violet-hover text-white font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98] text-sm tracking-wide">
              Optimiser cette étape du parcours
           </Button>
        </div>
      </div>
    </>
  );
}

