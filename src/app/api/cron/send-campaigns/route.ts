import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
              select: { id: true, email: true, tags: true, points: true },
            },
          },
        },
      },
    });

    const results = [];

    for (const campaign of scheduledCampaigns) {
      let targetCustomers = campaign.organization.customers;

      if (campaign.targetTags.length > 0) {
        targetCustomers = targetCustomers.filter((c) =>
          campaign.targetTags.some((tag) => c.tags.includes(tag))
        );
      }

      if (campaign.minPoints) {
        targetCustomers = targetCustomers.filter((c) => c.points >= campaign.minPoints!);
      }

      const messages = targetCustomers.flatMap((customer) =>
        campaign.channels.map((channel) => ({
          organizationId: campaign.organizationId,
          customerId: customer.id,
          campaignId: campaign.id,
          channel,
          subject: campaign.subject,
          content: campaign.content,
          status: "SENT" as const,
          sentAt: new Date(),
        }))
      );

      if (messages.length > 0) {
        await prisma.message.createMany({ data: messages });
      }

      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: "COMPLETED", sentAt: new Date() },
      });

      results.push({ campaignId: campaign.id, messagesSent: messages.length });
    }

    return NextResponse.json({ processed: scheduledCampaigns.length, results });
  } catch (error) {
    console.error("Cron send-campaigns error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
