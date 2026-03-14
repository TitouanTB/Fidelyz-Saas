import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { sendBulkMessages, CHANNEL_PRIORITY } from "@/lib/messaging";
import { getEnabledChannels } from "@/lib/feature-flags";
import { addDays } from "date-fns";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    const results = [];

    const organizations = await prisma.organization.findMany({
      where: {
        loyaltyConfigs: {
          some: {
            isActive: true,
          },
        },
      },
      include: {
        loyaltyConfigs: true,
      },
    });

    for (const org of organizations) {
      const thirtyDaysAgo = addDays(now, -30);
      const sixtyDaysAgo = addDays(now, -60);

      const inactiveCustomers = await prisma.customer.findMany({
        where: {
          organizationId: org.id,
          unsubscribed: false,
          OR: [
            {
              lastVisitAt: {
                lte: thirtyDaysAgo,
                gte: sixtyDaysAgo,
              },
            },
            {
              lastVisitAt: null,
              createdAt: {
                lte: thirtyDaysAgo,
                gte: sixtyDaysAgo,
              },
            },
          ],
          messages: {
            none: {
              createdAt: {
                gte: addDays(now, -7),
              },
              subject: {
                contains: "On vous manque",
              },
            },
          },
        },
        include: {
          visitRecords: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
          pointsHistory: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      if (inactiveCustomers.length === 0) {
        continue;
      }

      const messagePromises = inactiveCustomers.map(async (customer: any) => {
        const lastVisit = customer.visitRecords[0]?.createdAt;
        const daysSinceLastVisit = lastVisit
          ? Math.floor(
              (now.getTime() - new Date(lastVisit).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null;

        let subject = "On vous manque ! 💙";
        let content = `Bonjour ${customer.firstName || ""}, ça fait un moment que nous ne vous avons pas vu ! Nous avons de nouvelles récompenses qui vous attendent. Revenez nous voir bientôt !`;

        if (customer.points >= 100) {
          subject = "Vos points vous attendent ! ⭐";
          content = `Bonjour ${customer.firstName || ""}, vous avez ${customer.points} points qui n'attendent que vous ! Profitez-en pour découvrir nos nouvelles récompenses. À très bientôt !`;
        }

        if (customer.tier && ["Gold", "Platinum"].includes(customer.tier)) {
          subject = "Une offre exclusive vous attend ✨";
          content = `Cher client VIP, nous avons préparé quelque chose de spécial pour vous. Votre fidélité mérite d'être récompensée ! Découvrez votre offre exclusive en magasin.`;
        }

        return {
          id: customer.id,
          email: customer.email,
          phone: customer.phone,
          walletEnabled: false,
          unsubscribed: customer.unsubscribed,
          subject,
          content,
          daysSinceLastVisit,
        };
      });

      const customersWithMessages = await Promise.all(messagePromises);

      const BATCH_SIZE = 10;
      for (let i = 0; i < customersWithMessages.length; i += BATCH_SIZE) {
        const batch = customersWithMessages.slice(i, i + BATCH_SIZE);

        await sendBulkMessages(
          {
            organizationId: org.id,
            channels: ["EMAIL", "SMS", "WHATSAPP"],
            subject: batch[0].subject,
            content: batch[0].content,
            enableFallback: true,
            priority: CHANNEL_PRIORITY,
          },
          batch.map((c: any) => ({
            id: c.id,
            email: c.email,
            phone: c.phone,
            walletEnabled: c.walletEnabled,
            unsubscribed: c.unsubscribed,
          }))
        );
      }

      results.push({
        organizationId: org.id,
        organizationName: org.name,
        inactiveCustomersNotified: inactiveCustomers.length,
      });
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Cron reactivate-inactive error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
