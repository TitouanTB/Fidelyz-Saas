'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionCollapsibleProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onRegenerate?: () => void;
  regenerateLabel?: string;
  isLoading?: boolean;
}

export function SectionCollapsible({
  title,
  icon,
  children,
  defaultOpen = false,
  onRegenerate,
  regenerateLabel = "Régénérer avec l'IA",
  isLoading = false,
}: SectionCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              onClick={(e) => {
                e.stopPropagation();
                onRegenerate();
              }}
              disabled={isLoading}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              {isLoading ? 'Génération...' : regenerateLabel}
            </Button>
          )}
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-gray-500 transition-transform" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500 transition-transform" />
          )}
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 border-t border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
}
