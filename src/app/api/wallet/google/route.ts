import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateGoogleWalletJWT } from "@/lib/wallet/google";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/wallet/google
 * Generate a Google Wallet JWT link for adding a pass
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: "Missing customerId" },
        { status: 400 }
      );
    }

    // Get the customer to verify access
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { organization: true },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Generate Google Wallet JWT
    const result = await generateGoogleWalletJWT(
      customer.organizationId,
      customer.id
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate wallet link" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      jwt: result.jwt,
    });
  } catch (error) {
    console.error("Google Wallet API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wallet/google
 * Check if Google Wallet is available
 */
export async function GET() {
  const isConfigured = !!(
    process.env.GOOGLE_WALLET_ISSUER_ID &&
    process.env.GOOGLE_WALLET_CLASS_ID &&
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_KEY
  );

  return NextResponse.json({
    enabled: isConfigured && process.env.ENABLE_WALLET === "true",
  });
}
