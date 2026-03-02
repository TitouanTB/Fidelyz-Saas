'use client';

import { Monitor, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useEditorStore } from '@/store/editor-store';

export function PreviewPane() {
  const [isOpen, setIsOpen] = useState(true);
  const previewMode = useEditorStore((state) => state.previewMode);
  const setPreviewMode = useEditorStore((state) => state.setPreviewMode);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
      >
        <Monitor className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-4 bg-gray-900 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <h2 className="text-white font-semibold">Aperçu en temps réel</h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-700 rounded-lg p-1">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
              className={previewMode === 'desktop' ? 'bg-purple-600 text-white' : 'text-gray-300'}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Desktop
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
              className={previewMode === 'mobile' ? 'bg-purple-600 text-white' : 'text-gray-300'}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 bg-gray-100 p-4 flex items-center justify-center overflow-hidden">
        <div
          className={`bg-white shadow-2xl transition-all duration-300 ${
            previewMode === 'mobile'
              ? 'w-[375px] h-[812px] rounded-3xl overflow-hidden'
              : 'w-full h-full rounded-lg overflow-hidden'
          }`}
        >
          {/* Preview iframe content will be here */}
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
            <Monitor className="h-16 w-16 mb-4" />
            <p className="text-sm">Prévisualisation du mini-site</p>
            <p className="text-xs mt-2">
              Le contenu se met à jour en temps réel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
