import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Layers,
  IndianRupee,
  Tag,
  Sliders,
  ArrowLeft,
  Check,
  Download,
  Copy
} from 'lucide-react';

const PRESET_THEMES = [
  { id: 'pure-white', label: 'Amazon / Shopify Pure White', desc: '100% pure white background with soft ground shadow' },
  { id: 'clean-white', label: 'Clean Minimal Studio', desc: 'Diffused neutral lighting, clean studio podium' },
  { id: 'minimal-marble', label: 'Minimalist Marble', desc: 'Carrara stone slab, morning sunlight' },
  { id: 'warm-wood', label: 'Warm Wooden Table', desc: 'Natural oak wood, organic botanical shadow' },
  { id: 'pastel-podium', label: 'Soft Pastel Podium', desc: 'Architectural geometric podium, fashion tone' },
  { id: 'dark-slate', label: 'Luxury Dark Slate', desc: 'Dark stone texture, dramatic rim spotlights' },
  { id: 'modern-tech', label: 'Modern Tech Glass', desc: 'Reflective mirror glass, subtle tech glow' },
];

export default function StagingReview({
  data,
  onReset,
  onRegenerateImage,
  onPublish,
  isRegenerating,
  isPublishing
}) {
  const [selectedTheme, setSelectedTheme] = useState(data.backgroundTheme || 'clean-white');
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, fieldKey) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField((prev) => (prev === fieldKey ? null : prev));
    }, 2000);
  };

  // Editable form state
  const [title, setTitle] = useState(data.product?.title || '');
  const [category, setCategory] = useState(data.product?.category || '');
  const [description, setDescription] = useState(data.product?.description || '');
  const [suggestedPrice, setSuggestedPrice] = useState(
    data.product?.suggestedPrice !== undefined ? data.product.suggestedPrice : 499
  );
  const [tags, setTags] = useState(
    data.product?.tags?.length ? [...data.product.tags] : ['e-commerce', 'bestseller', 'premium']
  );
  const [newTagInput, setNewTagInput] = useState('');

  // Tags handlers
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = newTagInput.trim().toLowerCase().replace(/,/g, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTriggerRegenerate = (themeToUse = selectedTheme) => {
    onRegenerateImage(themeToUse);
  };

  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    onRegenerateImage(newTheme);
  };

  const handleDownloadPNG = () => {
    if (!data.studioImageUrl) return;
    const link = document.createElement('a');
    const filename = `${(title || 'studio-product').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}-render.png`;
    link.href = data.studioImageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerPublish = () => {
    const finalPayload = {
      ...data,
      title,
      studioImageUrl: data.studioImageUrl,
      product: {
        title,
        category,
        description,
        tags,
        suggestedPrice: parseFloat(suggestedPrice) || 0,
        detectedBrandOrLabel: data.product?.detectedBrandOrLabel,
        visualAttributes: data.product?.visualAttributes
      }
    };
    onPublish(finalPayload);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Top Simple Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 text-xs font-semibold text-ink hover:text-ink bg-white hover:border-aiLime hover:shadow-[0_0_16px_rgba(199,243,107,0.6)] rounded-xl border border-softBorder shadow-sm transition-all duration-200 flex items-center space-x-2 font-sans active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-ink" />
          <span>Back to Upload</span>
        </button>
      </div>

      {/* Unified Charcoal Black Glassmorphic Single Container Divided Vertically */}
      <div className="bg-[#12161A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden text-white grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        {/* Left Column: Visual Studio */}
        <div className="lg:col-span-5 p-6 flex flex-col justify-between h-full space-y-5">
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Single-line Visual Preview Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-label-xs font-heading font-semibold uppercase tracking-wider text-aiLime flex items-center space-x-1.5 whitespace-nowrap">
                <Layers className="w-4 h-4 text-aiLime" />
                <span>Visual Preview</span>
              </span>
              <span className="text-[11px] text-white/50 font-sans">Studio Staging</span>
            </div>

            {/* Display Canvas Area - stretches to match right column */}
            <div className="w-full flex-1 min-h-[360px] lg:min-h-[420px] bg-[#0A0D0F] rounded-2xl border border-white/10 overflow-hidden relative flex items-center justify-center group shadow-inner">
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <img
                  src={data.studioImageUrl}
                  alt="AI Studio Mockup"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#12161A]/95 border border-white/10 text-[10px] font-bold text-aiLime backdrop-blur-md shadow-sm flex items-center space-x-1.5 font-sans">
                  <span className="w-2 h-2 rounded-full bg-successGreen animate-pulse" />
                  <span>STUDIO PHOTOSHOOT</span>
                </div>

                {/* Download PNG Button (Bottom Right) */}
                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  title="Download Studio Render as PNG"
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-[#12161A]/90 hover:bg-[#171717] border border-white/15 hover:border-aiLime text-white/80 hover:text-aiLime backdrop-blur-md shadow-lg transition-all duration-200 hover:shadow-[0_0_16px_rgba(199,243,107,0.5)] active:scale-95 z-10 flex items-center space-x-1.5 font-sans group/dl"
                >
                  <Download className="w-3.5 h-3.5 text-aiLime transition-transform group-hover/dl:-translate-y-0.5" />
                  <span className="text-[11px] font-semibold text-white group-hover/dl:text-aiLime">Download PNG</span>
                </button>
              </div>

              {isRegenerating && (
                <div className="absolute inset-0 bg-[#0A0D0F]/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 z-20">
                  <RefreshCw className="w-8 h-8 animate-spin text-aiLime" />
                  <p className="text-xs font-bold text-white font-heading">Synthesizing Studio Backdrop & Cutout...</p>
                </div>
              )}
            </div>

            {/* Backdrop Theme Preset Selector */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-label-xs font-heading font-semibold uppercase tracking-wider text-white/90 flex items-center space-x-1.5 whitespace-nowrap">
                  <Sliders className="w-3.5 h-3.5 text-aiLime" />
                  <span>Backdrop Theme</span>
                </label>
              </div>

              <select
                value={selectedTheme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0A0D0F] border border-white/10 rounded-xl text-xs text-white font-medium focus:ring-1 focus:ring-aiLime focus:outline-none transition cursor-pointer font-sans shadow-sm"
              >
                {PRESET_THEMES.map((theme) => (
                  <option key={theme.id} value={theme.id} className="bg-[#12161A] text-white">
                    {theme.label} — {theme.desc}
                  </option>
                ))}
              </select>

              {/* Quick Regenerate Button */}
              <button
                type="button"
                onClick={() => handleTriggerRegenerate()}
                disabled={isRegenerating}
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-semibold text-white transition flex items-center justify-center space-x-2 disabled:opacity-50 font-sans shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-aiLime ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>Re-render Scene & Cutout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Generated Catalog Content (Clean Editorial AI Layout) */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between h-full space-y-7">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-label-xs font-heading font-semibold uppercase tracking-wider text-aiLime flex items-center space-x-2 whitespace-nowrap">
              <Sparkles className="w-4 h-4 text-aiLime" />
              <span>AI Generated Catalog Copy</span>
            </span>
            <span className="text-[11px] text-white/40 font-sans">Click any field to edit directly</span>
          </div>

          <div className="space-y-7 flex-1">
            {/* 01 — PRODUCT INFORMATION */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-aiLime/80 uppercase">01</span>
                <span className="text-[11px] font-mono font-bold tracking-wider text-white/40 uppercase">Product Information</span>
              </div>

              {/* Product Title (Strongest Element) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-heading font-semibold text-white/80">
                    Product Title <span className="text-coralError">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[11px] font-mono ${title.length > 80 ? 'text-coralError' : 'text-white/40'}`}>
                      {title.length}/80 chars
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(title, 'title')}
                      title="Copy Product Title"
                      className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-white/60 hover:text-aiLime border border-white/10 transition active:scale-95 flex items-center justify-center"
                    >
                      {copiedField === 'title' ? (
                        <Check className="w-3.5 h-3.5 text-aiLime" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-aiLime" />
                      )}
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="High-converting product title..."
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.09] border border-white/10 focus:border-aiLime/60 rounded-xl text-sm sm:text-base text-white font-medium focus:ring-1 focus:ring-aiLime/20 focus:outline-none transition font-sans"
                />
              </div>

              {/* Category Hierarchy & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Category */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-heading font-medium text-white/60">
                      Category Hierarchy
                    </label>
                    <button
                      type="button"
                      onClick={() => handleCopy(category, 'category')}
                      title="Copy Category"
                      className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-aiLime border border-white/10 transition active:scale-95 flex items-center justify-center"
                    >
                      {copiedField === 'category' ? (
                        <Check className="w-3 h-3 text-aiLime" />
                      ) : (
                        <Copy className="w-3 h-3 text-aiLime" />
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Grocery & Gourmet Food > Spices"
                    className="w-full px-3 py-2 bg-white/[0.03] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/10 focus:border-aiLime/50 rounded-lg text-xs text-aiLime/90 font-medium focus:outline-none transition font-sans"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-heading font-medium text-white/60">
                      Suggested Price
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] text-white/40 font-mono">INR (₹)</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(`₹${suggestedPrice}`, 'price')}
                        title="Copy Price"
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-aiLime border border-white/10 transition active:scale-95 flex items-center justify-center"
                      >
                        {copiedField === 'price' ? (
                          <Check className="w-3 h-3 text-aiLime" />
                        ) : (
                          <Copy className="w-3 h-3 text-aiLime" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                      <IndianRupee className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="number"
                      step="1"
                      value={suggestedPrice}
                      onChange={(e) => setSuggestedPrice(e.target.value)}
                      placeholder="499"
                      className="w-full pl-8 pr-3 py-2 bg-white/[0.03] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/10 focus:border-aiLime/50 rounded-lg text-xs font-bold text-white focus:outline-none transition font-sans"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="border-t border-white/10" />

            {/* 02 — MARKETING CONTENT */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-aiLime/80 uppercase">02</span>
                <span className="text-[11px] font-mono font-bold tracking-wider text-white/40 uppercase">Marketing Content</span>
              </div>

              {/* Product Overview & Benefit Copy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-heading font-semibold text-white/80">
                    Product Overview & Benefit Copy
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-aiLime/80 px-2 py-0.5 rounded bg-aiLime/10 border border-aiLime/20">
                      SEO Optimized
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(description, 'description')}
                      title="Copy Marketing Description"
                      className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-white/60 hover:text-aiLime border border-white/10 transition active:scale-95 flex items-center justify-center"
                    >
                      {copiedField === 'description' ? (
                        <Check className="w-3.5 h-3.5 text-aiLime" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-aiLime" />
                      )}
                    </button>
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="2-3 sentence marketing overview description..."
                  className="w-full px-3.5 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] focus:bg-white/[0.08] border border-white/10 focus:border-aiLime/50 rounded-xl text-xs sm:text-sm text-white/90 leading-relaxed focus:outline-none transition font-sans"
                />
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="border-t border-white/10" />

            {/* 03 — DISCOVERABILITY */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-aiLime/80 uppercase">03</span>
                <span className="text-[11px] font-mono font-bold tracking-wider text-white/40 uppercase">Discoverability</span>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-heading font-semibold text-white/80 flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-aiLime" />
                  <span>SEO Tags & Search Keywords</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleCopy(tags.map(t => `#${t}`).join(' '), 'tags')}
                  title="Copy All Tags"
                  className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-white/60 hover:text-aiLime border border-white/10 transition active:scale-95 flex items-center justify-center"
                >
                  {copiedField === 'tags' ? (
                    <Check className="w-3.5 h-3.5 text-aiLime" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-aiLime" />
                  )}
                </button>
              </div>

              {/* Compact tags layout */}
              <div className="flex flex-wrap gap-2 items-center">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 text-aiLime border border-white/10 font-sans transition"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-coralError text-aiLime/60 hover:text-white ml-0.5 text-xs leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ Add tag (Press Enter)"
                  className="bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-dashed border-white/20 focus:border-aiLime/50 rounded-full text-xs text-white focus:outline-none px-3 py-1 placeholder-white/30 min-w-[130px] font-sans transition"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition font-sans"
            >
              Reset / Upload Another
            </button>

            <button
              type="button"
              onClick={handleTriggerPublish}
              disabled={isPublishing}
              className="w-full sm:w-auto px-6 py-2.5 bg-aiLime hover:bg-[#b8e85c] text-ink font-heading font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition active:scale-[0.98] disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3] text-ink" />
              <span>Approve & Publish to Store</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
