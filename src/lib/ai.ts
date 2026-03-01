import { GoogleGenerativeAI } from "@google/generative-ai";
import { TEMPLATES, type TemplateId } from "./ai/templates";
import { COLOR_PALETTES, type PaletteId } from "./ai/palettes";
import { FONT_PAIRS, type FontPairId } from "./ai/fonts";
import { TEXT_CONSTRAINTS } from "./ai/constraints";
import { DEFAULT_TEXTS, type RestaurantType } from "./ai/default-texts";
import { getDefaultTemplateForType, truncateText } from "./ai/helpers";
import { validateGeneratedContent } from "./ai/validate";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

const flashModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const proModel = genAI.getGenerativeModel({ model: "gemini-pro" });

export interface CampaignSuggestion {
  title: string;
  description: string;
  targetAudience: string;
  channels: string[];
  estimatedReach: string;
  tips: string[];
}

export interface CustomerInsight {
  segment: string;
  characteristics: string[];
  recommendations: string[];
  potentialValue: string;
}

export interface MenuExtraction {
  products: MenuProduct[];
  categories: string[];
  currency: string;
  averagePrice: number;
}

export interface MenuProduct {
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface BrandingSuggestion {
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  styleKeywords: string[];
  fontSuggestions: {
    heading: string;
    body: string;
  };
  logoIdeas: string[];
  taglineIdeas: string[];
}

export interface MiniSiteContent {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  benefits: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  loyaltyProgram: {
    programName: string;
    howItWorks: string[];
    pointsPerPurchase: number;
    welcomeBonus: number;
  };
  cta: {
    heading: string;
    description: string;
    buttonText: string;
  };
}

export interface AdaptedReward {
  name: string;
  description: string;
  type: string;
  pointsRequired: number;
  value: number | null;
  icon: string;
  tier: "starter" | "popular" | "premium";
}

export const generateCampaignSuggestion = async (
  organizationName: string,
  industry: string,
  goals: string[]
): Promise<CampaignSuggestion> => {
  const prompt = `
    Generate a marketing campaign suggestion for a ${industry} business named "${organizationName}".
    Their goals are: ${goals.join(", ")}.
    
    Return a JSON object with the following structure:
    {
      "title": "Campaign title",
      "description": "Detailed campaign description",
      "targetAudience": "Description of the target audience",
      "channels": ["email", "sms", "whatsapp"],
      "estimatedReach": "Estimated reach percentage",
      "tips": ["Tip 1", "Tip 2", "Tip 3"]
    }
    
    Only return the JSON object, no other text.
  `;

  const result = await proModel.generateContent(prompt);
  const response = result.response.text();
  
  try {
    return JSON.parse(response.replace(/```json\n?|\n?```/g, "")) as CampaignSuggestion;
  } catch {
    return {
      title: "Engaging Loyalty Campaign",
      description: "A campaign designed to increase customer engagement and loyalty.",
      targetAudience: "Existing customers who haven't made a purchase in 30 days",
      channels: ["email", "sms"],
      estimatedReach: "75%",
      tips: [
        "Personalize messages based on customer history",
        "Offer exclusive discounts for returning customers",
        "Create urgency with limited-time offers",
      ],
    };
  }
};

export const analyzeCustomerData = async (
  customers: Array<{ totalSpend: number; visitCount: number; points: number }>
): Promise<CustomerInsight[]> => {
  const prompt = `
    Analyze the following customer data and provide insights:
    ${JSON.stringify(customers.slice(0, 100))}
    
    Return a JSON array of customer segments with the following structure:
    [
      {
        "segment": "Segment name",
        "characteristics": ["Characteristic 1", "Characteristic 2"],
        "recommendations": ["Recommendation 1", "Recommendation 2"],
        "potentialValue": "High/Medium/Low"
      }
    ]
    
    Only return the JSON array, no other text.
  `;

  const result = await proModel.generateContent(prompt);
  const response = result.response.text();
  
  try {
    return JSON.parse(response.replace(/```json\n?|\n?```/g, "")) as CustomerInsight[];
  } catch {
    return [
      {
        segment: "High-Value Customers",
        characteristics: ["Frequent purchases", "High average order value"],
        recommendations: ["Offer exclusive rewards", "Provide early access to new products"],
        potentialValue: "High",
      },
    ];
  }
};

export const generateEmailContent = async (
  subject: string,
  tone: "professional" | "friendly" | "urgent",
  context: string
): Promise<{ subject: string; body: string }> => {
  const prompt = `
    Generate an email with a ${tone} tone.
    Subject: ${subject}
    Context: ${context}
    
    Return a JSON object with the following structure:
    {
      "subject": "Email subject line",
      "body": "Email body in HTML format"
    }
    
    Only return the JSON object, no other text.
  `;

  const result = await proModel.generateContent(prompt);
  const response = result.response.text();
  
  try {
    return JSON.parse(response.replace(/```json\n?|\n?```/g, ""));
  } catch {
    return {
      subject,
      body: `<p>${context}</p>`,
    };
  }
};

export const extractMenuFromUrl = async (
  url: string,
  organizationName: string
): Promise<MenuExtraction> => {
  const prompt = `
    You are analyzing a website for "${organizationName}" at URL: ${url}
    
    Based on common patterns for this type of business website, extract a representative menu/product catalog.
    Since you cannot browse the live website, generate a realistic product catalog that would be typical for this business.
    
    Return a JSON object with the following structure:
    {
      "products": [
        {
          "name": "Product name",
          "description": "Brief description",
          "price": 12.99,
          "category": "Category name"
        }
      ],
      "categories": ["Category1", "Category2"],
      "currency": "EUR",
      "averagePrice": 15.00
    }
    
    Generate 10-15 products across 3-5 categories that would be realistic for this business.
    Only return the JSON object, no other text.
  `;

  const result = await flashModel.generateContent(prompt);
  const response = result.response.text();
  
  try {
    return JSON.parse(response.replace(/```json\n?|\n?```/g, "")) as MenuExtraction;
  } catch {
    return {
      products: [
        { name: "Signature Item", description: "Our most popular offering", price: 12.99, category: "Popular" },
        { name: "Classic Choice", description: "A timeless favorite", price: 9.99, category: "Popular" },
        { name: "Premium Option", description: "Top-tier quality", price: 19.99, category: "Premium" },
      ],
      categories: ["Popular", "Premium"],
      currency: "EUR",
      averagePrice: 14.32,
    };
  }
};

export const extractMenuFromText = async (
  text: string,
  organizationName: string
): Promise<MenuExtraction> => {
  const prompt = `
    Extract product/menu information from the following text for "${organizationName}":
    
    ${text}
    
    Return a JSON object with the following structure:
    {
      "products": [
        {
          "name": "Product name",
          "description": "Brief description",
          "price": 12.99,
          "category": "Category name"
        }
      ],
      "categories": ["Category1", "Category2"],
      "currency": "EUR",
      "averagePrice": 15.00
    }
    
    Only return the JSON object, no other text. If prices are not mentioned, estimate reasonable prices.
  `;

  const result = await flashModel.generateContent(prompt);
  const response = result.response.text();
  
  try {
    return JSON.parse(response.replace(/```json\n?|\n?```/g, "")) as MenuExtraction;
  } catch {
    return {
      products: [],
      categories: [],
      currency: "EUR",
      averagePrice: 0,
    };
  }
};

export const generateBrandingSuggestion = async (
  organizationName: string,
  industry: string,
  description?: string,
  websiteUrl?: string
): Promise<BrandingSuggestion> => {
  const prompt = `
    Generate branding suggestions for a ${industry} business named "${organizationName}".
    ${description ? `Description: ${description}` : ""}
    ${websiteUrl ? `Website: ${websiteUrl}` : ""}
    
    Return a JSON object with the following structure:
    {
      "colorPalette": {
        "primary": "#HEXCODE",
        "secondary": "#HEXCODE",
        "accent": "#HEXCODE",
        "background": "#HEXCODE",
        "text": "#HEXCODE"
      },
      "styleKeywords": ["modern", "friendly", "professional"],
      "fontSuggestions": {
        "heading": "Font name for headings",
        "body": "Font name for body text"
      },
      "logoIdeas": ["Idea 1: description", "Idea 2: description", "Idea 3: description"],
      "taglineIdeas": ["Tagline 1", "Tagline 2", "Tagline 3"]
    }
    
    Generate professional, cohesive branding that fits the industry and business personality.
    Only return the JSON object, no other text.
  `;

  const result = await flashModel.generateContent(prompt);
  const response = result.response.text();
  
  try {
    return JSON.parse(response.replace(/```json\n?|\n?```/g, "")) as BrandingSuggestion;
  } catch {
    return {
      colorPalette: {
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#f59e0b",
        background: "#ffffff",
        text: "#1f2937",
      },
      styleKeywords: ["modern", "professional", "trustworthy"],
      fontSuggestions: {
        heading: "Inter",
        body: "Inter",
      },
      logoIdeas: [
        "Minimalist wordmark with accent color",
        "Icon combining initials with industry symbol",
        "Modern emblem with geometric shapes",
      ],
      taglineIdeas: [
        "Rewarding loyalty, one visit at a time",
        "Your loyalty, our passion",
        "Where every purchase counts",
      ],
    };
  }
};

export const generateMiniSiteContent = async (
  organizationName: string,
  industry: string,
  description: string,
  branding: BrandingSuggestion,
  menuData?: MenuExtraction
): Promise<MiniSiteContent> => {
  const prompt = `
    Generate content for a loyalty program mini-site for "${organizationName}", a ${industry} business.
    ${description ? `Business description: ${description}` : ""}
    ${menuData ? `Products/Categories available: ${menuData.categories.join(", ")}` : ""}
    
    Branding style: ${branding.styleKeywords.join(", ")}
    
    Return a JSON object with the following structure:
    {
      "hero": {
        "headline": "Catchy headline for the loyalty program",
        "subheadline": "Supporting text explaining the value",
        "ctaText": "Join Now" or "Sign Up"
      },
      "benefits": [
        {
          "title": "Benefit title",
          "description": "Benefit description",
          "icon": "star|gift|percent|heart|sparkles"
        }
      ],
      "loyaltyProgram": {
        "programName": "Creative name for the loyalty program",
        "howItWorks": ["Step 1", "Step 2", "Step 3"],
        "pointsPerPurchase": 10,
        "welcomeBonus": 100
      },
      "cta": {
        "heading": "Final call to action heading",
        "description": "Motivating text",
        "buttonText": "Get Started"
      }
    }
    
    Make the content engaging, industry-appropriate, and focused on customer value.
    Only return the JSON object, no other text.
  `;

  const result = await flashModel.generateContent(prompt);
  const response = result.response.text();
  
  try {
    return JSON.parse(response.replace(/```json\n?|\n?```/g, "")) as MiniSiteContent;
  } catch {
    return {
      hero: {
        headline: `Join the ${organizationName} Loyalty Program`,
        subheadline: "Earn rewards with every purchase",
        ctaText: "Join Now",
      },
      benefits: [
        { title: "Earn Points", description: "Get points on every purchase", icon: "star" },
        { title: "Exclusive Rewards", description: "Redeem points for special offers", icon: "gift" },
        { title: "Member Perks", description: "Enjoy members-only benefits", icon: "sparkles" },
      ],
      loyaltyProgram: {
        programName: `${organizationName} Rewards`,
        howItWorks: ["Sign up for free", "Earn points on purchases", "Redeem for rewards"],
        pointsPerPurchase: 10,
        welcomeBonus: 100,
      },
      cta: {
        heading: "Start Earning Today",
        description: "Join thousands of happy members",
        buttonText: "Get Started",
      },
    };
  }
};

export const generateAdaptedRewards = async (
  organizationName: string,
  industry: string,
  menuData?: MenuExtraction,
  averagePrice?: number
): Promise<AdaptedReward[]> => {
  const avgPrice = averagePrice || menuData?.averagePrice || 15;
  
  const prompt = `
    Generate 4-6 loyalty reward suggestions for "${organizationName}", a ${industry} business.
    ${menuData ? `Product categories: ${menuData.categories.join(", ")}` : ""}
    Average product price: ${avgPrice} EUR
    
    The rewards should be realistic and attractive for this specific industry and price point.
    
    Return a JSON array with the following structure:
    [
      {
        "name": "Reward name",
        "description": "Clear description of what the customer gets",
        "type": "DISCOUNT_PERCENT|DISCOUNT_FIXED|FREE_PRODUCT|FREE_ITEM|CASHBACK",
        "pointsRequired": 100,
        "value": 10 or null,
        "icon": "coffee|percent|gift|star|heart|sparkles|ticket",
        "tier": "starter|popular|premium"
      }
    ]
    
    Create a progression: starter rewards (low points), popular mid-tier rewards, and premium high-value rewards.
    Points should be reasonable based on typical earning rate of 10 points per euro spent.
    Only return the JSON array, no other text.
  `;

  try {
    const result = await flashModel.generateContent(prompt);
    const response = result.response.text();
    
    try {
      return JSON.parse(response.replace(/```json\n?|\n?```/g, "")) as AdaptedReward[];
    } catch {
      return getDefaultRewards();
    }
  } catch {
    return getDefaultRewards();
  }
};

function getDefaultRewards(): AdaptedReward[] {
  return [
    {
      name: "Welcome Treat",
      description: "A small complimentary item with your next purchase",
      type: "FREE_ITEM",
      pointsRequired: 50,
      value: null,
      icon: "gift",
      tier: "starter",
    },
    {
      name: "10% Off",
      description: "10% discount on your next order",
      type: "DISCOUNT_PERCENT",
      pointsRequired: 100,
      value: 10,
      icon: "percent",
      tier: "starter",
    },
    {
      name: "Free Product",
      description: "Get any product from our selection free",
      type: "FREE_PRODUCT",
      pointsRequired: 250,
      value: null,
      icon: "star",
      tier: "popular",
    },
    {
      name: "VIP Experience",
      description: "Exclusive premium reward for our loyal members",
      type: "FREE_PRODUCT",
      pointsRequired: 500,
      value: null,
      icon: "sparkles",
      tier: "premium",
    },
  ];
}

// ============================================
// NEW: Restaurant Data Generation with Templates
// ============================================

export interface RestaurantData {
  template: TemplateId;
  palette: PaletteId;
  fonts: FontPairId;
  heroHeadline: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  specialtyName: string;
  specialtyDescription: string;
  ctaPrimary: string;
  ctaSecondary: string;
  rewardDescription: string;
  primary: string;
  secondary: string;
  accent: string;
}

export async function generateRestaurantData(
  organizationName: string,
  restaurantType: RestaurantType,
  description?: string
): Promise<RestaurantData> {
  // Determine the template based on restaurant type
  const templateId = getDefaultTemplateForType(restaurantType);
  const template = TEMPLATES[templateId];
  const defaultPalette = COLOR_PALETTES[template.defaultPalette as PaletteId];
  const defaultFonts = FONT_PAIRS[template.defaultFonts as FontPairId];
  const defaultTexts = DEFAULT_TEXTS[restaurantType];

  // Build the prompt that constrains the AI to templates and constraints
  const prompt = `
    Generate restaurant website content for "${organizationName}", a ${restaurantType} restaurant.
    ${description ? `Additional description: ${description}` : ""}
    
    IMPORTANT CONSTRAINTS:
    - You MUST use the template: "${templateId}" (pre-selected based on restaurant type)
    - You MUST use the color palette: "${template.defaultPalette}" with colors: ${JSON.stringify(defaultPalette)}
    - You MUST use the font pair: "${template.defaultFonts}" with fonts: ${JSON.stringify(defaultFonts)}
    - You CANNOT invent new colors, templates, or fonts - only use the provided ones
    
    TEXT LENGTH CONSTRAINTS (MUST RESPECT):
    - heroHeadline: ${TEXT_CONSTRAINTS.heroHeadline.min}-${TEXT_CONSTRAINTS.heroHeadline.max} characters
    - heroSubtitle: ${TEXT_CONSTRAINTS.heroSubtitle.min}-${TEXT_CONSTRAINTS.heroSubtitle.max} characters  
    - aboutTitle: ${TEXT_CONSTRAINTS.aboutTitle.min}-${TEXT_CONSTRAINTS.aboutTitle.max} characters
    - aboutParagraph1: ${TEXT_CONSTRAINTS.aboutParagraph1.min}-${TEXT_CONSTRAINTS.aboutParagraph1.max} characters
    - aboutParagraph2: ${TEXT_CONSTRAINTS.aboutParagraph2.min}-${TEXT_CONSTRAINTS.aboutParagraph2.max} characters
    - specialtyName: ${TEXT_CONSTRAINTS.specialtyName.min}-${TEXT_CONSTRAINTS.specialtyName.max} characters
    - specialtyDescription: ${TEXT_CONSTRAINTS.specialtyDescription.min}-${TEXT_CONSTRAINTS.specialtyDescription.max} characters
    - ctaPrimary: ${TEXT_CONSTRAINTS.ctaPrimary.min}-${TEXT_CONSTRAINTS.ctaPrimary.max} characters
    - ctaSecondary: ${TEXT_CONSTRAINTS.ctaSecondary.min}-${TEXT_CONSTRAINTS.ctaSecondary.max} characters
    - rewardDescription: ${TEXT_CONSTRAINTS.rewardDescription.min}-${TEXT_CONSTRAINTS.rewardDescription.max} characters
    
    Return a JSON object with exactly this structure:
    {
      "template": "${templateId}",
      "palette": "${template.defaultPalette}",
      "fonts": "${template.defaultFonts}",
      "heroHeadline": "Headline text for hero section",
      "heroSubtitle": "Subtitle text for hero section",
      "aboutTitle": "Title for about section",
      "aboutParagraph1": "First paragraph of about section",
      "aboutParagraph2": "Second paragraph of about section",
      "specialtyName": "Name of specialty dish/offer",
      "specialtyDescription": "Description of the specialty",
      "ctaPrimary": "Primary call-to-action text",
      "ctaSecondary": "Secondary call-to-action text",
      "rewardDescription": "Description of loyalty reward program",
      "primary": "${defaultPalette.primary}",
      "secondary": "${defaultPalette.secondary}",
      "accent": "${defaultPalette.accent}"
    }
    
    Only return the JSON object, no other text. Ensure all text lengths respect the constraints above.
  `;

  try {
    const result = await flashModel.generateContent(prompt);
    const response = result.response.text();
    
    try {
      const parsedContent = JSON.parse(response.replace(/```json\n?|\n?```/g, "")) as Partial<RestaurantData>;
      
      // Validate and correct the generated content
      const validatedContent = validateGeneratedContent(
        {
          template: parsedContent.template || templateId,
          palette: parsedContent.palette || (template.defaultPalette as PaletteId),
          fonts: parsedContent.fonts || (template.defaultFonts as FontPairId),
          primary: parsedContent.primary || defaultPalette.primary,
          secondary: parsedContent.secondary || defaultPalette.secondary,
          heroHeadline: parsedContent.heroHeadline,
          heroSubtitle: parsedContent.heroSubtitle,
          aboutTitle: parsedContent.aboutTitle,
          aboutParagraph1: parsedContent.aboutParagraph1,
          aboutParagraph2: parsedContent.aboutParagraph2,
          specialtyName: parsedContent.specialtyName,
          specialtyDescription: parsedContent.specialtyDescription,
          ctaPrimary: parsedContent.ctaPrimary,
          ctaSecondary: parsedContent.ctaSecondary,
          rewardDescription: parsedContent.rewardDescription,
        },
        restaurantType
      );

      // Return the fully validated content with defaults for missing fields
      return {
        template: validatedContent.template,
        palette: validatedContent.palette,
        fonts: validatedContent.fonts,
        heroHeadline: validatedContent.heroHeadline || defaultTexts.heroHeadline,
        heroSubtitle: validatedContent.heroSubtitle || defaultTexts.heroSubtitle,
        aboutTitle: validatedContent.aboutTitle || defaultTexts.aboutTitle,
        aboutParagraph1: validatedContent.aboutParagraph1 || defaultTexts.aboutParagraph1,
        aboutParagraph2: validatedContent.aboutParagraph2 || defaultTexts.aboutParagraph2,
        specialtyName: validatedContent.specialtyName || defaultTexts.specialtyName,
        specialtyDescription: validatedContent.specialtyDescription || defaultTexts.specialtyDescription,
        ctaPrimary: validatedContent.ctaPrimary || defaultTexts.ctaPrimary,
        ctaSecondary: validatedContent.ctaSecondary || defaultTexts.ctaSecondary,
        rewardDescription: validatedContent.rewardDescription || "Rejoignez notre programme de fidélité et gagnez des récompenses exclusives.",
        primary: validatedContent.primary,
        secondary: validatedContent.secondary,
        accent: parsedContent.accent || defaultPalette.accent,
      };
    } catch (parseError) {
      // If parsing fails, return default texts for this restaurant type
      return getDefaultRestaurantData(restaurantType, templateId);
    }
  } catch (error) {
    // If AI fails completely, return default data
    return getDefaultRestaurantData(restaurantType, templateId);
  }
}

function getDefaultRestaurantData(
  restaurantType: RestaurantType,
  templateId: TemplateId
): RestaurantData {
  const template = TEMPLATES[templateId];
  const palette = COLOR_PALETTES[template.defaultPalette as PaletteId];
  const texts = DEFAULT_TEXTS[restaurantType];

  return {
    template: templateId,
    palette: template.defaultPalette as PaletteId,
    fonts: template.defaultFonts as FontPairId,
    heroHeadline: texts.heroHeadline,
    heroSubtitle: texts.heroSubtitle,
    aboutTitle: texts.aboutTitle,
    aboutParagraph1: texts.aboutParagraph1,
    aboutParagraph2: texts.aboutParagraph2,
    specialtyName: texts.specialtyName,
    specialtyDescription: texts.specialtyDescription,
    ctaPrimary: texts.ctaPrimary,
    ctaSecondary: texts.ctaSecondary,
    rewardDescription: "Rejoignez notre programme de fidélité et gagnez des récompenses exclusives.",
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
  };
}

export { genAI, flashModel, proModel };
