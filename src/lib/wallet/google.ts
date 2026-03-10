import { prisma } from "@/lib/prisma";
import { GoogleAuth } from "google-auth-library";
import jwt from "jsonwebtoken";
import { isFeatureEnabled } from "@/lib/feature-flags";

const GOOGLE_WALLET_ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || "";
const GOOGLE_WALLET_CLASS_ID = process.env.GOOGLE_WALLET_CLASS_ID || "";
const GOOGLE_WALLET_SERVICE_ACCOUNT_KEY = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_KEY || "";

/**
 * Check if Google Wallet is available
 */
export const isGoogleWalletAvailable = (): boolean => {
  return (
    isFeatureEnabled("enableGoogleWallet") &&
    !!GOOGLE_WALLET_ISSUER_ID &&
    !!GOOGLE_WALLET_CLASS_ID &&
    !!GOOGLE_WALLET_SERVICE_ACCOUNT_KEY
  );
};

/**
 * Generate a Google Wallet JWT for adding a pass
 * This uses the Google Wallet Passes API
 */
export async function generateGoogleWalletJWT(
  organizationId: string,
  customerId: string
): Promise<{ success: boolean; jwt?: string; url?: string; error?: string }> {
  // Check feature flag
  if (!isFeatureEnabled("enableWallet") || !isFeatureEnabled("enableGoogleWallet")) {
    return {
      success: false,
      error: "Google Wallet is disabled via feature flag",
    };
  }

  // Check configuration
  if (!GOOGLE_WALLET_ISSUER_ID || !GOOGLE_WALLET_CLASS_ID) {
    return {
      success: false,
      error: "Google Wallet not configured",
    };
  }

  if (!GOOGLE_WALLET_SERVICE_ACCOUNT_KEY) {
    return {
      success: false,
      error: "Google Wallet service account key not configured",
    };
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { organization: true },
    });

    if (!customer) {
      return { success: false, error: "Customer not found" };
    }

    // Create service account credentials
    const credentials = JSON.parse(GOOGLE_WALLET_SERVICE_ACCOUNT_KEY);
    const auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
    });

    const client = await auth.getClient();

    // Generate the JWT payload
    const payload = {
      iss: credentials.client_email,
      aud: "google",
      typ: "savetoandroidpay",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      origins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
      request: {
        eventTicketClasses: [
          {
            id: `${GOOGLE_WALLET_ISSUER_ID}.${GOOGLE_WALLET_CLASS_ID}`,
            eventName: {
              defaultValue: {
                language: "fr",
                value: `${customer.organization.name} - Carte de fidélité`,
              },
            },
            issuerName: customer.organization.name,
            reviewStatus: "UNDER_REVIEW",
          },
        ],
        eventTicketObjects: [
          {
            id: `${GOOGLE_WALLET_ISSUER_ID}.${customer.googleWalletPassId}`,
            classId: `${GOOGLE_WALLET_ISSUER_ID}.${GOOGLE_WALLET_CLASS_ID}`,
            state: "ACTIVE",
            heroImage: {
              sourceUri: {
                uri: customer.organization.logoUrl || "",
              },
            },
            barcode: {
              type: "QR_CODE",
              value: customer.personalPageToken,
            },
            ticketHolderName: `${customer.firstName || "Client"} ${customer.lastName || ""}`,
            eventDateTime: {
              dateTime: new Date().toISOString(),
            },
            venue: {
              name: customer.organization.name,
              address: {
                addressLines: [""],
              },
            },
          },
        ],
      },
    };

    // Sign the JWT
    const signedJwt = jwt.sign(payload, credentials.private_key, { algorithm: "RS256" });

    const saveUrl = `https://pay.google.com/gp/v/save/${signedJwt}`;

    // Update customer with pass ID if not already set
    if (!customer.googleWalletPassId) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          googleWalletPassId: `${Date.now()}_${customer.id.substring(0, 8)}`,
        },
      });
    }

    return {
      success: true,
      jwt: signedJwt,
      url: saveUrl,
    };
  } catch (error) {
    console.error("Error generating Google Wallet JWT:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Detect if a user agent is Android
 */
export function isAndroidUserAgent(userAgent?: string): boolean {
  if (!userAgent) return false;
  return /android/i.test(userAgent);
}

/**
 * Detect if a user agent is iOS
 */
export function isIOSUserAgent(userAgent?: string): boolean {
  if (!userAgent) return false;
  return /iphone|ipad|ipod/i.test(userAgent);
}

/**
 * Check if wallet features are available
 */
export const isWalletAvailable = (): boolean => {
  return isFeatureEnabled("enableWallet") && (
    isGoogleWalletAvailable() || 
    isFeatureEnabled("enableAppleWallet")
  );
};
