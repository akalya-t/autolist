import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGenerateContent, mockAiClient } = vi.hoisted(() => {
  const mockGenerateContent = vi.fn();
  const mockAiClient = {
    models: {
      generateContent: mockGenerateContent
    }
  };
  return { mockGenerateContent, mockAiClient };
});

vi.mock('../services/googleClient.js', () => ({
  getGoogleGenAIClient: vi.fn(() => mockAiClient),
  ai: mockAiClient,
  default: mockAiClient
}));

import { analyzeProductImage } from '../services/geminiService.js';

describe('Gemini Vision Service (analyzeProductImage)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('when Gemini returns valid JSON, analyzeProductImage returns the parsed object', async () => {
    const mockProductData = {
      title: 'Handcrafted Ceramic Coffee Mug 350ml',
      category: 'Home & Kitchen > Drinkware > Coffee Mugs',
      description: 'Artisanal ceramic mug with ergonomic handle and heat-retaining glaze.',
      tags: ['ceramic mug', 'coffee cup', 'handmade'],
      suggestedPrice: 349,
      detectedBrandOrLabel: 'ClayCraft',
      visualAttributes: {
        primaryColor: 'Terracotta',
        material: 'Ceramic',
        style: 'Artisanal'
      }
    };

    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(mockProductData)
    });

    const fakeImageBuffer = Buffer.from('fake-raw-image-content');
    const result = await analyzeProductImage(fakeImageBuffer, 'image/jpeg');

    expect(result).toEqual(mockProductData);
    expect(result.title).toBe('Handcrafted Ceramic Coffee Mug 350ml');
    expect(result.suggestedPrice).toBe(349);
    expect(result._isFallback).toBeUndefined();
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('when Gemini throws, the fallback listing is returned (_isFallback true)', async () => {
    mockGenerateContent.mockRejectedValue(new Error('Simulated Gemini 429 Resource Exhausted'));

    const fakeImageBuffer = Buffer.from('fake-raw-image-content');
    const result = await analyzeProductImage(fakeImageBuffer, 'image/jpeg');

    expect(result).toHaveProperty('_isFallback', true);
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('suggestedPrice');
    expect(result._fallbackReason).toContain('Simulated Gemini 429');
  });
});
