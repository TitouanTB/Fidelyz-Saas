import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const regenerateSchema = z.object({
  section: z.enum([
    'hero',
    'about',
    'specialties',
    'cta',
    'reward',
    'notifications',
    'all',
  ]),
  organizationName: z.string().optional(),
  context: z.object({
    industry?: string;
    description?: string;
    currentData?: z.record(z.any());
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });
    if (!member) {
      return NextResponse.json({ error: "No organization found" }, { status: 403 });
    }

    const organization = member.organization;

    const body = await request.json();
    const parsed = regenerateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { section, context } = parsed.data;
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    let prompt = "";
    let result: Record<string, unknown> = {};

    // Build prompts based on section
    switch (section) {
      case 'hero':
        prompt = buildHeroPrompt(organization.name, organization.industry, organization.description, context?.currentData);
        break;
      case 'about':
        prompt = buildAboutPrompt(organization.name, organization.industry, organization.description, context?.currentData);
        break;
      case 'specialties':
        prompt = buildSpecialtiesPrompt(organization.name, organization.industry, context?.currentData);
        break;
      case 'cta':
        prompt = buildCtaPrompt(organization.name, organization.industry, context?.currentData);
        break;
      case 'reward':
        prompt = buildRewardPrompt(organization.name, organization.industry, context?.currentData);
        break;
      case 'notifications':
        prompt = buildNotificationsPrompt(organization.name, organization.industry, context?.currentData);
        break;
      case 'all':
        prompt = buildAllPrompt(organization.name, organization.industry, organization.description, context?.currentData);
        break;
      default:
        return NextResponse.json({ error: "Invalid section" }, { status: 400 });
    }

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    // Parse the AI response
    try {
      result = JSON.parse(text);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        console.error("Failed to parse AI response:", text);
        return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Regenerate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function buildHeroPrompt(name: string, industry: string | null, description: string | null, currentData?: Record<string, unknown>): string {
  return `
En tant qu'expert en marketing pour restaurants, génère du contenu pour la section hero d'un mini-site.

Nom du restaurant: ${name}
Industrie: ${industry || "restauration"}
Description: ${description || "Restaurant de qualité"}

Génère un headline et un sous-titre accrocheurs, professionnels et conviviaux en français.
Le headline doit être court (max 10 mots) et percutant.
Le sous-titre doit être informatif et inciter à l'action.

Réponds UNIQUEMENT en JSON format:
{
  "heroHeadline": "string",
  "heroSubtitle": "string"
}
`;
}

function buildAboutPrompt(name: string, industry: string | null, description: string | null, currentData?: Record<string, unknown>): string {
  return `
En tant qu'expert en marketing pour restaurants, génère du contenu pour la section "À propos" d'un mini-site.

Nom du restaurant: ${name}
Industrie: ${industry || "restauration"}
Description existante: ${description || ""}

Génère:
1. Un titre pour la section "À propos"
2. Deux paragraphes décrivant l'histoire et les valeurs du restaurant

Le ton doit être chaleureux, authentique et professionnel en français.

Réponds UNIQUEMENT en JSON format:
{
  "aboutTitle": "string",
  "aboutParagraph1": "string",
  "aboutParagraph2": "string"
}
`;
}

function buildSpecialtiesPrompt(name: string, industry: string | null, currentData?: Record<string, unknown>): string {
  return `
En tant qu'expert en marketing pour restaurants, génère du contenu pour les spécialités mises en avant.

Nom du restaurant: ${name}
Industrie: ${industry || "restauration"}

Génère 3 spécialités avec:
1. Un nom court et appétissant
2. Une description alléchante (1-2 phrases)

Le ton doit être gourmand et invitant en français.

Réponds UNIQUEMENT en JSON format:
{
  "specialtyNames": ["string", "string", "string"],
  "specialtyDescriptions": ["string", "string", "string"]
}
`;
}

function buildCtaPrompt(name: string, industry: string | null, currentData?: Record<string, unknown>): string {
  return `
En tant qu'expert en marketing pour restaurants, génère du texte pour les boutons d'appel à l'action (CTA).

Nom du restaurant: ${name}
Industrie: ${industry || "restauration"}

Génère:
1. Un texte pour le bouton CTA principal (action principale: commander, réserver, etc.)
2. Un texte pour le bouton CTA secondaire (action secondaire: en savoir plus, voir le menu, etc.)

Les textes doivent être courts (max 3-4 mots), percutants et engageants en français.

Réponds UNIQUEMENT en JSON format:
{
  "ctaPrimary": "string",
  "ctaSecondary": "string"
}
`;
}

function buildRewardPrompt(name: string, industry: string | null, currentData?: Record<string, unknown>): string {
  return `
En tant qu'expert en programmes de fidélité, génère le contenu d'une récompense.

Nom du restaurant: ${name}
Industrie: ${industry || "restauration"}

Génère:
1. Le type de récompense (free_item, discount, etc.)
2. Une description attractive de la récompense
3. Le nombre de visites requis (entre 5 et 15)
4. La durée de validité en jours (entre 15 et 60)
5. Des conditions générales simples

Le ton doit être motivant et clair en français.

Réponds UNIQUEMENT en JSON format:
{
  "rewardType": "string",
  "rewardDescription": "string",
  "rewardVisitsRequired": number,
  "rewardValidityDays": number,
  "rewardConditions": "string"
}
`;
}

function buildNotificationsPrompt(name: string, industry: string | null, currentData?: Record<string, unknown>): string {
  return `
En tant qu'expert en marketing, génère des messages de notification pour un programme de fidélité.

Nom du restaurant: ${name}
Industrie: ${industry || "restauration"}

Génère 3 types de messages:
1. Message de rappel (J+3) - pour les clients qui ne sont pas venus depuis 3 jours
2. Message de réactivation (J+21) - pour les clients qui ne sont pas venus depuis 21 jours
3. Message de réactivation 2 (J+45) - pour les clients qui ne sont pas venus depuis 45 jours

Les messages doivent être:
- Personnalisables (utiliser {restaurant} pour le nom du restaurant)
- Conviviaux et non intrusifs
- Courts et efficaces
- En français

Réponds UNIQUEMENT en JSON format:
{
  "reminderTemplate": "string",
  "reactivationTemplate": "string",
  "reactivation2Template": "string"
}
`;
}

function buildAllPrompt(name: string, industry: string | null, description: string | null, currentData?: Record<string, unknown>): string {
  return `
En tant qu'expert en marketing pour restaurants, génère tout le contenu d'un mini-site.

Nom du restaurant: ${name}
Industrie: ${industry || "restauration"}
Description: ${description || "Restaurant de qualité"}

Génère du contenu pour toutes les sections:
1. Hero: headline et sous-titre
2. About: titre et 2 paragraphes
3. Spécialités: 3 noms et descriptions
4. CTA: texte des boutons
5. Récompense: type, description, visites requises, validité, conditions
6. Notifications: messages de rappel et réactivation

Le ton doit être professionnel, chaleureux et engageant en français.

Réponds UNIQUEMENT en JSON format:
{
  "heroHeadline": "string",
  "heroSubtitle": "string",
  "aboutTitle": "string",
  "aboutParagraph1": "string",
  "aboutParagraph2": "string",
  "specialtyNames": ["string", "string", "string"],
  "specialtyDescriptions": ["string", "string", "string"],
  "ctaPrimary": "string",
  "ctaSecondary": "string",
  "rewardType": "string",
  "rewardDescription": "string",
  "rewardVisitsRequired": number,
  "rewardValidityDays": number,
  "rewardConditions": "string",
  "reminderTemplate": "string",
  "reactivationTemplate": "string",
  "reactivation2Template": "string"
}
`;
}
