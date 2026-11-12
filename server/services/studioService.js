import sharp from 'sharp';
import { getGoogleGenAIClient } from './googleClient.js';

/**
 * Studio Photo Generation & Background Synthesis Service
 * 
 * Tiers:
 * Tier 0: Gemini Multimodal Image Generation (Nano Banana - gemini-2.5-flash-image / gemini-3.1-flash-image)
 * Tier 1: Photoroom API (if PHOTOROOM_API_KEY provided)
 * Tier 2: Replicate FLUX Fill / Inpaint (if REPLICATE_API_TOKEN provided)
 * Tier 3: High-Fidelity Perspective Studio Compositor (rasterized to 1024x1024 PNG)
 */

export const STUDIO_IMAGE_PROMPT_TEMPLATE = (scenePrompt, negativePrompt = '', detectedProductContext = '') => `
Task: Replace only the background and environment of this product photograph; produce a high-end commercial e-commerce packshot.
${detectedProductContext ? `Product Context: ${detectedProductContext}` : ''}
Scene Environment: ${scenePrompt}
Avoid Elements: ${negativePrompt ? `${negativePrompt}, human hands, extra products, text overlay, watermarks, floating objects` : 'human hands, extra products, text overlay, watermarks, floating objects'}

Strict Preservation Rules:
- Do not alter the product's shape, proportions, color, or material.
- Do not alter, redraw, re-spell, translate, or invent any text, logo, brand mark, or graphic printed on the packaging.
- Do not add, remove, or duplicate any part of the product.
- Do not add props, hands, extra products, text overlays, watermarks, or badges.
- The product must sit physically grounded on the surface with a correct, realistic contact shadow — it must not float.
- Output a single product, centered, fully in frame, square aspect ratio.
`.trim();

