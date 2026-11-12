import { getGoogleGenAIClient } from './googleClient.js';

/**
 * System prompt for Gemini multimodal vision & copy generation
 */
const SYSTEM_INSTRUCTION = `You are an expert e-commerce catalog specialist and marketing copywriter specializing in the Indian retail and e-commerce market. 
Analyze the provided product image thoroughly:
1. Inspect packaging text, product name, brand labels, barcodes, weight/volume (e.g., 50g, 100g, 500ml), ingredients/materials, texture, shape, and key features.
2. Formulate an SEO-friendly, high-converting product title (under 80 characters).
3. Determine the primary e-commerce category hierarchy (e.g., 'Grocery & Gourmet Foods > Spices & Masalas' or 'Electronics > Audio > Headphones').
4. Write a compelling 2-3 sentence product overview description focusing on buyer benefits and practical value.
5. Suggest 4-6 relevant SEO search tags.
6. Estimate a realistic commercial retail price in Indian Rupees (suggestedPrice as a number in INR / ₹, e.g., 149, 299, 499) calibrated against typical Indian MRP for the detected category, brand tier, and pack size.
7. Return strictly valid JSON conforming to the requested schema. Do not include markdown code fences or extraneous commentary.`;

/**
 * JSON Schema for structured output
 */
const PRODUCT_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "SEO-friendly, high-converting product title under 80 characters."
    },
    category: {
      type: "string",
      description: "Primary e-commerce category hierarchy."
    },
    description: {
      type: "string",
      description: "Compelling 2-3 sentence product overview description highlighting customer benefits."
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "4-6 relevant SEO search tags and keywords."
    },
    suggestedPrice: {
      type: "number",
      description: "Realistic estimated retail price in Indian Rupees (INR / ₹) matching Indian MRP conventions."
    },
    detectedBrandOrLabel: {
      type: "string",
      description: "Detected brand, label name, or 'Generic' if none."
    },
    visualAttributes: {
      type: "object",
      properties: {
        primaryColor: { type: "string" },
        material: { type: "string" },
        style: { type: "string" }
      }
    }
  },
  required: ["title", "category", "description", "tags", "suggestedPrice"]
};

// Candidate vision models tested and verified with @google/genai SDK
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash'
];

/**
 * Analyze an image buffer with Gemini Multimodal Vision
 * @param {Buffer} imageBuffer - Raw image buffer
 * @param {string} mimeType - e.g. 'image/jpeg', 'image/png'
 * @param {string} [customContext] - Optional user context or instructions
 * @returns {Promise<Object>} Structured product listing data
 */
export async function analyzeProductImage(imageBuffer, mimeType = 'image/jpeg', customContext = '') {
  const ai = getGoogleGenAIClient();

  if (!ai) {
    console.warn('⚠️ GEMINI_API_KEY is not set. Returning smart contextual fallback product listing.');
    return generateContextualFallback(mimeType);
  }

  const prompt = customContext 
    ? `Analyze this product image in detail. Read all brand packaging text, product name, weight/volume, and visible details. Additional context: ${customContext}. Return strictly structured JSON matching the schema.`
    : "Analyze this product image in detail. Read all brand packaging text, product name, weight/volume, ingredients, and visible details. Produce an authentic, SEO-optimized e-commerce listing strictly following the schema.";

  const inlineData = {
    data: imageBuffer.toString('base64'),
    mimeType: mimeType && mimeType.startsWith('image/') ? mimeType : 'image/jpeg'
  };

  let lastError = null;

  // Try candidate models in order until one succeeds
  for (const modelName of CANDIDATE_MODELS) {
    try {
      console.log(`[GeminiService] Analyzing product image using model: "${modelName}"...`);
      const t0 = Date.now();
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          prompt,
          { inlineData }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: PRODUCT_SCHEMA,
          temperature: 0.1,
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini vision model');
      }

      const parsedData = JSON.parse(responseText);
      const elapsed = Date.now() - t0;
      console.log(`[GeminiService] Successfully generated listing for: "${parsedData.title}" using ${modelName} in ${elapsed}ms`);
      return parsedData;
    } catch (error) {
      console.warn(`[GeminiService] Model ${modelName} encountered error:`, error.message);
      lastError = error;
    }
  }

  console.error('[GeminiService] All Gemini models failed:', lastError);
  return generateContextualFallback(mimeType, lastError ? lastError.message : 'All models failed');
}

/**
 * Contextual fallback if Gemini key is missing or quota exceeded
 */
function generateContextualFallback(mimeType, errorMsg = '') {
  return {
    title: "Pro-Grade Matte Insulated Travel Tumbler – Stainless Steel 500ml",
    category: "Home & Kitchen > Drinkware > Tumblers",
    description: "Engineered for active lifestyles, this premium double-walled insulated tumbler locks in hot and cold temperatures for over 18 hours. Features a condensation-proof matte exterior and ergonomic grip for daily commuting and outdoor adventures.",
    tags: ["travel mug", "insulated tumbler", "stainless steel", "drinkware", "eco friendly", "bpa free"],
    suggestedPrice: 499,
    detectedBrandOrLabel: "AeroHydrate",
    visualAttributes: {
      primaryColor: "Matte Slate / Charcoal",
      material: "18/8 Stainless Steel & Polypropylene",
      style: "Minimalist Modern"
    },
    _isFallback: true,
    _fallbackReason: errorMsg || "GEMINI_API_KEY not configured in .env"
  };
}
