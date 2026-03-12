import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBrandingSuggestion } from "@/lib/ai";
import { z } from "zod";

const brandingSchema = z.object({
  organizationName: z.string().min(2),
  industry: z.string().min(1),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = brandingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { organizationName, industry } = parsed.data;

    const branding = await generateBrandingSuggestion(
      organizationName,
      industry
    );

    return NextResponse.json({ branding });
  } catch (error) {
    console.error("Branding generation error:", error);
    return NextResponse.json({ error: "Failed to generate branding" }, { status: 500 });
  }
}
