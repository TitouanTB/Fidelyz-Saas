import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await prisma.organizationMember.findFirst({
      where: { userId: user.id, role: { in: ["OWNER", "ADMIN"] } },
    });
    if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const organization = await prisma.organization.update({
      where: { id: member.organizationId },
      data: {
        ...parsed.data,
        websiteUrl: parsed.data.websiteUrl || null,
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
