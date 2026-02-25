import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { retryFailedMessages, CHANNEL_PRIORITY } from "@/lib/messaging";
import { Channel } from "@prisma/client";
import { z } from "zod";

const retrySchema = z.object({
  messageIds: z.array(z.string()).min(1),
  fallbackChannels: z.array(z.enum(["EMAIL", "SMS", "PUSH", "WHATSAPP", "WALLET"])).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await prisma.organizationMember.findFirst({ where: { userId: user.id } });
    if (!member) return NextResponse.json({ error: "No organization" }, { status: 404 });

    const body = await request.json();
    const parsed = retrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { messageIds, fallbackChannels } = parsed.data;

    // Verify all messages belong to this organization
    const messages = await prisma.message.findMany({
      where: {
        id: { in: messageIds },
        organizationId: member.organizationId,
      },
      select: { id: true },
    });

    if (messages.length !== messageIds.length) {
      return NextResponse.json(
        { error: "Some messages not found or do not belong to your organization" },
        { status: 403 }
      );
    }

    // Retry the messages
    const results = await retryFailedMessages(
      messageIds,
      fallbackChannels as Channel[] | undefined
    );

    // Calculate statistics
    const stats = {
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      byChannel: results.reduce((acc, r) => {
        acc[r.channel] = (acc[r.channel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      stats,
      results: results.map((r) => ({
        success: r.success,
        channel: r.channel,
        messageId: r.messageId,
        externalId: r.externalId,
        error: r.error,
      })),
    });
  } catch (error) {
    console.error("Retry messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
