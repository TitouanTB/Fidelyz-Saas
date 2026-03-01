import Twilio from "twilio";

const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const sendSMS = async (to: string, body: string) => {
  const message = await twilioClient.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  });

  return {
    sid: message.sid,
    status: message.status,
    to: message.to,
    from: message.from,
  };
};

export const sendWhatsApp = async (to: string, body: string) => {
  const message = await twilioClient.messages.create({
    body,
    from: process.env.TWILIO_WHATSAPP_NUMBER!,
    to: `whatsapp:${to}`,
  });

  return {
    sid: message.sid,
    status: message.status,
    to: message.to,
    from: message.from,
  };
};

/**
 * Send WhatsApp message from a restaurant's WhatsApp Business number
 * This uses the restaurant's own WhatsApp number (via Twilio Embedded Signup Meta)
 */
export const sendWhatsAppFromRestaurant = async (
  to: string,
  body: string,
  from: string
) => {
  const message = await twilioClient.messages.create({
    body,
    from: `whatsapp:${from}`,
    to: `whatsapp:${to}`,
  });

  return {
    sid: message.sid,
    status: message.status,
    to: message.to,
    from: message.from,
  };
};

export const sendBulkSMS = async (recipients: string[], body: string) => {
  const results = await Promise.allSettled(
    recipients.map((to) => sendSMS(to, body))
  );

  return results.map((result, index) => ({
    to: recipients[index],
    success: result.status === "fulfilled",
    data: result.status === "fulfilled" ? result.value : null,
    error: result.status === "rejected" ? (result.reason as Error).message : null,
  }));
};

export { twilioClient };