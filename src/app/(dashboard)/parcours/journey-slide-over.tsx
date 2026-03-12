"use client";

import { JourneyStage } from "./types";
import { JOURNEY_CONFIG, STAGE_COLORS } from "./config";
import { X } from "lucide-react";

interface JourneySlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  stage: JourneyStage | null;
  details: Record<string, unknown> | null;
  stats?: {
    stage: JourneyStage;
    count: number;
    rate: number;
  };
}

export function JourneySlideOver({
  isOpen,
  onClose,
  stage,
  details,
  stats,
}: JourneySlideOverProps) {
  if (!stage) return null;

  const config = JOURNEY_CONFIG.find(c => c.stage === stage);
  if (!config) return null;

  const colorName = STAGE_COLORS[stage];

  const getRecentItems = (d: Record<string, unknown>): Record<string, unknown>[] | null => {
    const val =
      d.recentScans ??
      d.recentActivations ??
      d.recentWelcomeMessages ??
      d.customers ??
      d.recentVisits ??
      d.recentClaims ??
      d.recentExpirations;
    return Array.isArray(val) ? (val as Record<string, unknown>[]) : null;
  };

  const SKIPPED_KEYS = new Set([
    "recentScans",
    "recentActivations",
    "recentWelcomeMessages",
    "customers",
    "recentVisits",
    "recentClaims",
    "recentExpirations",
  ]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Slide Over Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className={`bg-${colorName}-50 border-b border-${colorName}-200 px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`bg-${colorName}-500 w-10 h-10 rounded-xl flex items-center justify-center`}>
                <span className="text-white font-bold">{stats?.count ?? 0}</span>
              </div>
              <div>
                <h2 className={`text-lg font-semibold text-${colorName}-700`}>
                  {config.title}
                </h2>
                <p className={`text-sm text-${colorName}-600`}>
                  {config.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Stats Summary */}
          {stats && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500">Total</p>
                <p className={`text-xl font-bold text-${colorName}-600`}>
                  {stats.count}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500">Taux de conversion</p>
                <p className={`text-xl font-bold text-${colorName}-600`}>
                  {stats.rate}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100%-200px)]">
          {details ? (
            <div className="space-y-6">
              {/* Stats by Type */}
              {Object.entries(details)
                .filter(([key]) => !SKIPPED_KEYS.has(key))
                .map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof value === "number"
                        ? value.toLocaleString()
                        : String(value ?? "")}
                    </p>
                  </div>
                ))}

              {/* Recent Items */}
              {(() => {
                const items = getRecentItems(details);
                if (!items) return null;
                return (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Éléments récents
                    </h3>
                    <div className="space-y-2">
                      {items.length === 0 ? (
                        <p className="text-sm text-gray-500">Aucun élément</p>
                      ) : (
                        items.slice(0, 5).map((row, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {String(row.email ?? row.firstName ?? `Item ${idx + 1}`)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {row.scannedAt
                                  ? new Date(row.scannedAt as string).toLocaleDateString()
                                  : row.claimedAt
                                  ? new Date(row.claimedAt as string).toLocaleDateString()
                                  : row.createdAt
                                  ? new Date(row.createdAt as string).toLocaleDateString()
                                  : ""}
                              </p>
                            </div>
                            {!!row.status && (
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  row.status === "PENDING"
                                    ? "bg-amber-100 text-amber-700"
                                    : row.status === "REDEEMED"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {String(row.status)}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Empty State */}
              {Object.keys(details).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Aucune donnée disponible</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
