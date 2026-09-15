# AI-Powered E-Commerce Product Auto-Lister

An  single-page web application that automates e-commerce product listings. Instead of manually writing copy and paying for costly studio photography, an admin simply takes a smartphone photo or uploads a raw product image. 

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



