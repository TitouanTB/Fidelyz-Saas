import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBulkMessages, CHANNEL_PRIORITY } from "@/lib/messaging";
import { getEnabledChannels } from "@/lib/feature-flags";
import { MessageStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if messaging services are available
  const enabledChannels = getEnabledChannels();
  if (enabledChannels.length === 0) {
    return NextResponse.json({
      success: true,
      skipped: true,
      message: "No messaging services enabled",
    });
  }

  try {
    const now = new Date();
    const scheduledCampaigns = await prisma.campaign.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
      },
      include: {
        organization: {
          include: {
            customers: {
              select: {
                id: true,
                email: true,
                phone: true,
                tags: true,
                points: true,
                tier: true,
                unsubscribed: true,
              },
            },
          },
        },
      },
    });

    const results = [];

    for (const campaign of scheduledCampaigns) {
      let targetCustomers = campaign.organization.customers;

      // Apply targeting filters
      if (campaign.targetTags.length > 0) {
        targetCustomers = targetCustomers.filter((c) =>
          campaign.targetTags.some((tag) => c.tags.includes(tag))
        );
      }

      if (campaign.targetTiers.length > 0) {
        targetCustomers = targetCustomers.filter((c) =>
          c.tier ? campaign.targetTiers.includes(c.tier) : false
        );
      }

      if (campaign.minPoints !== null) {
        targetCustomers = targetCustomers.filter(
          (c) => c.points >= campaign.minPoints!
        );
      }

      if (campaign.maxPoints !== null) {
        targetCustomers = targetCustomers.filter(
          (c) => c.points <= campaign.maxPoints!
        );
      }

      if (campaign.minVisits !== null) {
        // Note: This would require visit count data
        // For now, we skip this filter
      }

      // Filter out unsubscribed customers
      const eligibleCustomers = targetCustomers.filter((c) => !c.unsubscribed);

      if (eligibleCustomers.length === 0) {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            status: "COMPLETED",
            sentAt: new Date(),
            completedAt: new Date(),
          },
        });

        results.push({
          campaignId: campaign.id,
          messagesSent: 0,
          note: "No eligible customers",
        });
        continue;
      }

      // Send messages with fallback
      const sendResults = await sendBulkMessages(
        {
          organizationId: campaign.organizationId,
          channels: campaign.channels,
          subject: campaign.subject || undefined,
          content: campaign.content,
          campaignId: campaign.id,
          enableFallback: true,
          priority: CHANNEL_PRIORITY,
        },
        eligibleCustomers.map((c) => ({
          id: c.id,
          email: c.email,
          phone: c.phone,
          walletEnabled: false, // Would be fetched from preferences
          unsubscribed: c.unsubscribed,
        }))
      );

      // Update campaign with results
      const successful = sendResults.filter((r) => r.success).length;
      const failed = sendResults.filter((r) => !r.success).length;

      await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          status: "COMPLETED",
          sentAt: new Date(),
          completedAt: new Date(),
          totalSent: successful,
        },
      });

      results.push({
        campaignId: campaign.id,
        messagesSent: successful,
        failed,
        totalCustomers: eligibleCustomers.length,
      });
    }

    return NextResponse.json({
      processed: scheduledCampaigns.length,
      results,
    });
  } catch (error) {
    console.error("Cron send-campaigns error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
