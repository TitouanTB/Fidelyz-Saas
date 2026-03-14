export { prisma } from "./prisma";
export { stripe, PLANS, getStripePrice, createCheckoutSession, createBillingPortalSession, handleWebhookEvent } from "./stripe";
export type { PlanKey } from "./stripe";
export { getTwilio, sendSMS, sendWhatsApp, sendWhatsAppFromRestaurant, sendBulkSMS, isSMSAvailable, isWhatsAppAvailable } from "./twilio";
export { getResend, sendEmail, sendBulkEmail, sendTemplateEmail, isEmailAvailable } from "./resend";
export { getAI, generateAIContent, generateAIImage, generateAISuggestions, generateAdaptedRewards, generateBrandingSuggestion, generateMiniSiteContent, isAIAvailable } from "./ai";
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

// Event tracking exports
export {
  createEvent,
  getClientIP,
  getUserAgent,
} from "./events";
export type {
  CreateEventParams,
} from "./events";

// Google Wallet exports
export {
  generateGoogleWalletJWT,
  isAndroidUserAgent,
  isIOSUserAgent,
} from "./wallet/google";