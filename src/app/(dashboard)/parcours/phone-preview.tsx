"use client";

import { JourneyStage } from "./types";
import { JOURNEY_CONFIG, STAGE_COLORS } from "./config";
import { ScanLine, Zap, HandHeart, Bell, Repeat, MessageSquare, Gift, Clock, Star, ChevronRight, Signal, Wifi, Battery, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhonePreviewProps {
  selectedStage: JourneyStage | null;
}

const stageScreens: Record<JourneyStage, { title: string; content: string; icon: typeof ScanLine }> = {
  QR_SCAN: {
    title: "Scanner le QR Code",
    content: "Scannez le code QR sur votre reçu pour cumuler vos points instantanément.",
    icon: ScanLine,
  },
  ACTIVATION: {
    title: "Activer ma carte",
    content: "Rejoignez le club Fidelyz et commencez à débloquer vos paliers de récompenses.",
    icon: Zap,
  },
  WELCOME: {
    title: "Bienvenue !",
    content: "Heureux de vous voir ! Un bonus exclusif vous attend pour votre première visite.",
    icon: HandHeart,
  },
  REMINDER_D3: {
    title: "On vous attend !",
    content: "Votre café préféré vous manque ? Revenez nous voir et doublez vos points aujourd'hui.",
    icon: Bell,
  },
  NEXT_VISIT: {
    title: "Merci de votre visite !",
    content: "Points crédités avec succès ! Encore quelques visites pour votre prochaine offre.",
    icon: Repeat,
  },
  RELANCE_D21: {
    title: "Vous nous manquez",
    content: "On ne vous a pas vu depuis un moment. Voici un petit cadeau pour fêter votre retour.",
    icon: MessageSquare,
  },
  REWARD: {
    title: "Félicitations !",
    content: "Vous avez atteint le palier Or ! Votre récompense est prête à être activée.",
    icon: Gift,
  },
  EXPIRATION: {
    title: "Points expirés",
    content: "Certains points ont expiré, mais de nouvelles opportunités de gain sont disponibles !",
    icon: Clock,
  },
};

export function PhonePreview({ selectedStage }: PhonePreviewProps) {
  const stage = selectedStage || "WELCOME";
  const screen = stageScreens[stage];
  const Icon = screen.icon;

  return (
    <div className="flex flex-col xl:flex-row items-center xl:items-start gap-12 w-full">
      {/* Phone Mockup */}
      <div className="relative w-[300px] h-[610px] bg-[#0c0c0e] rounded-[3.5rem] p-3 shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10 ring-1 ring-white/5">
        {/* Inner Frame */}
        <div className="w-full h-full bg-[#111114] rounded-[2.8rem] overflow-hidden relative flex flex-col border border-white/5">
          {/* Status Bar */}
          <div className="h-10 flex items-center justify-between px-8 pt-2">
            <div className="text-[10px] font-bold text-text-primary">9:41</div>
            <div className="flex items-center gap-1.5 opacity-60">
              <Signal size={12} className="text-text-primary" />
              <Wifi size={12} className="text-text-primary" />
              <Battery size={12} className="text-text-primary" />
            </div>
          </div>

          {/* App Header */}
          <div className="px-6 py-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-default rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(147,23,253,0.3)]">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <p className="font-bold text-sm text-text-primary font-heading">Fidelyz</p>
                <p className="text-[10px] text-text-tertiary font-medium">Programme Membre</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 space-y-5 flex flex-col pt-8">
            <div className="glass-surface rounded-2xl p-6 border border-white/5 bg-white/2">
              <div className="w-14 h-14 bg-violet-default/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-violet-default/20">
                <Icon className="w-7 h-7 text-violet-default" />
              </div>
              <h3 className="text-lg font-bold text-center text-text-primary mb-2 font-heading tracking-tight">
                {screen.title}
              </h3>
              <p className="text-xs text-text-secondary text-center leading-relaxed">
                {screen.content}
              </p>
            </div>

            {/* Points Card */}
            <div className="glass-surface rounded-2xl p-5 border border-white/5 bg-violet-default/[0.03] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-violet-default blur-3xl opacity-10" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Points Fidélité</p>
                  <p className="text-3xl font-bold text-text-primary font-heading mt-1">1,250</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-violet-default/10 flex items-center justify-center border border-violet-default/20">
                  <Star className="w-5 h-5 text-violet-default fill-violet-default/20" />
                </div>
              </div>
              <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-violet-default rounded-full shadow-[0_0_10px_rgba(147,23,253,0.5)]" style={{ width: "65%" }} />
              </div>
              <p className="text-[9px] text-text-tertiary mt-2 font-medium">Encore 250 points pour le palier Platinium</p>
            </div>

            <div className="flex-1" />

            {/* CTA Button */}
            <button className="w-full h-12 bg-violet-default hover:bg-violet-hover text-white text-xs font-bold rounded-xl shadow-[0_10px_20px_rgba(147,23,253,0.3)] transition-all active:scale-95 uppercase tracking-widest">
              Gérer mon profil
            </button>
          </div>

          {/* Bottom Navigation */}
          <div className="h-20 border-t border-white/5 flex items-center justify-around px-8 bg-white/2 backdrop-blur-md">
            <div className="w-10 h-10 bg-violet-default/10 rounded-xl flex items-center justify-center border border-violet-default/20">
              <Icon className="w-5 h-5 text-violet-default" />
            </div>
            <div className="w-10 h-10 flex items-center justify-center opacity-40">
              <Gift className="w-5 h-5 text-text-tertiary" />
            </div>
            <div className="w-10 h-10 flex items-center justify-center opacity-40">
              <Users className="w-5 h-5 text-text-tertiary" />
            </div>
          </div>
          
          {/* Bottom Handle */}
          <div className="h-6 flex justify-center items-end pb-2">
            <div className="w-20 h-1 bg-white/20 rounded-full" />
          </div>
        </div>

        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#0c0c0e] rounded-full" />
      </div>

      {/* Stage Selector */}
      <div className="flex-1 w-full sm:w-auto">
        <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.2em] mb-6">Cycle de vie client</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-2 gap-3">
          {JOURNEY_CONFIG.map((config) => {
            const isSelected = stage === config.stage;
            const screenInfo = stageScreens[config.stage];
            const IconComponent = screenInfo.icon;

            return (
              <button
                key={config.stage}
                onClick={() => {}} // Controlled from parent
                className={cn(
                  "p-4 rounded-2xl border transition-all text-left group",
                  isSelected
                    ? "bg-violet-default/10 border-violet-default/30 shadow-[0_0_20px_rgba(147,23,253,0.1)]"
                    : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                  config.iconBg
                )}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <p className={cn(
                  "text-xs font-bold font-heading transition-colors",
                  isSelected ? "text-text-primary" : "text-text-secondary"
                )}>
                  {config.title}
                </p>
                <p className="text-[10px] text-text-tertiary mt-1 font-medium group-hover:text-text-secondary transition-colors">Prévisualiser l'écran</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

