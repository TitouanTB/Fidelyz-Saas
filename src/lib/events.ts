import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Event Tracking
 * Creates events for tracking user actions and system events
 */

export interface CreateEventParams {
  organizationId: string;
  clientId?: string;
  type: string;
  eventName?: string;
  properties?: Prisma.InputJsonValue;
  sessionId?: string;
  visitorId?: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
}

/**
 * Create a new event
 */
export async function createEvent(params: CreateEventParams) {
  const {
    organizationId,
    clientId,
    type,
    eventName,
    properties,
    sessionId,
    visitorId,
    userAgent,
    ipAddress,
    referrer,
  } = params;

  return await prisma.event.create({
    data: {
      organizationId,
      clientId,
      type,
      eventName,
      properties,
      sessionId,
      visitorId,
      userAgent,
      ipAddress,
      referrer,
    },
  });
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return "unknown";
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown";
}
