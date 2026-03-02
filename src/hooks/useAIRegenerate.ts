import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useEditorStore } from '@/store/editor-store';

export function useAIRegenerate() {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const setPartialState = useEditorStore((state) => state.setPartialState);

  const regenerate = useCallback(async (section: string, context?: Record<string, unknown>) => {
    setIsRegenerating(true);
    setCurrentSection(section);

    try {
      const response = await fetch('/api/onboarding/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('Regeneration failed');
      }

      const data = await response.json();
      setPartialState(data.data);
      toast.success(`Section "${section}" régénérée avec succès`);
      return data.data;
    } catch (error) {
      console.error('Regeneration error:', error);
      toast.error('Échec de la régénération');
      throw error;
    } finally {
      setIsRegenerating(false);
      setCurrentSection(null);
    }
  }, [setPartialState]);

  return {
    regenerate,
    isRegenerating,
    currentSection,
  };
}
