import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMiniSiteContent } from "@/lib/ai";
import { z } from "zod";

const miniSiteSchema = z.object({
  organizationName: z.string().min(2),
  industry: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = miniSiteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { organizationName, industry, description } = parsed.data;

    const miniSiteContent = await generateMiniSiteContent(
      organizationName,
      industry,
      description || ""
    );

    return NextResponse.json({ miniSiteContent });
  } catch (error) {
    console.error("Mini-site generation error:", error);
    return NextResponse.json({ error: "Failed to generate mini-site content" }, { status: 500 });
  }
}

