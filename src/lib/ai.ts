import { GoogleGenerativeAI } from "@google/generative-ai";
import { featureFlags, isFeatureEnabled } from "./feature-flags";

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

  return withAI(
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

  return withAI(
    async (ai) => {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompts[type]);
      const response = result.response.text();
      
      // Parse the response to extract suggestions
      const suggestions = response
        .split("\n")
        .filter((line) => line.trim().length > 0)
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
