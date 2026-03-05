import { JourneyStage } from "@/app/(dashboard)/parcours/types";

export interface JourneyConfig {
  stage: JourneyStage;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
}

export const JOURNEY_CONFIG: JourneyConfig[] = [
  {
    stage: "QR_SCAN",
    title: "Scan QR",
    description: "Client scanne le QR code de fidélité",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    iconBg: "bg-indigo-500",
  },
  {
    stage: "ACTIVATION",
    title: "Activation",
    description: "Création du compte et première activation",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    iconBg: "bg-violet-500",
  },
  {
    stage: "WELCOME",
    title: "Welcome",
    description: "Message de bienvenue personnalisé",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    iconBg: "bg-cyan-500",
  },
  {
    stage: "REMINDER_D3",
    title: "Rappel J+3",
    description: "Relance 3 jours après l'inscription",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    iconBg: "bg-amber-500",
  },
  {
    stage: "NEXT_VISIT",
    title: "Visite suivante",
    description: "Incitatif pour la prochaine visite",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    iconBg: "bg-emerald-500",
  },
  {
    stage: "RELANCE_D21",
    title: "Relance J+21",
    description: "Relance client inactif après 21 jours",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    iconBg: "bg-orange-500",
  },
  {
    stage: "REWARD",
    title: "Récompense",
    description: "Attribution et utilisation des récompenses",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    iconBg: "bg-rose-500",
  },
  {
    stage: "EXPIRATION",
    title: "Expiration",
    description: "Points expirés ou programme terminé",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconBg: "bg-red-500",
  },
];

export const STAGE_COLORS: Record<JourneyStage, string> = {
  QR_SCAN: "indigo",
  ACTIVATION: "violet",
  WELCOME: "cyan",
  REMINDER_D3: "amber",
  NEXT_VISIT: "emerald",
  RELANCE_D21: "orange",
  REWARD: "rose",
  EXPIRATION: "red",
};
