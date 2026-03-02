'use client';

import { useEffect, useState } from 'react';
import { Save, CheckCircle2, Loader2 } from 'lucide-react';

interface AutosaveIndicatorProps {
  status: 'saved' | 'saving' | 'unsaved';
  lastSavedAt: Date | null;
}

export function AutosaveIndicator({ status, lastSavedAt }: AutosaveIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    function updateTimeAgo() {
      if (!lastSavedAt) {
        setTimeAgo('');
        return;
      }

      const now = new Date();
      const diff = Math.floor((now.getTime() - lastSavedAt.getTime()) / 1000);

      if (diff < 60) {
        setTimeAgo(`il y a ${diff}s`);
      } else if (diff < 3600) {
        setTimeAgo(`il y a ${Math.floor(diff / 60)}min`);
      } else if (diff < 86400) {
        setTimeAgo(`il y a ${Math.floor(diff / 3600)}h`);
      } else {
        setTimeAgo(`il y a ${Math.floor(diff / 86400)}j`);
      }
    }

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastSavedAt]);

  return (
    <div className="flex items-center gap-2 text-sm">
      {status === 'saving' && (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Sauvegarde...</span>
        </div>
      )}
      {status === 'saved' && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span>
            Sauvegardé {timeAgo && <span className="font-medium">{timeAgo}</span>}
          </span>
        </div>
      )}
      {status === 'unsaved' && (
        <div className="flex items-center gap-2 text-gray-500">
          <Save className="h-4 w-4" />
          <span>Modifications non sauvegardées</span>
        </div>
      )}
    </div>
  );
}
