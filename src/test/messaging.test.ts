import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  CHANNEL_PRIORITY,
  canUseChannel,
  getAvailableChannels,
  sortChannelsByPriority,
  getBestChannel,
  sendMessageWithFallback,
  sendBulkMessages,
  getMessagingStats,
  retryFailedMessages,
} from "@/lib/messaging";
import { Channel, MessageStatus } from "@prisma/client";

// Mock the prisma client
vi.mock("@/lib/prisma", () => ({
  prisma: {
    message: {
      create: vi.fn(),
      createMany: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

// Mock the resend service
vi.mock("@/lib/resend", () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: "email_123" }),
  sendTemplateEmail: vi.fn().mockResolvedValue({ id: "email_456" }),
}));

// Mock the twilio service
vi.mock("@/lib/twilio", () => ({
  sendSMS: vi.fn().mockResolvedValue({ sid: "sms_123", status: "sent" }),
  sendWhatsApp: vi.fn().mockResolvedValue({ sid: "wa_123", status: "sent" }),
}));

import { prisma } from "@/lib/prisma";
import { sendEmail, sendTemplateEmail } from "@/lib/resend";
import { sendSMS, sendWhatsApp } from "@/lib/twilio";

describe("CHANNEL_PRIORITY", () => {
  it("should have correct priority order", () => {
    expect(CHANNEL_PRIORITY).toEqual([
      "WALLET",
      "WHATSAPP",
      "SMS",
      "EMAIL",
      "PUSH",
    ]);
  });
});

describe("canUseChannel", () => {
  const baseCustomer = {
    email: "test@example.com",
    phone: "+1234567890",
    walletEnabled: true,
    unsubscribed: false,
  };

  it("should allow WALLET when customer has phone and wallet enabled", () => {
    expect(canUseChannel("WALLET", baseCustomer)).toBe(true);
  });

  it("should not allow WALLET when wallet is disabled", () => {
    expect(canUseChannel("WALLET", { ...baseCustomer, walletEnabled: false })).toBe(false);
  });

  it("should allow WHATSAPP when customer has phone", () => {
    expect(canUseChannel("WHATSAPP", baseCustomer)).toBe(true);
  });

  it("should not allow WHATSAPP when customer has no phone", () => {
    expect(canUseChannel("WHATSAPP", { ...baseCustomer, phone: null })).toBe(false);
  });

  it("should allow SMS when customer has phone", () => {
    expect(canUseChannel("SMS", baseCustomer)).toBe(true);
  });

  it("should not allow SMS when customer has no phone", () => {
    expect(canUseChannel("SMS", { ...baseCustomer, phone: null })).toBe(false);
  });

  it("should allow EMAIL when customer has email", () => {
    expect(canUseChannel("EMAIL", baseCustomer)).toBe(true);
  });

  it("should not allow EMAIL when customer has no email", () => {
    expect(canUseChannel("EMAIL", { ...baseCustomer, email: null })).toBe(false);
  });

  it("should not allow any channel when customer is unsubscribed", () => {
    expect(canUseChannel("EMAIL", { ...baseCustomer, unsubscribed: true })).toBe(false);
    expect(canUseChannel("SMS", { ...baseCustomer, unsubscribed: true })).toBe(false);
    expect(canUseChannel("WHATSAPP", { ...baseCustomer, unsubscribed: true })).toBe(false);
  });
});

describe("getAvailableChannels", () => {
  const customer = {
    email: "test@example.com",
    phone: "+1234567890",
    walletEnabled: false,
    unsubscribed: false,
  };

  it("should return only channels customer can use", () => {
    const channels: Channel[] = ["EMAIL", "SMS", "WHATSAPP", "WALLET"];
    const available = getAvailableChannels(channels, customer);
    expect(available).toEqual(["EMAIL", "SMS", "WHATSAPP"]);
  });

  it("should return empty array when customer is unsubscribed", () => {
    const channels: Channel[] = ["EMAIL", "SMS"];
    const available = getAvailableChannels(channels, { ...customer, unsubscribed: true });
    expect(available).toEqual([]);
  });
});

describe("sortChannelsByPriority", () => {
  it("should sort channels by priority order", () => {
    const channels: Channel[] = ["EMAIL", "WALLET", "SMS", "WHATSAPP"];
    const sorted = sortChannelsByPriority(channels);
    expect(sorted).toEqual(["WALLET", "WHATSAPP", "SMS", "EMAIL"]);
  });

  it("should handle custom priority order", () => {
    const channels: Channel[] = ["EMAIL", "SMS", "WHATSAPP"];
    const customPriority: Channel[] = ["EMAIL", "SMS", "WHATSAPP"];
    const sorted = sortChannelsByPriority(channels, customPriority);
    expect(sorted).toEqual(["EMAIL", "SMS", "WHATSAPP"]);
  });

  it("should handle unknown channels by placing them last", () => {
    const channels: Channel[] = ["PUSH", "EMAIL"];
    const sorted = sortChannelsByPriority(channels);
    expect(sorted[sorted.length - 1]).toBe("PUSH");
  });
});

describe("getBestChannel", () => {
  const customer = {
    email: "test@example.com",
    phone: "+1234567890",
    walletEnabled: true,
    unsubscribed: false,
  };

  it("should return WALLET as best channel when available", () => {
    const channels: Channel[] = ["EMAIL", "SMS", "WALLET"];
    const best = getBestChannel(channels, customer);
    expect(best).toBe("WALLET");
  });

  it("should return WHATSAPP when WALLET is not available", () => {
    const channels: Channel[] = ["EMAIL", "SMS", "WHATSAPP"];
    const best = getBestChannel(channels, { ...customer, walletEnabled: false });
    expect(best).toBe("WHATSAPP");
  });

  it("should return null when no channels are available", () => {
    const channels: Channel[] = ["WALLET"];
    const best = getBestChannel(channels, { ...customer, walletEnabled: false });
    expect(best).toBeNull();
  });
});

describe("sendMessageWithFallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseParams = {
    organizationId: "org_123",
    customerId: "cust_123",
    channels: ["WALLET", "WHATSAPP", "SMS", "EMAIL"] as Channel[],
    content: "Test message",
    subject: "Test Subject",
    enableFallback: true,
  };

  const baseCustomer = {
    email: "test@example.com",
    phone: "+1234567890",
    walletEnabled: true,
    unsubscribed: false,
  };

  it("should send via WALLET when available and working", async () => {
    const mockMessage = { id: "msg_123" };
    vi.mocked(prisma.message.create).mockResolvedValue(mockMessage as never);

    const result = await sendMessageWithFallback(baseParams, baseCustomer);

    expect(result.success).toBe(true);
    expect(result.channel).toBe("WALLET");
    expect(result.fallbackAttempted).toBe(false);
  });

  it("should fallback to WHATSAPP when WALLET fails", async () => {
    const mockMessage = { id: "msg_123" };
    vi.mocked(prisma.message.create).mockResolvedValue(mockMessage as never);

    const result = await sendMessageWithFallback(
      { ...baseParams, channels: ["WALLET", "WHATSAPP", "SMS", "EMAIL"] },
      { ...baseCustomer, walletEnabled: false }
    );

    expect(result.success).toBe(true);
    expect(result.channel).toBe("WHATSAPP");
  });

  it("should fallback to SMS when WHATSAPP fails", async () => {
    const mockMessage = { id: "msg_123" };
    vi.mocked(prisma.message.create).mockResolvedValue(mockMessage as never);
    vi.mocked(sendWhatsApp).mockRejectedValue(new Error("WhatsApp failed"));

    const result = await sendMessageWithFallback(
      { ...baseParams, channels: ["WHATSAPP", "SMS", "EMAIL"] },
      { ...baseCustomer, walletEnabled: false }
    );

    expect(result.success).toBe(true);
    expect(result.channel).toBe("SMS");
    expect(sendSMS).toHaveBeenCalled();
  });

  it("should fallback to EMAIL when SMS fails", async () => {
    const mockMessage = { id: "msg_123" };
    vi.mocked(prisma.message.create).mockResolvedValue(mockMessage as never);
    vi.mocked(sendSMS).mockRejectedValue(new Error("SMS failed"));

    const result = await sendMessageWithFallback(
      { ...baseParams, channels: ["SMS", "EMAIL"] },
      baseCustomer
    );

    expect(result.success).toBe(true);
    expect(result.channel).toBe("EMAIL");
    expect(sendEmail).toHaveBeenCalled();
  });

  it("should return failure when all channels fail", async () => {
    const mockMessage = { id: "msg_123" };
    vi.mocked(prisma.message.create).mockResolvedValue(mockMessage as never);
    vi.mocked(sendEmail).mockRejectedValue(new Error("Email failed"));

    const result = await sendMessageWithFallback(
      { ...baseParams, channels: ["EMAIL"] },
      baseCustomer
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Email failed");
  });

  it("should not fallback when enableFallback is false", async () => {
    const mockMessage = { id: "msg_123" };
    vi.mocked(prisma.message.create).mockResolvedValue(mockMessage as never);
    vi.mocked(sendWhatsApp).mockRejectedValue(new Error("WhatsApp failed"));

    const result = await sendMessageWithFallback(
      { ...baseParams, channels: ["WHATSAPP", "SMS"], enableFallback: false },
      baseCustomer
    );

    expect(result.success).toBe(false);
    expect(sendSMS).not.toHaveBeenCalled();
  });

  it("should use template when templateName is provided", async () => {
    const mockMessage = { id: "msg_123" };
    vi.mocked(prisma.message.create).mockResolvedValue(mockMessage as never);

    await sendMessageWithFallback(
      {
        ...baseParams,
        channels: ["EMAIL"],
        templateName: "welcome",
        templateData: { name: "John" },
      },
      baseCustomer
    );

    expect(sendTemplateEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        templateName: "welcome",
        templateData: { name: "John" },
      })
    );
  });
});

