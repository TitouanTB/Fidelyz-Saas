// Templates
export { TEMPLATES, type TemplateId } from './templates';

// Palettes
export { COLOR_PALETTES, type PaletteId } from './palettes';

// Fonts
export { FONT_PAIRS, type FontPairId } from './fonts';

// Constraints
export { TEXT_CONSTRAINTS, type TextConstraintKey } from './constraints';

// Default texts
export { DEFAULT_TEXTS, type RestaurantType } from './default-texts';

// Helpers
export { getDefaultTemplateForType, truncateText, expandText, hasSufficientContrast } from './helpers';

// Validation
export { validateGeneratedContent, isValidRestaurantType, type GeneratedContent } from './validate';
