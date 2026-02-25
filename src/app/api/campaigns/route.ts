import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const campaignSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["ONE_TIME", "AUTOMATED", "RECURRING"]),
  channels: z.array(z.enum(["EMAIL", "SMS", "PUSH", "WHATSAPP", "WALLET"])).min(1),
  subject: z.string().optional(),
  content: z.string().min(1),
  scheduledAt: z.string().datetime().optional().or(z.literal("")),
  targetTags: z.array(z.string()).optional(),
  targetTiers: z.array(z.string()).optional(),
  minPoints: z.number().int().min(0).optional(),
  maxPoints: z.number().int().min(0).optional(),
  minVisits: z.number().int().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await prisma.organizationMember.findFirst({ where: { userId: user.id } });
    if (!member) return NextResponse.json({ error: "No organization" }, { status: 404 });

    const campaigns = await prisma.campaign.findMany({
      where: { organizationId: member.organizationId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { messages: true } } },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Get campaigns error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await prisma.organizationMember.findFirst({ where: { userId: user.id } });
    if (!member) return NextResponse.json({ error: "No organization" }, { status: 404 });

    const body = await request.json();
    const parsed = campaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { scheduledAt, targetTags, targetTiers, ...rest } = parsed.data;

    const campaign = await prisma.campaign.create({
      data: {
        ...rest,
        organizationId: member.organizationId,
        status: scheduledAt ? "SCHEDULED" : "DRAFT",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        targetTags: targetTags || [],
        targetTiers: targetTiers || [],
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
