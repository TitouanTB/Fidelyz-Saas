export const FONT_PAIRS = {
  PLAYFAIR_INTER: { title: 'Playfair Display', body: 'Inter' },
  MONTSERRAT_OPENSANS: { title: 'Montserrat', body: 'Open Sans' },
  LORA_LATO: { title: 'Lora', body: 'Lato' },
  CORMORANT_RALEWAY: { title: 'Cormorant Garamond', body: 'Raleway' },
  OSWALD_SOURCESANS: { title: 'Oswald', body: 'Source Sans Pro' },
  NUNITO_LATO: { title: 'Nunito', body: 'Lato' },
} as const;

export type FontPairId = keyof typeof FONT_PAIRS;
