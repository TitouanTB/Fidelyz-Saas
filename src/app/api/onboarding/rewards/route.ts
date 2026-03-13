import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAdaptedRewards } from "@/lib/ai";
import { z } from "zod";

const rewardsSchema = z.object({
  organizationName: z.string().min(2),
  industry: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = rewardsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { industry } = parsed.data;

    const rewards = await generateAdaptedRewards(
      industry,
      []
    );

    return NextResponse.json({ rewards });
  } catch (error) {
    console.error("Rewards generation error:", error);
    return NextResponse.json({ error: "Failed to generate rewards" }, { status: 500 });
  }
}

