import { Channel, MessageStatus, Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { sendEmail, sendTemplateEmail } from "./resend";
import { sendSMS, sendWhatsApp } from "./twilio";

// Channel priority order (highest to lowest)
export const CHANNEL_PRIORITY: Channel[] = [
  "WALLET",
  "WHATSAPP",
  "SMS",
  "EMAIL",
  "PUSH",
];

// Channel capability requirements
interface ChannelCapabilities {
  requiresPhone: boolean;
  requiresEmail: boolean;
  requiresWallet: boolean;
}

const CHANNEL_REQUIREMENTS: Record<Channel, ChannelCapabilities> = {
  WALLET: { requiresPhone: true, requiresEmail: false, requiresWallet: true },
  WHATSAPP: { requiresPhone: true, requiresEmail: false, requiresWallet: false },
  SMS: { requiresPhone: true, requiresEmail: false, requiresWallet: false },
  EMAIL: { requiresPhone: false, requiresEmail: true, requiresWallet: false },
  PUSH: { requiresPhone: false, requiresEmail: false, requiresWallet: false },
};

export interface SendMessageParams {
  organizationId: string;
  customerId: string;
  campaignId?: string;
  channels: Channel[];
  subject?: string;
  content: string;
  templateName?: string;
  templateData?: Record<string, unknown>;
  enableFallback?: boolean;
  priority?: Channel[];
}

export interface CustomerChannelInfo {
  email: string | null;
  phone: string | null;
  walletEnabled: boolean;
  unsubscribed: boolean;
}

export interface SendResult {
  success: boolean;
  channel: Channel;
  messageId?: string;
  externalId?: string;
  error?: string;
  fallbackAttempted?: boolean;
  fallbackChannel?: Channel;
}

/**
 * Check if a customer has the required contact info for a channel
 */
export function canUseChannel(
  channel: Channel,
  customer: CustomerChannelInfo
): boolean {
  if (customer.unsubscribed) return false;

  const requirements = CHANNEL_REQUIREMENTS[channel];

  if (requirements.requiresEmail && !customer.email) return false;
  if (requirements.requiresPhone && !customer.phone) return false;
  if (requirements.requiresWallet && !customer.walletEnabled) return false;

  return true;
}

/**
 * Get available channels for a customer based on their contact info
 */
export function getAvailableChannels(
  channels: Channel[],
  customer: CustomerChannelInfo
): Channel[] {
  return channels.filter((channel) => canUseChannel(channel, customer));
}

/**
 * Sort channels by priority
 */
export function sortChannelsByPriority(
  channels: Channel[],
  priority: Channel[] = CHANNEL_PRIORITY
): Channel[] {
  const priorityMap = new Map(priority.map((c, i) => [c, i]));

  return [...channels].sort((a, b) => {
    const priorityA = priorityMap.get(a) ?? Infinity;
    const priorityB = priorityMap.get(b) ?? Infinity;
    return priorityA - priorityB;
  });
}

/**
 * Get the best available channel for a customer
 */
export function getBestChannel(
  channels: Channel[],
  customer: CustomerChannelInfo,
  priority: Channel[] = CHANNEL_PRIORITY
): Channel | null {
  const availableChannels = getAvailableChannels(channels, customer);
  if (availableChannels.length === 0) return null;

  const sorted = sortChannelsByPriority(availableChannels, priority);
  return sorted[0];
}

/**
 * Generate Apple Wallet pass content
 */
async function sendWalletMessage(
  to: string,
  content: string,
  subject?: string
): Promise<{ externalId: string; status: string }> {
  // In a real implementation, this would integrate with Apple Wallet API
  // For now, we simulate a successful wallet push
  // The content would typically include a wallet pass URL or update

  const walletPassUrl = `https://api.example.com/wallet/passes/${Buffer.from(to).toString("base64")}`;
  const walletContent = `${content}\n\nView your pass: ${walletPassUrl}`;

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    externalId: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: "sent",
  };
}

