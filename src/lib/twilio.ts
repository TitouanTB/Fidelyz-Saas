import Twilio from "twilio";
import { featureFlags, isFeatureEnabled } from "./feature-flags";

let twilioClient: Twilio.Twilio | null = null;

/**
 * Get Twilio client with graceful degradation
 * Returns null if Twilio is not configured or feature flags are disabled
 */
function getTwilioClient(): Twilio.Twilio | null {
  if (!isFeatureEnabled("enableSMS") && !isFeatureEnabled("enableWhatsApp")) {
    console.warn("Twilio is disabled via feature flags");
    return null;
  }

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn("Twilio credentials not configured");
    return null;
  }

  if (!twilioClient) {
    try {
      twilioClient = Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } catch (error) {
      console.error("Failed to initialize Twilio:", error);
      return null;
    }
  }

  return twilioClient;
}

/**
 * Wrapper for Twilio operations with graceful degradation
 */
async function withTwilio<T>(
  operation: (client: Twilio.Twilio) => Promise<T>,
  fallback: T
): Promise<T> {
  const client = getTwilioClient();

  if (!client) {
    console.warn("Twilio unavailable, using fallback");
    return fallback;
  }

  try {
    return await operation(client);
  } catch (error) {
    console.error("Twilio operation failed:", error);
    return fallback;
  }
}

/**
 * Send SMS with graceful degradation
 */
export const sendSMS = async (
  to: string,
  body: string
): Promise<{
  success: boolean;
  sid?: string;
  status?: string;
  to?: string;
  from?: string;
  error?: string;
}> => {
  if (!isFeatureEnabled("enableSMS")) {
    return { success: false, error: "SMS is disabled" };
  }

  return withTwilio<{
    success: boolean;
    sid?: string;
    status?: string;
    to?: string;
    from?: string;
    error?: string;
  }>(
    async (client) => {
      const message = await client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to,
      });

      return {
        success: true,
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
      };
    },
    { success: false, error: "SMS service unavailable" }
  );
};

/**
 * Send WhatsApp message with graceful degradation
 */
export const sendWhatsApp = async (
  to: string,
  body: string
): Promise<{
  success: boolean;
  sid?: string;
  status?: string;
  to?: string;
  from?: string;
  error?: string;
}> => {
  if (!isFeatureEnabled("enableWhatsApp")) {
    return { success: false, error: "WhatsApp is disabled" };
  }

  if (!process.env.TWILIO_WHATSAPP_NUMBER) {
    return { success: false, error: "WhatsApp number not configured" };
  }

  return withTwilio<{
    success: boolean;
    sid?: string;
    status?: string;
    to?: string;
    from?: string;
    error?: string;
  }>(
    async (client) => {
      const message = await client.messages.create({
        body,
        from: process.env.TWILIO_WHATSAPP_NUMBER!,
        to: `whatsapp:${to}`,
      });

      return {
        success: true,
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
      };
    },
    { success: false, error: "WhatsApp service unavailable" }
  );
};

/**
 * Send WhatsApp message from a restaurant's WhatsApp Business number
 * This uses the restaurant's own WhatsApp number (via Twilio Embedded Signup Meta)
 */
export const sendWhatsAppFromRestaurant = async (
  to: string,
  body: string,
  from: string
): Promise<{
  success: boolean;
  sid?: string;
  status?: string;
  to?: string;
  from?: string;
  error?: string;
}> => {
  if (!isFeatureEnabled("enableWhatsApp")) {
    return { success: false, error: "WhatsApp is disabled" };
  }

  return withTwilio<{
    success: boolean;
    sid?: string;
    status?: string;
    to?: string;
    from?: string;
    error?: string;
  }>(
    async (client) => {
      const message = await client.messages.create({
        body,
        from: `whatsapp:${from}`,
        to: `whatsapp:${to}`,
      });

      return {
        success: true,
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
      };
    },
    { success: false, error: "WhatsApp service unavailable" }
  );
};

/**
 * Send bulk SMS with graceful degradation
 */
export const sendBulkSMS = async (
  recipients: string[],
  body: string
): Promise<Array<{
  to: string;
  success: boolean;
  data: unknown;
  error: string | null;
}>> => {
  if (!isFeatureEnabled("enableSMS")) {
    return recipients.map((to) => ({
      to,
      success: false,
      data: null,
      error: "SMS is disabled",
    }));
  }

  const results = await Promise.all(
    recipients.map(async (to) => {
      const result = await sendSMS(to, body);
      return {
        to,
        success: result.success,
        data: result.sid ? { sid: result.sid, status: result.status } : null,
        error: result.error || null,
      };
    })
  );

  return results;
};

// Export twilioClient getter for advanced operations
export const getTwilio = (): Twilio.Twilio | null => {
  return getTwilioClient();
};

// Check if SMS is available
export const isSMSAvailable = (): boolean => {
  return isFeatureEnabled("enableSMS") && 
    !!process.env.TWILIO_ACCOUNT_SID && 
    !!process.env.TWILIO_AUTH_TOKEN &&
    !!process.env.TWILIO_PHONE_NUMBER;
};

// Check if WhatsApp is available
export const isWhatsAppAvailable = (): boolean => {
  return isFeatureEnabled("enableWhatsApp") && 
    !!process.env.TWILIO_ACCOUNT_SID && 
    !!process.env.TWILIO_AUTH_TOKEN &&
    !!process.env.TWILIO_WHATSAPP_NUMBER;
};