export const STUDIO_PRESETS = [
  {
    id: "pure-white",
    name: "Amazon / Shopify Pure White",
    prompt: "Commercial e-commerce packshot photography, seamless 100% solid pure white infinity cyclorama background, hex #FFFFFF, zero horizon line, zero room seams, diffused overhead softbox lighting, crisp product details, tight hyper-realistic base contact shadow, 85mm commercial lens.",
    negativePrompt: "gradient, off-white, grey background, floor seams, podium, pedestal, colored lighting, reflection, floating object.",
    badge: "PURE WHITE STANDARD",
    sceneType: "seamless-white",
    lighting: {
      keyLightColor: "#ffffff",
      keyLightOpacity: 1.0,
      fillColor: "#ffffff",
      ambientShadow: "rgba(15, 23, 42, 0.22)",
      tightShadow: "rgba(0, 0, 0, 0.45)",
      shadowOffsetX: 0,
      shadowOffsetY: 4
    }
  },
  {
    id: "clean-white",
    name: "Clean Minimal Studio",
    prompt: "Scandinavian architectural studio product photography, elegant low circular matte plaster pedestal with soft micro-texture, neutral soft-grey studio wall in distant soft focus, large 120cm diffused softbox key light at 45 degrees left, realistic directional ground shadow, 50mm f/4 lens.",
    negativePrompt: "busy scene, messy environment, dirty plaster, glossy plastic, harsh black shadows, clutter, distorted geometry.",
    badge: "CLEAN STUDIO",
    sceneType: "pedestal",
    pedestal: {
      shape: "cylinder",
      surfaceColor: "#f8fafc",
      rimColor: "#ffffff",
      sideColor: "#e2e8f0",
      strokeColor: "#cbd5e1"
    },
    lighting: {
      keyLightColor: "#ffffff",
      keyLightOpacity: 0.9,
      fillColor: "#e2e8f0",
      ambientShadow: "rgba(15, 23, 42, 0.25)",
      tightShadow: "rgba(15, 23, 42, 0.65)",
      shadowOffsetX: 12,
      shadowOffsetY: 8
    }
  },
  {
    id: "minimal-marble",
    name: "Minimalist Marble",
    prompt: "High-end luxury beauty editorial still life photography, wide smooth honed white Carrara marble slab platform with faint subtle grey veining, satin eggshell finish, diffused morning window light from upper-left, subtle botanical shadow silhouettes on back wall, crisp anchor contact shadow, 85mm f/2.8 lens.",
    negativePrompt: "heavy black veins, fake digital marble, direct sun glare, yellow tint, messy cracks, broken stone.",
    badge: "CARRARA MARBLE",
    sceneType: "marble-slab",
    lighting: {
      keyLightColor: "rgba(254, 243, 199, 0.65)",
      keyLightOpacity: 0.8,
      fillColor: "#cbd5e1",
      ambientShadow: "rgba(30, 41, 59, 0.32)",
      tightShadow: "rgba(15, 23, 42, 0.70)",
      shadowOffsetX: -14,
      shadowOffsetY: 6
    }
  },
  {
    id: "warm-wood",
    name: "Warm Wooden Table",
    prompt: "Warm artisanal lifestyle product photography, authentic natural blonde oak tabletop surface stretching into deep perspective with fine horizontal wood grain, diffused morning side-light entering from 60 degrees, distant soft-focus beige linen wall, rich warm umber contact grounding shadow, 70mm lens.",
    negativePrompt: "orange shellac varnish, red mahogany, heavy wood knots, vertical wall as floor, dark harsh shadows, plastic fake wood.",
    badge: "NATURAL OAK",
    sceneType: "wood-tabletop",
    lighting: {
      keyLightColor: "rgba(254, 215, 170, 0.6)",
      keyLightOpacity: 0.85,
      fillColor: "#d97706",
      ambientShadow: "rgba(69, 26, 3, 0.45)",
      tightShadow: "rgba(40, 15, 2, 0.85)",
      shadowOffsetX: 16,
      shadowOffsetY: 8
    }
  },
  {
    id: "pastel-podium",
    name: "Soft Pastel Podium",
    prompt: "Contemporary high-fashion editorial product photography, centered geometric cylinder pedestal in muted dusty rose and warm pastel peach, matte clay finish, overhead diffused beauty dish lighting, soft rim light along product silhouette, clean curved pastel studio set, 85mm lens.",
    negativePrompt: "neon pink, oversaturated magenta, cartoonish render, plastic shine, heavy black shadows.",
    badge: "PASTEL PODIUM",
    sceneType: "pedestal",
    pedestal: {
      shape: "cylinder",
      surfaceColor: "#fce7f3",
      rimColor: "#ffffff",
      sideColor: "#f472b6",
      strokeColor: "#ec4899"
    },
    lighting: {
      keyLightColor: "#ffffff",
      keyLightOpacity: 0.85,
      fillColor: "#f472b6",
      ambientShadow: "rgba(131, 24, 67, 0.35)",
      tightShadow: "rgba(76, 5, 25, 0.70)",
      shadowOffsetX: 8,
      shadowOffsetY: 6
    }
  },
  {
    id: "dark-slate",
    name: "Luxury Dark Slate",
    prompt: "Dramatic cinematic commercial product showcase, raw textured charcoal basalt slate stone platform with chiseled edges, chiaroscuro studio lighting, precise cool-white and icy cyan rim edge lights tracing product silhouette contours, deep matte black background, pin-sharp base contact shadow, 50mm macro lens.",
    negativePrompt: "underexposed product, lost silhouette edges, muddy shadows, washed out blacks, smoke clouds, heavy grain.",
    badge: "DARK SLATE",
    sceneType: "slate-slab",
    lighting: {
      keyLightColor: "rgba(56, 189, 248, 0.45)",
      keyLightOpacity: 0.9,
      fillColor: "#020617",
      ambientShadow: "rgba(0, 0, 0, 0.85)",
      tightShadow: "rgba(0, 0, 0, 0.98)",
      shadowOffsetX: 0,
      shadowOffsetY: 6
    }
  },
  {
    id: "modern-tech",
    name: "Modern Tech Glass",
    prompt: "Futuristic consumer electronics commercial showcase, polished dark optical mirror glass surface with inverted geometric reflection, architectural minimalist dark studio backdrop with horizontal electric cyan and indigo LED accent strips in distant soft focus, pin-sharp base contact, 50mm studio lens.",
    negativePrompt: "retro 80s grid, rainbow lens flare, blurry glass smudges, fingerprint marks, distorted reflection, noisy sensor grain.",
    badge: "TECH GLASS",
    sceneType: "tech-glass",
    lighting: {
      keyLightColor: "rgba(129, 140, 248, 0.55)",
      keyLightOpacity: 0.95,
      fillColor: "#030712",
      ambientShadow: "rgba(0, 0, 0, 0.90)",
      tightShadow: "rgba(0, 0, 0, 0.98)",
      shadowOffsetX: 0,
      shadowOffsetY: 4
    }
  }
];

/**
 * Identify configured primary studio engine
 */
export function getActiveStudioEngine() {
  const photoroomKey = process.env.PHOTOROOM_API_KEY;
  if (photoroomKey && photoroomKey !== 'YOUR_PHOTOROOM_API_KEY') {
    return 'photoroom';
  }
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    return 'gemini-image';
  }
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (replicateToken && replicateToken !== 'YOUR_REPLICATE_API_TOKEN') {
    return 'replicate';
  }
  return 'svg-compositor-fallback';
}