/**
 * Send message via specific channel
 */
async function sendViaChannel(
  channel: Channel,
  customer: CustomerChannelInfo,
  content: string,
  subject?: string,
  templateName?: string,
  templateData?: Record<string, unknown>
): Promise<{ externalId: string; status: string }> {
  const to = customer.phone || customer.email || "";

  switch (channel) {
    case "EMAIL":
      if (!customer.email) throw new Error("Customer has no email");
      if (templateName) {
        await sendTemplateEmail({
          to: customer.email,
          subject: subject || "Message",
          templateName,
          templateData: templateData || {},
        });
      } else {
        await sendEmail({
          to: customer.email,
          subject: subject || "Message",
          html: content,
        });
      }
      return { externalId: `email_${Date.now()}`, status: "sent" };

    case "SMS":
      if (!customer.phone) throw new Error("Customer has no phone");
      const smsResult = await sendSMS(customer.phone, content);
      return { externalId: smsResult.sid, status: smsResult.status };

    case "WHATSAPP":
      if (!customer.phone) throw new Error("Customer has no phone");
      const waResult = await sendWhatsApp(customer.phone, content);
      return { externalId: waResult.sid, status: waResult.status };

    case "WALLET":
      if (!customer.walletEnabled) throw new Error("Customer has no wallet");
      return await sendWalletMessage(to, content, subject);

    case "PUSH":
      // Push notifications would require a push service integration
      throw new Error("Push notifications not yet implemented");

    default:
      throw new Error(`Unknown channel: ${channel}`);
  }
}

/**
 * Send a message with automatic fallback
 */
export async function sendMessageWithFallback(
  params: SendMessageParams,
  customer: CustomerChannelInfo
): Promise<SendResult> {
  const {
    organizationId,
    customerId,
    campaignId,
    channels,
    subject,
    content,
    templateName,
    templateData,
    enableFallback = true,
    priority = CHANNEL_PRIORITY,
  } = params;

  const sortedChannels = sortChannelsByPriority(channels, priority);
  const attemptedChannels: Channel[] = [];
  let lastError: string | undefined;

  for (const channel of sortedChannels) {
    // Check if customer can receive on this channel
    if (!canUseChannel(channel, customer)) {
      continue;
    }

    attemptedChannels.push(channel);

    try {
      // Send the message
      const result = await sendViaChannel(
        channel,
        customer,
        content,
        subject,
        templateName,
        templateData
      );

      // Create message record
      const message = await prisma.message.create({
        data: {
          organizationId,
          customerId,
          campaignId: campaignId || null,
          channel,
          attemptedChannels,
          subject,
          content,
          status: MessageStatus.SENT,
          externalId: result.externalId,
          sentAt: new Date(),
        },
      });

      return {
        success: true,
        channel,
        messageId: message.id,
        externalId: result.externalId,
        fallbackAttempted: attemptedChannels.length > 1,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);

      // If fallback is disabled, stop here
      if (!enableFallback) {
        break;
      }

      // Continue to next channel (fallback)
      continue;
    }
  }

  // All channels failed or no suitable channel found
  const finalChannel = sortedChannels[sortedChannels.length - 1];

  // Create failed message record
  const failedMessage = await prisma.message.create({
    data: {
      organizationId,
      customerId,
      campaignId: campaignId || null,
      channel: finalChannel || "EMAIL",
      attemptedChannels,
      subject,
      content,
      status: MessageStatus.FAILED,
      failedReason: lastError || "No available channels",
    },
  });

  return {
    success: false,
    channel: finalChannel || "EMAIL",
    messageId: failedMessage.id,
    error: lastError || "No available channels for customer",
  };
}

/**
 * Send bulk messages with priority cascade
 */
