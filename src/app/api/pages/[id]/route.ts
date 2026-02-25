import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const pageUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  pageType: z.enum(["mini-site", "menu", "rewards", "portal"]).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
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

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orgId = await getOrganizationId(user.id);
    if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 404 });

    const { id } = await params;
    const page = await prisma.publicPage.findFirst({
      where: { id, organizationId: orgId },
      include: { organization: true },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error("Get page error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orgId = await getOrganizationId(user.id);
    if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 404 });

    const { id } = await params;
    const existingPage = await prisma.publicPage.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = pageUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    if (parsed.data.slug && parsed.data.slug !== existingPage.slug) {
      const slugExists = await prisma.publicPage.findUnique({
        where: {
          organizationId_slug: { organizationId: orgId, slug: parsed.data.slug },
        },
      });

      if (slugExists) {
        return NextResponse.json({ error: "A page with this slug already exists" }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.title) updateData.title = parsed.data.title;
    if (parsed.data.slug) updateData.slug = parsed.data.slug;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
    if (parsed.data.isPublished !== undefined) {
      updateData.isPublished = parsed.data.isPublished;
      if (parsed.data.isPublished && !existingPage.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    if (parsed.data.content || parsed.data.pageType) {
      const existingContent = existingPage.content as Record<string, unknown>;
      updateData.content = {
        ...existingContent,
        ...parsed.data.content,
        pageType: parsed.data.pageType || existingContent.pageType,
      };
    }

    const page = await prisma.publicPage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ page });
  } catch (error) {
    console.error("Update page error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orgId = await getOrganizationId(user.id);
    if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 404 });

    const { id } = await params;
    const existingPage = await prisma.publicPage.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    await prisma.publicPage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete page error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