/**
 * Tier 0: Generate real studio photograph using Gemini Image Models (Nano Banana Family)
 * Sends original unmodified product photo with packaging preservation rules
 */
export async function generateWithGeminiImage(imageBuffer, mimeType = 'image/jpeg', preset, options = {}) {
  const ai = getGoogleGenAIClient();
  if (!ai) {
    const err = new Error('[StudioService Tier 0] GEMINI_API_KEY is not configured in server/.env');
    if (process.env.GEMINI_IMAGE_STRICT === 'true') throw err;
    console.warn(err.message);
    return null;
  }

  const candidateImageModels = [
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-image',
    'gemini-3.1-flash-image-preview',
    'gemini-3-pro-image'
  ];

  const detectedContext = options.productContext || (
    options.detectedBrandOrLabel ? `Brand: ${options.detectedBrandOrLabel}, Category: ${options.category || 'Product'}, Material: ${options.material || 'Standard packaging'}` : ''
  );

  const fullPrompt = STUDIO_IMAGE_PROMPT_TEMPLATE(
    preset.prompt,
    preset.negativePrompt,
    detectedContext
  );

  const inlineData = {
    data: imageBuffer.toString('base64'),
    mimeType: mimeType && mimeType.startsWith('image/') ? mimeType : 'image/jpeg'
  };

  let lastDetailedError = null;

  for (const modelName of candidateImageModels) {
    const config = {
      responseModalities: ['TEXT', 'IMAGE']
    };

    console.log(`[StudioService Tier 0] Attempting Gemini Image Generation with model: "${modelName}"`);
    console.log(`[StudioService Tier 0] Config:`, JSON.stringify(config));
    console.log(`[StudioService Tier 0] Preset ID: "${preset.id}" | Prompt length: ${fullPrompt.length} chars`);

    try {
      const t0 = Date.now();
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          { inlineData },
          fullPrompt
        ],
        config
      });

      const duration = Date.now() - t0;
      const candidate = response.candidates?.[0];
      const finishReason = candidate?.finishReason;
      const parts = candidate?.content?.parts || [];

      console.log(`[StudioService Tier 0] Response received from "${modelName}" in ${duration}ms. FinishReason: ${finishReason}, Parts: ${parts.length}`);

      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const rawMime = part.inlineData.mimeType || 'image/png';
          let pngBuffer = Buffer.from(part.inlineData.data, 'base64');
          if (rawMime !== 'image/png') {
            pngBuffer = await sharp(pngBuffer).png().toBuffer();
          }
          console.log(`[StudioService Tier 0] SUCCESS! Generated photorealistic studio render with ${modelName} (${(pngBuffer.length / 1024).toFixed(1)} KB)`);
          return `data:image/png;base64,${pngBuffer.toString('base64')}`;
        }
      }

      console.warn(`[StudioService Tier 0] Model "${modelName}" returned without image part. FinishReason: ${finishReason}. Parts inspection:`, parts.map(p => Object.keys(p)));
      lastDetailedError = new Error(`Model ${modelName} returned finishReason=${finishReason} without image data`);
    } catch (err) {
      console.error(`[StudioService Tier 0] Model "${modelName}" threw FULL ERROR:`, {
        message: err.message,
        status: err.status,
        code: err.code,
        details: err.details || err.errorDetails,
        stack: err.stack
      });
      lastDetailedError = err;
    }
  }

  if (process.env.GEMINI_IMAGE_STRICT === 'true') {
    throw new Error(`[StudioService Tier 0 GEMINI_IMAGE_STRICT] All candidate image models failed. Root error: ${lastDetailedError?.message || 'No response'}`);
  }

  return null;
}

/**
 * High-Precision Edge-Protected Silhouette Cutout Engine
 * Used EXCLUSIVELY for the SVG compositor fallback path
 */
