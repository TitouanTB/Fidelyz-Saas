import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { sendBulkMessages, CHANNEL_PRIORITY } from "@/lib/messaging";
import { getEnabledChannels } from "@/lib/feature-flags";
import { Channel, Prisma } from "@prisma/client";

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
      // Removed the heavy 'include' that fetched all customers into memory
    });

    const results = [];
    const BATCH_SIZE = 500; // Process 500 customers at a time per campaign

    for (const campaign of scheduledCampaigns) {
      // Build the Prisma where clause based on campaign targeting
      const customerWhere: Prisma.CustomerWhereInput = {
        organizationId: campaign.organizationId,
        unsubscribed: false, // Always filter out unsubscribed at DB level
      };

      if (campaign.targetTags.length > 0) {
        customerWhere.tags = { hasSome: campaign.targetTags };
      }

      if (campaign.targetTiers.length > 0) {
        customerWhere.tier = { in: campaign.targetTiers };
      }

      if (campaign.minPoints !== null) {
        customerWhere.points = { gte: campaign.minPoints };
      }

      if (campaign.maxPoints !== null) {
        customerWhere.points = {
          ...(customerWhere.points as Prisma.IntFilter),
          lte: campaign.maxPoints,
        };
      }

      // First, get the total count of eligible customers for this campaign
      const totalEligibleCustomers = await prisma.customer.count({
        where: customerWhere,
      });

      if (totalEligibleCustomers === 0) {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            status: "COMPLETED",
            sentAt: new Date(),
            completedAt: new Date(),
            totalSent: 0,
          },
        });

        results.push({
          campaignId: campaign.id,
          messagesSent: 0,
          note: "No eligible customers",
        });
        continue;
      }

      let totalSuccessful = 0;
      let totalFailed = 0;
      let processed = 0;

      // Update status to ACTIVE while processing
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: "ACTIVE", sentAt: new Date() },
      });

      // Process customers in batches using cursor-like pagination (skip/take)
      // For cron jobs under Vercel time limits, we process as much as we can.
      // If we timeout, the next cron run will pick up remaining sending (requires tracking)
      // For now, we rely on the DB batching to avoid Out of Memory (OOM)
      
      while (processed < totalEligibleCustomers) {
        const batchCustomers = await prisma.customer.findMany({
          where: customerWhere,
          select: {
            id: true,
            email: true,
            phone: true,
            unsubscribed: true,
          },
          skip: processed,
          take: BATCH_SIZE,
          orderBy: { id: "asc" }, // Ensure stable sorting for pagination
        });

        if (batchCustomers.length === 0) break;

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
          batchCustomers.map((c: { id: string; email: string; phone: string | null; unsubscribed: boolean }) => ({
             id: c.id,
             email: c.email,
             phone: c.phone,
             walletEnabled: false, 
             unsubscribed: c.unsubscribed,
          }))
        );

        const batchSuccessful = sendResults.filter((r) => r.success).length;
        const batchFailed = sendResults.filter((r) => !r.success).length;

        totalSuccessful += batchSuccessful;
        totalFailed += batchFailed;
        processed += batchCustomers.length;
        
        // Optionally update progress in DB here if jobs take very long
      }

      // Finish campaign
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          totalSent: totalSuccessful,
          // You could track totalFailed here if added to schema
        },
      });

      results.push({
        campaignId: campaign.id,
        messagesSent: totalSuccessful,
        failed: totalFailed,
        totalCustomers: totalEligibleCustomers,
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
