import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { EditorState } from "@/store/editor-store";

const autosaveSchema = z.object({
  // Design
  selectedTemplate: z.string().optional(),
  selectedPalette: z.string().optional(),
  selectedFonts: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),

  // Textes
  heroHeadline: z.string().optional(),
  heroSubtitle: z.string().optional(),
  aboutTitle: z.string().optional(),
  aboutParagraph1: z.string().optional(),
  aboutParagraph2: z.string().optional(),
  specialtyNames: z.array(z.string()).optional(),
  specialtyDescriptions: z.array(z.string()).optional(),
  ctaPrimary: z.string().optional(),
  ctaSecondary: z.string().optional(),

  // Récompense
  rewardType: z.string().optional(),
  rewardDescription: z.string().optional(),
  rewardVisitsRequired: z.number().optional(),
  rewardValidityDays: z.number().optional(),
  rewardConditions: z.string().optional(),

  // Menu
  menuCategories: z.array(z.any()).optional(),
  menuItems: z.array(z.any()).optional(),

  // Formulaire Client
  formEmailEnabled: z.boolean().optional(),
  formPhoneEnabled: z.boolean().optional(),
  formNameEnabled: z.boolean().optional(),
  formButtonText: z.string().optional(),
  formConsentText: z.string().optional(),

  // QR Codes
  qrColor: z.string().optional(),
  qrSize: z.number().optional(),

  // Notifications
  reminderDelayDays: z.number().optional(),
  reactivationDelayDays: z.number().optional(),
  reactivationDelayDays2: z.number().optional(),
  reminderEnabled: z.boolean().optional(),
  reactivationEnabled: z.boolean().optional(),
  reactivation2Enabled: z.boolean().optional(),
  reminderTemplate: z.string().optional(),
  reactivationTemplate: z.string().optional(),
  reactivation2Template: z.string().optional(),

  // Version history
  versions: z.array(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
    });
    if (!member) {
      return NextResponse.json({ error: "No organization found" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = autosaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Get current metadata
    const organization = await prisma.organization.findUnique({
      where: { id: member.organizationId },
      select: { metadata: true },
    });

    const currentMetadata = (organization?.metadata as Record<string, any>) || {};
    const editorMetadata = (currentMetadata.editor as Record<string, any>) || {};

    // Update editor settings in metadata
    const updatedMetadata = {
      ...currentMetadata,
      editor: {
        ...editorMetadata,
        ...parsed.data,
        lastSavedAt: new Date().toISOString(),
      },
    };

    await prisma.organization.update({
      where: { id: member.organizationId },
      data: { metadata: updatedMetadata as unknown as Record<string, unknown> },
    });

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Autosave error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
    });
    if (!member) {
      return NextResponse.json({ error: "No organization found" }, { status: 403 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: member.organizationId },
      select: { metadata: true },
    });

    const metadata = organization?.metadata as Record<string, unknown> || {};
    const editorData = (metadata.editor as Partial<EditorState>) || {};

    return NextResponse.json({
      data: editorData,
      lastSavedAt: editorData.lastSavedAt || null,
    });
  } catch (error) {
    console.error("Get editor data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
