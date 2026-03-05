import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/parcours/[stage] - Get details for a specific journey stage
export async function GET(
  request: Request,
  { params }: { params: Promise<{ stage: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stage } = await params;

    const member = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true }
    });

    if (!member) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get detailed information for each stage
    let details: Record<string, unknown> = {};

    switch (stage) {
      case "QR_SCAN":
        const qrScans = await prisma.qRScan.findMany({
          where: { organizationId: member.organizationId, type: "REWARD" },
          orderBy: { scannedAt: "desc" },
          take: 50,
          include: { client: true }
        });
        details = {
          totalScans: qrScans.length,
          recentScans: qrScans.slice(0, 10),
          byDay: qrScans.reduce((acc, scan) => {
            const day = scan.scannedAt.toISOString().split("T")[0];
            acc[day] = (acc[day] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };
        break;

      case "ACTIVATION":
        const activatedCustomers = await prisma.customer.findMany({
          where: { organizationId: member.organizationId, visits: { gte: 1 } },
          orderBy: { lastVisitAt: "desc" },
          take: 50
        });
        details = {
          totalActivated: activatedCustomers.length,
          recentActivations: activatedCustomers.slice(0, 10)
        };
        break;

      case "WELCOME":
        const welcomeMessages = await prisma.message.findMany({
          where: { 
            organizationId: member.organizationId,
            subject: { contains: "welcome", mode: "insensitive" }
          },
          orderBy: { sentAt: "desc" },
          take: 50,
          include: { customer: true }
        });
        details = {
          totalWelcomeSent: welcomeMessages.length,
          recentWelcomeMessages: welcomeMessages.slice(0, 10)
        };
        break;

      case "REMINDER_D3":
        const reminder3Days = await prisma.customer.findMany({
          where: {
            organizationId: member.organizationId,
            createdAt: {
              gte: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
              lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            }
          },
          take: 50
        });
        details = {
          customersInWindow: reminder3Days.length,
          customers: reminder3Days.slice(0, 10)
        };
        break;

      case "NEXT_VISIT":
        const returningCustomers = await prisma.visit.findMany({
          where: { customer: { organizationId: member.organizationId } },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { customer: true }
        });
        details = {
          totalVisits: returningCustomers.length,
          recentVisits: returningCustomers.slice(0, 10)
        };
        break;

      case "RELANCE_D21":
        const relance21Days = await prisma.customer.findMany({
          where: {
            organizationId: member.organizationId,
            lastVisitAt: {
              gte: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
              lt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
            }
          },
          take: 50
        });
        details = {
          customersInWindow: relance21Days.length,
          customers: relance21Days.slice(0, 10)
        };
        break;

      case "REWARD":
        const rewardClaims = await prisma.rewardClaim.findMany({
          where: { reward: { organizationId: member.organizationId } },
          orderBy: { claimedAt: "desc" },
          take: 50,
          include: { reward: true, customer: true }
        });
        details = {
          totalClaimed: rewardClaims.length,
          pending: rewardClaims.filter(c => c.status === "PENDING").length,
          redeemed: rewardClaims.filter(c => c.status === "REDEEMED").length,
          recentClaims: rewardClaims.slice(0, 10)
        };
        break;

      case "EXPIRATION":
        const expiringPoints = await prisma.pointsTransaction.findMany({
          where: {
            customer: { organizationId: member.organizationId },
            type: "EXPIRE"
          },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { customer: true }
        });
        details = {
          totalExpired: expiringPoints.length,
          recentExpirations: expiringPoints.slice(0, 10)
        };
        break;

      default:
        return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    return NextResponse.json({ data: details });
  } catch (error) {
    console.error("Error fetching journey stage details:", error);
    return NextResponse.json(
      { error: "Failed to fetch stage details" },
      { status: 500 }
    );
  }
}
