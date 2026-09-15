import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadStage from './components/UploadStage';
import ProcessingStage from './components/ProcessingStage';
import StagingReview from './components/StagingReview';
import PublishSuccessModal from './components/PublishSuccessModal';
import { AlertTriangle, Sparkles, CheckCircle } from 'lucide-react';

const rawApiBase = import.meta.env.VITE_API_URL || '';
const formatApiBase = (url) => {
  if (!url) return '';
  let clean = url.trim().replace(/\/+$/, '');
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  return clean;
};
const API_BASE = formatApiBase(rawApiBase);

export default function App() {
  const [stage, setStage] = useState('upload'); // 'upload' | 'processing' | 'review'
  const [rawPreview, setRawPreview] = useState(null);
  const [listingData, setListingData] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedData, setPublishedData] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Check backend server status on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((res) => res.json())
      .then((data) => {
        setServerStatus(data);
      })
      .catch((err) => {
        console.warn('Backend server not reachable yet:', err);
      });
  }, []);

  /**
   * State 1 -> State 2 -> State 3
   * Upload / Camera -> Processing Checklist -> Staging Review
   */
  const handleAnalyze = async ({ file, imageBase64, backgroundTheme }) => {
    setErrorMessage(null);
    setRawPreview(imageBase64);
    setStage('processing');

    try {
      const formData = new FormData();
      if (file) {
        formData.append('image', file);
      }
      if (imageBase64) {
        formData.append('imageBase64', imageBase64);
      }
      formData.append('backgroundTheme', backgroundTheme || 'clean-white');

      const response = await fetch(`${API_BASE}/api/scan-and-generate`, {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to scan and generate listing.');
      }

      setListingData(json.data);
      setStage('review');
    } catch (err) {
      console.error('Scan and generate failed:', err);
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setStage('upload');
    }
  };

  /**
   * Regenerate only the studio background mockup
   */
  const handleRegenerateImage = async (newTheme, options = {}) => {
    if (!listingData?.originalImageUrl) return;
    setIsRegenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/regenerate-studio-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalImageUrl: listingData.originalImageUrl,
          backgroundTheme: newTheme,
          scale: options.scale || 1.0,
          verticalOffset: options.verticalOffset || 0,
          shadowIntensity: options.shadowIntensity || 1.0
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to regenerate studio image.');
      }

      setListingData((prev) => ({
        ...prev,
        studioImageUrl: json.data.studioImageUrl,
        backgroundTheme: json.data.backgroundTheme,
      }));
    } catch (err) {
      console.error('Regenerate error:', err);
      setErrorMessage(err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  /**
   * Approve & Publish to store catalog
   */
  const handlePublish = async (finalPayload) => {
    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalPayload),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to publish listing.');
      }

      setPublishedData(json.product);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Publish error:', err);
      setErrorMessage(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  /**
   * Reset back to State 1 (Upload Stage)
   */
  const handleReset = () => {
    setListingData(null);
    setRawPreview(null);
    setErrorMessage(null);
    setStage('upload');
  };

  return (
    <div className="min-h-screen bg-warmBg text-ink flex flex-col font-sans">
      {/* Navbar Header */}
      <Header stage={stage} onReset={handleReset} serverStatus={serverStatus} />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {/* Error Alert if any */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto mt-6 px-4">
            <div className="p-4 rounded-2xl bg-coralError/10 border border-coralError/30 text-coralError flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-coralError" />
                <p className="text-xs font-semibold">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs font-bold text-coralError hover:opacity-75 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* State 1: Upload / Capture Stage */}
        {stage === 'upload' && (
          <UploadStage onAnalyze={handleAnalyze} isLoading={false} />
        )}

        {/* State 2: Processing / Scanning State */}
        {stage === 'processing' && (
          <ProcessingStage rawImagePreview={rawPreview} />
        )}

        {/* State 3: Staging & Review Stage */}
        {stage === 'review' && listingData && (
          <StagingReview
            data={listingData}
            onReset={handleReset}
            onRegenerateImage={handleRegenerateImage}
            onPublish={handlePublish}
            isRegenerating={isRegenerating}
            isPublishing={isPublishing}
          />
        )}
      </main>

      {/* Publish Success & Export Modal */}
      <PublishSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        publishedData={publishedData}
        onReset={handleReset}
      />
    </div>
  );
}
