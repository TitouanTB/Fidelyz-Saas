import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationName, industry } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      const fallback = `Welcome to ${organizationName}'s loyalty program! Join us and earn exclusive rewards with every purchase. As a valued member of our ${industry} community, you'll enjoy special discounts, early access to new products, and personalized offers designed just for you.`;
      return NextResponse.json({ description: fallback });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a marketing copywriter specializing in loyalty programs. Write a concise, engaging description (2-3 sentences) for a business's loyalty program page.",
          },
          {
            role: "user",
            content: `Write a loyalty program description for "${organizationName}", a business in the ${industry} industry. Make it friendly, engaging, and highlight the value for customers.`,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    const description = data.choices[0]?.message?.content?.trim();

    return NextResponse.json({ description });
  } catch (error) {
    console.error("AI description error:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}
