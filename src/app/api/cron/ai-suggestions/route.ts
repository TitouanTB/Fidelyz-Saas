import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAISuggestions, isAIAvailable } from "@/lib/ai";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if AI suggestions are enabled and available
  if (!isAIAvailable()) {
    return NextResponse.json({
      success: true,
      skipped: true,
      message: "AI suggestions are disabled or not configured",
    });
  }

  try {
    const results = [];

    // Get all organizations that haven't had AI suggestions generated recently
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const organizations = await prisma.organization.findMany({
      where: {
        plan: {
          in: ["PRO", "ENTERPRISE"], // AI features only for paid plans
        },
      },
      include: {
        customers: {
          select: {
            totalSpend: true,
            visitCount: true,
            points: true,
            tier: true,
          },
        },
        rewards: true,
        campaigns: {
          where: {
            createdAt: {
              gte: oneWeekAgo,
            },
          },
        },
      },
    });

    for (const org of organizations) {
      const orgResults: Record<string, unknown> = {
        organizationId: org.id,
        organizationName: org.name,
      };

      try {
        // 1. Generate campaign suggestions if less than 2 campaigns this week
        if (org.campaigns.length < 2) {
          const campaignResult = await generateAISuggestions(
            `Organization: ${org.name}, Industry: ${org.industry || "commerce"}`,
            "campaign"
          );

          if (campaignResult.success && campaignResult.suggestions) {
            orgResults.campaignSuggestions = campaignResult.suggestions;

            // Store the first suggestion in the database for later use
            const suggestion = campaignResult.suggestions[0];
            if (suggestion) {
              await prisma.campaign.create({
                data: {
                  organizationId: org.id,
                  name: `[Suggestion IA] Campagne`,
                  description: suggestion,
                  type: "AUTOMATED",
                  status: "DRAFT",
                  channels: ["EMAIL", "SMS"],
                  subject: "Suggestion IA",
                  content: suggestion,
                  targetTiers: [],
                  targetTags: [],
                },
              });
            }
          }
        }

        // 2. Suggest new rewards if organization has less than 4 active rewards
        if (org.rewards.filter((r) => r.isActive).length < 4) {
          const rewardResult = await generateAISuggestions(
            `Organization: ${org.name}, Industry: ${org.industry || "commerce"}`,
            "reward"
          );

          if (rewardResult.success && rewardResult.suggestions) {
            orgResults.rewardSuggestions = rewardResult.suggestions;

            // Store reward suggestions as inactive rewards
            for (const suggestion of rewardResult.suggestions.slice(0, 2)) {
              const existingReward = await prisma.reward.findFirst({
                where: {
                  organizationId: org.id,
                  name: suggestion,
                },
              });

              if (!existingReward) {
                await prisma.reward.create({
                  data: {
                    organizationId: org.id,
                    name: suggestion,
                    description: suggestion,
                    pointsRequired: 100,
                    type: "DISCOUNT_PERCENT",
                    value: 10,
                    isActive: false, // Suggestions are inactive by default
                  },
                });
              }
            }
          }
        }

        results.push(orgResults);
      } catch (orgError) {
        console.error(
          `Error processing AI suggestions for org ${org.id}:`,
          orgError
        );
        orgResults.error =
          orgError instanceof Error ? orgError.message : "Unknown error";
        results.push(orgResults);
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Cron ai-suggestions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
