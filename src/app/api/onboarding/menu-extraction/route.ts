import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractMenuFromUrl, extractMenuFromText } from "@/lib/ai";
import { z } from "zod";

const menuExtractionSchema = z.object({
  url: z.string().url().optional(),
  text: z.string().min(10).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = menuExtractionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { url, text } = parsed.data;

    if (!url && !text) {
      return NextResponse.json({ error: "Either URL or text is required" }, { status: 400 });
    }

    let menuData;
    if (url) {
      menuData = await extractMenuFromUrl(url);
    } else if (text) {
      menuData = await extractMenuFromText(text);
    }

    return NextResponse.json({ menuData });
  } catch (error) {
    console.error("Menu extraction error:", error);
    return NextResponse.json({ error: "Failed to extract menu" }, { status: 500 });
  }
}
