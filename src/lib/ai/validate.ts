import { TEMPLATES, type TemplateId } from './templates';
import { COLOR_PALETTES, type PaletteId } from './palettes';
import { FONT_PAIRS, type FontPairId } from './fonts';
import { TEXT_CONSTRAINTS, type TextConstraintKey } from './constraints';
import { getDefaultTemplateForType, truncateText, hasSufficientContrast } from './helpers';
import type { RestaurantType } from './default-texts';

export interface GeneratedContent {
  template: TemplateId;
  palette: PaletteId;
  fonts: FontPairId;
  primary: string;
  secondary: string;
  heroHeadline?: string;
  heroSubtitle?: string;
  aboutTitle?: string;
  aboutParagraph1?: string;
  aboutParagraph2?: string;
  specialtyName?: string;
  specialtyDescription?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  rewardDescription?: string;
  [key: string]: string | undefined;
}

export function validateGeneratedContent(
  content: GeneratedContent,
  restaurantType: string
): GeneratedContent {
  const validatedContent = { ...content };

  // 1. Valider template
  if (!TEMPLATES[validatedContent.template]) {
    validatedContent.template = getDefaultTemplateForType(restaurantType);
  }

  const template = TEMPLATES[validatedContent.template];

  // 2. Valider palette
  if (!COLOR_PALETTES[validatedContent.palette]) {
    validatedContent.palette = template.defaultPalette as PaletteId;
  }

  // 3. Valider polices
  if (!FONT_PAIRS[validatedContent.fonts]) {
    validatedContent.fonts = template.defaultFonts as FontPairId;
  }

  // 4. Valider et corriger longueurs textes
  for (const [field, constraint] of Object.entries(TEXT_CONSTRAINTS)) {
    const fieldValue = validatedContent[field as TextConstraintKey];
    if (fieldValue && (fieldValue.length < constraint.min || fieldValue.length > constraint.max)) {
      if (fieldValue.length > constraint.max) {
        validatedContent[field as TextConstraintKey] = truncateText(fieldValue, constraint.max - 3);
      }
      // If too short, we keep the text as-is since we can't meaningfully expand it
      // The AI should have generated appropriate length content
    }
  }

  // 5. Valider contraste primary/secondary
  if (!hasSufficientContrast(validatedContent.primary, validatedContent.secondary)) {
    const defaultPalette = COLOR_PALETTES[template.defaultPalette as PaletteId];
    validatedContent.primary = defaultPalette.primary;
    validatedContent.secondary = defaultPalette.secondary;
    validatedContent.palette = template.defaultPalette as PaletteId;
  }

  return validatedContent;
}

export function isValidRestaurantType(type: string): type is RestaurantType {
  return ['GASTRO', 'BRASSERIE', 'BAR', 'CAFE', 'PIZZERIA', 'FAST_FOOD', 'OTHER'].includes(type);
}
