import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";

const claimSchema = z.object({
  organizationId: z.string(),
  rewardId: z.string().optional(),
  firstName: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  channel: z.enum(["whatsapp", "email", "wallet"]),
  feedback: z.string().optional(),
});

function generateCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

function generateToken(): string {
  return randomBytes(16).toString("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = claimSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { organizationId, rewardId, firstName, phone, email, channel, feedback } = parsed.data;

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        loyaltyConfigs: { where: { isActive: true }, take: 1 },
        rewards: rewardId ? { where: { id: rewardId } } : undefined,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Restaurant non trouvé" }, { status: 404 });
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: {
        organizationId,
        phone,
      },
    });

    if (!customer && email) {
      customer = await prisma.customer.findUnique({
        where: {
          organizationId_email: {
            organizationId,
            email,
          },
        },
      });
    }

    const loyaltyConfig = organization.loyaltyConfigs[0];
    const welcomeBonus = loyaltyConfig?.welcomeBonus || 0;

    if (!customer) {
      // Generate a placeholder email if none provided
      const customerEmail = email || `${phone.replace(/\D/g, "")}@placeholder.fidelyz.app`;
      
      customer = await prisma.customer.create({
        data: {
          organizationId,
          firstName,
          phone,
          email: customerEmail,
          points: welcomeBonus,
        },
      });

      if (welcomeBonus > 0) {
        await prisma.pointsTransaction.create({
          data: {
            customerId: customer.id,
            points: welcomeBonus,
            type: "BONUS",
            source: "welcome",
            description: "Bonus de bienvenue",
          },
        });
      }
    } else {
      // Update customer info if needed
      if (firstName && firstName !== customer.firstName) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { firstName },
        });
      }
    }

    // Create reward claim if there's a reward
    let claim = null;
    let code = generateCode();

    if (rewardId) {
      const reward = organization.rewards?.find((r) => r.id === rewardId) ||
        (await prisma.reward.findFirst({
          where: { id: rewardId, organizationId, isActive: true },
        }));

      if (!reward) {
        return NextResponse.json({ error: "Récompense non trouvée" }, { status: 404 });
      }

      code = generateCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

      claim = await prisma.rewardClaim.create({
        data: {
          rewardId: reward.id,
          customerId: customer.id,
          code,
          status: "PENDING",
          expiresAt,
        },
      });
    }

    // Generate customer token for portal access
    const customerToken = customer.id;

    // Track analytics event
    await prisma.analyticsEvent.create({
      data: {
        organizationId,
        eventType: "reward_claim",
        eventName: "reward_claimed",
        properties: {
          customerId: customer.id,
          rewardId: rewardId || null,
          channel,
          hasFeedback: !!feedback,
        },
      },
    });

    // If negative feedback provided, store it
    if (feedback) {
      await prisma.analyticsEvent.create({
        data: {
          organizationId,
          eventType: "feedback",
          eventName: "negative_feedback",
          properties: {
            customerId: customer.id,
            feedback,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      code,
      customerToken,
      customerId: customer.id,
      claimId: claim?.id,
      points: customer.points,
    });
  } catch (error) {
    console.error("Reward claim error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
