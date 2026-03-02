'use client';

import { Check } from 'lucide-react';

const templates = [
  {
    id: 'modern',
    name: 'Moderne',
    description: 'Design épuré et contemporain',
    preview: '/templates/modern-preview.png',
  },
  {
    id: 'classic',
    name: 'Classique',
    description: 'Style intemporel et élégant',
    preview: '/templates/classic-preview.png',
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Couleurs vives et dynamiques',
    preview: '/templates/vibrant-preview.png',
  },
  {
    id: 'minimal',
    name: 'Minimaliste',
    description: 'Ligne claire et épurée',
    preview: '/templates/minimal-preview.png',
  },
  {
    id: 'cozy',
    name: 'Chaleureux',
    description: 'Atmosphère accueillante',
    preview: '/templates/cozy-preview.png',
  },
];

const palettes = [
  {
    id: 'violet',
    name: 'Violet',
    colors: ['#9317FD', '#E879F9', '#FCD34D'],
  },
  {
    id: 'blue',
    name: 'Bleu',
    colors: ['#2563EB', '#60A5FA', '#93C5FD'],
  },
  {
    id: 'green',
    name: 'Vert',
    colors: ['#059669', '#34D399', '#6EE7B7'],
  },
  {
    id: 'orange',
    name: 'Orange',
    colors: ['#EA580C', '#FB923C', '#FDBA74'],
  },
  {
    id: 'red',
    name: 'Rouge',
    colors: ['#DC2626', '#F87171', '#FCA5A5'],
  },
  {
    id: 'teal',
    name: 'Turquoise',
    colors: ['#0D9488', '#2DD4BF', '#5EEAD4'],
  },
  {
    id: 'pink',
    name: 'Rose',
    colors: ['#DB2777', '#F472B6', '#F9A8D4'],
  },
  {
    id: 'custom',
    name: 'Personnalisé',
    colors: ['#000000', '#666666', '#CCCCCC'],
  },
];

const fontPairs = [
  {
    id: 'inter-poppins',
    name: 'Inter + Poppins',
    description: 'Moderne et lisible',
    preview: 'AB',
  },
  {
    id: 'playfair-lato',
    name: 'Playfair + Lato',
    description: 'Élégant et professionnel',
    preview: 'Aa',
  },
  {
    id: 'merriweather-opensans',
    name: 'Merriweather + Open Sans',
    description: 'Classique et équilibré',
    preview: 'Aa',
  },
  {
    id: 'montserrat-roboto',
    name: 'Montserrat + Roboto',
    description: 'Dynamique et moderne',
    preview: 'AB',
  },
  {
    id: 'raleway-open',
    name: 'Raleway + Open Sans',
    description: 'Léger et aéré',
    preview: 'Aa',
  },
  {
    id: 'lora-muli',
    name: 'Lora + Muli',
    description: 'Sérif et sans-serif',
    preview: 'Aa',
  },
];

interface TemplateSelectorProps {
  selectedTemplate: string;
  selectedPalette: string;
  selectedFonts: string;
  onTemplateChange: (template: string) => void;
  onPaletteChange: (palette: string) => void;
  onFontsChange: (fonts: string) => void;
}

export function TemplateSelector({
  selectedTemplate,
  selectedPalette,
  selectedFonts,
  onTemplateChange,
  onPaletteChange,
  onFontsChange,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Templates */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Template
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onTemplateChange(template.id)}
              className={`relative p-3 border-2 rounded-lg transition-all hover:shadow-md ${
                selectedTemplate === template.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-2 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">
                  {template.name[0]}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">{template.name}</p>
              <p className="text-xs text-gray-500">{template.description}</p>
              {selectedTemplate === template.id && (
                <Check className="absolute top-2 right-2 h-5 w-5 text-purple-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Color Palettes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Palette de couleurs
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {palettes.map((palette) => (
            <button
              key={palette.id}
              onClick={() => onPaletteChange(palette.id)}
              className={`relative p-3 border-2 rounded-lg transition-all hover:shadow-md ${
                selectedPalette === palette.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex gap-1 mb-2">
                {palette.colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 h-8 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-gray-900">{palette.name}</p>
              {selectedPalette === palette.id && (
                <Check className="absolute top-2 right-2 h-5 w-5 text-purple-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Font Pairs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Paire de polices
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {fontPairs.map((fonts) => (
            <button
              key={fonts.id}
              onClick={() => onFontsChange(fonts.id)}
              className={`relative p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                selectedFonts === fonts.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2 text-gray-800 font-sans">
                {fonts.preview}
              </div>
              <p className="text-sm font-medium text-gray-900">{fonts.name}</p>
              <p className="text-xs text-gray-500">{fonts.description}</p>
              {selectedFonts === fonts.id && (
                <Check className="absolute top-2 right-2 h-5 w-5 text-purple-600" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
