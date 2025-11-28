import { GoogleGenerativeAI } from "@google/generative-ai";

// Access API key safely
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export const getGeminiResponse = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    console.warn("VITE_GEMINI_API_KEY not set");
    return "Erro: Chave de API não configurada.";
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao processar a solicitação.";
  }
};