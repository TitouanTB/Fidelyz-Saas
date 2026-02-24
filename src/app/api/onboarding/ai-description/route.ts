import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { flashModel } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationName, industry } = await request.json();

    if (!process.env.GOOGLE_AI_API_KEY) {
      const fallback = `Welcome to ${organizationName}'s loyalty program! Join us and earn exclusive rewards with every purchase. As a valued member of our ${industry} community, you'll enjoy special discounts, early access to new products, and personalized offers designed just for you.`;
      return NextResponse.json({ description: fallback });
    }

    const prompt = `
      Write a compelling loyalty program description for "${organizationName}", a business in the ${industry} industry.
      
      Requirements:
      - Write 2-3 engaging sentences
      - Highlight the value for customers
      - Be friendly and welcoming
      - Focus on rewards, exclusivity, and benefits
      
      Return only the description text, no additional formatting.
    `;

    const result = await flashModel.generateContent(prompt);
    const description = result.response.text().trim();

    return NextResponse.json({ description });
  } catch (error) {
    console.error("AI description error:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}
