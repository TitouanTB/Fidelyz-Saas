export { prisma } from "./prisma";
export { stripe, PLANS, getStripePrice, createCheckoutSession, createBillingPortalSession, handleWebhookEvent } from "./stripe";
export type { PlanKey } from "./stripe";
export { twilioClient, sendSMS, sendWhatsApp, sendBulkSMS } from "./twilio";
export { resend, sendEmail, sendBulkEmail, sendTemplateEmail } from "./resend";
export { genAI, model, generateCampaignSuggestion, analyzeCustomerData, generateEmailContent } from "./ai";
export { cn, formatCurrency, formatDate, formatRelativeDate, generateSlug, truncate, getInitials } from "./utils";
export { createClient, getSupabaseBrowserClient, getAuthUser, getAuthSession, signOut } from "./supabase";
export type { SupabaseClient, User, Session } from "./supabase";

// Multi-channel messaging exports
export {
  CHANNEL_PRIORITY,
  canUseChannel,
  getAvailableChannels,
  sortChannelsByPriority,
  getBestChannel,
  sendMessageWithFallback,
  sendBulkMessages,
  updateMessageStatus,
  getMessagingStats,
  retryFailedMessages,
} from "./messaging";
export type {
  SendMessageParams,
  CustomerChannelInfo,
  SendResult,
} from "./messaging";