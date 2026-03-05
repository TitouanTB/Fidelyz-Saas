"use client";

import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface ServiceStatus {
  name: string;
  enabled: boolean;
  configured: boolean;
  error?: string;
}

interface HealthCheckData {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  environment: string;
  featureFlags: Record<string, boolean>;
  checks: Array<{
    status: "healthy" | "degraded" | "unhealthy";
    service: string;
    message?: string;
  }>;
}

interface ServicesAlertProps {
  className?: string;
}

export function ServicesAlert({ className }: ServicesAlertProps) {
  const [health, setHealth] = useState<HealthCheckData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        setHealth(data);
      } catch (error) {
        console.error("Failed to fetch health:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={`bg-gray-50 rounded-xl p-4 ${className}`}>
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-5 h-5 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  const hasIssues = health.status !== "healthy";
  const degradedServices = health.checks.filter((c) => c.status === "degraded");
  const unhealthyServices = health.checks.filter((c) => c.status === "unhealthy");

  if (!hasIssues) {
    return null;
  }

  const getIcon = () => {
    if (unhealthyServices.length > 0) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  };

  const getTitle = () => {
    if (unhealthyServices.length > 0) {
      return "Services indisponibles";
    }
    return "Services dégradés";
  };

  const getBgColor = () => {
    if (unhealthyServices.length > 0) {
      return "bg-red-50 border-red-200";
    }
    return "bg-amber-50 border-amber-200";
  };

  return (
    <div className={`rounded-xl border p-4 ${getBgColor()} ${className}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{getTitle()}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Certains services peuvent ne pas fonctionner correctement.
          </p>
          
          <div className="mt-3 space-y-2">
            {unhealthyServices.map((service) => (
              <div
                key={service.service}
                className="flex items-center gap-2 text-sm"
              >
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-gray-700">
                  {service.service}: {service.message || "Erreur"}
                </span>
              </div>
            ))}
            {degradedServices.map((service) => (
              <div
                key={service.service}
                className="flex items-center gap-2 text-sm"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-gray-700">
                  {service.service}: {service.message || "Configuration manquante"}
                </span>
              </div>
            ))}
          </div>

          <a
            href="/settings"
            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Configurer les services <Info className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

// Compact version for use in header
export function ServicesStatusIndicator({ className }: { className?: string }) {
  const [health, setHealth] = useState<HealthCheckData | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        setHealth(data);
      } catch (error) {
        console.error("Failed to fetch health:", error);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!health) return null;

  const getStatusColor = () => {
    switch (health.status) {
      case "healthy":
        return "bg-green-500";
      case "degraded":
        return "bg-amber-500";
      case "unhealthy":
        return "bg-red-500";
    }
  };

  const getStatusText = () => {
    switch (health.status) {
      case "healthy":
        return "Tous les services";
      case "degraded":
        return "Services dégradés";
      case "unhealthy":
        return "Services unavailable";
    }
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="text-gray-600">{getStatusText()}</span>
    </div>
  );
}
