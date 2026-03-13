import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const qrScanSchema = z.object({
  organizationId: z.string().optional(),
  slug: z.string().optional(),
  pageType: z.enum(["mini-site", "menu", "reward", "portal"]).optional(),
  qrCodeId: z.string().optional(),
  location: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = qrScanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { organizationId, slug, pageType, qrCodeId, location, metadata } = parsed.data;

    // Find organization if slug provided
    let orgId: string | null = organizationId || null;
    if (slug && !orgId) {
      const org = await prisma.organization.findUnique({
        where: { slug },
        select: { id: true },
      });
      orgId = org?.id || null;
    }

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID ou slug requis" },
        { status: 400 }
      );
    }

    // Create analytics event
    const event = await prisma.analyticsEvent.create({
      data: {
        organizationId: orgId,
        eventType: "qr_scan",
        eventName: pageType ? `${pageType}_qr_scan` : "qr_scan",
        properties: {
          pageType,
          qrCodeId,
          location,
          ...metadata,
        } as any,
      },
    });

    return NextResponse.json({
      success: true,
      eventId: event.id,
    });
  } catch (error) {
    console.error("QR scan tracking error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const slug = searchParams.get("slug");
    const pageType = searchParams.get("pageType") as "mini-site" | "menu" | "reward" | "portal" | null;

    // Find organization if slug provided
    let orgId: string | null = organizationId || null;
    if (slug && !orgId) {
      const org = await prisma.organization.findUnique({
        where: { slug },
        select: { id: true },
      });
      orgId = org?.id || null;
    }

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID ou slug requis" },
        { status: 400 }
      );
    }

    // Create analytics event
    const event = await prisma.analyticsEvent.create({
      data: {
        organizationId: orgId,
        eventType: "qr_scan",
        eventName: pageType ? `${pageType}_qr_scan` : "qr_scan",
        properties: {
          pageType,
        },
      },
    });

    return NextResponse.json({
      success: true,
      eventId: event.id,
    });
  } catch (error) {
    console.error("QR scan tracking error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
