'use client';

import { Clock, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

interface Version {
  id: string;
  timestamp: Date;
  data: unknown;
  description?: string;
}

interface HistoryTimelineProps {
  versions: Version[];
  currentVersionIndex: number;
  onRestore: (index: number) => void;
  onDelete?: (index: number) => void;
}

export function HistoryTimeline({
  versions,
  currentVersionIndex,
  onRestore,
  onDelete,
}: HistoryTimelineProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Clock className="h-4 w-4" />
          Historique ({versions.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Historique des versions</DialogTitle>
          <DialogDescription>
            Les 10 dernières versions sont sauvegardées automatiquement
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {versions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Aucune version sauvegardée
              </p>
            ) : (
              versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    index === currentVersionIndex
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">
                          Version {index + 1}
                        </span>
                        {index === currentVersionIndex && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            Actuelle
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {version.description || 'Sauvegarde automatique'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(version.timestamp), "dd MMM yyyy 'à' HH:mm")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {index !== currentVersionIndex && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onRestore(index)}
                          title="Restaurer cette version"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => onDelete(index)}
                          title="Supprimer cette version"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
