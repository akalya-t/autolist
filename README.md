# AI-Powered E-Commerce Product Auto-Lister

An intelligent, lightweight, single-page web application that automates e-commerce product listings. Instead of manually writing copy and paying for costly studio photography, an admin simply takes a smartphone photo or uploads a raw product image. 

The system automatically:
1. **Scans the image with Gemini 1.5 Flash Multimodal VLM** using structured JSON output to extract specs, SEO-friendly titles, high-converting descriptions, bullet points, tags, and pricing.
2. **Synthesizes a commercial studio photoshoot** by isolating product geometry, removing clutter, and rendering professional lighting, contact shadows, and pedestal backdrops.
3. **Presents a single, minimal admin view** with side-by-side review, instant scene theme regeneration, editable catalog fields, and 1-click publishing.

---

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + Lucide React icons
- **Backend**: Node.js + Express + Multer (multipart handling)
- **AI Vision Engine**: Google Gemini 1.5 Flash (`@google/generative-ai`) with Structured JSON Schema outputs
- **Studio Photo Engine**: Built-in Studio Compositor Engine + Photoroom API / Replicate FLUX.1-Fill support

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env` and insert your Gemini API Key:

```bash
# In server/.env
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Commercial Background Replacement APIs
PHOTOROOM_API_KEY=
REPLICATE_API_TOKEN=

PORT=5000
```

> **Note**: You can obtain a free Gemini API key at [Google AI Studio](https://aistudio.google.com/). If no key is set, the application automatically runs in rich demo mode so you can test all features immediately!

### 3. Run Development Server
From the root directory, start both the Express backend and Vite frontend concurrently:

```bash
npm run dev
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🎨 Three Minimalist UI States

### State 1: Upload / Capture Stage
- Drag-and-drop zone for `.jpg`, `.png`, `.webp` images up to 25MB.
- "Use Camera" button with direct browser webcam feed or smartphone camera capture.
- 1-Click sample demo products (Tumbler, Earbuds, Serum) for instant testing.
- Preview thumbnail with backdrop preset selection.
- Large primary CTA: **"Analyze & Generate Listing"**.

### State 2: Processing / Scanning State
- Step-by-step dynamic progress checklist:
  - `[✓] Uploading raw product image...`
  - `[⟳] Analyzing product geometry & packaging text with Gemini VLM...`
  - `[ ] Synthesizing studio-grade lifestyle render...`
- Animated skeleton loaders in both visual and catalog columns.

### State 3: Staging & Review Stage
- **Left Column (Visuals)**:
  - Studio Mockup view, Raw Original view, and Side-by-Side split view.
  - Backdrop theme selector (*Clean White Studio, Minimalist Marble, Warm Wooden Table, Soft Pastel Podium, Luxury Dark Slate, Modern Tech Glass*).
  - "Regenerate Scene Background" quick-button.
- **Right Column (Editable Catalog Form)**:
  - Product Title (editable, character counter).
  - Category Hierarchy (editable).
  - Suggested Price ($ USD).
  - Product Overview / Benefit Description (editable).
  - 4 Feature Highlights / Bullet Points (add / delete / edit).
  - SEO Tags & Search Keywords (add / remove tag pills).
- **Footer Actions**:
  - "Reset / Upload Another"
  - "Approve & Publish to Store" (launches export modal with formatted REST JSON payload).

---

## 📡 Backend API Endpoints

### 1. `POST /api/scan-and-generate`
Multipart form request:
- `image`: File buffer or `imageBase64`
- `backgroundTheme`: Theme ID (e.g. `'clean-white'`, `'minimal-marble'`)

**Response Payload**:
```json
{
  "success": true,
  "data": {
    "originalImageUrl": "data:image/jpeg;base64,...",
    "studioImageUrl": "data:image/svg+xml;base64,...",
    "product": {
      "title": "EcoGrip 500ml Insulated Travel Tumbler – Double-Wall Stainless Steel",
      "category": "Home & Kitchen > Drinkware",
      "description": "Keep your beverages hot for up to 12 hours or ice-cold for 24 hours...",
      "bulletPoints": [
        "Double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12 hours.",
        "Constructed from 18/8 food-grade stainless steel with BPA-free lid.",
        "Ergonomic spill-proof push-button spout for effortless one-handed use.",
        "Fits standard car cup holders and features a rugged matte powder-coated finish."
      ],
      "tags": ["travel mug", "stainless steel", "insulated tumbler", "drinkware"],
      "suggestedPrice": 24.99
    }
  }
}
```

### 2. `POST /api/regenerate-studio-image`
Re-renders only the studio mockup with a newly selected background preset without re-running vision NLP extraction.

### 3. `POST /api/publish`
Approves and publishes the edited listing to the store catalog.

---

## 📜 License
MIT
