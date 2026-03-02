'use client';

import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  validateContrast?: boolean;
  backgroundColor?: string;
}

export function ColorPicker({
  label,
  value,
  onChange,
  validateContrast = false,
  backgroundColor = '#FFFFFF',
}: ColorPickerProps) {
  const [isValid, setIsValid] = useState(true);

  // Calculate luminance
  function getLuminance(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const { r, g, b } = rgb;
    const [rL, gL, bL] = [r, g, b].map((c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
  }

  // Calculate contrast ratio
  function getContrastRatio(color1: string, color2: string): number {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  function isValidHex(hex: string): boolean {
    return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let newValue = e.target.value;

    // Add # if missing
    if (!newValue.startsWith('#')) {
      newValue = '#' + newValue;
    }

    // Validate hex format
    if (!isValidHex(newValue)) {
      setIsValid(false);
      return;
    }

    setIsValid(true);

    // Validate contrast if required
    if (validateContrast) {
      const contrast = getContrastRatio(newValue, backgroundColor);
      // WCAG AA requires at least 4.5:1 for normal text
      const hasGoodContrast = contrast >= 4.5;

      if (hasGoodContrast) {
        onChange(newValue);
      } else {
        setIsValid(false);
      }
    } else {
      onChange(newValue);
    }
  }

  const contrastRatio = validateContrast ? getContrastRatio(value, backgroundColor) : 0;
  const contrastLabel = validateContrast ? `Contraste: ${contrastRatio.toFixed(2)}:1` : '';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={`color-${label}`}>{label}</Label>
        {validateContrast && contrastRatio > 0 && contrastRatio < 4.5 && (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle className="h-3 w-3" />
            {contrastLabel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <input
            id={`color-${label}`}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer overflow-hidden"
          />
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              backgroundColor: value,
              mixBlendMode: 'multiply',
            }}
          />
        </div>
        <div className="flex-1">
          <Input
            type="text"
            value={value}
            onChange={handleChange}
            className={`font-mono text-sm ${!isValid ? 'border-red-500 focus:border-red-500' : ''}`}
            placeholder="#000000"
            maxLength={7}
          />
          {!isValid && (
            <p className="text-xs text-red-600 mt-1">
              {validateContrast
                ? 'Contraste insuffisant (min 4.5:1)'
                : 'Format invalide (ex: #9317FD)'}
            </p>
          )}
        </div>
      </div>
      {validateContrast && contrastRatio >= 4.5 && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <Check className="h-3 w-3" />
          {contrastLabel} - Bon
        </div>
      )}
    </div>
  );
}
