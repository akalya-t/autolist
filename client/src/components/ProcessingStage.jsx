import React, { useState, useEffect } from 'react';
import { Loader2, Scan, FileText } from 'lucide-react';

export default function ProcessingStage({ rawImagePreview }) {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) return 94;
        const increment = Math.floor(Math.random() * 9) + 4;
        return Math.min(prev + increment, 94);
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 lg:py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center animate-fadeIn">
      {/* Unified Charcoal Black Glassmorphic Box Divided Vertically by a Line */}
      <div className="w-full bg-[#12161A] border border-white/15 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden text-white grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10 backdrop-blur-xl">
        {/* Left Column: Multimodal Vision Track (matches text height) */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between h-full space-y-5">
          <div className="flex-1 flex flex-col">
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-aiLime flex items-center space-x-2">
                <Scan className="w-4 h-4 text-aiLime" />
                <span>Multimodal Vision Track</span>
              </span>
              <div className="flex items-center space-x-2 text-xs text-white/70 font-sans bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-aiLime" />
                <span>Scanning</span>
              </div>
            </div>

            {/* Viewport Canvas with Laser Scanner - generous height */}
            <div className="w-full flex-1 min-h-[400px] lg:min-h-[460px] bg-[#0A0D0F] rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center group shadow-inner">
              {rawImagePreview ? (
                <div className="relative w-full h-full flex items-center justify-center p-6">
                  <img
                    src={rawImagePreview}
                    alt="Scanning raw"
                    className="w-full h-full max-h-[380px] object-contain filter contrast-105 opacity-90 transition-all duration-500"
                  />
                  {/* Laser scan line animation */}
                  <div className="absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-aiLime/30 to-transparent animate-bounce opacity-90 pointer-events-none" />
                  <div className="absolute inset-0 border border-aiLime/20 rounded-2xl pointer-events-none" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3 text-white/50">
                  <Loader2 className="w-9 h-9 animate-spin text-aiLime" />
                  <span className="text-sm font-sans">Loading frame...</span>
                </div>
              )}

              {/* Central Floating Loading Badge */}
              <div className="absolute bottom-4 inset-x-4 bg-[#12161A]/95 border border-white/15 backdrop-blur-md rounded-xl p-3 flex items-center space-x-3 shadow-xl">
                <Loader2 className="w-4 h-4 animate-spin text-aiLime flex-shrink-0" />
                <p className="text-xs text-white/90 truncate font-sans font-medium">
                  Isolating product silhouette & shadow mapping...
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-white/70 font-sans font-medium">
              <span>Studio Render Pipeline</span>
              <span className="font-mono text-aiLime font-bold text-sm">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-aiLime transition-all duration-300 rounded-full shadow-[0_0_12px_rgba(202,255,0,0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: AI Catalog Copy Track */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-9 flex flex-col justify-between h-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-aiLime flex items-center space-x-2">
              <FileText className="w-4 h-4 text-aiLime" />
              <span>AI Catalog Copy Track</span>
            </span>
            <div className="flex items-center space-x-2 text-xs text-white/70 font-sans bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-aiLime" />
              <span>Synthesizing Copy</span>
            </div>
          </div>

          {/* Title Placeholder Skeleton */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-semibold uppercase tracking-wider text-white/60">
                Product Title
              </span>
              <span className="text-[11px] text-aiLime/90 font-mono">Generating SEO Title...</span>
            </div>
            <div className="h-12 bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center space-x-3 animate-pulse">
              <div className="h-3.5 bg-white/20 rounded-md w-3/4" />
            </div>
          </div>

          {/* Category & Price Placeholder Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <span className="text-xs font-heading font-semibold uppercase tracking-wider text-white/60">
                Category Hierarchy
              </span>
              <div className="h-11 bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center animate-pulse">
                <div className="h-3.5 bg-aiLime/40 rounded-md w-1/2" />
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-xs font-heading font-semibold uppercase tracking-wider text-white/60">
                Estimated Price (₹)
              </span>
              <div className="h-11 bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center animate-pulse">
                <div className="h-3.5 bg-white/20 rounded-md w-1/3" />
              </div>
            </div>
          </div>

          {/* Description Placeholder Skeleton */}
          <div className="space-y-2.5">
            <span className="text-xs font-heading font-semibold uppercase tracking-wider text-white/60">
              Marketing Description
            </span>
            <div className="h-24 bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 animate-pulse">
              <div className="h-3 bg-white/20 rounded-md w-full" />
              <div className="h-3 bg-white/20 rounded-md w-5/6" />
              <div className="h-3 bg-white/15 rounded-md w-2/3" />
            </div>
          </div>

          {/* SEO Tags Placeholder Skeleton */}
          <div className="space-y-2.5">
            <span className="text-xs font-heading font-semibold uppercase tracking-wider text-white/60">
              SEO Tags & Search Keywords
            </span>
            <div className="flex flex-wrap gap-2.5 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 bg-white/5 border border-white/10 rounded-full px-4 flex items-center"
                  style={{ width: `${75 + (i % 3) * 25}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
