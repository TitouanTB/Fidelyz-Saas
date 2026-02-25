import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBulkMessages, CHANNEL_PRIORITY } from "@/lib/messaging";
import { addDays, isAfter } from "date-fns";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const results = [];

    // Find all organizations with active loyalty programs
    const organizations = await prisma.organization.findMany({
      where: {
        loyaltyConfigs: {
          some: {
            isActive: true,
          },
        },
      },
      include: {
        customers: {
          where: {
            unsubscribed: false,
          },
          include: {
            rewardClaims: {
              where: {
                status: "PENDING",
                expiresAt: {
                  lte: addDays(now, 7), // Expiring within 7 days
                  gte: now,
                },
              },
              include: {
                reward: true,
              },
            },
            pointsHistory: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
    });

    for (const org of organizations) {
      const customersWithExpiringRewards = org.customers.filter(
        (c) => c.rewardClaims.length > 0
      );

      if (customersWithExpiringRewards.length === 0) {
        continue;
      }

      // Send reminders to customers with expiring rewards
      const sendResults = await sendBulkMessages(
        {
          organizationId: org.id,
          channels: ["EMAIL", "SMS", "WHATSAPP"],
          subject: "Vos récompenses arrivent à expiration 🎁",
          content: `Bonjour ! Vous avez des récompenses qui arrivent bientôt à expiration. Connectez-vous pour les utiliser avant qu'il ne soit trop tard !`,
          enableFallback: true,
          priority: CHANNEL_PRIORITY,
        },
        customersWithExpiringRewards.map((c) => ({
          id: c.id,
          email: c.email,
          phone: c.phone,
          walletEnabled: false,
          unsubscribed: c.unsubscribed,
        }))
      );

      const successful = sendResults.filter((r) => r.success).length;

      results.push({
        organizationId: org.id,
        customersNotified: customersWithExpiringRewards.length,
        messagesSent: successful,
      });
    }

    // Also notify customers with high points balance who haven't claimed rewards
    const customersWithHighPoints = await prisma.customer.findMany({
      where: {
        unsubscribed: false,
        points: {
          gte: 100, // Has enough points for a reward
        },
        rewardClaims: {
          none: {
            status: "PENDING",
          },
        },
      },
      include: {
        organization: true,
        pointsHistory: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    // Group by organization
    const customersByOrg = customersWithHighPoints.reduce((acc, customer) => {
      if (!acc[customer.organizationId]) {
        acc[customer.organizationId] = [];
      }
      acc[customer.organizationId].push(customer);
      return acc;
    }, {} as Record<string, typeof customersWithHighPoints>);

    for (const [orgId, customers] of Object.entries(customersByOrg)) {
      // Filter customers who haven't had activity in 14 days
      const inactiveCustomers = customers.filter((c) => {
        if (!c.pointsHistory.length) return true;
        const lastActivity = c.pointsHistory[0]?.createdAt;
        return isAfter(now, addDays(new Date(lastActivity), 14));
      });

      if (inactiveCustomers.length === 0) continue;

      const sendResults = await sendBulkMessages(
        {
          organizationId: orgId,
          channels: ["EMAIL", "SMS"],
          subject: "Vous avez des points à utiliser ! ✨",
          content: `Bonjour ! Vous avez accumulé ${inactiveCustomers[0]?.points || 0} points. Profitez-en pour découvrir nos récompenses disponibles !`,
          enableFallback: true,
          priority: CHANNEL_PRIORITY,
        },
        inactiveCustomers.map((c) => ({
          id: c.id,
          email: c.email,
          phone: c.phone,
          walletEnabled: false,
          unsubscribed: c.unsubscribed,
        }))
      );

      const successful = sendResults.filter((r) => r.success).length;

      results.push({
        organizationId: orgId,
        customersWithPointsNotified: inactiveCustomers.length,
        messagesSent: successful,
      });
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Cron reward-reminders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
