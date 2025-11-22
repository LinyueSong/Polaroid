import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [flashActive, setFlashActive] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1080 },
          aspectRatio: 1
        },
        audio: false
      });
      
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError('');
    } catch (err) {
      console.error("Camera access error:", err);
      setError('Could not access camera. Please allow permissions or try uploading.');
    }
  }, [facingMode]);

  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode, isCameraActive]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      // 1. Trigger Flash
      setFlashActive(true);

      // 2. Wait a tiny bit for flash visual to register, then capture
      setTimeout(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const context = canvas.getContext('2d');
        
        if (context) {
          // Calculate square crop from center
          const size = Math.min(video.videoWidth, video.videoHeight);
          const startX = (video.videoWidth - size) / 2;
          const startY = (video.videoHeight - size) / 2;

          canvas.width = size;
          canvas.height = size;

          // Flip horizontally if user facing
          if (facingMode === 'user') {
              context.translate(size, 0);
              context.scale(-1, 1);
          }

          context.drawImage(video, startX, startY, size, size, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          
          // 3. Pass data up, but keep flash white screen for a moment to smooth transition
          onCapture(dataUrl);
          
          // 4. Reset flash
          setTimeout(() => setFlashActive(false), 300);
        }
      }, 100);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCapture(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-900 overflow-hidden rounded-2xl shadow-inner border border-zinc-800">
      
      {/* Flash Overlay */}
      <div className={`absolute inset-0 z-50 bg-white pointer-events-none transition-opacity duration-300 ${flashActive ? 'opacity-100' : 'opacity-0'}`} />

      {isCameraActive ? (
        <>
            <div className="relative w-full aspect-square max-w-md overflow-hidden bg-black shadow-2xl border-4 border-zinc-800 rounded-lg">
              {/* Viewfinder Grid */}
              <div className="absolute inset-0 pointer-events-none z-10 opacity-30 grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white/50"></div>
                <div className="border-r border-b border-white/50"></div>
                <div className="border-b border-white/50"></div>
                <div className="border-r border-b border-white/50"></div>
                <div className="border-r border-b border-white/50"></div>
                <div className="border-b border-white/50"></div>
                <div className="border-r border-white/50"></div>
                <div className="border-r border-white/50"></div>
                <div></div>
              </div>

              <video 
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4 text-center">
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center gap-8 z-20">
               <label className="cursor-pointer p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-all active:scale-95">
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <ImageIcon className="w-6 h-6" />
               </label>

              <button 
                onClick={takePhoto}
                disabled={flashActive}
                className="w-20 h-20 rounded-full border-4 border-white bg-red-500 hover:bg-red-600 shadow-[0_0_0_4px_rgba(255,0,0,0.2)] transition-all active:scale-90 flex items-center justify-center disabled:scale-95"
                aria-label="Take Photo"
              >
                <span className="sr-only">Capture</span>
              </button>

              <button 
                onClick={toggleCamera}
                className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-all active:scale-95"
                aria-label="Switch Camera"
              >
                <RefreshCw className="w-6 h-6" />
              </button>
            </div>
        </>
      ) : (
         // Fallback for upload only mode or initial state
        <div className="flex flex-col items-center z-20">
           <label className="cursor-pointer flex flex-col items-center gap-4 p-8 border-2 border-dashed border-zinc-600 rounded-xl hover:bg-zinc-800/50 transition-colors">
              <Upload className="w-12 h-12 text-zinc-400" />
              <span className="text-zinc-300 font-medium">Upload an Image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
           </label>
           <button 
              onClick={() => setIsCameraActive(true)}
              className="mt-6 text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Enable Camera
           </button>
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};