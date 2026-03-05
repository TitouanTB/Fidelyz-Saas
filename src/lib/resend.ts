import { Resend } from "resend";
import { featureFlags, isFeatureEnabled } from "./feature-flags";

let resendInstance: Resend | null = null;

/**
 * Get Resend client with graceful degradation
 * Returns null if Resend is not configured or feature flag is disabled
 */
function getResendClient(): Resend | null {
  if (!isFeatureEnabled("enableEmail")) {
    console.warn("Email (Resend) is disabled via feature flag");
    return null;
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("Resend API key not configured");
    return null;
  }

  if (!resendInstance) {
    try {
      resendInstance = new Resend(process.env.RESEND_API_KEY);
    } catch (error) {
      console.error("Failed to initialize Resend:", error);
      return null;
    }
  }

  return resendInstance;
}

/**
 * Wrapper for Resend operations with graceful degradation
 */
async function withResend<T>(
  operation: (resend: Resend) => Promise<{ data?: T; error?: { message: string } }>,
  fallback: { data?: T; error?: { message: string } }
): Promise<{ data?: T; error?: { message: string } }> {
  const resend = getResendClient();

  if (!resend) {
    console.warn("Resend unavailable, using fallback");
    return fallback;
  }

  try {
    return await operation(resend);
  } catch (error) {
    console.error("Resend operation failed:", error);
    return fallback;
  }
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

interface SendTemplateEmailParams extends SendEmailParams {
  templateName: string;
  templateData: Record<string, unknown>;
}

/**
 * Send email with graceful degradation
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailParams): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> => {
  if (!isFeatureEnabled("enableEmail")) {
    return { success: false, error: "Email is disabled" };
  }

  return withResend(
    async (resend) => {
      const result = await resend.emails.send({
        from: from || process.env.EMAIL_FROM!,
        to,
        subject,
        html,
        text,
      });

      if (result.error) {
        return { error: { message: result.error.message } };
      }

      return { data: result.data };
    },
    { error: { message: "Email service unavailable" } }
  ).then((result) => ({
    success: !result.error,
    data: result.data,
    error: result.error?.message,
  }));
};

/**
 * Send bulk email with graceful degradation
 */
export const sendBulkEmail = async (
  emails: SendEmailParams[]
): Promise<Array<{
  to: string | string[];
  success: boolean;
  data: unknown;
  error: string | null;
}>> => {
  if (!isFeatureEnabled("enableEmail")) {
    return emails.map((email) => ({
      to: email.to,
      success: false,
      data: null,
      error: "Email is disabled",
    }));
  }

  const results = await Promise.all(
    emails.map(async (email) => {
      const result = await sendEmail(email);
      return {
        to: email.to,
        success: result.success,
        data: result.data,
        error: result.error || null,
      };
    })
  );

  return results;
};

/**
 * Send template email with graceful degradation
 */
export const sendTemplateEmail = async ({
  to,
  subject,
  templateName,
  templateData,
}: SendTemplateEmailParams): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> => {
  const templates: Record<string, (data: Record<string, unknown>) => string> = {
    welcome: (data) => `
      <h1>Welcome to ${data.appName || "Fidelyz"}!</h1>
      <p>Hello ${data.name || "there"},</p>
      <p>Thank you for joining us. We're excited to have you on board!</p>
      <p>Best regards,<br>The ${data.appName || "Fidelyz"} Team</p>
    `,
    "campaign-update": (data) => `
      <h1>Campaign Update: ${data.campaignName || "Your Campaign"}</h1>
      <p>Hello ${data.name || "there"},</p>
      <p>${data.message || "You have an update on your campaign."}</p>
      <p>Best regards,<br>The Fidelyz Team</p>
    `,
    "points-earned": (data) => `
      <h1>You've earned points!</h1>
      <p>Hello ${data.name || "there"},</p>
      <p>Congratulations! You've earned <strong>${data.points || 0} points</strong>.</p>
      <p>Your total points: <strong>${data.totalPoints || 0}</strong></p>
      <p>Keep up the great work!</p>
    `,
  };

  const html =
    templates[templateName]?.(templateData) ||
    `
    <h1>${subject}</h1>
    <p>${JSON.stringify(templateData)}</p>
  `;

  return sendEmail({ to, subject, html });
};

// Export resend getter for advanced operations
export const getResend = (): Resend | null => {
  return getResendClient();
};

// Check if email is available
export const isEmailAvailable = (): boolean => {
  return isFeatureEnabled("enableEmail") && !!process.env.RESEND_API_KEY;
};
