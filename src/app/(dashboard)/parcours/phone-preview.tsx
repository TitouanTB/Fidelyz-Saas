"use client";

import { JourneyStage } from "./types";
import { JOURNEY_CONFIG, STAGE_COLORS } from "./config";
import { ScanLine, Zap, HandHeart, Bell, Repeat, MessageSquare, Gift, Clock, Star, ChevronRight } from "lucide-react";

interface PhonePreviewProps {
  selectedStage: JourneyStage | null;
}

const stageScreens: Record<JourneyStage, { title: string; content: string; icon: typeof ScanLine }> = {
  QR_SCAN: {
    title: "Scanner le QR Code",
    content: "Scannez le code QR sur votre reçu pour accumulatez des points",
    icon: ScanLine,
  },
  ACTIVATION: {
    title: "Activer ma carte",
    content: "Créez votre compte en quelques secondes et commencez à accumulates des points",
    icon: Zap,
  },
  WELCOME: {
    title: "Bienvenue !",
    content: "Merci de nous rejoindre ! Vous avez gagné 50 points de bienvenue",
    icon: HandHeart,
  },
  REMINDER_D3: {
    title: "On vous attend !",
    content: "Cela fait 3 jours depuis votre dernière visite. Voici 10 points oferta pour votre prochain passage",
    icon: Bell,
  },
  NEXT_VISIT: {
    title: "Merci de votre visite !",
    content: "Vous avez gagné 25 points ! Il ne vous faut que 5 visites pour votre prochaine récompense",
    icon: Repeat,
  },
  RELANCE_D21: {
    title: "Il nous manque",
    content: "Cela fait 21 jours depuis votre dernière visite. Voici un code promo -20% pour votre retour",
    icon: MessageSquare,
  },
  REWARD: {
    title: "Félicitations !",
    content: "Vous avez assez de points pour obtenir un dessert gratuit !",
    icon: Gift,
  },
  EXPIRATION: {
    title: "Points expirés",
    content: "Vos points non utilisés ont expiré. Mais ne worryez pas, vous pouvez recommencer !",
    icon: Clock,
  },
};

export function PhonePreview({ selectedStage }: PhonePreviewProps) {
  const stage = selectedStage || "WELCOME";
  const config = JOURNEY_CONFIG.find(c => c.stage === stage);
  const screen = stageScreens[stage];
  const colorName = STAGE_COLORS[stage];
  const Icon = screen.icon;

  return (
    <div className="flex items-start gap-8">
      {/* Phone Mockup */}
      <div className="relative w-[280px] h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
        {/* Phone Frame */}
        <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
          {/* Status Bar */}
          <div className="h-12 bg-gray-50 border-b flex items-center justify-between px-6">
            <div className="text-xs font-medium">9:41</div>
            <div className="flex gap-1">
              <div className="w-4 h-2.5 bg-gray-800 rounded-sm" />
              <div className="w-0.5 h-2.5 bg-gray-800" />
            </div>
          </div>

          {/* App Header */}
          <div className={`bg-${colorName}-500 px-4 py-4`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <span className={`text-${colorName}-600 font-bold text-lg`}>F</span>
              </div>
              <div className="text-white">
                <p className="font-semibold text-sm">Fidelyz</p>
                <p className="text-xs opacity-80">Carte de fidélité</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={`p-4 bg-${colorName}-50 min-h-[300px]`}>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className={`w-16 h-16 bg-${colorName}-100 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`w-8 h-8 text-${colorName}-600`} />
              </div>
              <h3 className={`text-lg font-semibold text-center text-${colorName}-700 mb-2`}>
                {screen.title}
              </h3>
              <p className="text-sm text-gray-600 text-center">
                {screen.content}
              </p>
            </div>

            {/* Points Card */}
            <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Vos points</p>
                  <p className="text-2xl font-bold text-gray-900">125</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full bg-${colorName}-500 rounded-full`} style={{ width: "25%" }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">75 points jusqu'à votre prochaine récompense</p>
            </div>

            {/* CTA Button */}
            <button className={`mt-4 w-full py-3 bg-${colorName}-500 text-white font-medium rounded-xl`}>
              Voir mes récompenses
            </button>
          </div>

          {/* Bottom Navigation */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around px-4">
            <div className={`w-10 h-10 bg-${colorName}-50 rounded-xl flex items-center justify-center`}>
              <Icon className={`w-5 h-5 text-${colorName}-600`} />
            </div>
            <div className="w-10 h-10 flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="w-10 h-10 flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-full" />
      </div>

      {/* Stage Selector */}
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Choisir l'étape à prévisualiser</h3>
        <div className="grid grid-cols-4 gap-2">
          {JOURNEY_CONFIG.map((config) => {
            const isSelected = stage === config.stage;
            const screenInfo = stageScreens[config.stage];
            const IconComponent = screenInfo.icon;

            return (
              <button
                key={config.stage}
                className={`p-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? `${config.borderColor} bg-${config.bgColor.split(' ')[0]}`
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`${config.iconBg} w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1`}>
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <p className={`text-xs font-medium ${isSelected ? config.color : "text-gray-600"}`}>
                  {config.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
