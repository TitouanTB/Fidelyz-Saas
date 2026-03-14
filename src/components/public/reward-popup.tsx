"use client";

import { useState, useEffect } from "react";
import { Gift, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RewardPopupProps {
  slug: string;
  primaryColor: string;
  rewardName?: string;
  delay?: number;
}

export function RewardPopup({
  slug,
  primaryColor,
  rewardName = "Obtenez votre récompense !",
  delay = 5000,
}: RewardPopupProps) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`reward-popup-dismissed-${slug}`);
    if (dismissed) return;

    const timer = setTimeout(() => {
      setShowPopup(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [slug, delay]);

  const handleDismiss = () => {
    setShowPopup(false);
    localStorage.setItem(`reward-popup-dismissed-${slug}`, "true");
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
      <div
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: primaryColor + "20" }}
          >
            <Gift className="w-8 h-8" style={{ color: primaryColor } as React.CSSProperties} />
          </div>

          <h3 className="text-xl font-bold text-gray-900">🎉 {rewardName}</h3>
          <p className="text-gray-600 mt-2 text-sm">
            Inscrivez-vous au programme de fidélité et bénéficiez de récompenses exclusives
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link href={`/r/${slug}`} className="w-full">
              <Button
                className="w-full"
                style={{ backgroundColor: primaryColor }}
              >
                Obtenir ma récompense
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleDismiss} className="w-full">
              Plus tard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
