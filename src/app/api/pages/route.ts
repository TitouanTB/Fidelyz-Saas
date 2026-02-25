import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateSlug } from "@/lib/utils";

const pageSchema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  pageType: z.enum(["mini-site", "menu", "rewards", "portal"]).default("mini-site"),
  content: z.record(z.unknown()),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

async function getOrganizationId(userId: string) {
  const member = await prisma.organizationMember.findFirst({
    where: { userId },
    select: { organizationId: true },
  });
  return member?.organizationId;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orgId = await getOrganizationId(user.id);
    if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 404 });

    const pages = await prisma.publicPage.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Get pages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orgId = await getOrganizationId(user.id);
    if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 404 });

    const body = await request.json();
    const parsed = pageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const slug = parsed.data.slug || generateSlug(parsed.data.title);

    const existing = await prisma.publicPage.findUnique({
      where: { organizationId_slug: { organizationId: orgId, slug } },
    });

    if (existing) {
      return NextResponse.json({ error: "A page with this slug already exists" }, { status: 409 });
    }

    const content = {
      ...parsed.data.content,
      pageType: parsed.data.pageType,
    };

    const page = await prisma.publicPage.create({
      data: {
        organizationId: orgId,
        title: parsed.data.title,
        slug,
        description: parsed.data.description,
        content,
        isActive: parsed.data.isActive ?? true,
        isPublished: parsed.data.isPublished ?? false,
      },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    console.error("Create page error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
