import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

export const sendEmail = async ({ to, subject, html, text, from }: SendEmailParams) => {
  const { data, error } = await resend.emails.send({
    from: from || process.env.EMAIL_FROM!,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
};

export const sendBulkEmail = async (emails: SendEmailParams[]) => {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email))
  );

  return results.map((result, index) => ({
    to: emails[index].to,
    success: result.status === "fulfilled",
    data: result.status === "fulfilled" ? result.value : null,
    error: result.status === "rejected" ? (result.reason as Error).message : null,
  }));
};

export const sendTemplateEmail = async ({
  to,
  subject,
  templateName,
  templateData,
}: SendTemplateEmailParams) => {
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

  const html = templates[templateName]?.(templateData) || `
    <h1>${subject}</h1>
    <p>${JSON.stringify(templateData)}</p>
  `;

  return sendEmail({ to, subject, html });
};

export { resend };