export async function isolateProductCutout(imageBuffer, options = {}) {
  const mode = options.cutoutMode || 'smart';
  if (mode === 'none') return imageBuffer;

  try {
    const sharpInstance = sharp(imageBuffer);
    const metadata = await sharpInstance.metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 800;

    const processWidth = Math.min(width, 1000);
    const processHeight = Math.round((height / width) * processWidth);

    const { data, info } = await sharpInstance
      .resize(processWidth, processHeight, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const w = info.width;
    const h = info.height;

    const lum = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const idx = i * 4;
      lum[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }

    const cornerLum = (lum[0] + lum[w - 1] + lum[(h - 1) * w] + lum[(h - 1) * w + (w - 1)]) / 4;
    const isWhiteBg = cornerLum > 210;
    const edgeSensitivity = options.cutoutSensitivity || (isWhiteBg ? 8.5 : 14.0);

    const leftBounds = new Int32Array(h);
    const rightBounds = new Int32Array(h);
    const rowHasProduct = new Uint8Array(h);

    for (let y = 0; y < h; y++) {
      let left = -1;
      for (let x = 1; x < Math.floor(w * 0.49); x++) {
        const idx = y * w + x;
        const gradX = Math.abs(lum[idx] - lum[idx - 1]);
        const gradY = (y > 0 && y < h - 1) ? Math.abs(lum[idx + w] - lum[idx - w]) / 2 : 0;
        const totalGrad = Math.sqrt(gradX * gradX + gradY * gradY);
        const lumDiff = Math.abs(lum[idx] - cornerLum);

        if (totalGrad > edgeSensitivity || lumDiff > 22 || (isWhiteBg && lum[idx] < 225)) {
          left = Math.max(0, x - 1);
          break;
        }
      }

      let right = -1;
      for (let x = w - 2; x >= Math.ceil(w * 0.51); x--) {
        const idx = y * w + x;
        const gradX = Math.abs(lum[idx] - lum[idx + 1]);
        const gradY = (y > 0 && y < h - 1) ? Math.abs(lum[idx + w] - lum[idx - w]) / 2 : 0;
        const totalGrad = Math.sqrt(gradX * gradX + gradY * gradY);
        const lumDiff = Math.abs(lum[idx] - cornerLum);

        if (totalGrad > edgeSensitivity || lumDiff > 22 || (isWhiteBg && lum[idx] < 225)) {
          right = Math.min(w - 1, x + 1);
          break;
        }
      }

      if (left !== -1 && right !== -1 && left < right) {
        leftBounds[y] = left;
        rightBounds[y] = right;
        rowHasProduct[y] = 1;
      } else {
        leftBounds[y] = -1;
        rightBounds[y] = -1;
        rowHasProduct[y] = 0;
      }
    }

    for (let y = 0; y < h; y++) {
      if (rowHasProduct[y] === 0) {
        for (let x = 0; x < w; x++) data[(y * w + x) * 4 + 3] = 0;
      } else {
        const l = leftBounds[y];
        const r = rightBounds[y];
        for (let x = 0; x < l; x++) data[(y * w + x) * 4 + 3] = 0;
        if (l > 0) data[(y * w + l) * 4 + 3] = 160;
        for (let x = l + 1; x < r; x++) data[(y * w + x) * 4 + 3] = 255;
        if (r < w - 1) data[(y * w + r) * 4 + 3] = 160;
        for (let x = r + 1; x < w; x++) data[(y * w + x) * 4 + 3] = 0;
      }
    }

    return await sharp(data, { raw: { width: w, height: h, channels: 4 } })
      .trim({ threshold: 5 })
      .png()
      .toBuffer();
  } catch (err) {
    console.warn('[StudioService] Silhouette cutout fallback:', err.message);
    return imageBuffer;
  }
}

/**
 * Main Studio Generator
 * Tiers: Gemini Image (Tier 0) -> Photoroom (Tier 1) -> Replicate (Tier 2) -> Compositor (Tier 3)
 * Guaranteed return: Real PNG Data URL (data:image/png;base64,...)
 */
export async function generateStudioMockup(imageBuffer, mimeType = 'image/jpeg', themePrompt = 'clean-white', options = {}) {
  const photoroomKey = process.env.PHOTOROOM_API_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;

  const matchedPreset = STUDIO_PRESETS.find(p => p.id === themePrompt || p.name.toLowerCase() === themePrompt.toLowerCase()) || STUDIO_PRESETS[1];
  const effectivePrompt = matchedPreset ? matchedPreset.prompt : themePrompt;

  // Tier 0: Gemini Multimodal Image Generation
  try {
    const geminiImgDataUrl = await generateWithGeminiImage(imageBuffer, mimeType, matchedPreset, options);
    if (geminiImgDataUrl) {
      return {
        studioImageUrl: geminiImgDataUrl,
        studioEngine: 'gemini-image'
      };
    }
  } catch (err) {
    console.warn('[StudioService] Tier 0 Gemini image error (proceeding to Tier 1):', err.message);
    if (process.env.GEMINI_IMAGE_STRICT === 'true' && (!photoroomKey || photoroomKey === 'YOUR_PHOTOROOM_API_KEY') && (!replicateToken || replicateToken === 'YOUR_REPLICATE_API_TOKEN')) {
      throw err;
    }
  }

  // Tier 1: Photoroom API (v2)
  if (photoroomKey && photoroomKey !== 'YOUR_PHOTOROOM_API_KEY') {
    try {
      console.log(`[StudioService Tier 1] Dispatching to Photoroom API v2 for theme: "${matchedPreset.id}"...`);
      const formData = new FormData();
      formData.append('imageFile', new Blob([imageBuffer], { type: mimeType }), 'product.png');
      formData.append('background.prompt', effectivePrompt);
      formData.append('shadow.mode', 'ai.soft');

      const response = await fetch('https://image-api.photoroom.com/v2/edit', {
        method: 'POST',
        headers: { 'x-api-key': photoroomKey },
        body: formData,
      });

      if (response.ok) {
        const resultBuffer = await response.arrayBuffer();
        const pngBuf = await sharp(Buffer.from(resultBuffer)).png().toBuffer();
        console.log(`[StudioService Tier 1] Photoroom SUCCESS! Received ${(pngBuf.length / 1024).toFixed(1)} KB image for ${matchedPreset.id}`);
        return {
          studioImageUrl: `data:image/png;base64,${pngBuf.toString('base64')}`,
          studioEngine: 'photoroom'
        };
      } else {
        const errText = await response.text();
        console.warn('[StudioService Tier 1] Photoroom returned error:', response.status, errText);
      }
    } catch (err) {
      console.error('[StudioService Tier 1] Photoroom request failed:', err.message);
    }
  }

  // Tier 2: Replicate API (FLUX Fill / Inpainting)
  if (replicateToken && replicateToken !== 'YOUR_REPLICATE_API_TOKEN') {
    try {
      console.log(`[StudioService Tier 2] Dispatching to Replicate Diffusion API...`);
      const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${replicateToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait'
        },
        body: JSON.stringify({
          version: "fb8af171cfa1616ddcf1242fa093f9f40e8a947d03d18c977b6670b144cf7d81",
          input: { 
            image: base64Image,
            prompt: effectivePrompt,
            negative_prompt: matchedPreset.negativePrompt || ""
          }
        })
      });

      if (response.ok) {
        const repData = await response.json();
        const outUrl = Array.isArray(repData.output) ? repData.output[0] : repData.output;
        if (outUrl) {
          const imgResp = await fetch(outUrl);
          const imgArrayBuf = await imgResp.arrayBuffer();
          const pngBuf = await sharp(Buffer.from(imgArrayBuf)).png().toBuffer();
          return {
            studioImageUrl: `data:image/png;base64,${pngBuf.toString('base64')}`,
            studioEngine: 'replicate'
          };
        }
      }
    } catch (err) {
      console.error('[StudioService Tier 2] Replicate request failed:', err.message);
    }
  }

  // Tier 3: Fallback High-Fidelity Studio Compositor (rasterized to genuine 1024x1024 PNG)
  console.log(`[StudioService Tier 3] Generating perspective composite for: ${matchedPreset.id}`);
  const cutoutBuffer = await isolateProductCutout(imageBuffer, options);
  const compositePngDataUrl = await generateStudioComposite(cutoutBuffer, matchedPreset, options);

  return {
    studioImageUrl: compositePngDataUrl,
    studioEngine: 'svg-compositor-fallback'
  };
}