describe("sendBulkMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseParams = {
    organizationId: "org_123",
    channels: ["EMAIL"] as Channel[],
    content: "Test message",
    subject: "Test Subject",
    enableFallback: true,
  };

  const customers = [
    { id: "cust_1", email: "user1@example.com", phone: null, walletEnabled: false, unsubscribed: false },
    { id: "cust_2", email: "user2@example.com", phone: null, walletEnabled: false, unsubscribed: false },
    { id: "cust_3", email: "user3@example.com", phone: null, walletEnabled: false, unsubscribed: false },
  ];

  it("should process all customers", async () => {
    // Mock the sendEmail function to succeed
    vi.mocked(sendEmail).mockResolvedValue({ id: "email_123" } as never);

    // Reset message.create mock to resolve for all calls
    vi.mocked(prisma.message.create).mockResolvedValue({ id: "msg_123" } as never);

    const results = await sendBulkMessages(baseParams, customers);

    // Should return results for all 3 customers
    expect(results).toHaveLength(3);
    // All should succeed since email is mocked to work
    expect(results.every((r) => r.success)).toBe(true);
  });

  it("should return array of results matching customer count", async () => {
    // Mock failures for all sends
    vi.mocked(sendEmail).mockRejectedValue(new Error("Failed") as never);
    vi.mocked(prisma.message.create).mockResolvedValue({ id: "msg_123" } as never);

    const results = await sendBulkMessages(baseParams, customers);

    // Should return results for all customers even if all fail
    expect(results).toHaveLength(3);
  });
});

