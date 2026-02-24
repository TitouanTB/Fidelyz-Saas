import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sendSchema = z.object({
  customerEmail: z.string().email(),
  channel: z.enum(["EMAIL", "SMS", "PUSH", "WHATSAPP"]),
  subject: z.string().optional(),
  content: z.string().min(1),
  campaignId: z.string().optional(),
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

    const { customerEmail, channel, subject, content, campaignId } = parsed.data;

    const customer = await prisma.customer.findUnique({
      where: { organizationId_email: { organizationId: member.organizationId, email: customerEmail } },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        organizationId: member.organizationId,
        customerId: customer.id,
        campaignId: campaignId || null,
        channel,
        subject,
        content,
        status: "SENT",
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
