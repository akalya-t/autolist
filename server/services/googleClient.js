import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

export const ai = apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE'
  ? new GoogleGenAI({ apiKey })
  : null;

export function getGoogleGenAIClient() {
  const currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey || currentKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return null;
  }
  return ai || new GoogleGenAI({ apiKey: currentKey });
}

export default ai;
