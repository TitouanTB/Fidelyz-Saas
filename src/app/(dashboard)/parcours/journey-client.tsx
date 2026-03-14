"use client";

import { useState, useEffect, useCallback } from "react";
import { JourneyStage, JourneyStats, JOURNEY_CONFIG } from "./config";
import { JourneyBlock } from "./journey-block";
import { JourneySlideOver } from "./journey-slide-over";
import { PhonePreview } from "./phone-preview";
import { 
  ScanLine, 
  Zap, 
  HandHeart, 
  Bell, 
  Repeat, 
  MessageSquare, 
  Gift, 
  Clock,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface JourneyPageClientProps {
  initialStats: JourneyStats[];
}

export function JourneyPageClient({ initialStats }: JourneyPageClientProps) {
  const [stats, setStats] = useState<JourneyStats[]>(initialStats);
  const [selectedStage, setSelectedStage] = useState<JourneyStage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stageDetails, setStageDetails] = useState<Record<string, unknown> | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/parcours");
      const data = await response.json();
      if (data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStageClick = async (stage: JourneyStage) => {
    setSelectedStage(stage);
    setIsSlideOverOpen(true);
    
    try {
      const response = await fetch(`/api/parcours/${stage}`);
      const data = await response.json();
      if (data.data) {
        setStageDetails(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stage details:", error);
    }
  };

  const handleSimulate = async (stage: JourneyStage) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/parcours/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage })
      });
      const data = await response.json();
      if (data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to simulate:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const icons = {
    QR_SCAN: ScanLine,
    ACTIVATION: Zap,
    WELCOME: HandHeart,
    REMINDER_D3: Bell,
    NEXT_VISIT: Repeat,
    RELANCE_D21: MessageSquare,
    REWARD: Gift,
    EXPIRATION: Clock,
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-text-primary tracking-tight">Parcours Client</h1>
          <p className="text-text-secondary text-base mt-2">
            Visualisez et optimisez le cycle de vie complet de vos membres.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchStats()}
          disabled={isLoading}
          className="bg-white/5 border-white/10 hover:bg-white/10 text-text-primary gap-2"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          {isLoading ? "Chargement..." : "Actualiser les données"}
        </Button>
      </div>

      {/* Desktop Timeline */}
      <div className="hidden lg:block">
        <div className="relative pt-10 pb-20">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-[5%] right-[5%] h-[2px] bg-gradient-to-r from-violet-default/20 via-violet-default/50 to-violet-default/20 -translate-y-1/2 blur-[0.5px]" />
          
          <div className="grid grid-cols-8 gap-4 relative">
            {JOURNEY_CONFIG.map((config, index) => {
              const stat = stats.find(s => s.stage === config.stage);
              const Icon = icons[config.stage];
              
              return (
                <div key={config.stage} className="relative z-10">
                  <JourneyBlock
                    config={config}
                    stat={stat}
                    icon={Icon}
                    onClick={() => handleStageClick(config.stage)}
                    onSimulate={() => handleSimulate(config.stage)}
                    index={index}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Timeline */}
      <div className="lg:hidden space-y-6 relative">
         <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-violet-default/50 to-transparent" />
        {JOURNEY_CONFIG.map((config, index) => {
          const stat = stats.find(s => s.stage === config.stage);
          const Icon = icons[config.stage];
          
          return (
            <JourneyBlock
              key={config.stage}
              config={config}
              stat={stat}
              icon={Icon}
              onClick={() => handleStageClick(config.stage)}
              onSimulate={() => handleSimulate(config.stage)}
              index={index}
              isMobile
            />
          );
        })}
      </div>

      {/* Phone Preview */}
      <div className="pt-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-violet-default/10 rounded-xl flex items-center justify-center">
             <MessageSquare className="text-violet-default" size={20} />
          </div>
          <h2 className="text-xl font-bold font-heading text-text-primary">Aperçu de l'expérience membre</h2>
        </div>
        
        <div className="glass-surface p-12 rounded-3xl border border-white/5 flex justify-center bg-[radial-gradient(circle_at_center,_var(--violet-glow)_0%,_transparent_70%)]">
           <PhonePreview selectedStage={selectedStage} />
        </div>
      </div>

      {/* Slide Over */}
      <JourneySlideOver
        isOpen={isSlideOverOpen}
        onClose={() => {
          setIsSlideOverOpen(false);
          setSelectedStage(null);
          setStageDetails(null);
        }}
        stage={selectedStage}
        details={stageDetails}
        stats={stats.find(s => s.stage === selectedStage)}
      />
    </div>
  );
}

