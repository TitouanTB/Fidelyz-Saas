import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

  const result = await model.generateContent(prompt);
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

  const result = await model.generateContent(prompt);
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

  const result = await model.generateContent(prompt);
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

export { genAI, model };