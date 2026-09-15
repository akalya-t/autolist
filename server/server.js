import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeProductImage } from './services/geminiService.js';
import { generateStudioMockup, STUDIO_PRESETS, getActiveStudioEngine } from './services/studioService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and large JSON payloads for base64 images
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (.jpg, .png, .webp) are allowed'));
    }
  }
});

/**
 * Health check & configuration status
 */
app.get('/api/health', (req, res) => {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE');
  const studioEngine = getActiveStudioEngine();

  res.json({
    status: 'ok',
    version: '1.0.0',
    services: {
      geminiVision: geminiConfigured ? 'active' : 'demo-mode',
      studioEngine: studioEngine
    },
    message: geminiConfigured 
      ? `Gemini Multimodal Vision & Image Studio engine is active (${studioEngine}).` 
      : 'Running in demo mode. Add GEMINI_API_KEY to server/.env for live AI multimodal generation.'
  });
});

/**
 * Get available studio background theme presets
 */
app.get('/api/presets', (req, res) => {
  res.json({
    success: true,
    presets: STUDIO_PRESETS
  });
});

/**
 * Main Controller: Scan Image & Generate Studio Mockup + Product Copy
 * Supports both high-speed parallel track (default) and sequential enriched prompt track
 * POST /api/scan-and-generate
 */
app.post('/api/scan-and-generate', upload.single('image'), async (req, res) => {
  try {
    let imageBuffer;
    let mimeType = 'image/jpeg';
    const backgroundTheme = req.body.backgroundTheme || 'clean-white';
    const customPrompt = req.body.customPrompt || '';

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    } else if (req.body.imageBase64) {
      // Allow base64 string from direct camera snapshot
      const rawBase64 = req.body.imageBase64;
      const matches = rawBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        imageBuffer = Buffer.from(matches[2], 'base64');
      } else {
        imageBuffer = Buffer.from(rawBase64, 'base64');
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'No product image provided. Please upload an image or capture with camera.'
      });
    }

    const originalImageUrl = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

    console.log(`[POST /api/scan-and-generate] Processing image (${(imageBuffer.length / 1024).toFixed(1)} KB)...`);
    const startTime = Date.now();

    let geminiResult;
    let studioMockupResult;

    // Optional sequenced prompt enrichment path
    if (process.env.ENRICH_IMAGE_PROMPT === 'true') {
      console.log('[POST /api/scan-and-generate] Sequenced execution enabled (ENRICH_IMAGE_PROMPT=true)');
      geminiResult = await analyzeProductImage(imageBuffer, mimeType, customPrompt);
      const enrichmentOptions = {
        detectedBrandOrLabel: geminiResult.detectedBrandOrLabel,
        category: geminiResult.category,
        material: geminiResult.visualAttributes?.material
      };
      studioMockupResult = await generateStudioMockup(imageBuffer, mimeType, backgroundTheme, enrichmentOptions);
    } else {
      // High-speed parallel execution (default)
      [geminiResult, studioMockupResult] = await Promise.all([
        analyzeProductImage(imageBuffer, mimeType, customPrompt),
        generateStudioMockup(imageBuffer, mimeType, backgroundTheme)
      ]);
    }

    const studioImageUrl = typeof studioMockupResult === 'string' ? studioMockupResult : studioMockupResult.studioImageUrl;
    const studioEngine = studioMockupResult?.studioEngine || getActiveStudioEngine();

    const processingDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[POST /api/scan-and-generate] Completed in ${processingDuration}s via [${studioEngine}]`);

    // Format response matching unified specification with INR pricing
    const responsePayload = {
      success: true,
      data: {
        originalImageUrl,
        studioImageUrl,
        studioEngine,
        backgroundTheme,
        processingTime: `${processingDuration}s`,
        product: {
          title: geminiResult.title || 'Untitled E-Commerce Product',
          category: geminiResult.category || 'General > Merchandise',
          description: geminiResult.description || '',
          tags: Array.isArray(geminiResult.tags) ? geminiResult.tags : [],
          suggestedPrice: typeof geminiResult.suggestedPrice === 'number' ? geminiResult.suggestedPrice : 499,
          detectedBrandOrLabel: geminiResult.detectedBrandOrLabel || 'Generic',
          visualAttributes: geminiResult.visualAttributes || {}
        },
        _isFallback: geminiResult._isFallback || false
      }
    };

    return res.json(responsePayload);
  } catch (error) {
    console.error('Server error during scan-and-generate:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process product image. Please try again.',
      details: error.message
    });
  }
});

/**
 * Regenerate Studio Background Only
 * POST /api/regenerate-studio-image
 */
app.post('/api/regenerate-studio-image', upload.single('image'), async (req, res) => {
  try {
    let imageBuffer;
    let mimeType = 'image/jpeg';
    const backgroundTheme = req.body.backgroundTheme || 'clean-white';

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    } else if (req.body.originalImageUrl) {
      const rawBase64 = req.body.originalImageUrl;
      const matches = rawBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        imageBuffer = Buffer.from(matches[2], 'base64');
      } else {
        imageBuffer = Buffer.from(rawBase64, 'base64');
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Missing original image data for regeneration.'
      });
    }

    const options = {
      scale: parseFloat(req.body.scale) || 1.0,
      verticalOffset: parseInt(req.body.verticalOffset) || 0,
      shadowIntensity: parseFloat(req.body.shadowIntensity) || 1.0,
      cutoutMode: req.body.cutoutMode || 'smart'
    };

    const studioMockupResult = await generateStudioMockup(imageBuffer, mimeType, backgroundTheme, options);
    const studioImageUrl = typeof studioMockupResult === 'string' ? studioMockupResult : studioMockupResult.studioImageUrl;
    const studioEngine = studioMockupResult?.studioEngine || getActiveStudioEngine();

    return res.json({
      success: true,
      data: {
        studioImageUrl,
        studioEngine,
        backgroundTheme,
        options
      }
    });
  } catch (error) {
    console.error('Error in regenerate-studio-image:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to regenerate studio image.',
      details: error.message
    });
  }
});

/**
 * Publish Product to Catalog / Store
 * POST /api/publish
 */
app.post('/api/publish', (req, res) => {
  try {
    const listing = req.body;
    const productTitle = listing?.product?.title || listing?.title;

    if (!listing || !productTitle) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product listing payload: missing title'
      });
    }

    const publishedRecord = {
      id: `prod_${Date.now()}`,
      status: 'active',
      publishedAt: new Date().toISOString(),
      ...listing,
      title: productTitle
    };

    console.log(`[POST /api/publish] Successfully published product: "${productTitle}" (ID: ${publishedRecord.id})`);

    return res.json({
      success: true,
      message: 'Product successfully approved and published to store catalog!',
      product: publishedRecord
    });
  } catch (error) {
    console.error('Error publishing product:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to publish product.'
    });
  }
});

// Serve frontend if built in production
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.listen(PORT, () => {
  console.log(`🚀 AI Product Auto-Lister Server running on http://localhost:${PORT}`);
  console.log(`💡 Health check: http://localhost:${PORT}/api/health`);
  const activeEngine = getActiveStudioEngine();
  console.log(`🎨 Active Studio Engine: [${activeEngine}]`);
  if (activeEngine === 'svg-compositor-fallback') {
    console.warn(`⚠️ Warning: No AI image generation key configured or active. Studio mockups will use high-precision vector compositor fallback (rasterized to PNG).`);
  }
});
