import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const claimSchema = z.object({
  rewardId: z.string(),
  customerId: z.string(),
});

function generateClaimCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = claimSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const page = await prisma.publicPage.findFirst({
      where: { slug, isActive: true },
      include: { organization: true },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const [customer, reward] = await Promise.all([
      prisma.customer.findFirst({
        where: { id: parsed.data.customerId, organizationId: page.organizationId },
      }),
      prisma.reward.findFirst({
        where: { id: parsed.data.rewardId, organizationId: page.organizationId, isActive: true },
      }),
    ]);

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (!reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    if (customer.points < reward.pointsRequired) {
      return NextResponse.json({ error: "Not enough points" }, { status: 400 });
    }

    if (reward.quantity !== null && reward.claimedCount >= reward.quantity) {
      return NextResponse.json({ error: "Reward no longer available" }, { status: 400 });
    }

    const existingClaim = await prisma.rewardClaim.findFirst({
      where: {
        rewardId: reward.id,
        customerId: customer.id,
        status: "PENDING",
      },
    });

    if (existingClaim) {
      return NextResponse.json({
        error: "You already have a pending claim for this reward",
        existingCode: existingClaim.code,
      }, { status: 400 });
    }

    const code = generateClaimCode();
    const expiresAt = reward.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [claim] = await prisma.$transaction([
      prisma.rewardClaim.create({
        data: {
          rewardId: reward.id,
          customerId: customer.id,
          code,
          expiresAt,
        },
      }),
      prisma.customer.update({
        where: { id: customer.id },
        data: { points: { decrement: reward.pointsRequired } },
      }),
      prisma.pointsTransaction.create({
        data: {
          customerId: customer.id,
          points: -reward.pointsRequired,
          type: "REDEEM",
          source: "reward_claim",
          description: `Claimed: ${reward.name}`,
        },
      }),
      prisma.reward.update({
        where: { id: reward.id },
        data: { claimedCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      claim: {
        id: claim.id,
        code: claim.code,
        expiresAt: claim.expiresAt,
        reward: {
          name: reward.name,
          description: reward.description,
          type: reward.type,
          value: reward.value,
        },
      },
      pointsUsed: reward.pointsRequired,
    });
  } catch (error) {
    console.error("Claim reward error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}