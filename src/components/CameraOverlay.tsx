import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCw, Zap } from 'lucide-react';

interface CameraOverlayProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

const CameraOverlay: React.FC<CameraOverlayProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setError(null);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Kamera-Zugriff verweigert oder nicht verfügbar. Bitte prüfen Sie Ihre Berechtigungen.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        setIsCapturing(true);
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current frame from the video onto the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert the canvas to a data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Stop stream and callback
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        onCapture(dataUrl);
        setTimeout(() => setIsCapturing(false), 500);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center"
    >
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-black/40 px-3 py-1 backdrop-blur-md border border-white/10 rounded-full">Live-Aufnahme</span>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 text-white transition-all rounded-full backdrop-blur-md border border-white/10"
        >
          <X size={24} />
        </button>
      </div>

      <div className="relative w-full h-full max-w-4xl mx-auto flex items-center justify-center p-4">
        {error ? (
          <div className="text-center space-y-6 max-w-md bg-white/5 p-10 backdrop-blur-xl border border-white/10">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <Zap className="text-red-500" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold uppercase text-[11px] tracking-widest">Kamera-Fehler</h3>
              <p className="text-white/60 text-xs leading-relaxed italic">{error}</p>
            </div>
            <button 
              onClick={startCamera}
              className="px-8 py-3 bg-white text-black font-bold uppercase text-[10px] tracking-widest hover:bg-accent hover:text-white transition-all"
            >
              Erneut versuchen
            </button>
          </div>
        ) : (
          <div className="relative w-full aspect-video md:aspect-[16/10] bg-zinc-900 overflow-hidden shadow-2xl border border-white/5">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            
            {/* Guide lines */}
            <div className="absolute inset-0 pointer-events-none opacity-20 capitalize">
               <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white" />
               <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white" />
               <div className="absolute top-1/3 left-0 right-0 h-px bg-white" />
               <div className="absolute top-2/3 left-0 right-0 h-px bg-white" />
            </div>

            {isCapturing && (
              <div className="absolute inset-0 bg-white" />
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-12 z-10">
        <button 
          onClick={toggleCamera}
          className="p-5 bg-white/10 hover:bg-white/20 text-white transition-all rounded-full backdrop-blur-md border border-white/10"
          title="Kamera wechseln"
        >
          <RefreshCw size={24} />
        </button>

        <button 
          onClick={capturePhoto}
          disabled={!!error || !stream}
          className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all shadow-2xl ${!!error || !stream ? 'border-white/20 bg-white/5' : 'border-white bg-white hover:scale-110 active:scale-95 group'}`}
          title="Foto aufnehmen"
        >
          <div className={`w-14 h-14 rounded-full transition-all ${!!error || !stream ? 'bg-white/10' : 'bg-transparent border-2 border-black group-hover:bg-black/5'}`} />
        </button>

        <div className="p-5 opacity-0 pointer-events-none">
          <RefreshCw size={24} />
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraOverlay;
