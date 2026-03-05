/**
 * Feature Flags for optional services
 * These can be toggled via environment variables
 */

export interface FeatureFlags {
  // Messaging services
  enableSMS: boolean;
  enableWhatsApp: boolean;
  enableEmail: boolean;
  enablePush: boolean;
  
  // Wallet services
  enableWallet: boolean;
  enableGoogleWallet: boolean;
  enableAppleWallet: boolean;
  
  // AI services
  enableAISuggestions: boolean;
  
  // Analytics
  enableAnalytics: boolean;
  
  // Billing
  enableBilling: boolean;
  
  // Beta features
  enableBetaFeatures: boolean;
}

function getEnvBoolean(key: string, defaultValue = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === "true";
}

function getEnvString(key: string, defaultValue = ""): string {
  return process.env[key] || defaultValue;
}

export const featureFlags: FeatureFlags = {
  enableSMS: getEnvBoolean("ENABLE_SMS", true),
  enableWhatsApp: getEnvBoolean("ENABLE_WHATSAPP", true),
  enableEmail: getEnvBoolean("ENABLE_EMAIL", true),
  enablePush: getEnvBoolean("ENABLE_PUSH", false),
  
  enableWallet: getEnvBoolean("ENABLE_WALLET", true),
  enableGoogleWallet: getEnvBoolean("ENABLE_GOOGLE_WALLET", true),
  enableAppleWallet: getEnvBoolean("ENABLE_APPLE_WALLET", false),
  
  enableAISuggestions: getEnvBoolean("ENABLE_AI_SUGGESTIONS", true),
  
  enableAnalytics: getEnvBoolean("ENABLE_ANALYTICS", true),
  
  enableBilling: getEnvBoolean("ENABLE_BILLING", true),
  
  enableBetaFeatures: getEnvBoolean("ENABLE_BETA_FEATURES", false),
};

// Helper functions to check feature availability
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return featureFlags[feature];
};

// Get all enabled messaging channels
export const getEnabledChannels = (): string[] => {
  const channels: string[] = [];
  if (featureFlags.enableEmail) channels.push("EMAIL");
  if (featureFlags.enableSMS) channels.push("SMS");
  if (featureFlags.enableWhatsApp) channels.push("WHATSAPP");
  if (featureFlags.enablePush) channels.push("PUSH");
  return channels;
};

// Service configuration status
export interface ServiceStatus {
  name: string;
  enabled: boolean;
  configured: boolean;
  error?: string;
}

export const getServiceStatuses = (): ServiceStatus[] => {
  return [
    {
      name: "Email (Resend)",
      enabled: featureFlags.enableEmail,
      configured: !!process.env.RESEND_API_KEY,
    },
    {
      name: "SMS (Twilio)",
      enabled: featureFlags.enableSMS,
      configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    },
    {
      name: "WhatsApp (Twilio)",
      enabled: featureFlags.enableWhatsApp,
      configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_WHATSAPP_NUMBER),
    },
    {
      name: "Google Wallet",
      enabled: featureFlags.enableGoogleWallet,
      configured: !!(process.env.GOOGLE_WALLET_ISSUER_ID && process.env.GOOGLE_WALLET_CLASS_ID),
    },
    {
      name: "Apple Wallet",
      enabled: featureFlags.enableAppleWallet,
      configured: !!(
        process.env.APPLE_WALLET_CERTIFICATE_PATH &&
        process.env.APPLE_WALLET_PASS_TYPE_ID
      ),
    },
    {
      name: "AI Suggestions",
      enabled: featureFlags.enableAISuggestions,
      configured: !!process.env.GOOGLE_AI_API_KEY,
    },
    {
      name: "Billing (Stripe)",
      enabled: featureFlags.enableBilling,
      configured: !!process.env.STRIPE_SECRET_KEY,
    },
  ];
};
