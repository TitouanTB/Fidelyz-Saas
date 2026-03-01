export const COLOR_PALETTES = {
  CHARBON_OR: { primary: '#1a1a1a', secondary: '#f5f0e8', accent: '#c9a84c' },
  BORDEAUX_CREME: { primary: '#6b2d3e', secondary: '#faf6f0', accent: '#d4a853' },
  ARDOISE_TERRACOTTA: { primary: '#3d4a5c', secondary: '#f8f4ef', accent: '#c17c5a' },
  VERT_FORET: { primary: '#2d4a3e', secondary: '#f5f2ea', accent: '#8fad6e' },
  MARINE_SABLE: { primary: '#1e3a5f', secondary: '#f5f0e2', accent: '#e8a87c' },
  ANTHRACITE_ROUGE: { primary: '#2c2c2c', secondary: '#fff5f5', accent: '#c0392b' },
  ROUGE_CREME: { primary: '#c0392b', secondary: '#fdf8f0', accent: '#f39c12' },
  OLIVE_BEIGE: { primary: '#5c6b3a', secondary: '#f9f6ee', accent: '#d4960a' },
} as const;

export type PaletteId = keyof typeof COLOR_PALETTES;
