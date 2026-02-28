"use client";

import { Gift, ChevronRight } from "lucide-react";
import Link from "next/link";

interface StickyRewardBannerProps {
  slug: string;
  primaryColor: string;
  rewardName?: string;
  pointsRequired?: number;
}

export function StickyRewardBanner({
  slug,
  primaryColor,
  rewardName = "Récompense disponible",
  pointsRequired,
}: StickyRewardBannerProps) {
  return (
    <Link
      href={`/r/${slug}`}
      className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 shadow-lg hover:opacity-95 transition-opacity"
      style={{ background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}cc)` }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-sm">{rewardName}</p>
            {pointsRequired !== undefined && (
              <p className="text-xs text-white/80">{pointsRequired} points</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium">
          <span>Obtenir</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
