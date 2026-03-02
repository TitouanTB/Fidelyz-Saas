import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppFromRestaurant } from "@/lib/twilio";
import { generateGoogleWalletJWT } from "@/lib/wallet/google";
import { createEvent, getClientIP, getUserAgent } from "@/lib/events";
import { MessageStatus, Channel } from "@prisma/client";

/**
 * WhatsApp Webhook for Twilio
 * Handles incoming WhatsApp messages and responds automatically
 *
 * Expected message format: "FIDELYZ-[code]" where [code] is the restaurant slug
 */

/**
 * Extract restaurant code from message
 * Format: FIDELYZ-[code]
 */
function extractRestaurantCode(message: string): string | null {
  const match = message.match(/FIDELYZ-([A-Za-z0-9-]+)/i);
  return match ? match[1] : null;
}

/**
 * Clean phone number to standard format (remove +, spaces, dashes)
 */
function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s\-\+]/g, "");
}

/**
 * POST /api/webhooks/twilio
 * Handle incoming WhatsApp messages
 */
export async function POST(request: NextRequest) {
  try {
    // Check if WhatsApp feature is enabled
    if (process.env.ENABLE_WHATSAPP !== "true") {
      console.log("WhatsApp feature is disabled");
      return new NextResponse("OK", { status: 200 });
    }

    // Parse Twilio webhook (form data)
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries());

    const from = body.From as string; // WhatsApp number of sender (e.g., whatsapp:+1234567890)
    const messageBody = body.Body as string; // Message content
    const messageSid = body.MessageSid as string; // Message ID

    // Clean sender phone number
    const senderPhone = from.replace("whatsapp:", "");

    console.log(`Received WhatsApp message from ${senderPhone}: ${messageBody}`);

    // Extract restaurant code from message
    const restaurantCode = extractRestaurantCode(messageBody);

    if (!restaurantCode) {
      console.log("No restaurant code found in message");
      // Return 200 to acknowledge, but don't send a response
      return new NextResponse("OK", { status: 200 });
    }

    // Find organization by slug (restaurant code)
    const organization = await prisma.organization.findUnique({
      where: { slug: restaurantCode },
      include: {
        loyaltyConfigs: {
          where: { isActive: true },
        },
      },
    });

    if (!organization) {
      console.log(`Organization not found for code: ${restaurantCode}`);
      return new NextResponse("OK", { status: 200 });
    }

    // Check if organization has WhatsApp enabled (has a WhatsApp number)
    if (!organization.whatsappNumber) {
      console.log(`Organization ${organization.slug} has no WhatsApp number configured`);
      return new NextResponse("OK", { status: 200 });
    }

    // Find customer by phone number
    const cleanSenderPhone = cleanPhoneNumber(senderPhone);
    const customer = await prisma.customer.findFirst({
      where: {
        organizationId: organization.id,
        phone: {
          contains: cleanSenderPhone,
        },
      },
    });

    if (!customer) {
      console.log(`Customer not found for phone: ${senderPhone}`);
      return new NextResponse("OK", { status: 200 });
    }

    // Get loyalty config for visit count info
    const loyaltyConfig = organization.loyaltyConfigs[0];
    const visitsForReward = loyaltyConfig?.visitsForReward || 10;
    const currentVisits = customer.visits;
    const remainingVisits = Math.max(0, visitsForReward - currentVisits);

    // Create event: whatsapp_inbound
    await createEvent({
      organizationId: organization.id,
      clientId: customer.id,
      type: "whatsapp_inbound",
      eventName: "WhatsApp message received",
      properties: {
        messageSid,
        messageBody,
        senderPhone,
        restaurantCode,
      },
      userAgent: getUserAgent(request),
      ipAddress: getClientIP(request),
    });

    // Detect if user is Android (from message metadata or default to false)
    // Note: Twilio doesn't send user-agent for incoming WhatsApp messages
    // In a real implementation, you'd store the user's device preference from a previous interaction
    const isAndroid = false; // Default to false for now
    const includeGoogleWalletLink = isAndroid && customer.googleWalletPassId;

    // Generate Google Wallet link if needed
    let googleWalletLink = "";
    if (includeGoogleWalletLink) {
      const walletResult = await generateGoogleWalletJWT(
        organization.id,
        customer.id
      );
      if (walletResult.success && walletResult.url) {
        googleWalletLink = walletResult.url;
      }
    }

    // Generate personal page link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const personalPageLink = `${appUrl}/c/${customer.personalPageToken}`;

    // Build response message
    const firstName = customer.firstName || "Bonjour";
    const responseMessage = `${firstName} ! 🎉

Votre carte de fidélité ${organization.name} est prête.

🏆 Visites : ${currentVisits}/${visitsForReward} pour votre prochaine récompense
${includeGoogleWalletLink && googleWalletLink ? `📱 Votre carte : ${googleWalletLink}` : ""}
🔗 Votre espace : ${personalPageLink}

Montrez ce QR code en caisse à chaque visite !

💡 Installez notre application pour accéder à toutes vos fonctionnalités : ${appUrl}`;

    // Send WhatsApp message from restaurant's number
    const waResult = await sendWhatsAppFromRestaurant(
      senderPhone,
      responseMessage,
      organization.whatsappNumber
    );

    // Log message in database
    const messageRecord = await prisma.message.create({
      data: {
        organizationId: organization.id,
        customerId: customer.id,
        channel: Channel.WHATSAPP,
        attemptedChannels: [Channel.WHATSAPP],
        subject: "Carte de fidélité",
        content: responseMessage,
        status: MessageStatus.SENT,
        externalId: waResult.sid,
        sentAt: new Date(),
        metadata: {
          trigger: "whatsapp_bot",
          messageSid,
          isAndroid,
          includeGoogleWalletLink,
          googleWalletLink,
        },
      },
    });

    // Create event: whatsapp_reply_sent
    await createEvent({
      organizationId: organization.id,
      clientId: customer.id,
      type: "whatsapp_reply_sent",
      eventName: "WhatsApp reply sent",
      properties: {
        messageId: messageRecord.id,
        externalId: waResult.sid,
        messageLength: responseMessage.length,
        isAndroid,
        includeGoogleWalletLink,
      },
      userAgent: getUserAgent(request),
      ipAddress: getClientIP(request),
    });

    console.log(`WhatsApp reply sent to ${senderPhone}, SID: ${waResult.sid}`);

    // Return TwiML (empty response, just acknowledge)
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);

    // Log the error but return 200 to Twilio to avoid retries
    // In production, you might want to send alerts to monitoring
    return new NextResponse("OK", { status: 200 });
  }
}

/**
 * GET /api/webhooks/twilio
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    webhook: "whatsapp",
    enabled: process.env.ENABLE_WHATSAPP === "true",
  });
}
