import { GoogleGenerativeAI } from "@google/generative-ai";
import { isFeatureEnabled } from "./feature-flags";

let genAI: GoogleGenerativeAI | null = null;

/**
 * Get Google Generative AI client with graceful degradation
 * Returns null if AI is not configured or feature flag is disabled
 */
function getGenAI(): GoogleGenerativeAI | null {
  if (!isFeatureEnabled("enableAISuggestions")) {
    console.warn("AI Suggestions is disabled via feature flag");
    return null;
  }

  if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn("Google AI API key not configured");
    return null;
  }

  if (!genAI) {
    try {
      genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    } catch (error) {
      console.error("Failed to initialize Google AI:", error);
      return null;
    }
  }

  return genAI;
}

/**
 * Wrapper for AI operations with graceful degradation
 */
async function withAI<T>(
  operation: (ai: GoogleGenerativeAI) => Promise<T>,
  fallback: T
): Promise<T> {
  const ai = getGenAI();

  if (!ai) {
    console.warn("AI unavailable, using fallback");
    return fallback;
  }

  try {
    return await operation(ai);
  } catch (error) {
    console.error("AI operation failed:", error);
    return fallback;
  }
}

// Re-export templates, palettes, fonts, etc.
export { TEMPLATES, type TemplateId } from "./ai/templates";
export { COLOR_PALETTES, type PaletteId } from "./ai/palettes";
export { FONT_PAIRS, type FontPairId } from "./ai/fonts";
export { TEXT_CONSTRAINTS, type TextConstraintKey } from "./ai/constraints";
export { DEFAULT_TEXTS, type RestaurantType } from "./ai/default-texts";
export { getDefaultTemplateForType, truncateText, expandText, hasSufficientContrast } from "./ai/helpers";
export { validateGeneratedContent, isValidRestaurantType, type GeneratedContent } from "./ai/validate";

/**
 * Generate content using AI with graceful degradation
 */
export const generateAIContent = async (
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<{
  success: boolean;
  content?: string;
  error?: string;
}> => {
  const modelName = options?.model || "gemini-1.5-flash";

  return withAI<{ success: boolean; content?: string; error?: string }>(
    async (ai) => {
      const model = ai.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return { success: true, content: text };
    },
    { success: false, error: "AI service unavailable" }
  );
};

/**
 * Generate image with AI (placeholder - using text-based generation)
 */
export const generateAIImage = async (
  description: string
): Promise<{
  success: boolean;
  imageUrl?: string;
  error?: string;
}> => {
  // Placeholder for image generation - would integrate with DALL-E or similar
  return {
    success: false,
    error: "Image generation not yet implemented",
  };
};

/**
 * Generate suggestions for campaigns/rewards with graceful degradation
 */
export const generateAISuggestions = async (
  context: string,
  type: "campaign" | "reward" | "message"
): Promise<{
  success: boolean;
  suggestions?: string[];
  error?: string;
}> => {
  const prompts: Record<string, string> = {
    campaign: `Generate 3 marketing campaign suggestions for a restaurant loyalty program. Context: ${context}`,
    reward: `Generate 3 reward ideas for a restaurant loyalty program. Context: ${context}`,
    message: `Generate 3 personalized message suggestions for customers. Context: ${context}`,
  };

  return withAI<{ success: boolean; suggestions?: string[]; error?: string }>(
    async (ai) => {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompts[type]);
      const response = result.response.text();
      
      // Parse the response to extract suggestions
      const suggestions = response
        .split("\n")
        .filter((line: string) => line.trim().length > 0)
        .slice(0, 3);

      return { success: true, suggestions };
    },
    { success: false, error: "AI service unavailable" }
  );
};

// Export AI getter for advanced operations
export const getAI = (): GoogleGenerativeAI | null => {
  return getGenAI();
};

// Check if AI is available
export const isAIAvailable = (): boolean => {
  return isFeatureEnabled("enableAISuggestions") && !!process.env.GOOGLE_AI_API_KEY;
};

// Alias/wrapper functions for missing exports - these provide fallback behavior when AI is unavailable

/**
 * Extract menu items from text (placeholder)
 */
export const extractMenuFromText = async (text: string): Promise<{
  success: boolean;
  items?: Array<{ name: string; description: string; price?: number }>;
  error?: string;
}> => {
  // Placeholder - returning empty array instead of error to not block onboarding
  return { success: true, items: [] };
};

