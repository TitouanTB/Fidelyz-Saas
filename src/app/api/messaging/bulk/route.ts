import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sendBulkMessages, CHANNEL_PRIORITY } from "@/lib/messaging";
import { Channel } from "@prisma/client";
import { z } from "zod";

const bulkSendSchema = z.object({
  customerIds: z.array(z.string()).min(1),
  channels: z.array(z.enum(["EMAIL", "SMS", "PUSH", "WHATSAPP", "WALLET"])).min(1),
  subject: z.string().optional(),
  content: z.string().min(1),
  campaignId: z.string().optional(),
  templateName: z.string().optional(),
  templateData: z.record(z.unknown()).optional(),
  enableFallback: z.boolean().default(true),
  priority: z.array(z.enum(["EMAIL", "SMS", "PUSH", "WHATSAPP", "WALLET"])).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await prisma.organizationMember.findFirst({ where: { userId: user.id } });
    if (!member) return NextResponse.json({ error: "No organization" }, { status: 404 });

    const body = await request.json();
    const parsed = bulkSendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const {
      customerIds,
      channels,
      subject,
      content,
      campaignId,
      templateName,
      templateData,
      enableFallback,
      priority,
    } = parsed.data;

    // Fetch all customers
    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
        organizationId: member.organizationId,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        unsubscribed: true,
      },
    });

    if (customers.length === 0) {
      return NextResponse.json({ error: "No customers found" }, { status: 404 });
    }

    // Filter out unsubscribed customers
    const eligibleCustomers = customers.filter((c) => !c.unsubscribed);

    if (eligibleCustomers.length === 0) {
      return NextResponse.json(
        { error: "All customers are unsubscribed" },
        { status: 400 }
      );
    }

    // Send bulk messages
    const results = await sendBulkMessages(
      {
        organizationId: member.organizationId,
        channels: channels as Channel[],
        subject,
        content,
        campaignId,
        templateName,
        templateData,
        enableFallback,
        priority: priority as Channel[] | undefined,
      },
      eligibleCustomers.map((c) => ({
        id: c.id,
        email: c.email,
        phone: c.phone,
        walletEnabled: false, // Would be fetched from preferences
        unsubscribed: c.unsubscribed,
      }))
    );

    // Calculate statistics
    const stats = {
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      fallbackUsed: results.filter((r) => r.fallbackAttempted).length,
      byChannel: results.reduce((acc, r) => {
        acc[r.channel] = (acc[r.channel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json(
      {
        success: true,
        stats,
        results: results.map((r) => ({
          success: r.success,
          channel: r.channel,
          messageId: r.messageId,
          externalId: r.externalId,
          fallbackUsed: r.fallbackAttempted,
          error: r.error,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk send error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