/**
 * True Perspective Studio Compositor
 * Generates distinct environments (Wood tabletop plane, Carrara marble slab, Dark Tech Glass, Amazon pure white)
 * Rasterizes result to pure PNG at 1024x1024 without any burned-in badges
 */
async function generateStudioComposite(cutoutBuffer, preset, options = {}) {
  const cutoutMeta = await sharp(cutoutBuffer).metadata();
  const rawW = cutoutMeta.width || 400;
  const rawH = cutoutMeta.height || 600;

  const base64Cutout = `data:image/png;base64,${cutoutBuffer.toString('base64')}`;
  const scale = options.scale || 0.62;
  const userOffset = options.verticalOffset || 0;

  const maxBoundingH = 650;
  const maxBoundingW = 550;
  const aspect = rawW / rawH;

  let productWidth = Math.round(maxBoundingH * aspect * scale);
  let productHeight = Math.round(maxBoundingH * scale);

  if (productWidth > maxBoundingW) {
    productWidth = maxBoundingW;
    productHeight = Math.round(productWidth / aspect);
  }

  const productX = Math.round((1000 - productWidth) / 2);

  let contactBaselineY = 740;
  if (preset.sceneType === 'seamless-white') contactBaselineY = 760;
  if (preset.sceneType === 'marble-slab') contactBaselineY = 710;
  if (preset.sceneType === 'wood-tabletop') contactBaselineY = 720;
  if (preset.sceneType === 'pedestal') contactBaselineY = 675;
  if (preset.sceneType === 'slate-slab') contactBaselineY = 705;
  if (preset.sceneType === 'tech-glass') contactBaselineY = 730;

  const productY = contactBaselineY - productHeight + userOffset;

  const contactShadowW = Math.round(productWidth * 0.72);
  const contactShadowH = Math.max(8, Math.round(contactShadowW * 0.08));
  const ambientShadowW = Math.round(productWidth * 0.95);
  const ambientShadowH = Math.round(ambientShadowW * 0.18);

  const shadowX = 500 + preset.lighting.shadowOffsetX;
  const shadowY = contactBaselineY + userOffset;

  const sceneSvg = buildSceneEnvironmentSvg(preset, {
    base64Cutout,
    productX,
    productY,
    productWidth,
    productHeight,
    contactBaselineY,
    shadowX,
    shadowY,
    contactShadowW,
    contactShadowH,
    ambientShadowW,
    ambientShadowH,
    userOffset
  });

  // Convert SVG to pure 1024x1024 raster PNG
  const pngBuffer = await sharp(Buffer.from(sceneSvg))
    .resize(1024, 1024)
    .png({ quality: 95 })
    .toBuffer();

  return `data:image/png;base64,${pngBuffer.toString('base64')}`;
}

