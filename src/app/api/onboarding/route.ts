import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const onboardingSchema = z.object({
  organizationName: z.string().min(2),
  industry: z.string().min(1),
  description: z.string().optional(),
  primaryColor: z.string().default("#6366f1"),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  slug: z.string().min(2),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { organizationName, industry, description, primaryColor, websiteUrl, slug } = parsed.data;

    const existingMember = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
    });

    if (existingMember) {
      return NextResponse.json({ error: "Already belongs to an organization" }, { status: 409 });
    }

    let uniqueSlug = slug;
    let counter = 0;
    while (await prisma.organization.findUnique({ where: { slug: uniqueSlug } })) {
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }

    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        slug: uniqueSlug,
        industry,
        description,
        primaryColor,
        websiteUrl: websiteUrl || null,
        onboardingDone: true,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    return NextResponse.json({ organization }, { status: 201 });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
