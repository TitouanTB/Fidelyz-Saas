import { NextRequest, NextResponse } from "next/server";
import { updateMessageStatus } from "@/lib/messaging";
import { MessageStatus } from "@prisma/client";

/**
 * Handle webhooks from messaging providers (Twilio, Resend, etc.)
 * Updates message status based on delivery events
 */

// Twilio status mapping
const twilioStatusMap: Record<string, MessageStatus> = {
  queued: MessageStatus.QUEUED,
  sending: MessageStatus.SENT,
  sent: MessageStatus.SENT,
  delivered: MessageStatus.DELIVERED,
  undelivered: MessageStatus.FAILED,
  failed: MessageStatus.FAILED,
  received: MessageStatus.DELIVERED,
  accepted: MessageStatus.SENT,
  scheduled: MessageStatus.QUEUED,
  read: MessageStatus.OPENED,
};

// Resend status mapping
const resendStatusMap: Record<string, MessageStatus> = {
  sent: MessageStatus.SENT,
  delivered: MessageStatus.DELIVERED,
  bounced: MessageStatus.BOUNCED,
  complained: MessageStatus.FAILED,
  opened: MessageStatus.OPENED,
  clicked: MessageStatus.CLICKED,
};

/**
 * POST /api/messaging/webhooks
 * Handle status updates from Twilio
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let body: Record<string, unknown>;

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      // Handle form data (Twilio webhooks)
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    }

    // Determine provider from request
    const provider = request.nextUrl.searchParams.get("provider") || "twilio";

    let externalId: string | undefined;
    let status: MessageStatus | undefined;
    let metadata: Record<string, unknown> = {};

    if (provider === "twilio") {
      // Twilio webhook format
      externalId = body.MessageSid as string;
      const twilioStatus = body.MessageStatus as string;
      status = twilioStatusMap[twilioStatus];

      metadata = {
        to: body.To,
        from: body.From,
        errorCode: body.ErrorCode,
        errorMessage: body.ErrorMessage,
        provider: "twilio",
      };
    } else if (provider === "resend") {
      // Resend webhook format
      const eventType = body.type as string;
      const emailData = body.data as Record<string, unknown>;

      externalId = emailData?.email_id as string;
      status = resendStatusMap[eventType];

      metadata = {
        to: emailData?.to,
        from: emailData?.from,
        subject: emailData?.subject,
        provider: "resend",
      };
    } else {
      return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
    }

    if (!externalId || !status) {
      return NextResponse.json(
        { error: "Missing externalId or status" },
        { status: 400 }
      );
    }

    // Update message status
    await updateMessageStatus(externalId, status, metadata);

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messaging/webhooks
 * Handle email link tracking (opens, clicks)
 */
export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type");
    const messageId = request.nextUrl.searchParams.get("messageId");

    if (!messageId || !type) {
      return NextResponse.json(
        { error: "Missing messageId or type" },
        { status: 400 }
      );
    }

    let status: MessageStatus;

    switch (type) {
      case "open":
        status = MessageStatus.OPENED;
        break;
      case "click":
        status = MessageStatus.CLICKED;
        break;
      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Update message status
    await updateMessageStatus(messageId, status, {
      trackedAt: new Date().toISOString(),
    });

    // Return a 1x1 transparent pixel for tracking pixels
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
      "base64"
    );

    return new NextResponse(pixel, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