describe("getMessagingStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockMessages = [
    { status: MessageStatus.SENT, channel: "EMAIL" as Channel },
    { status: MessageStatus.DELIVERED, channel: "EMAIL" as Channel },
    { status: MessageStatus.OPENED, channel: "EMAIL" as Channel },
    { status: MessageStatus.SENT, channel: "SMS" as Channel },
    { status: MessageStatus.FAILED, channel: "WHATSAPP" as Channel },
  ];

  it("should calculate statistics correctly", async () => {
    vi.mocked(prisma.message.findMany).mockResolvedValue(mockMessages as never);

    const stats = await getMessagingStats("org_123");

    expect(stats.total).toBe(5);
    expect(stats.sent).toBe(2); // Two SENT messages
    expect(stats.delivered).toBe(1);
    expect(stats.opened).toBe(1);
    expect(stats.failed).toBe(1);
    expect(stats.byChannel.EMAIL).toBe(3);
    expect(stats.byChannel.SMS).toBe(1);
    expect(stats.byChannel.WHATSAPP).toBe(1);
  });

  it("should filter by date range", async () => {
    vi.mocked(prisma.message.findMany).mockResolvedValue([] as never);

    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-01-31");

    await getMessagingStats("org_123", startDate, endDate);

    expect(prisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: "org_123",
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      })
    );
  });
});

describe("retryFailedMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockFailedMessages = [
    {
      id: "msg_1",
      channel: "WHATSAPP" as Channel,
      organizationId: "org_123",
      customerId: "cust_1",
      content: "Test",
      subject: null,
      campaignId: null,
      customer: {
        email: "test@example.com",
        phone: "+1234567890",
        unsubscribed: false,
      },
    },
  ];

  it("should retry failed messages", async () => {
    vi.mocked(prisma.message.findMany).mockResolvedValue(mockFailedMessages as never);
    const mockNewMessage = { id: "msg_new" };
    vi.mocked(prisma.message.create).mockResolvedValue(mockNewMessage as never);

    const results = await retryFailedMessages(["msg_1"]);

    expect(results).toHaveLength(1);
    expect(prisma.message.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: { in: ["msg_1"] },
          status: MessageStatus.FAILED,
        },
      })
    );
  });
});
