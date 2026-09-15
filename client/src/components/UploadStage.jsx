import React, { useState, useRef } from 'react';
import { Upload, Camera, Image as ImageIcon, Sparkles, X, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import CameraModal from './CameraModal';

export default function UploadStage({ onAnalyze, isLoading }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [backgroundTheme, setBackgroundTheme] = useState('clean-white');
  const fileInputRef = useRef(null);
  const mobileCameraInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (.jpg, .png, .webp)');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCameraCapture = (dataUrl) => {
    setSelectedImage(dataUrl);
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
      });
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mobileCameraInputRef.current) mobileCameraInputRef.current.value = '';
  };

  const handleStartAnalysis = () => {
    if (!selectedImage && !selectedFile) return;
    onAnalyze({
      file: selectedFile,
      imageBase64: selectedImage,
      backgroundTheme
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* Clean Hero Intro */}
      <div className="text-center mb-10">
        <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-ink tracking-tight leading-[1.12]">
          Turn any product photo<br />
          <span className="text-deepForest inline-block">
            into a store-ready asset.
          </span>
        </h1>
        
        <p className="mt-4 text-body-base sm:text-lg text-slateText max-w-2xl mx-auto font-sans leading-relaxed">
          Gemini 1.5 Flash VLM reads brand labels, extracts exact specifications, and crafts high-converting SEO copy while our studio engine synthesizes a commercial mockup.
        </p>
      </div>

      {/* Main Center Card */}
      <div className="bg-surface border border-softBorder rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
        {!selectedImage ? (
          /* Dropzone State */
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-deepForest bg-[#E5E5DF] scale-[1.01]'
                  : 'border-[#D5D5CE] hover:border-ink/50 bg-[#EFEFEA] hover:bg-[#EAEAE4]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={mobileCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 mx-auto rounded-2xl bg-surface border border-softBorder flex items-center justify-center text-ink mb-4 shadow-sm">
                <Upload className="w-7 h-7" />
              </div>

              <h3 className="font-heading font-semibold text-lg sm:text-xl text-ink mb-1.5">
                Drag and drop your raw product photo here
              </h3>
              <p className="text-body-sm text-slateText mb-6 font-sans">
                Supports JPG, PNG, WEBP up to 25MB • Smartphone photos, desk snaps, or raw packaging
              </p>

              {/* High-Contrast Black Action Buttons with Hover Glow */}
              <div className="flex flex-wrap items-center justify-center gap-3.5" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-[#171717] text-white text-xs font-semibold rounded-xl border border-[#171717] shadow-sm transition-all duration-200 flex items-center space-x-2.5 hover:bg-black hover:border-aiLime/80 hover:shadow-[0_0_20px_rgba(199,243,107,0.5)] active:scale-95 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-aiLime" />
                  <span className="text-white font-medium">Browse Files</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
                      mobileCameraInputRef.current?.click();
                    } else {
                      setIsCameraOpen(true);
                    }
                  }}
                  className="px-5 py-2.5 bg-[#171717] text-white text-xs font-semibold rounded-xl border border-[#171717] shadow-sm transition-all duration-200 flex items-center space-x-2.5 hover:bg-black hover:border-aiLime/80 hover:shadow-[0_0_20px_rgba(199,243,107,0.5)] active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-aiLime" />
                  <span className="text-white font-medium">Use Camera</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Preview Thumbnail & Confirm State */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-label-xs uppercase tracking-wider text-deepForest font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-successGreen" />
                <span>Raw Photo Ready for Analysis</span>
              </span>
              <button
                onClick={handleClearImage}
                className="text-xs text-slateText hover:text-coralError flex items-center space-x-1 p-1 rounded transition font-sans font-medium"
              >
                <X className="w-4 h-4" />
                <span>Change Image</span>
              </button>
            </div>

            {/* Thumbnail Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1 relative aspect-square rounded-2xl bg-warmBg overflow-hidden border border-softBorder shadow-sm group">
                <img
                  src={selectedImage}
                  alt="Raw upload preview"
                  className="w-full h-full object-contain p-2"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-surface/90 text-[10px] font-bold text-ink backdrop-blur-sm border border-softBorder shadow-xs">
                  RAW INPUT
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="p-4 rounded-2xl bg-[#EFEFEA] border border-softBorder space-y-2">
                  <h4 className="text-label-xs font-semibold uppercase tracking-wider text-ink font-heading">Initial Studio Backdrop Target</h4>
                  <p className="text-xs text-slateText font-sans">Choose the lighting atmosphere for the initial photoshoot mockup:</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {[
                      { id: 'pure-white', label: 'Amazon / Pure White' },
                      { id: 'clean-white', label: 'Clean Minimal Studio' },
                      { id: 'minimal-marble', label: 'Minimalist Marble' },
                      { id: 'warm-wood', label: 'Warm Wooden Table' },
                      { id: 'pastel-podium', label: 'Soft Pastel Podium' },
                      { id: 'dark-slate', label: 'Luxury Dark Slate' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setBackgroundTheme(theme.id)}
                        className={`px-3 py-2 rounded-xl text-xs whitespace-nowrap text-left transition-all duration-200 font-sans ${
                          backgroundTheme === theme.id
                            ? 'bg-white text-ink border-2 border-aiLime shadow-[0_0_16px_rgba(199,243,107,0.7)] ring-1 ring-aiLime/70 font-bold'
                            : 'bg-white border border-softBorder text-ink hover:text-ink hover:border-aiLime hover:shadow-[0_0_14px_rgba(199,243,107,0.6)] font-medium shadow-xs'
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slateText font-sans">
                  <ShieldCheck className="w-4 h-4 text-successGreen flex-shrink-0" />
                  <span>Automated label OCR, category classification, specs detection & studio lighting synthesis.</span>
                </div>
              </div>
            </div>

            {/* Large Primary Action Button */}
            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-aiLime hover:bg-aiLime-hover text-deepForest text-base font-heading font-bold rounded-2xl shadow-card border border-deepForest/10 flex items-center justify-center space-x-3 transition duration-200 active:scale-[0.99] disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 text-deepForest" />
              <span>Analyze & Generate Listing</span>
              <ArrowRight className="w-5 h-5 text-deepForest" />
            </button>
          </div>
        )}
      </div>

      {/* Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
}
