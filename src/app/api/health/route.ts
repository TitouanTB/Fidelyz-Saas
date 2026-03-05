import { NextResponse } from "next/server";
import { featureFlags, getServiceStatuses } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

/**
 * Health Check Endpoint
 * Returns the status of all services and dependencies
 */
export async function GET() {
  const checks: {
    status: "healthy" | "degraded" | "unhealthy";
    service: string;
    message?: string;
    timestamp: string;
  }[] = [];

  // Check database connection
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    checks.push({
      status: "healthy",
      service: "database",
      message: "PostgreSQL connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    checks.push({
      status: "unhealthy",
      service: "database",
      message: error instanceof Error ? error.message : "Database connection failed",
      timestamp: new Date().toISOString(),
    });
  }

  // Check Supabase connection
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    
    if (!error) {
      checks.push({
        status: "healthy",
        service: "supabase",
        message: "Supabase connected",
        timestamp: new Date().toISOString(),
      });
    } else {
      checks.push({
        status: "degraded",
        service: "supabase",
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    checks.push({
      status: "unhealthy",
      service: "supabase",
      message: error instanceof Error ? error.message : "Supabase connection failed",
      timestamp: new Date().toISOString(),
    });
  }

  // Check optional services
  const serviceStatuses = getServiceStatuses();
  
  for (const service of serviceStatuses) {
    if (service.enabled && !service.configured) {
      checks.push({
        status: "degraded",
        service: service.name.toLowerCase().replace(/\s/g, "-"),
        message: `${service.name} is enabled but not configured`,
        timestamp: new Date().toISOString(),
      });
    } else if (service.enabled && service.configured) {
      checks.push({
        status: "healthy",
        service: service.name.toLowerCase().replace(/\s/g, "-"),
        message: `${service.name} is configured and ready`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Determine overall status
  const hasUnhealthy = checks.some((c) => c.status === "unhealthy");
  const hasDegraded = checks.some((c) => c.status === "degraded");
  
  const overallStatus = hasUnhealthy
    ? "unhealthy"
    : hasDegraded
    ? "degraded"
    : "healthy";

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime?.() || 0,
    featureFlags: {
      enableSMS: featureFlags.enableSMS,
      enableWhatsApp: featureFlags.enableWhatsApp,
      enableEmail: featureFlags.enableEmail,
      enableWallet: featureFlags.enableWallet,
      enableGoogleWallet: featureFlags.enableGoogleWallet,
      enableAISuggestions: featureFlags.enableAISuggestions,
      enableBilling: featureFlags.enableBilling,
    },
    checks,
  };

  const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503;

  return NextResponse.json(response, { status: statusCode });
}
