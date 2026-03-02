import { useEffect } from 'react';
import { useEditorStore } from '@/store/editor-store';

interface UseAutosaveOptions {
  debounceMs?: number;
  intervalMs?: number;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAutosave(options: UseAutosaveOptions = {}) {
  const {
    debounceMs = 1000,
    intervalMs = 30000,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
  } = options;

  const {
    autosaveStatus,
    setAutosaveStatus,
    setLastSavedAt,
    setIsDirty,
    saveVersion,
    ...editorState
  } = useEditorStore();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    // Debounced autosave
    const performAutosave = async () => {
      if (autosaveStatus !== 'unsaved') return;

      try {
        onSaveStart?.();
        setAutosaveStatus('saving');

        const response = await fetch('/api/settings/autosave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editorState),
        });

        if (response.ok) {
          setLastSavedAt(new Date());
          setAutosaveStatus('saved');
          setIsDirty(false);
          onSaveSuccess?.();
        } else {
          throw new Error('Autosave failed');
        }
      } catch (error) {
        console.error('Autosave error:', error);
        setAutosaveStatus('unsaved');
        onSaveError?.(error as Error);
      }
    };

    // Set up debounced save
    if (autosaveStatus === 'unsaved') {
      timeoutId = setTimeout(() => {
        performAutosave();
      }, debounceMs);
    }

    // Set up periodic save
    intervalId = setInterval(() => {
      performAutosave();
      saveVersion();
    }, intervalMs);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [
    autosaveStatus,
    setAutosaveStatus,
    setLastSavedAt,
    setIsDirty,
    saveVersion,
    editorState,
    debounceMs,
    intervalMs,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
  ]);

  return {
    autosaveStatus,
    lastSavedAt: useEditorStore((state) => state.lastSavedAt),
  };
}
