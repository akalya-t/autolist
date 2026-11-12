import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, Sparkles, ShieldAlert } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileFallbackRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' or 'user'
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPhoto(null);
      setError(null);
      setPermissionDenied(false);
      return;
    }
    startCamera();
    return () => {
      stopCamera();
    };
  }, [isOpen, cameraFacing]);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    setPermissionDenied(false);
    stopCamera();

    if (!navigator?.mediaDevices?.getUserMedia) {
      setError('Camera API is not supported in this browser environment or requires HTTPS/localhost.');
      setIsLoading(false);
      return;
    }

    // Try progressive fallback constraints to ensure device compatibility
    const constraintOptions = [
      { video: { facingMode: { ideal: cameraFacing }, width: { ideal: 1920 }, height: { ideal: 1080 } } },
      { video: { facingMode: { ideal: cameraFacing } } },
      { video: { facingMode: cameraFacing === 'environment' ? 'user' : 'environment' } },
      { video: true }
    ];

    let activeStream = null;
    let lastErr = null;

    for (const constraints of constraintOptions) {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (activeStream) break;
      } catch (err) {
        lastErr = err;
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionDenied(true);
          break;
        }
      }
    }

    if (activeStream) {
      setStream(activeStream);
      if (videoRef.current) {
        videoRef.current.srcObject = activeStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.warn('Video play error:', e));
        };
      }
      setIsLoading(false);
    } else {
      console.error('Camera access failed:', lastErr);
      if (lastErr?.name === 'NotAllowedError' || lastErr?.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setError('Camera permission was blocked. Please click the camera/lock icon in your browser address bar and select "Allow".');
      } else {
        setError('No active webcam found or camera is in use by another application.');
      }
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      setStream(null);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhoto(dataUrl);
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      stopCamera();
      onClose();
    }
  };

  const toggleCameraFacing = () => {
    setCameraFacing(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleFallbackFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Charcoal Black Glassmorphic Container */}
      <div className="bg-[#12161A]/95 backdrop-blur-2xl border border-white/10 rounded-3xl max-w-xl w-full overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#181E24]/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-aiLime/20 border border-aiLime/30 flex items-center justify-center text-aiLime">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-white text-base">Live Camera Capture</h3>
              <p className="text-[11px] text-white/60 font-sans">Snap high-resolution product packaging directly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Canvas */}
        <div className="relative aspect-[4/3] bg-[#0A0D0F] flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-coralError/10 border border-coralError/30 flex items-center justify-center text-coralError">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-white text-base mb-1">Camera Access Required</h4>
                <p className="text-xs text-white/70 font-sans leading-relaxed">{error}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-aiLime hover:bg-aiLime-hover text-deepForest text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileFallbackRef.current?.click()}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/15 transition"
                >
                  Choose From Device
                </button>
                <input
                  ref={fileFallbackRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFallbackFile}
                  className="hidden"
                />
              </div>
            </div>
          ) : capturedPhoto ? (
            <div className="relative w-full h-full flex items-center justify-center p-2 bg-black/40">
              <img
                src={capturedPhoto}
                alt="Captured product"
                className="w-full h-full object-contain rounded-xl"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/75 border border-white/20 text-[11px] font-bold text-aiLime backdrop-blur-md flex items-center space-x-1.5 font-sans">
                <Check className="w-3.5 h-3.5 text-aiLime" />
                <span>PHOTO CAPTURED</span>
              </div>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0D0F] text-white/70 space-y-2 z-10">
                  <RefreshCw className="w-7 h-7 animate-spin text-aiLime" />
                  <span className="text-xs font-medium font-sans">Connecting to camera sensor...</span>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Product Frame Guide */}
              <div className="absolute inset-6 border-2 border-dashed border-aiLime/60 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-[11px] font-semibold tracking-wide uppercase px-3 py-1 bg-black/80 text-aiLime border border-aiLime/30 rounded-full backdrop-blur-md font-sans shadow-lg">
                  Center Product Inside Frame
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-5 border-t border-white/10 bg-[#181E24]/80 flex items-center justify-between">
          {!capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition flex items-center space-x-1.5 font-sans"
              >
                <RefreshCw className="w-3.5 h-3.5 text-aiLime" />
                <span>Flip Camera</span>
              </button>

              <button
                type="button"
                onClick={takeSnapshot}
                disabled={isLoading || error}
                className="px-6 py-2.5 bg-aiLime hover:bg-aiLime-hover text-deepForest font-heading font-bold text-sm rounded-full shadow-[0_0_20px_rgba(199,243,107,0.4)] flex items-center space-x-2 transition disabled:opacity-50 active:scale-95"
              >
                <Camera className="w-4 h-4 text-deepForest" />
                <span>Capture Photo</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-white/60 hover:text-white transition font-sans"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCapturedPhoto(null)}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition flex items-center space-x-1.5 font-sans"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="px-6 py-2.5 bg-aiLime hover:bg-aiLime-hover text-deepForest font-heading font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(199,243,107,0.4)] flex items-center space-x-2 transition active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Use This Photo</span>
              </button>
            </>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
