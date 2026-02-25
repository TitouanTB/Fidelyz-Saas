import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  pageSlug: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    let organizationId: string | undefined;

    if (parsed.data.pageSlug) {
      const page = await prisma.publicPage.findFirst({
        where: { slug: parsed.data.pageSlug, isActive: true },
        select: { organizationId: true },
      });
      organizationId = page?.organizationId;
    }

    if (!organizationId) {
      return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email: parsed.data.email,
        },
      },
    });

    if (existingCustomer) {
      return NextResponse.json({
        customer: {
          id: existingCustomer.id,
          email: existingCustomer.email,
          firstName: existingCustomer.firstName,
          lastName: existingCustomer.lastName,
          points: existingCustomer.points,
          tier: existingCustomer.tier,
        },
      });
    }

    const loyaltyConfig = await prisma.loyaltyConfig.findUnique({
      where: { organizationId },
    });

    const welcomeBonus = loyaltyConfig?.welcomeBonus || 0;

    const customer = await prisma.customer.create({
      data: {
        organizationId,
        email: parsed.data.email,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
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
          description: "Welcome bonus",
        },
      });
    }

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        points: customer.points,
        tier: customer.tier,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Public signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}