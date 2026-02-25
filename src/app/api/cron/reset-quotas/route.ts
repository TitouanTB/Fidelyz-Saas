import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Quota definitions by plan
const PLAN_QUOTAS = {
  FREE: {
    messagesPerMonth: 100,
    campaignsPerMonth: 2,
    customersLimit: 100,
    aiSuggestions: false,
  },
  STARTER: {
    messagesPerMonth: 1000,
    campaignsPerMonth: 10,
    customersLimit: 500,
    aiSuggestions: true,
  },
  PRO: {
    messagesPerMonth: 10000,
    campaignsPerMonth: 50,
    customersLimit: 5000,
    aiSuggestions: true,
  },
  ENTERPRISE: {
    messagesPerMonth: 100000,
    campaignsPerMonth: 200,
    customersLimit: 50000,
    aiSuggestions: true,
  },
};

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = [];
    const now = new Date();

    // Reset monthly quotas - runs on the 1st of each month
    const isFirstOfMonth = now.getDate() === 1;

    // Get all organizations
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            customers: true,
            campaigns: {
              where: {
                createdAt: {
                  gte: new Date(now.getFullYear(), now.getMonth(), 1),
                },
              },
            },
            messages: {
              where: {
                createdAt: {
                  gte: new Date(now.getFullYear(), now.getMonth(), 1),
                },
              },
            },
          },
        },
      },
    });

    for (const org of organizations) {
      const quotas = PLAN_QUOTAS[org.plan];
      const orgResult: Record<string, unknown> = {
        organizationId: org.id,
        organizationName: org.name,
        plan: org.plan,
      };

      // Monthly reset (1st of month)
      if (isFirstOfMonth) {
        orgResult.resetType = "monthly";
        orgResult.quotasReset = {
          messagesPerMonth: quotas.messagesPerMonth,
          campaignsPerMonth: quotas.campaignsPerMonth,
          aiSuggestions: quotas.aiSuggestions,
        };
      }

      // Check and report current usage
      orgResult.currentUsage = {
        customers: org._count.customers,
        customersLimit: quotas.customersLimit,
        customersUtilization: Math.round(
          (org._count.customers / quotas.customersLimit) * 100
        ),
        campaignsThisMonth: org._count.campaigns,
        campaignsLimit: quotas.campaignsPerMonth,
        messagesThisMonth: org._count.messages,
        messagesLimit: quotas.messagesPerMonth,
      };

      // Check for organizations approaching limits
      const utilizationThreshold = 80;
      const alerts = [];

      if (
        org._count.customers >=
        quotas.customersLimit * (utilizationThreshold / 100)
      ) {
        alerts.push({
          type: "customers",
          message: `Approaching customer limit: ${org._count.customers}/${quotas.customersLimit}`,
          severity:
            org._count.customers >= quotas.customersLimit ? "critical" : "warning",
        });
      }

      if (
        org._count.campaigns >=
        quotas.campaignsPerMonth * (utilizationThreshold / 100)
      ) {
        alerts.push({
          type: "campaigns",
          message: `Approaching campaign limit: ${org._count.campaigns}/${quotas.campaignsPerMonth}`,
          severity:
            org._count.campaigns >= quotas.campaignsPerMonth
              ? "critical"
              : "warning",
        });
      }

      if (
        org._count.messages >=
        quotas.messagesPerMonth * (utilizationThreshold / 100)
      ) {
        alerts.push({
          type: "messages",
          message: `Approaching message limit: ${org._count.messages}/${quotas.messagesPerMonth}`,
          severity:
            org._count.messages >= quotas.messagesPerMonth
              ? "critical"
              : "warning",
        });
      }

      orgResult.alerts = alerts;

      // Clean up expired reward claims
      const expiredClaims = await prisma.rewardClaim.updateMany({
        where: {
          status: "PENDING",
          expiresAt: {
            lt: now,
          },
        },
        data: {
          status: "EXPIRED",
        },
      });

      orgResult.expiredRewardClaims = expiredClaims.count;

      // Clean up old analytics events (keep last 90 days)
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const deletedAnalytics = await prisma.analyticsEvent.deleteMany({
        where: {
          organizationId: org.id,
          createdAt: {
            lt: ninetyDaysAgo,
          },
        },
      });

      orgResult.cleanedAnalyticsEvents = deletedAnalytics.count;

      results.push(orgResult);
    }

    // Summary statistics
    const summary = {
      totalOrganizations: organizations.length,
      organizationsWithAlerts: results.filter(
        (r) => (r.alerts as unknown[]).length > 0
      ).length,
      totalExpiredClaims: results.reduce(
        (sum, r) => sum + (r.expiredRewardClaims as number || 0),
        0
      ),
      totalCleanedAnalytics: results.reduce(
        (sum, r) => sum + (r.cleanedAnalyticsEvents as number || 0),
        0
      ),
    };

    return NextResponse.json({
      success: true,
      isFirstOfMonth,
      summary,
      results,
    });
  } catch (error) {
    console.error("Cron reset-quotas error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
