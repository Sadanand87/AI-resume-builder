import { GEMENI_API_KEY } from "../config/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(GEMENI_API_KEY);

// Create the model instance for Gemini 2.0 Flash
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", 
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1000,
  responseMimeType: "application/json",
};

// Start a chat session (can reuse across messages)
export const AIChatSession = model.startChat({
  generationConfig,
  history: [],
});
