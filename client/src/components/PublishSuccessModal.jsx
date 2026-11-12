import React, { useState } from 'react';
import { CheckCircle2, Copy, Download, Check, Sparkles, X, ExternalLink, PackageCheck } from 'lucide-react';

export default function PublishSuccessModal({ isOpen, onClose, publishedData, onReset }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !publishedData) return null;

  const jsonString = JSON.stringify(publishedData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-listing-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deepForest/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-softBorder rounded-3xl max-w-2xl w-full overflow-hidden shadow-modal flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-softBorder bg-warmBg/50 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-aiLime/40 border border-deepForest/10 flex items-center justify-center text-deepForest flex-shrink-0">
              <PackageCheck className="w-6 h-6 text-deepForest" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading text-lg font-bold text-ink">Product Successfully Published!</h3>
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-deepForest text-aiLime rounded-full font-sans">
                  LIVE CATALOG
                </span>
              </div>
              <p className="text-body-sm text-slateText mt-0.5 font-sans">
                The listing and studio imagery are ready for Shopify, WooCommerce, or Custom Storefront.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slateText hover:text-ink hover:bg-warmBg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Product Summary & JSON Payload */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Quick Summary Card */}
          <div className="p-4 rounded-2xl bg-warmBg/50 border border-softBorder flex items-center space-x-4">
            <div className="w-20 h-20 rounded-xl bg-surface overflow-hidden border border-softBorder flex-shrink-0 flex items-center justify-center shadow-xs">
              <img
                src={publishedData.studioImageUrl || publishedData.originalImageUrl}
                alt="Published mockup"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-heading font-bold text-sm text-ink line-clamp-1">{publishedData.product?.title}</h4>
              <p className="text-xs text-deepForest font-semibold mt-0.5 font-sans">{publishedData.product?.category}</p>
              <div className="flex items-center space-x-3 mt-1 text-xs text-slateText font-sans">
                <span className="text-ink font-bold">₹{publishedData.product?.suggestedPrice}</span>
                <span>•</span>
                <span>{publishedData.product?.tags?.length || 0} Tags</span>
              </div>
            </div>
          </div>

          {/* Structured JSON Payload Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-label-xs font-heading font-semibold uppercase tracking-wider text-ink">
                Catalog REST JSON Payload
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-xs font-semibold text-ink hover:text-ink bg-white hover:border-aiLime hover:shadow-[0_0_12px_rgba(199,243,107,0.5)] rounded-lg border border-softBorder transition-all duration-200 flex items-center space-x-1 font-sans shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-successGreen" /> : <Copy className="w-3.5 h-3.5 text-slateText" />}
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-2.5 py-1 text-xs font-semibold text-ink hover:text-ink bg-white hover:border-aiLime hover:shadow-[0_0_12px_rgba(199,243,107,0.5)] rounded-lg border border-softBorder transition-all duration-200 flex items-center space-x-1 font-sans shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slateText" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            <div className="bg-deepForest border border-deepForest rounded-2xl p-4 overflow-x-auto max-h-56 shadow-inner">
              <pre className="text-xs text-aiLime/95 font-mono leading-relaxed">
                {jsonString}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-softBorder bg-warmBg/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slateText hover:text-ink transition font-sans"
          >
            Close View
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onReset();
            }}
            className="px-5 py-2.5 bg-deepForest hover:bg-deepForest-hover text-white text-xs font-heading font-bold rounded-xl shadow-card flex items-center space-x-2 transition"
          >
            <Sparkles className="w-4 h-4 text-aiLime" />
            <span>List Another Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}
