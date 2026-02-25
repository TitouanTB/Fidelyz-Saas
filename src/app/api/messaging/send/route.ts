import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sendMessageWithFallback, getBestChannel, CHANNEL_PRIORITY } from "@/lib/messaging";
import { Channel } from "@prisma/client";
import { z } from "zod";

const sendSchema = z.object({
  customerId: z.string().optional(),
  customerEmail: z.string().email().optional(),
  channels: z.array(z.enum(["EMAIL", "SMS", "PUSH", "WHATSAPP", "WALLET"])).min(1),
  subject: z.string().optional(),
  content: z.string().min(1),
  campaignId: z.string().optional(),
  templateName: z.string().optional(),
  templateData: z.record(z.string(), z.unknown()).optional(),
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
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const {
      customerId,
      customerEmail,
      channels,
      subject,
      content,
      campaignId,
      templateName,
      templateData,
      enableFallback,
      priority,
    } = parsed.data;

    // Find customer by ID or email
    let customer;
    if (customerId) {
      customer = await prisma.customer.findFirst({
        where: {
          id: customerId,
          organizationId: member.organizationId,
        },
      });
    } else if (customerEmail) {
      customer = await prisma.customer.findUnique({
        where: {
          organizationId_email: {
            organizationId: member.organizationId,
            email: customerEmail,
          },
        },
      });
    }

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Send message with fallback
    const result = await sendMessageWithFallback(
      {
        organizationId: member.organizationId,
        customerId: customer.id,
        campaignId,
        channels: channels as Channel[],
        subject,
        content,
        templateName,
        templateData,
        enableFallback,
        priority: priority as Channel[] | undefined,
      },
      {
        email: customer.email,
        phone: customer.phone,
        walletEnabled: false, // Would be fetched from customer preferences
        unsubscribed: customer.unsubscribed,
      }
    );

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          messageId: result.messageId,
          channel: result.channel,
          externalId: result.externalId,
          fallbackUsed: result.fallbackAttempted,
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          channel: result.channel,
          messageId: result.messageId,
        },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check best available channel for a customer
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await prisma.organizationMember.findFirst({ where: { userId: user.id } });
    if (!member) return NextResponse.json({ error: "No organization" }, { status: 404 });

    const customerId = request.nextUrl.searchParams.get("customerId");
    const channelsParam = request.nextUrl.searchParams.get("channels");

    if (!customerId || !channelsParam) {
      return NextResponse.json(
        { error: "Missing customerId or channels parameter" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        organizationId: member.organizationId,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const channels = channelsParam.split(",") as Channel[];
    const bestChannel = getBestChannel(
      channels,
      {
        email: customer.email,
        phone: customer.phone,
        walletEnabled: false,
        unsubscribed: customer.unsubscribed,
      },
      CHANNEL_PRIORITY
    );

    return NextResponse.json({
      customerId: customer.id,
      bestChannel,
      availableChannels: channels.filter((c) => {
        if (customer.unsubscribed) return false;
        if (c === "EMAIL" && !customer.email) return false;
        if ((c === "SMS" || c === "WHATSAPP") && !customer.phone) return false;
        return true;
      }),
    });
  } catch (error) {
    console.error("Get best channel error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