export async function sendBulkMessages(
  params: Omit<SendMessageParams, "customerId">,
  customers: Array<{ id: string } & CustomerChannelInfo>
): Promise<SendResult[]> {
  const results: SendResult[] = [];

  // Process in batches to avoid overwhelming the APIs
  const BATCH_SIZE = 10;

  for (let i = 0; i < customers.length; i += BATCH_SIZE) {
    const batch = customers.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map((customer) =>
        sendMessageWithFallback(
          {
            ...params,
            customerId: customer.id,
          },
          customer
        )
      )
    );

    batchResults.forEach((result, index) => {
      const customer = batch[index];
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        results.push({
          success: false,
          channel: params.channels[0],
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        });
      }
    });
  }

  return results;
}

/**
 * Update message status from external provider webhook
 */
export async function updateMessageStatus(
  externalId: string,
  status: MessageStatus,
  metadata?: Record<string, unknown>
): Promise<void> {
  const updateData: Prisma.MessageUpdateInput = {
    status,
  };

  switch (status) {
    case MessageStatus.DELIVERED:
      updateData.deliveredAt = new Date();
      break;
    case MessageStatus.OPENED:
      updateData.openedAt = new Date();
      break;
    case MessageStatus.CLICKED:
      updateData.clickedAt = new Date();
      break;
    case MessageStatus.BOUNCED:
      updateData.bouncedAt = new Date();
      break;
    case MessageStatus.FAILED:
      updateData.failedReason = metadata?.error as string;
      break;
  }

  if (metadata) {
    updateData.metadata = metadata;
  }

  await prisma.message.updateMany({
    where: { externalId },
    data: updateData,
  });
}

/**
 * Get messaging statistics for an organization
 */
export async function getMessagingStats(
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  byChannel: Record<Channel, number>;
}> {
  const where: Prisma.MessageWhereInput = { organizationId };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const messages = await prisma.message.findMany({
    where,
    select: {
      status: true,
      channel: true,
    },
  });

  const stats = {
    total: messages.length,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    failed: 0,
    byChannel: {
      EMAIL: 0,
      SMS: 0,
      WHATSAPP: 0,
      PUSH: 0,
      WALLET: 0,
    } as Record<Channel, number>,
  };

  for (const message of messages) {
    stats.byChannel[message.channel]++;

    switch (message.status) {
      case MessageStatus.SENT:
      case MessageStatus.QUEUED:
        stats.sent++;
        break;
      case MessageStatus.DELIVERED:
        stats.delivered++;
        break;
      case MessageStatus.OPENED:
        stats.opened++;
        break;
      case MessageStatus.CLICKED:
        stats.clicked++;
        break;
      case MessageStatus.FAILED:
      case MessageStatus.BOUNCED:
        stats.failed++;
        break;
    }
  }

  return stats;
}

/**
 * Retry failed messages
 */
export async function retryFailedMessages(
  messageIds: string[],
  fallbackChannels?: Channel[]
): Promise<SendResult[]> {
  const messages = await prisma.message.findMany({
    where: {
      id: { in: messageIds },
      status: MessageStatus.FAILED,
    },
    include: {
      customer: {
        select: {
          email: true,
          phone: true,
          unsubscribed: true,
        },
      },
    },
  });

  const results: SendResult[] = [];

  for (const message of messages) {
    // Determine channels to try (use fallback channels if provided, else try all except the failed one)
    const channelsToTry =
      fallbackChannels ||
      CHANNEL_PRIORITY.filter((c) => c !== message.channel);

    const customerInfo: CustomerChannelInfo = {
      email: message.customer.email,
      phone: message.customer.phone,
      walletEnabled: false, // Would need to be fetched from customer preferences
      unsubscribed: message.customer.unsubscribed,
    };

    const result = await sendMessageWithFallback(
      {
        organizationId: message.organizationId,
        customerId: message.customerId,
        campaignId: message.campaignId || undefined,
        channels: channelsToTry,
        subject: message.subject || undefined,
        content: message.content,
        enableFallback: true,
      },
      customerInfo
    );

    results.push(result);
  }

  return results;
}
