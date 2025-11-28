import { GoogleGenAI, Type } from "@google/genai";
import { DesignSystem, GeneratedContent } from "../types";

// Initialize Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

export const generateDesignSystem = async (prompt: string): Promise<DesignSystem> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Generate a visual design system based on this description: "${prompt}". 
      Return a JSON object with a color palette (primary, secondary, accent, background, text) and a font pairing (heading, body). 
      For fonts, choose from 'Inter', 'Playfair Display', 'Roboto', 'Space Grotesk', 'Lato'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING },
                secondary: { type: Type.STRING },
                accent: { type: Type.STRING },
                background: { type: Type.STRING },
                text: { type: Type.STRING },
              },
              required: ["primary", "secondary", "accent", "background", "text"],
            },
            fonts: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING },
                body: { type: Type.STRING },
              },
              required: ["heading", "body"],
            },
            mood: { type: Type.STRING },
          },
          required: ["colors", "fonts", "mood"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as DesignSystem;
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Gemini Design Generation Error:", error);
    // Fallback
    return {
      colors: { primary: '#3B82F6', secondary: '#10B981', accent: '#F59E0B', background: '#FFFFFF', text: '#1F2937' },
      fonts: { heading: 'Inter', body: 'Inter' },
      mood: 'Neutral'
    };
  }
};

export const generateTextContent = async (context: string): Promise<GeneratedContent> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Create marketing copy based on this context: "${context}". Return JSON with headline, subheadline, bodyText (max 20 words), and cta (call to action). Language: PT-BR.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                headline: { type: Type.STRING },
                subheadline: { type: Type.STRING },
                bodyText: { type: Type.STRING },
                cta: { type: Type.STRING },
            },
            required: ["headline", "subheadline", "bodyText", "cta"]
        }
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedContent;
    }
    throw new Error("No text returned");
  } catch (error) {
    console.error("Gemini Text Generation Error:", error);
    return {
      headline: "Design Inovador",
      subheadline: "Transforme suas ideias",
      bodyText: "Crie visuais impactantes com o poder da IA generativa.",
      cta: "Saiba Mais"
    };
  }
};