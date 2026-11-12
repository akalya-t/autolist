import React from 'react';
import { Sparkles, ShoppingBag, RefreshCw, Layers } from 'lucide-react';

export default function Header({ stage, onReset, serverStatus }) {
  return (
    <header className="border-b border-softBorder bg-white/90 backdrop-blur-md sticky top-0 z-40 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => stage !== 'upload' && onReset()}>
          <div className="w-10 h-10 rounded-xl bg-deepForest p-0.5 shadow-md flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-aiLime" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-bold text-lg text-ink tracking-tight">AutoList<span className="text-deepForest font-extrabold">.ai</span></span>
              <span className="px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider bg-aiLime text-deepForest border border-deepForest/10 rounded-full font-sans">
                VLM v1.5
              </span>
            </div>
            <p className="text-xs text-slateText hidden sm:block font-sans">AI-Powered E-Commerce Product Auto-Lister</p>
          </div>
        </div>

        {/* Center / Status */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-warmBg border border-softBorder text-xs text-slateText font-sans">
            {serverStatus?.services?.geminiVision === 'active' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-successGreen animate-pulse"></span>
                <span className="text-deepForest font-semibold">Gemini 1.5 Flash Live</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-amber-800 font-semibold">Demo Mode (No API Key)</span>
              </>
            )}
            <span className="text-softBorder">•</span>
            <span className="text-slateText">Studio Photoshoot Engine</span>
          </div>

          {stage !== 'upload' && (
            <button
              onClick={onReset}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-ink hover:text-ink bg-white hover:border-aiLime hover:shadow-[0_0_14px_rgba(199,243,107,0.6)] border border-softBorder shadow-sm transition-all duration-200 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Listing</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
