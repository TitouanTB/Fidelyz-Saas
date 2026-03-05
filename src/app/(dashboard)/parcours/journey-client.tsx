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
  Clock 
} from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parcours Client</h1>
          <p className="text-gray-500 text-sm mt-1">
            Visualisez le parcours complet de vos clients
          </p>
        </div>
        <button
          onClick={() => fetchStats()}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Chargement..." : "Actualiser"}
        </button>
      </div>

      {/* Desktop Timeline */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
          
          <div className="grid grid-cols-8 gap-4 relative">
            {JOURNEY_CONFIG.map((config, index) => {
              const stat = stats.find(s => s.stage === config.stage);
              const Icon = icons[config.stage];
              
              return (
                <div key={config.stage} className="relative">
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
      <div className="lg:hidden space-y-4">
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
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aperçu Mobile</h2>
        <PhonePreview selectedStage={selectedStage} />
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
