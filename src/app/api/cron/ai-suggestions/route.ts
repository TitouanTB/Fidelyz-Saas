import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateCampaignSuggestion,
  generateAdaptedRewards,
  analyzeCustomerData,
} from "@/lib/ai";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if AI suggestions are enabled
  if (process.env.ENABLE_AI_SUGGESTIONS !== "true") {
    return NextResponse.json({
      success: true,
      message: "AI suggestions are disabled",
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
          const campaignSuggestion = await generateCampaignSuggestion(
            org.name,
            org.industry || "commerce",
            ["increase-loyalty", "boost-visits", "customer-retention"]
          );
          orgResults.campaignSuggestion = campaignSuggestion;

          // Store the suggestion in the database for later use
          await prisma.campaign.create({
            data: {
              organizationId: org.id,
              name: `[Suggestion IA] ${campaignSuggestion.title}`,
              description: campaignSuggestion.description,
              type: "AUTOMATED",
              status: "DRAFT",
              channels: campaignSuggestion.channels.map((c) =>
                c.toUpperCase()
              ) as ("EMAIL" | "SMS" | "PUSH" | "WHATSAPP" | "WALLET")[],
              subject: campaignSuggestion.title,
              content: campaignSuggestion.description,
              targetTiers: [],
              targetTags: [],
            },
          });
        }

        // 2. Analyze customer segments if enough data
        if (org.customers.length >= 10) {
          const customerInsights = await analyzeCustomerData(org.customers);
          orgResults.customerInsights = customerInsights;

          // Create targeted campaigns based on insights
          for (const insight of customerInsights.slice(0, 2)) {
            // Limit to 2 segments
            if (insight.recommendations.length > 0) {
              await prisma.campaign.create({
                data: {
                  organizationId: org.id,
                  name: `[IA] Campagne ${insight.segment}`,
                  description: insight.recommendations.join("\n"),
                  type: "AUTOMATED",
                  status: "DRAFT",
                  channels: ["EMAIL"],
                  subject: `Une offre spéciale pour vous, clients ${insight.segment}`,
                  content: insight.recommendations[0] || "",
                  targetTiers: [],
                  targetTags: [insight.segment.toLowerCase().replace(/\s+/g, "-")],
                },
              });
            }
          }
        }

        // 3. Suggest new rewards if organization has less than 4 active rewards
        if (org.rewards.filter((r) => r.isActive).length < 4) {
          const suggestedRewards = await generateAdaptedRewards(
            org.name,
            org.industry || "commerce",
            undefined,
            org.customers.reduce(
              (sum, c) => sum + (c.totalSpend || 0),
              0
            ) / (org.customers.length || 1)
          );
          orgResults.suggestedRewards = suggestedRewards;

          // Store reward suggestions as inactive rewards
          for (const reward of suggestedRewards.slice(0, 2)) {
            const existingReward = await prisma.reward.findFirst({
              where: {
                organizationId: org.id,
                name: reward.name,
              },
            });

            if (!existingReward) {
              await prisma.reward.create({
                data: {
                  organizationId: org.id,
                  name: `[Suggestion] ${reward.name}`,
                  description: reward.description,
                  pointsRequired: reward.pointsRequired,
                  type: reward.type as
                    | "DISCOUNT_PERCENT"
                    | "DISCOUNT_FIXED"
                    | "FREE_PRODUCT"
                    | "FREE_ITEM"
                    | "CASHBACK"
                    | "CUSTOM",
                  value: reward.value,
                  isActive: false, // Suggestions are inactive by default
                },
              });
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