/**
 * Extract menu items from URL (placeholder)
 */
export const extractMenuFromUrl = async (url: string): Promise<{
  success: boolean;
  items?: Array<{ name: string; description: string; price?: number }>;
  error?: string;
}> => {
  // Placeholder - returning empty array instead of error to not block onboarding
  return { success: true, items: [] };
};

/**
 * Get flash model for fast AI operations
 */
export const flashModel = (): GoogleGenerativeAI | null => {
  return getGenAI();
};

/**
 * Generate adapted rewards based on restaurant type
 */
export const generateAdaptedRewards = async (
  restaurantType: string,
  existingRewards: string[]
): Promise<{
  success: boolean;
  rewards?: string[];
  error?: string;
}> => {
  return withAI<{ success: boolean; rewards?: string[]; error?: string }>(
    async (ai) => {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Generate 3 reward ideas for a ${restaurantType} restaurant. Existing rewards: ${existingRewards.join(", ")}. Return only the reward names, one per line.`;
      const result = await model.generateContent(prompt);
      const rewards = result.response.text().split("\n").filter((r: string) => r.trim());
      return { success: true, rewards };
    },
    { success: false, error: "AI service unavailable" }
  );
};

/**
 * Parse JSON safely from AI response string, handling markdown code blocks
 */
const safeParseJSON = <T>(text: string, fallback: T): T => {
  try {
    // Sometimes Gemini wraps JSON in ```json ... ``` blocks
    const cleanedText = text.replace(/```(json)?|```/g, "").trim();
    return JSON.parse(cleanedText) as T;
  } catch (error) {
    console.error("Failed to parse AI JSON response:", error, "Raw text:", text);
    return fallback;
  }
};

/**
 * Generate branding suggestions
 */
export const generateBrandingSuggestion = async (
  restaurantName: string,
  restaurantType: string
): Promise<{
  success: boolean;
  suggestion?: { headline: string; colors: string[]; fonts: string[] };
  error?: string;
}> => {
  return withAI<{ success: boolean; suggestion?: { headline: string; colors: string[]; fonts: string[] }; error?: string }>(
    async (ai) => {
      // Force JSON response output
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const prompt = `Generate a branding suggestion for ${restaurantName}, a ${restaurantType}. Return a strict JSON object with EXACTLY these keys: "headline" (string, max 60 chars), "colors" (array of 3 hex codes strings), "fonts" (array of 2 font name strings). Do not include any markdown formatting.`;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      const fallback = {
        headline: `Bienvenue chez ${restaurantName}`,
        colors: ["#9317FD", "#1D1E20", "#FFFFFF"],
        fonts: ["Inter", "System-ui"]
      };

      const suggestion = safeParseJSON(text, fallback);
      return { success: true, suggestion };
    },
    { success: false, error: "AI service unavailable" }
  );
};

/**
 * Generate mini-site content
 */
export const generateMiniSiteContent = async (
  restaurantName: string,
  restaurantType: string,
  industry?: string
): Promise<{
  success: boolean;
  content?: {
    heroHeadline: string;
    heroSubtitle: string;
    aboutTitle: string;
    aboutParagraph: string;
  };
  error?: string;
}> => {
  return withAI<{
    success: boolean;
    content?: {
      heroHeadline: string;
      heroSubtitle: string;
      aboutTitle: string;
      aboutParagraph: string;
    };
    error?: string;
  }>(
    async (ai) => {
      // Force JSON response output
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const prompt = `Generate mini-site content for ${restaurantName}, a ${restaurantType}${industry ? ` in the ${industry} industry` : ''}. Return a strict JSON object with EXACTLY these keys: "heroHeadline" (string, max 50 chars), "heroSubtitle" (string, max 100 chars), "aboutTitle" (string, max 40 chars), "aboutParagraph" (string, max 300 chars). Do not include any markdown formatting.`;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      const fallback = {
        heroHeadline: restaurantName,
        heroSubtitle: `Le meilleur de la catégorie ${restaurantType}`,
        aboutTitle: "À propos de nous",
        aboutParagraph: `Découvrez ${restaurantName}, votre spécialiste ${restaurantType}. Nous sommes fiers de vous offrir la meilleure qualité et un service exceptionnel.`
      };

      const content = safeParseJSON(text, fallback);
      return { success: true, content };
    },
    { success: false, error: "AI service unavailable" }
  );
};
