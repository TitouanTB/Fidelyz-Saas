import { TEMPLATES, type TemplateId } from './templates';

export function getDefaultTemplateForType(type: string): TemplateId {
  const templates = Object.values(TEMPLATES) as Array<{ id: TemplateId; restaurantTypes: readonly string[] }>;
  const template = templates.find(t => t.restaurantTypes.includes(type));
  return template?.id || TEMPLATES.ELEGANT.id;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function expandText(text: string, minLength: number): string {
  if (text.length >= minLength) return text;
  // Add padding to reach minimum length
  const padding = ' '.repeat(minLength - text.length);
  return text + padding;
}

// Calculate relative luminance for contrast calculation
function getLuminance(hex: string): number {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function hasSufficientContrast(color1: string, color2: string, minRatio: number = 4.5): boolean {
  try {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const contrastRatio = (brightest + 0.05) / (darkest + 0.05);
    return contrastRatio >= minRatio;
  } catch {
    return false;
  }
}