/**
 * Builds distinct visual architecture for each preset
 * Note: AI Studio badge group removed completely per specifications
 */
function buildSceneEnvironmentSvg(preset, ctx) {
  const {
    base64Cutout, productX, productY, productWidth, productHeight,
    contactBaselineY, shadowX, shadowY, contactShadowW, contactShadowH,
    ambientShadowW, ambientShadowH, userOffset
  } = ctx;

  const { sceneType, lighting } = preset;

  return `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" height="1000" viewBox="0 0 1000 1000">
  <defs>
    <!-- Soft Contact Occlusion Filter -->
    <filter id="aoBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" />
    </filter>
    <filter id="ambientBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="22" />
    </filter>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="35" />
    </filter>

    <!-- Wood Tabletop Gradients -->
    <linearGradient id="woodSurface" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef3c7" />
      <stop offset="25%" stop-color="#fde68a" />
      <stop offset="70%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#92400e" />
    </linearGradient>
    <linearGradient id="woodBevel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#78350f" />
      <stop offset="100%" stop-color="#451a03" />
    </linearGradient>

    <!-- Marble Slab Gradients & Textures -->
    <linearGradient id="marbleTop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="45%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
    <linearGradient id="marbleBevel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#94a3b8" />
    </linearGradient>

    <!-- Slate Slab Gradients -->
    <linearGradient id="slateTop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="70%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="slateBevel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <!-- Dark Mirror Glass Gradient & Reflection Mask -->
    <linearGradient id="glassTop" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="glassReflectionFade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.38" />
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
    <mask id="glassMask">
      <rect x="0" y="${contactBaselineY}" width="1000" height="280" fill="url(#glassReflectionFade)" />
    </mask>

    <!-- Studio Wall Lighting Highlight -->
    <radialGradient id="wallSpotlight" cx="50%" cy="25%" r="65%">
      <stop offset="0%" stop-color="${lighting.keyLightColor}" stop-opacity="${lighting.keyLightOpacity}" />
      <stop offset="100%" stop-color="${lighting.keyLightColor}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- ================= 1. BACKGROUND WALL / ENVIRONMENT ================= -->
  ${renderBackgroundEnvironment(sceneType, lighting)}

  <!-- ================= 2. PHYSICAL BASE SURFACE (TABLE / SLAB / PODIUM) ================= -->
  ${renderPhysicalSurface(sceneType, preset, contactBaselineY)}

  <!-- ================= 3. INVERTED SURFACE REFLECTION (IF APPLICABLE) ================= -->
  ${(sceneType === 'marble-slab' || sceneType === 'tech-glass') ? `
    <g mask="url(#glassMask)" transform="translate(0, ${contactBaselineY * 2 + userOffset * 2}) scale(1, -1)">
      <image 
        xlink:href="${base64Cutout}" 
        href="${base64Cutout}"
        x="${productX}" 
        y="${productY}" 
        width="${productWidth}" 
        height="${productHeight}" 
        preserveAspectRatio="xMidYMid meet" 
        opacity="${sceneType === 'tech-glass' ? 0.45 : 0.2}"
      />
    </g>
  ` : ''}

  <!-- ================= 4. DUAL-STAGE GROUNDING CONTACT SHADOW ================= -->
  <!-- Layer 1: Ambient Directional Spread -->
  <ellipse 
    cx="${shadowX}" 
    cy="${shadowY + 4}" 
    rx="${ambientShadowW}" 
    ry="${ambientShadowH}" 
    fill="${lighting.ambientShadow}" 
    filter="url(#ambientBlur)" 
  />

  <!-- Layer 2: Tight Occlusion Contact Core (Directly pinches at base of product) -->
  <ellipse 
    cx="500" 
    cy="${shadowY - 1}" 
    rx="${contactShadowW}" 
    ry="${contactShadowH}" 
    fill="${lighting.tightShadow}" 
    filter="url(#aoBlur)" 
  />

  <!-- ================= 5. PRODUCT PHOTOGRAPHY HERO ================= -->
  <image 
    xlink:href="${base64Cutout}" 
    href="${base64Cutout}"
    x="${productX}" 
    y="${productY}" 
    width="${productWidth}" 
    height="${productHeight}" 
    preserveAspectRatio="xMidYMid meet" 
  />
</svg>
`.trim();
}

