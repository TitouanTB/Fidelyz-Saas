export const TEMPLATES = {
  ELEGANT: {
    id: 'ELEGANT',
    name: 'Élégant',
    restaurantTypes: ['GASTRO', 'BRASSERIE'],
    heroStyle: 'fullscreen_dark_overlay',
    layout: 'centered',
    defaultPalette: 'CHARBON_OR',
    defaultFonts: 'PLAYFAIR_INTER',
  },
  MODERNE: {
    id: 'MODERNE',
    name: 'Moderne',
    restaurantTypes: ['BAR', 'CAFE'],
    heroStyle: 'split_image_text',
    layout: 'asymmetric',
    defaultPalette: 'ARDOISE_TERRACOTTA',
    defaultFonts: 'MONTSERRAT_OPENSANS',
  },
  CHALEUREUX: {
    id: 'CHALEUREUX',
    name: 'Chaleureux',
    restaurantTypes: ['PIZZERIA', 'OTHER'],
    heroStyle: 'warm_gradient',
    layout: 'centered',
    defaultPalette: 'ROUGE_CREME',
    defaultFonts: 'NUNITO_LATO',
  },
  MINIMALISTE: {
    id: 'MINIMALISTE',
    name: 'Minimaliste',
    restaurantTypes: ['FAST_FOOD'],
    heroStyle: 'bold_typography',
    layout: 'grid',
    defaultPalette: 'ANTHRACITE_ROUGE',
    defaultFonts: 'OSWALD_SOURCESANS',
  },
  TRADITIONNEL: {
    id: 'TRADITIONNEL',
    name: 'Traditionnel',
    restaurantTypes: ['BRASSERIE'],
    heroStyle: 'vintage_frame',
    layout: 'editorial',
    defaultPalette: 'BORDEAUX_CREME',
    defaultFonts: 'LORA_RALEWAY',
  },
} as const;

export type TemplateId = keyof typeof TEMPLATES;
