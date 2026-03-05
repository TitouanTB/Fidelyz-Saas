export type JourneyStage = 
  | "QR_SCAN"
  | "ACTIVATION"
  | "WELCOME"
  | "REMINDER_D3"
  | "NEXT_VISIT"
  | "RELANCE_D21"
  | "REWARD"
  | "EXPIRATION";

export interface JourneyStats {
  stage: JourneyStage;
  count: number;
  rate: number;
}