/**
 * Render distinct background styles
 */
function renderBackgroundEnvironment(sceneType, lighting) {
  if (sceneType === 'seamless-white') {
    return `<rect width="1000" height="1000" fill="#ffffff" />`;
  }

  if (sceneType === 'wood-tabletop') {
    return `
      <rect width="1000" height="1000" fill="#fffbeb" />
      <radialGradient id="warmWall" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#fef3c7" />
        <stop offset="60%" stop-color="#fde68a" />
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.4" />
      </radialGradient>
      <rect width="1000" height="720" fill="url(#warmWall)" />
      <path d="M 80,120 Q 240,160 320,380 Q 200,280 80,120 Z" fill="rgba(146, 64, 14, 0.08)" filter="url(#ambientBlur)" />
      <path d="M 220,60 Q 380,120 420,320 Q 300,240 220,60 Z" fill="rgba(146, 64, 14, 0.06)" filter="url(#ambientBlur)" />
    `;
  }

  if (sceneType === 'marble-slab') {
    return `
      <rect width="1000" height="1000" fill="#f8fafc" />
      <rect width="1000" height="710" fill="#f1f5f9" />
      <ellipse cx="400" cy="280" rx="460" ry="320" fill="url(#wallSpotlight)" />
      <rect x="180" y="0" width="35" height="650" fill="rgba(148, 163, 184, 0.12)" transform="rotate(-18, 180, 0)" filter="url(#ambientBlur)" />
      <rect x="360" y="0" width="35" height="650" fill="rgba(148, 163, 184, 0.12)" transform="rotate(-18, 360, 0)" filter="url(#ambientBlur)" />
    `;
  }

  if (sceneType === 'slate-slab') {
    return `
      <rect width="1000" height="1000" fill="#020617" />
      <radialGradient id="slateVignette" cx="50%" cy="32%" r="65%">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="60%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#020617" />
      </radialGradient>
      <rect width="1000" height="705" fill="url(#slateVignette)" />
      <ellipse cx="500" cy="480" rx="340" ry="240" fill="rgba(56, 189, 248, 0.16)" filter="url(#softGlow)" />
    `;
  }

  if (sceneType === 'tech-glass') {
    return `
      <rect width="1000" height="1000" fill="#030712" />
      <line x1="0" y1="728" x2="1000" y2="728" stroke="#06b6d4" stroke-width="2.5" opacity="0.65" filter="url(#aoBlur)" />
      <line x1="0" y1="728" x2="1000" y2="728" stroke="#ffffff" stroke-width="0.8" opacity="0.9" />
      <ellipse cx="500" cy="420" rx="380" ry="280" fill="rgba(99, 102, 241, 0.22)" filter="url(#softGlow)" />
      <ellipse cx="500" cy="728" rx="420" ry="60" fill="rgba(6, 182, 212, 0.18)" filter="url(#aoBlur)" />
    `;
  }

  return `
    <radialGradient id="defaultWall" cx="50%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="70%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </radialGradient>
    <rect width="1000" height="1000" fill="url(#defaultWall)" />
    <ellipse cx="500" cy="300" rx="460" ry="340" fill="url(#wallSpotlight)" />
  `;
}

/**
 * Render distinct foreground surfaces
 */
