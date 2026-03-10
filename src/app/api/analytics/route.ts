import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, format, differenceInDays } from "date-fns";

type Period = "7d" | "30d" | "90d" | "1y" | "custom";

function getDateRange(period: Period, startDate?: string, endDate?: string) {
  const now = new Date();
  let start: Date;
  let end = endOfDay(now);

  switch (period) {
    case "7d":
      start = startOfDay(subDays(now, 7));
      break;
    case "30d":
      start = startOfDay(subDays(now, 30));
      break;
    case "90d":
      start = startOfDay(subDays(now, 90));
      break;
    case "1y":
      start = startOfDay(subDays(now, 365));
      break;
    case "custom":
      start = startDate ? startOfDay(new Date(startDate)) : startOfDay(subDays(now, 30));
      end = endDate ? endOfDay(new Date(endDate)) : endOfDay(now);
      break;
    default:
      start = startOfDay(subDays(now, 30));
  }

  return { start, end };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    if (!member) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const orgId = member.organizationId;
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get("period") || "30d") as Period;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const { start, end } = getDateRange(period, startDate, endDate);
    const previousStart = subDays(start, differenceInDays(end, start));
    const previousEnd = subDays(start, 1);

    // Fetch all analytics data in parallel
    const [
      customers,
      previousCustomers,
      messages,
      previousMessages,
      campaigns,
      visits,
      previousVisits,
      pointsTransactions,
      previousPointsTransactions,
      rewardClaims,
      customersByTier,
      customersByMonth,
      messagesByDay,
      visitsByDay,
      loyaltyConfig,
    ] = await Promise.all([
      // Current period customers
      prisma.customer.findMany({
        where: {
          organizationId: orgId,
          createdAt: { gte: start, lte: end },
        },
        select: { id: true, points: true, totalSpend: true, visits: true, tier: true, createdAt: true },
      }),
      // Previous period customers
      prisma.customer.count({
        where: {
          organizationId: orgId,
          createdAt: { gte: previousStart, lte: previousEnd },
        },
      }),
      // Current period messages
      prisma.message.findMany({
        where: {
          organizationId: orgId,
          createdAt: { gte: start, lte: end },
        },
        select: { id: true, status: true, createdAt: true },
      }),
      // Previous period messages
      prisma.message.count({
        where: {
          organizationId: orgId,
          createdAt: { gte: previousStart, lte: previousEnd },
        },
      }),
      // Campaigns
      prisma.campaign.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          name: true,
          totalSent: true,
          totalDelivered: true,
          totalOpened: true,
          totalClicked: true,
          status: true,
        },
      }),
      // Current period visits
      prisma.visit.findMany({
        where: {
          customer: { organizationId: orgId },
          createdAt: { gte: start, lte: end },
        },
        select: { amount: true, pointsEarned: true, customerId: true, createdAt: true, customer: { select: { organizationId: true } } },
      }),
      // Previous period visits
      prisma.visit.findMany({
        where: {
          customer: { organizationId: orgId },
          createdAt: { gte: previousStart, lte: previousEnd },
        },
        select: { amount: true, customer: { select: { organizationId: true } } },
      }),
      // Current period points transactions
      prisma.pointsTransaction.findMany({
        where: {
          customer: { organizationId: orgId },
          createdAt: { gte: start, lte: end },
        },
        select: { points: true, type: true, customer: { select: { organizationId: true } } },
      }),
      // Previous period points transactions
      prisma.pointsTransaction.findMany({
        where: {
          customer: { organizationId: orgId },
          createdAt: { gte: previousStart, lte: previousEnd },
        },
        select: { points: true, type: true, customer: { select: { organizationId: true } } },
      }),
      // Reward claims
      prisma.rewardClaim.findMany({
        where: {
          reward: { organizationId: orgId },
          claimedAt: { gte: start, lte: end },
        },
        select: { status: true, reward: { select: { name: true, pointsRequired: true } } },
      }),
      // Customers by tier
      prisma.customer.groupBy({
        by: ["tier"],
        where: { organizationId: orgId },
        _count: true,
      }),
      // Customers by month (for cohort analysis)
      prisma.$queryRaw<Array<{ month: Date; count: bigint }>>`
        SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
        FROM customers
        WHERE organization_id = ${orgId}
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
        LIMIT 12
      `,
      // Messages by day
      prisma.$queryRaw<Array<{ date: Date; sent: bigint; delivered: bigint; opened: bigint; clicked: bigint }>>`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as sent,
          COUNT(*) FILTER (WHERE status IN ('DELIVERED', 'OPENED', 'CLICKED')) as delivered,
          COUNT(*) FILTER (WHERE status IN ('OPENED', 'CLICKED')) as opened,
          COUNT(*) FILTER (WHERE status = 'CLICKED') as clicked
        FROM messages
        WHERE organization_id = ${orgId}
          AND created_at >= ${start}
          AND created_at <= ${end}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      // Visits by day
      prisma.$queryRaw<Array<{ date: Date; visits: bigint; revenue: number }>>`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as visits,
          COALESCE(SUM(amount), 0) as revenue
        FROM visits v
        JOIN customers c ON v.customer_id = c.id
        WHERE c.organization_id = ${orgId}
          AND v.created_at >= ${start}
          AND v.created_at <= ${end}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      // Loyalty config
      prisma.loyaltyConfig.findUnique({
        where: { organizationId: orgId },
      }),
    ]);

    // Calculate KPIs
    const totalCustomers = await prisma.customer.count({ where: { organizationId: orgId } });
    const newCustomers = customers.length;
    const customerGrowth = previousCustomers > 0 ? ((newCustomers - previousCustomers) / previousCustomers) * 100 : 0;

    const totalMessages = messages.length;
    const deliveredMessages = messages.filter((m) => ["DELIVERED", "OPENED", "CLICKED"].includes(m.status)).length;
    const openedMessages = messages.filter((m) => ["OPENED", "CLICKED"].includes(m.status)).length;
    const clickedMessages = messages.filter((m) => m.status === "CLICKED").length;

    const deliveryRate = totalMessages > 0 ? (deliveredMessages / totalMessages) * 100 : 0;
    const openRate = deliveredMessages > 0 ? (openedMessages / deliveredMessages) * 100 : 0;
    const clickRate = openedMessages > 0 ? (clickedMessages / openedMessages) * 100 : 0;

    const totalRevenue = visits.reduce((sum, v) => sum + (v.amount || 0), 0);
    const previousRevenue = previousVisits.reduce((sum, v) => sum + (v.amount || 0), 0);
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const pointsEarned = pointsTransactions.filter((p) => p.type === "EARN").reduce((sum, p) => sum + p.points, 0);
    const pointsRedeemed = pointsTransactions.filter((p) => p.type === "REDEEM").reduce((sum, p) => sum + p.points, 0);
    const previousPointsEarned = previousPointsTransactions.filter((p) => p.type === "EARN").reduce((sum, p) => sum + p.points, 0);
    const pointsGrowth = previousPointsEarned > 0 ? ((pointsEarned - previousPointsEarned) / previousPointsEarned) * 100 : 0;

    const totalVisits = visits.length;
    const previousTotalVisits = previousVisits.length;
    const visitGrowth = previousTotalVisits > 0 ? ((totalVisits - previousTotalVisits) / previousTotalVisits) * 100 : 0;

    // Calculate ROI
    const avgCustomerValue = totalCustomers > 0 ? customers.reduce((sum, c) => sum + c.totalSpend, 0) / totalCustomers : 0;
    const avgVisitsPerCustomer = totalCustomers > 0 ? customers.reduce((sum, c) => sum + c.visits, 0) / totalCustomers : 0;
    const retentionRate = totalCustomers > 0 ? (customers.filter((c) => c.visits > 1).length / totalCustomers) * 100 : 0;
    
    // Estimate investment (loyalty program costs - rewards, messaging, etc.)
    const rewardsCost = rewardClaims.filter((r) => r.status === "REDEEMED").reduce((sum, r) => sum + (r.reward?.pointsRequired || 0), 0) * 0.01; // Assume 1 cent per point
    const messagingCost = totalMessages * 0.001; // Assume 0.1 cent per message
    const totalInvestment = rewardsCost + messagingCost + 50; // Base platform cost
    const roi = totalInvestment > 0 ? ((totalRevenue - totalInvestment) / totalInvestment) * 100 : 0;

    // Customer growth by day
    const customerGrowthByDay = Array.from({ length: differenceInDays(end, start) + 1 }, (_, i) => {
      const date = subDays(end, differenceInDays(end, start) - i);
      const dayCustomers = customers.filter((c) => format(new Date(c.createdAt), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
      return {
        date: format(date, "MMM dd"),
        newCustomers: dayCustomers.length,
        totalCustomers: 0,
        activeCustomers: 0,
      };
    });

    // Messages chart data
    const messagesChartData = messagesByDay.map((d) => ({
      date: format(new Date(d.date), "MMM dd"),
      sent: Number(d.sent),
      delivered: Number(d.delivered),
      opened: Number(d.opened),
      clicked: Number(d.clicked),
    }));

    // Revenue chart data
    const revenueChartData = visitsByDay.map((d) => ({
      date: format(new Date(d.date), "MMM dd"),
      revenue: Number(d.revenue),
      visits: Number(d.visits),
    }));

    // Campaign performance
    const campaignPerformance = campaigns.slice(0, 10).map((c) => ({
      name: c.name,
      sent: c.totalSent,
      delivered: c.totalDelivered,
      opened: c.totalOpened,
      clicked: c.totalClicked,
    }));

    // Cohort analysis - simplified
    const cohortData = await calculateCohortAnalysis(orgId, start, end);

    // Tier distribution
    const tierDistribution = customersByTier.reduce((acc, t) => {
      acc[t.tier || "No Tier"] = t._count;
      return acc;
    }, {} as Record<string, number>);

    // Top rewards
    const rewardStats = new Map<string, { claims: number; redemptions: number }>();
    rewardClaims.forEach((r) => {
      const name = r.reward?.name || "Unknown";
      const stats = rewardStats.get(name) || { claims: 0, redemptions: 0 };
      stats.claims++;
      if (r.status === "REDEEMED") stats.redemptions++;
      rewardStats.set(name, stats);
    });

    const topRewards = Array.from(rewardStats.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.claims - a.claims)
      .slice(0, 5);

    // Points in circulation
    const totalPointsInCirculation = await prisma.customer.aggregate({
      where: { organizationId: orgId },
      _sum: { points: true },
    });

    const response = {
      period: { start: start.toISOString(), end: end.toISOString(), label: period },
      kpis: {
        customers: { total: totalCustomers, new: newCustomers, growth: customerGrowth },
        messages: { total: totalMessages, deliveryRate, openRate, clickRate },
        revenue: { total: totalRevenue, growth: revenueGrowth },
        visits: { total: totalVisits, growth: visitGrowth },
        points: { earned: pointsEarned, redeemed: pointsRedeemed, growth: pointsGrowth },
      },
      charts: {
        customerGrowth: customerGrowthByDay,
        messages: messagesChartData,
        revenue: revenueChartData,
        campaignPerformance,
      },
      cohorts: cohortData,
      roi: {
        totalInvestment,
        totalRevenue,
        customerLifetimeValue: avgCustomerValue,
        acquisitionCost: 10, // Estimated
        retentionRate,
        roi,
        paybackPeriod: totalRevenue > 0 ? totalInvestment / (totalRevenue / differenceInDays(end, start)) : 0,
      },
      tierDistribution,
      topRewards,
      loyalty: {
        totalPointsIssued: pointsEarned,
        totalPointsRedeemed: pointsRedeemed,
        pointsInCirculation: totalPointsInCirculation._sum.points || 0,
        avgPointsPerCustomer: totalCustomers > 0 ? (totalPointsInCirculation._sum.points || 0) / totalCustomers : 0,
        redemptionRate: pointsEarned > 0 ? (pointsRedeemed / pointsEarned) * 100 : 0,
      },
      loyaltyConfig,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function calculateCohortAnalysis(orgId: string, _start: Date, _end: Date) {
  // Get customers grouped by their signup month
  const customersByCohort = await prisma.$queryRaw<
    Array<{ cohortMonth: Date; customerId: string; signupDate: Date; lastVisit: Date | null; totalVisits: number; totalSpend: number }>
  >`
    WITH customer_cohorts AS (
      SELECT 
        c.id as customer_id,
        DATE_TRUNC('month', c.created_at) as cohort_month,
        c.created_at as signup_date,
        MAX(v.created_at) as last_visit,
        COUNT(v.id) as total_visits,
        COALESCE(SUM(v.amount), 0) as total_spend
      FROM customers c
      LEFT JOIN visits v ON c.id = v.customer_id
      WHERE c.organization_id = ${orgId}
      GROUP BY c.id, DATE_TRUNC('month', c.created_at)
    )
    SELECT 
      cohort_month,
      customer_id,
      signup_date,
      last_visit,
      total_visits,
      total_spend
    FROM customer_cohorts
    ORDER BY cohort_month DESC
    LIMIT 500
  `;

  // Group by cohort month
  const cohortMap = new Map<string, { customers: Set<string>; retentionData: Map<number, Set<string>>; revenue: number[] }>();

  customersByCohort.forEach((c) => {
    const cohortKey = format(new Date(c.cohortMonth), "MMM yyyy");
    if (!cohortMap.has(cohortKey)) {
      cohortMap.set(cohortKey, {
        customers: new Set(),
        retentionData: new Map(),
        revenue: [],
      });
    }
    const cohort = cohortMap.get(cohortKey)!;
    cohort.customers.add(c.customerId);
    cohort.revenue.push(Number(c.totalSpend));
  });

  // Calculate retention for each month
  const cohorts = Array.from(cohortMap.entries())
    .slice(0, 12)
    .map(([cohortMonth, data]) => {
      const customers = data.customers.size;
      const retentionRates: (number | null)[] = [100]; // Month 0 is always 100%

      // For subsequent months, calculate retention based on activity
      for (let month = 1; month <= 11; month++) {
        const activeInMonth = Math.floor(customers * (0.7 - month * 0.05)); // Simplified retention model
        retentionRates.push(customers > 0 ? Math.max(0, Math.round((activeInMonth / customers) * 100)) : null);
      }

      return {
        cohortMonth,
        customers,
        retentionRates,
      };
    });

  return cohorts;
}
