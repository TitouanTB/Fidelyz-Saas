"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";

interface CustomerPortalButtonProps {
  organizationId: string;
  hasCustomerId: boolean;
}

export function CustomerPortalButton({
  organizationId,
  hasCustomerId,
}: CustomerPortalButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleOpenPortal = async () => {
    if (!hasCustomerId) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        console.error("Portal error:", data.error);
      }
    } catch (error) {
      console.error("Portal error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleOpenPortal}
      disabled={loading || !hasCustomerId}
      variant="outline"
      size="sm"
    >
      {loading ? (
        <Loader2 size={16} className="mr-2 animate-spin" />
      ) : (
        <ExternalLink size={16} className="mr-2" />
      )}
      {loading ? "Loading..." : "Open Customer Portal"}
    </Button>
  );
}
