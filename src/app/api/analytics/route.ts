import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay, format, differenceInDays } from "date-fns";
import { z } from "zod";

const querySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y", "custom"]).default("30d"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

type Period = z.infer<typeof querySchema>["period"];

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

import { getAuthContext } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { user, member, organization } = await getAuthContext();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!member || !organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const orgId = member.organizationId;
    
    // Validate Query Parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const result = querySchema.safeParse(searchParams);
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid query parameters", details: result.error.format() }, { status: 400 });
    }

    const { period, startDate, endDate } = result.data;

    const { start, end } = getDateRange(period, startDate, endDate);
    const previousStart = subDays(start, differenceInDays(end, start));
    const previousEnd = subDays(start, 1);

    // To prevent overwhelming the Prisma connection pool on Vercel (especially without PgBouncer),
    // we split the heavy parallel queries into logical sequential batches.

    // Batch 1: Core Customer & Growth Metrics
    const [
      customers,
      previousCustomers,
      customersByTier,
      customersByMonth,
    ] = await Promise.all([
      prisma.customer.findMany({
        where: { organizationId: orgId, createdAt: { gte: start, lte: end } },
        select: { id: true, points: true, totalSpend: true, visits: true, tier: true, createdAt: true },
      }),
      prisma.customer.count({
        where: { organizationId: orgId, createdAt: { gte: previousStart, lte: previousEnd } },
      }),
      prisma.customer.groupBy({
        by: ["tier"],
        where: { organizationId: orgId },
        _count: true,
      }),
      prisma.$queryRaw<Array<{ month: Date; count: bigint }>>`
        SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
        FROM customers
        WHERE organization_id = ${orgId}
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
        LIMIT 12
      `,
    ]);

    // Batch 2: Messages & Campaigns
    const [
      messages,
      previousMessages,
      campaigns,
      messagesByDay,
    ] = await Promise.all([
      prisma.message.findMany({
        where: { organizationId: orgId, createdAt: { gte: start, lte: end } },
        select: { id: true, status: true, createdAt: true },
      }),
      prisma.message.count({
        where: { organizationId: orgId, createdAt: { gte: previousStart, lte: previousEnd } },
      }),
      prisma.campaign.findMany({
        where: { organizationId: orgId },
        select: { id: true, name: true, totalSent: true, totalDelivered: true, totalOpened: true, totalClicked: true, status: true },
      }),
      prisma.$queryRaw<Array<{ date: Date; sent: bigint; delivered: bigint; opened: bigint; clicked: bigint }>>`
        SELECT DATE(created_at) as date, COUNT(*) as sent, COUNT(*) FILTER (WHERE status IN ('DELIVERED', 'OPENED', 'CLICKED')) as delivered, COUNT(*) FILTER (WHERE status IN ('OPENED', 'CLICKED')) as opened, COUNT(*) FILTER (WHERE status = 'CLICKED') as clicked
        FROM messages
        WHERE organization_id = ${orgId} AND created_at >= ${start} AND created_at <= ${end}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    // Batch 3: Revenue, Visits & Loyalty
    const [
      visits,
      previousVisits,
      pointsTransactions,
      previousPointsTransactions,
      rewardClaims,
      visitsByDay,
      loyaltyConfig,
    ] = await Promise.all([
      prisma.visit.findMany({
        where: { customer: { organizationId: orgId }, createdAt: { gte: start, lte: end } },
        select: { amount: true, pointsEarned: true, customerId: true, createdAt: true, customer: { select: { organizationId: true } } },
      }),
      prisma.visit.findMany({
        where: { customer: { organizationId: orgId }, createdAt: { gte: previousStart, lte: previousEnd } },
        select: { amount: true, customer: { select: { organizationId: true } } },
      }),
      prisma.pointsTransaction.findMany({
        where: { customer: { organizationId: orgId }, createdAt: { gte: start, lte: end } },
        select: { points: true, type: true, customer: { select: { organizationId: true } } },
      }),
      prisma.pointsTransaction.findMany({
        where: { customer: { organizationId: orgId }, createdAt: { gte: previousStart, lte: previousEnd } },
        select: { points: true, type: true, customer: { select: { organizationId: true } } },
      }),
      prisma.rewardClaim.findMany({
        where: { reward: { organizationId: orgId }, claimedAt: { gte: start, lte: end } },
        select: { status: true, reward: { select: { name: true, pointsRequired: true } } },
      }),
      prisma.$queryRaw<Array<{ date: Date; visits: bigint; revenue: number }>>`
        SELECT DATE(created_at) as date, COUNT(*) as visits, COALESCE(SUM(amount), 0) as revenue
        FROM visits v JOIN customers c ON v.customer_id = c.id
        WHERE c.organization_id = ${orgId} AND v.created_at >= ${start} AND v.created_at <= ${end}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      prisma.loyaltyConfig.findUnique({
        where: { organizationId: orgId },
      }),
    ]);

    // Calculate KPIs
    const totalCustomers = await prisma.customer.count({ where: { organizationId: orgId } });
    const newCustomers = customers.length;
    const customerGrowth = previousCustomers > 0 ? ((newCustomers - previousCustomers) / previousCustomers) * 100 : 0;

    const totalMessages = messages.length;
    const deliveredMessages = messages.filter((m: { status: string }) => ["DELIVERED", "OPENED", "CLICKED"].includes(m.status)).length;
    const openedMessages = messages.filter((m: { status: string }) => ["OPENED", "CLICKED"].includes(m.status)).length;
    const clickedMessages = messages.filter((m: { status: string }) => m.status === "CLICKED").length;

    const deliveryRate = totalMessages > 0 ? (deliveredMessages / totalMessages) * 100 : 0;
    const openRate = deliveredMessages > 0 ? (openedMessages / deliveredMessages) * 100 : 0;
    const clickRate = openedMessages > 0 ? (clickedMessages / openedMessages) * 100 : 0;

    const totalRevenue = visits.reduce((sum: number, v: { amount: number }) => sum + (v.amount || 0), 0);
    const previousRevenue = previousVisits.reduce((sum: number, v: { amount: number }) => sum + (v.amount || 0), 0);
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const pointsEarned = pointsTransactions.filter((p: { type: string }) => p.type === "EARN").reduce((sum: number, p: { points: number }) => sum + p.points, 0);
    const pointsRedeemed = pointsTransactions.filter((p: { type: string }) => p.type === "REDEEM").reduce((sum: number, p: { points: number }) => sum + p.points, 0);
    const previousPointsEarned = previousPointsTransactions.filter((p: { type: string }) => p.type === "EARN").reduce((sum: number, p: { points: number }) => sum + p.points, 0);
    const pointsGrowth = previousPointsEarned > 0 ? ((pointsEarned - previousPointsEarned) / previousPointsEarned) * 100 : 0;

    const totalVisits = visits.length;
    const previousTotalVisits = previousVisits.length;
    const visitGrowth = previousTotalVisits > 0 ? ((totalVisits - previousTotalVisits) / previousTotalVisits) * 100 : 0;

    // Calculate ROI
    const avgCustomerValue = totalCustomers > 0 ? customers.reduce((sum: number, c: { totalSpend: number }) => sum + c.totalSpend, 0) / totalCustomers : 0;
    const avgVisitsPerCustomer = totalCustomers > 0 ? customers.reduce((sum: number, c: { visits: number }) => sum + c.visits, 0) / totalCustomers : 0;
    const retentionRate = totalCustomers > 0 ? (customers.filter((c: { visits: number }) => c.visits > 1).length / totalCustomers) * 100 : 0;
    
    // Estimate investment (loyalty program costs - rewards, messaging, etc.)
    const rewardsCost = rewardClaims.filter((r: { status: string }) => r.status === "REDEEMED").reduce((sum: number, r: { reward: { pointsRequired: number } | null }) => sum + (r.reward?.pointsRequired || 0), 0) * 0.01; // Assume 1 cent per point
    const messagingCost = totalMessages * 0.001; // Assume 0.1 cent per message
    const totalInvestment = rewardsCost + messagingCost + 50; // Base platform cost
    const roi = totalInvestment > 0 ? ((totalRevenue - totalInvestment) / totalInvestment) * 100 : 0;

    // Customer growth by day
    const customerGrowthByDay = Array.from({ length: differenceInDays(end, start) + 1 }, (_, i) => {
      const date = subDays(end, differenceInDays(end, start) - i);
      const dayCustomers = customers.filter((c: { createdAt: Date }) => format(new Date(c.createdAt), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
      return {
        date: format(date, "MMM dd"),
        newCustomers: dayCustomers.length,
        totalCustomers: 0,
        activeCustomers: 0,
      };
    });

    // Messages chart data
    const messagesChartData = messagesByDay.map((d: { date: Date; sent: bigint; delivered: bigint; opened: bigint; clicked: bigint }) => ({
      date: format(new Date(d.date), "MMM dd"),
      sent: Number(d.sent),
      delivered: Number(d.delivered),
      opened: Number(d.opened),
      clicked: Number(d.clicked),
    }));

    // Revenue chart data
    const revenueChartData = visitsByDay.map((d: { date: Date; revenue: number; visits: bigint }) => ({
      date: format(new Date(d.date), "MMM dd"),
      revenue: Number(d.revenue),
      visits: Number(d.visits),
    }));

    // Campaign performance
    const campaignPerformance = campaigns.slice(0, 10).map((c: { name: string; totalSent: number; totalDelivered: number; totalOpened: number; totalClicked: number }) => ({
      name: c.name,
      sent: c.totalSent,
      delivered: c.totalDelivered,
      opened: c.totalOpened,
      clicked: c.totalClicked,
    }));

    // Cohort analysis - simplified
    const cohortData = await calculateCohortAnalysis(orgId, start, end);

    // Tier distribution
    const tierDistribution = customersByTier.reduce((acc: Record<string, number>, t: { tier: string | null; _count: number }) => {
      acc[t.tier || "No Tier"] = t._count;
      return acc;
    }, {} as Record<string, number>);

    // Top rewards
    const rewardStats = new Map<string, { claims: number; redemptions: number }>();
    rewardClaims.forEach((r: { reward: { name: string } | null; status: string }) => {
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
  // A true cohort analysis query. 
  // 1. Assign each customer a cohort month (their first visit or signup date).
  // 2. For every visit they make, calculate how many months after their cohort month it occurred (month_number).
  // 3. Aggregate to find total customers per cohort and distinct customers active in each month_number.
  
  const cohortData = await prisma.$queryRaw<
    Array<{
      cohort_month: Date;
      total_customers: bigint;
      month_number: number;
      active_customers: bigint;
    }>
  >`
    WITH customer_cohorts AS (
      SELECT 
        id as customer_id,
        -- Use the signup date truncated to month as the cohort
        DATE_TRUNC('month', created_at) as cohort_month
      FROM customers
      WHERE organization_id = ${orgId}
    ),
    cohort_sizes AS (
      SELECT 
        cohort_month,
        COUNT(customer_id) as total_customers
      FROM customer_cohorts
      GROUP BY cohort_month
    ),
    customer_activity AS (
      SELECT 
        c.cohort_month,
        c.customer_id,
        -- Calculate the difference in months between the visit and the cohort month
        -- (Year diff * 12) + Month diff
        EXTRACT(YEAR FROM AGE(DATE_TRUNC('month', v.created_at), c.cohort_month)) * 12 +
        EXTRACT(MONTH FROM AGE(DATE_TRUNC('month', v.created_at), c.cohort_month)) as month_number
      FROM customer_cohorts c
      JOIN visits v ON c.customer_id = v.customer_id
    ),
    monthly_retention AS (
      SELECT 
        cohort_month,
        month_number,
        COUNT(DISTINCT customer_id) as active_customers
      FROM customer_activity
      -- Only look at up to 11 months after signup
      WHERE month_number >= 0 AND month_number <= 11
      GROUP BY cohort_month, month_number
    )
    SELECT 
      s.cohort_month,
      s.total_customers,
      CAST(r.month_number AS INTEGER) as month_number,
      CAST(r.active_customers AS BIGINT) as active_customers
    FROM cohort_sizes s
    LEFT JOIN monthly_retention r ON s.cohort_month = r.cohort_month
    ORDER BY s.cohort_month DESC, r.month_number ASC
    LIMIT 200
  `;

  // Format the raw SQL result into the expected array structure
  const formattedCohorts = new Map<string, { customers: number; retentionRates: (number | null)[] }>();

  cohortData.forEach((row: { cohort_month: Date; total_customers: bigint; month_number: number; active_customers: bigint }) => {
    const cohortKey = format(new Date(row.cohort_month), "MMM yyyy");
    
    if (!formattedCohorts.has(cohortKey)) {
      // Initialize with 12 months of nulls
      formattedCohorts.set(cohortKey, {
        customers: Number(row.total_customers),
        retentionRates: Array(12).fill(null),
      });
    }

    const cohort = formattedCohorts.get(cohortKey)!;
    
    // Day 0 (month 0) is always 100% or based on real initial activity?
    // In typical cohorts, month 0 is 100%. If they visited in month X, we calculate %.
    if (row.month_number === 0) {
       cohort.retentionRates[0] = 100;
    } else if (row.month_number !== null && row.month_number > 0 && row.month_number < 12) {
      // Calculate percentage
      const total = cohort.customers;
      const active = Number(row.active_customers);
      cohort.retentionRates[row.month_number] = total > 0 ? Math.round((active / total) * 100) : 0;
    }
  });

  // Ensure Month 0 is always 100 even if they had no visit explicitly recorded in that month
  Array.from(formattedCohorts.values()).forEach(c => c.retentionRates[0] = 100);

  return Array.from(formattedCohorts.entries())
    .map(([cohortMonth, data]) => ({
      cohortMonth,
      customers: data.customers,
      retentionRates: data.retentionRates,
    }))
    .slice(0, 12); // Return top 12 cohorts
}
