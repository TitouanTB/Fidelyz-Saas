export const TEXT_CONSTRAINTS = {
  heroHeadline: { min: 20, max: 55 },
  heroSubtitle: { min: 60, max: 140 },
  aboutTitle: { min: 10, max: 40 },
  aboutParagraph1: { min: 150, max: 280 },
  aboutParagraph2: { min: 100, max: 220 },
  specialtyName: { min: 3, max: 40 },
  specialtyDescription: { min: 30, max: 90 },
  ctaPrimary: { min: 8, max: 30 },
  ctaSecondary: { min: 8, max: 25 },
  rewardDescription: { min: 20, max: 80 },
} as const;

export type TextConstraintKey = keyof typeof TEXT_CONSTRAINTS;
