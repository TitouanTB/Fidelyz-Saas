"use client";

import { useEffect } from "react";

interface PushSubscriberProps {
  organizationId?: string;
  customerId?: string;
}

export function PushSubscriber({ organizationId, customerId }: PushSubscriberProps) {
  useEffect(() => {
    const initOneSignal = async () => {
      if (typeof window === "undefined" || !window.OneSignal) return;

      try {
        const OneSignal = window.OneSignal;
        
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "",
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: false,
          },
        });

        if (organizationId) {
          OneSignal.sendTag("organization_id", organizationId);
        }

        if (customerId) {
          OneSignal.sendTag("customer_id", customerId);
        }
      } catch (error) {
        console.error("OneSignal initialization error:", error);
      }
    };

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    script.onload = initOneSignal;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src*="OneSignalSDK"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [organizationId, customerId]);

  return null;
}