function renderPhysicalSurface(sceneType, preset, contactBaselineY) {
  if (sceneType === 'seamless-white') {
    return '';
  }

  if (sceneType === 'wood-tabletop') {
    return `
      <polygon points="0,${contactBaselineY - 30} 1000,${contactBaselineY - 30} 1000,1000 0,1000" fill="url(#woodSurface)" />
      <line x1="0" y1="${contactBaselineY + 30}" x2="1000" y2="${contactBaselineY + 30}" stroke="rgba(146, 64, 14, 0.15)" stroke-width="1.5" />
      <line x1="0" y1="${contactBaselineY + 80}" x2="1000" y2="${contactBaselineY + 80}" stroke="rgba(146, 64, 14, 0.12)" stroke-width="2" />
      <line x1="0" y1="${contactBaselineY + 160}" x2="1000" y2="${contactBaselineY + 160}" stroke="rgba(146, 64, 14, 0.18)" stroke-width="2.5" />
      <line x1="0" y1="${contactBaselineY - 30}" x2="1000" y2="${contactBaselineY - 30}" stroke="rgba(255, 255, 255, 0.75)" stroke-width="2" />
    `;
  }

  if (sceneType === 'marble-slab') {
    return `
      <polygon points="120,${contactBaselineY + 35} 880,${contactBaselineY + 35} 840,${contactBaselineY + 95} 80,${contactBaselineY + 95}" fill="rgba(15, 23, 42, 0.25)" filter="url(#ambientBlur)" />
      <polygon points="110,${contactBaselineY + 28} 890,${contactBaselineY + 28} 890,${contactBaselineY + 68} 110,${contactBaselineY + 68}" fill="url(#marbleBevel)" />
      <polygon points="140,${contactBaselineY - 45} 860,${contactBaselineY - 45} 890,${contactBaselineY + 28} 110,${contactBaselineY + 28}" fill="url(#marbleTop)" stroke="#cbd5e1" stroke-width="1" />
      <path d="M 240,${contactBaselineY - 30} Q 360,${contactBaselineY - 10} 420,${contactBaselineY + 20} Q 460,${contactBaselineY + 5} 580,${contactBaselineY + 25}" stroke="rgba(148, 163, 184, 0.45)" stroke-width="1.8" fill="none" />
      <path d="M 620,${contactBaselineY - 35} Q 680,${contactBaselineY - 15} 760,${contactBaselineY + 15}" stroke="rgba(148, 163, 184, 0.35)" stroke-width="1.2" fill="none" />
      <line x1="110" y1="${contactBaselineY + 28}" x2="890" y2="${contactBaselineY + 28}" stroke="#ffffff" stroke-width="2" opacity="0.9" />
    `;
  }

  if (sceneType === 'slate-slab') {
    return `
      <polygon points="130,${contactBaselineY + 30} 870,${contactBaselineY + 30} 830,${contactBaselineY + 90} 90,${contactBaselineY + 90}" fill="rgba(0, 0, 0, 0.8)" filter="url(#ambientBlur)" />
      <polygon points="120,${contactBaselineY + 22} 880,${contactBaselineY + 22} 880,${contactBaselineY + 64} 120,${contactBaselineY + 64}" fill="url(#slateBevel)" />
      <polygon points="150,${contactBaselineY - 40} 850,${contactBaselineY - 40} 880,${contactBaselineY + 22} 120,${contactBaselineY + 22}" fill="url(#slateTop)" stroke="#334155" stroke-width="1.2" />
      <line x1="120" y1="${contactBaselineY + 22}" x2="880" y2="${contactBaselineY + 22}" stroke="#38bdf8" stroke-width="1.6" opacity="0.8" />
    `;
  }

  if (sceneType === 'tech-glass') {
    return `
      <polygon points="0,${contactBaselineY} 1000,${contactBaselineY} 1000,1000 0,1000" fill="url(#glassTop)" />
      <line x1="0" y1="${contactBaselineY}" x2="1000" y2="${contactBaselineY}" stroke="#6366f1" stroke-width="1.5" opacity="0.75" />
    `;
  }

  const ped = preset.pedestal || { surfaceColor: "#f8fafc", rimColor: "#ffffff", sideColor: "#e2e8f0", strokeColor: "#cbd5e1" };
  return `
    <g transform="translate(0, 0)">
      <ellipse cx="500" cy="${contactBaselineY + 45}" rx="380" ry="65" fill="${preset.lighting.ambientShadow}" filter="url(#ambientBlur)" />
      <path d="M 220,${contactBaselineY} C 220,${contactBaselineY - 40} 780,${contactBaselineY - 40} 780,${contactBaselineY} L 780,${contactBaselineY + 45} C 780,${contactBaselineY + 85} 220,${contactBaselineY + 85} Z" fill="${ped.sideColor}" stroke="${ped.strokeColor}" stroke-width="1.2" />
      <ellipse cx="500" cy="${contactBaselineY}" rx="280" ry="44" fill="${ped.surfaceColor}" stroke="${ped.strokeColor}" stroke-width="1.2" />
      <ellipse cx="500" cy="${contactBaselineY - 2}" rx="276" ry="40" fill="none" stroke="${ped.rimColor}" stroke-width="1.5" opacity="0.85" />
    </g>
  `;
}
