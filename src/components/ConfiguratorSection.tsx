/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Upload, RefreshCw, AlertCircle, Camera, X, Check, Sparkles, Image as ImageIcon, Zap, Star } from 'lucide-react';
import { reimagineRoom, analyzeRoom } from '../services/geminiService';

// Vordefinierte, exklusive Designstile für das Heidecker Studio
const INTERIOR_STYLES = [
  {
    id: "Warm Minimalism",
    name: "Warm Minimalism",
    description: "Sinnliche Reduktion",
    detail: "Neutrale, warme Erdtöne wie Leinen-Creme und Kaschmir-Grau, weiche organische Formen und feine Eichenholz-Akzente für erhabene Wohnlichkeit.",
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/warm-minimalism_final-2-1-2.png"
  },
  {
    id: "Japandi Zen",
    name: "Japandi Zen",
    description: "Fernöstliche Harmonie",
    detail: "Eine edle Verschmelzung von reduziertem skandinavischem Minimalismus und traditionellem japanischen Zen. Helle Eschenhölzer und feine Naturtextilien.",
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/japandi-zen-1-1-1.png"
  },
  {
    id: "Neo-Nature",
    name: "Neo-Nature",
    description: "Luxuriöse Natürlichkeit",
    detail: "Bringen Sie die Natur in Ihre Räume. Belebende Farbnuancen in Salbeigrün und Sand, natürliche Travertin-Steinstrukturen und üppiges Tageslicht.",
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/Neo-Nature-2-3-1-1-2.png"
  },
  {
    id: "Industrial Chic",
    name: "Industrial Chic",
    description: "Urbane Loft-Ästhetik",
    detail: "Feiner, geschliffener Sichtbeton, mattschwarzer Stahl und robustes, geschichtsträchtiges Altholz. Urbaner Industrie-Charakter im noblen Penthouse-Stil.",
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/urban-industrial.png"
  },
  {
    id: "Cosmopolitan Luxury",
    name: "Cosmopolitan Luxury",
    description: "Glamouröse Eleganz",
    detail: "Feinste Samtbezüge, tiefdunkle Nussbaum-Edelhölzer, poliertes Messing und edler weißer Carrara-Marmor für ein mondänes, internationales Lebensgefühl.",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600"
  }
];

export interface ConfiguratorSectionProps {
  externalImage?: string | null;
  externalIsExterior?: boolean;
  externalStyleId?: string | null;
  onExternalImageChange?: (image: string | null) => void;
  onExternalIsExteriorChange?: (isExterior: boolean) => void;
  onExternalStyleIdChange?: (styleId: string | null) => void;
  startWithCamera?: boolean;
  onStartWithCameraChange?: (start: boolean) => void;
}

export default function ConfiguratorSection({ 
  externalImage, 
  externalIsExterior, 
  externalStyleId,
  onExternalImageChange, 
  onExternalIsExteriorChange,
  onExternalStyleIdChange,
  startWithCamera,
  onStartWithCameraChange
}: ConfiguratorSectionProps = {}) {
  const [internalSourceImage, setInternalSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [internalStyle, setInternalStyle] = useState<string>("Warm Minimalism");

  const sourceImage = externalImage !== undefined ? externalImage : internalSourceImage;
  const setSourceImage = (img: string | null) => {
    if (onExternalImageChange) onExternalImageChange(img);
    else setInternalSourceImage(img);
  };

  const selectedStyle = externalStyleId !== undefined && externalStyleId ? externalStyleId : internalStyle;
  const setSelectedStyle = (style: string) => {
    if (onExternalStyleIdChange) onExternalStyleIdChange(style);
    else setInternalStyle(style);
  };
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-start camera if external prop requested
  useEffect(() => {
    if (startWithCamera && !sourceImage && !isCameraActive) {
      startCamera();
    }
  }, [startWithCamera, sourceImage, isCameraActive]);

  // States für den Before-After Slider
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Kamera starten
  const startCamera = async () => {
    setIsCameraActive(true);
    setError(null);
    setGeneratedImage(null);
    setAnalysis(null);
  };

  // Kamera stoppen
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Bild aus Kamera erfassen
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Bestmögliche Foto-Auflösung
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setSourceImage(dataUrl);
        stopCamera();
      }
    }
  };

  // Kamera-Stream bei Aktivierung initialisieren
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraActive) {
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { ideal: 'environment' } }, 
        audio: false 
      })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(e => console.warn("Kamera Play Fehler", e));
        }
      })
      .catch(err => {
        console.error("Fehler beim Kamerazugriff", err);
        setError("Kamerazugriff wurde verweigert oder ist nicht verfügbar. Bitte laden Sie stattdessen eine Bilddatei hoch.");
        setIsCameraActive(false);
      });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  // Datei-Upload verarbeiten
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setGeneratedImage(null);
        setAnalysis(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImage(reader.result as string);
        setGeneratedImage(null);
        setAnalysis(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Raum transformieren (Backend-API aufrufen)
  const handleTransform = async () => {
    if (!sourceImage) return;

    setIsProcessing(true);
    setError(null);
    setAnalysis(null);

    try {
      // 1. Raum transformieren via geminiService
      const transformedUrl = await reimagineRoom(
        sourceImage,
        selectedStyle,
        "Premium",
        "Harmonisch",
        "#c5a059",
        false,
        80
      );
      setGeneratedImage(transformedUrl);

      // 2. Parallel dazu eine Raumanalyse anstoßen
      try {
        const feedback = await analyzeRoom(sourceImage);
        setAnalysis(feedback);
      } catch (analErr) {
        console.warn("Fehler bei der optionalen Raumanalyse", analErr);
      }
    } catch (err: any) {
      console.error("Transformationsfehler:", err);
      setError(err?.message || "Die Raumtransformation schlug fehl. Bitte versuchen Sie es mit einem anderen Foto.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Alles zurücksetzen
  const handleReset = () => {
    setSourceImage(null);
    setGeneratedImage(null);
    setAnalysis(null);
    setError(null);
    stopCamera();
  };

  // Slider Positionsbestimmung bei Bewegung
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleSliderMove(e.clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  return (
    <section className="py-20 px-4 md:px-10 bg-paper min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="flex items-center justify-center gap-2 text-accent uppercase tracking-[0.25em] text-[11px] font-bold">
            <Sparkles size={14} /> Full-Stack Raumkonfigurator
          </div>
          <h2 className="luxury-text text-4xl md:text-6xl italic leading-tight">
            Gestalten Sie Ihren Traumraum
          </h2>
          <p className="text-sm md:text-base text-ink/60 max-w-xl mx-auto leading-relaxed">
            Laden Sie ein Foto Ihres Zimmers hoch oder nehmen Sie direkt eines auf. Wählen Sie Ihren gewünschten exklusiven Luxus-Stil und lassen Sie unsere künstliche Intelligenz das Design umgehend fotorealistisch verändern.
          </p>
        </div>

        {/* Workspace Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Linke Spalte: Konfiguration (Länge: 5 Cols) */}
          <div className="lg:col-span-5 space-y-8 bg-white p-6 md:p-8 border border-ink/5 shadow-sm">
            
            {/* Schritt 1: Foto hochladen */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-ink/10 pb-2">
                <span className="nav-label text-[10px] text-accent font-bold">SCHRITT 1</span>
                <span className="text-[11px] font-mono opacity-40">Raumfoto erfassen</span>
              </div>

              {!sourceImage && !isCameraActive && (
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-ink/10 bg-paper/30 flex flex-col items-center justify-center py-12 px-6 hover:border-accent/40 cursor-pointer group transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-14 h-14 bg-white border border-ink/5 flex items-center justify-center rounded-full group-hover:scale-105 transition-transform shadow-sm mb-4">
                    <Upload className="text-ink/40 group-hover:text-accent transition-colors" size={20} />
                  </div>
                  <p className="nav-label text-[11px] text-ink font-bold uppercase tracking-wider mb-1">
                    FOTO AUSWÄHLEN
                  </p>
                  <p className="text-[10px] text-ink/30 italic">
                    Per Drag & Drop oder Klick
                  </p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*;capture=camera" 
                    onChange={handleFileUpload} 
                  />
                  
                  <div className="w-full flex items-center justify-center gap-2 mt-6">
                    <div className="h-px bg-ink/10 flex-grow" />
                    <span className="text-[9px] text-ink/30 uppercase tracking-widest font-bold">ODER</span>
                    <div className="h-px bg-ink/10 flex-grow" />
                  </div>

                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera();
                    }}
                    className="mt-4 px-6 py-2.5 bg-ink text-white font-bold nav-label hover:bg-accent flex items-center gap-2 active:scale-95 transition-all text-[10px]"
                  >
                    <Camera size={12} /> Live-Kamera nutzen
                  </button>
                </div>
              )}

              {/* Live Kameramodus */}
              {isCameraActive && (
                <div className="relative aspect-video bg-black overflow-hidden border border-ink/10 shadow-lg">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-4 flex justify-center gap-4 z-20">
                    <button
                      onClick={capturePhoto}
                      className="px-6 py-3 bg-white text-ink font-bold nav-label flex items-center gap-2 shadow-2xl active:scale-95 hover:bg-paper duration-200"
                    >
                      <Camera size={14} className="text-accent" /> Foto aufnehmen
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-3 bg-red-600 text-white font-bold nav-label flex items-center gap-1 shadow-2xl active:scale-95 hover:bg-red-700 duration-200"
                    >
                      Abbrechen
                    </button>
                  </div>
                  <div className="absolute inset-5 pointer-events-none border border-white/10 opacity-30">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white" />
                  </div>
                </div>
              )}

              {/* Ausgewähltes Quellbild anzeigen */}
              {sourceImage && (
                <div className="relative aspect-video border border-ink/10 overflow-hidden shadow-sm">
                  <img src={sourceImage} alt="Quellbild" className="w-full h-full object-cover animate-fade-in" />
                  <button 
                    onClick={handleReset}
                    className="absolute top-3 right-3 p-1.5 bg-ink/90 text-white hover:bg-red-600 transition-colors rounded-full z-10"
                    title="Foto löschen"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-ink/75 backdrop-blur-md px-3 py-1.5 border border-white/10 text-white text-[9px] uppercase tracking-wider font-bold">
                    Ihr Originalbild
                  </div>
                </div>
              )}
            </div>

            {/* Schritt 2: Design-Style Kacheln */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-ink/10 pb-2">
                <span className="nav-label text-[10px] text-accent font-bold">SCHRITT 2</span>
                <span className="text-[11px] font-mono opacity-40 font-semibold">Exklusive Stilwelten</span>
              </div>

              {/* Grid-Sektion mit interaktiven Kacheln */}
              <div className="grid grid-cols-1 gap-3 max-h-[320px] overflow-y-auto pr-1 no-scrollbar">
                {INTERIOR_STYLES.map((style) => {
                  const isActive = selectedStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`text-left p-4 border transition-all flex items-start gap-4 relative group ${
                        isActive 
                          ? 'border-accent bg-accent/5 ring-1 ring-accent' 
                          : 'border-ink/5 hover:border-ink/15 hover:bg-paper/30'
                      }`}
                    >
                      <div className="w-16 h-16 shrink-0 bg-[#e7e5e4] border border-ink/5 overflow-hidden">
                        <img 
                          src={style.image} 
                          alt={style.name} 
                          className="w-full h-full object-cover group-hover:scale-105 duration-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[11px] uppercase tracking-widest text-ink">
                            {style.name}
                          </p>
                          {isActive && <Check size={10} className="text-accent" />}
                        </div>
                        <p className="text-[9px] text-accent font-bold uppercase tracking-wider italic">
                          {style.description}
                        </p>
                        <p className="text-[10px] text-ink/50 leading-relaxed italic pr-4">
                          {style.detail}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schritt 3: Aktion ausführen */}
            <div className="pt-4 border-t border-ink/10 space-y-4">
              <button
                onClick={handleTransform}
                disabled={isProcessing || !sourceImage}
                className={`w-full py-5 nav-label font-bold tracking-[0.25em] transition-all flex items-center justify-center gap-4 text-xs shadow-md uppercase relative overflow-hidden ${
                  isProcessing || !sourceImage
                    ? 'bg-ink/5 text-ink/20 cursor-not-allowed border border-ink/5'
                    : 'bg-ink text-white hover:bg-accent hover:shadow-lg active:scale-95'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="animate-spin text-accent" size={14} />
                    <span>KI RENDERT TRAUMDESIGN...</span>
                  </>
                ) : (
                  <>
                    <Zap size={13} className="text-white/80" />
                    <span>RAUM TRANSFORMIEREN</span>
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-500/5 border border-red-200 text-red-600 text-[10px] uppercase font-bold tracking-wider flex items-start gap-2.5">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Raumanalyse Feedback */}
              {analysis && (
                <div className="p-4 bg-accent/5 border border-accent/15 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-accent font-bold text-[10px] uppercase tracking-wider">
                    <Star size={11} className="fill-accent" /> Professionelle Stilanalyse
                  </div>
                  <p className="text-[11px] text-ink/75 leading-relaxed italic border-l border-accent/40 pl-3">
                    {analysis}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Rechte Spalte: Render-Vorschau und Slider (Länge: 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="nav-label opacity-40 text-[9px] mb-1">Visualisierungs-Studio</p>
                <h3 className="luxury-text text-2xl md:text-3xl italic">Ihr Interieur Meisterwerk</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] uppercase tracking-wider font-bold opacity-40">Ready to Visualize</span>
              </div>
            </div>

            {/* Bildausgabe-Container */}
            <div className="bg-paper-dark border border-ink/10 h-[380px] md:h-[550px] relative overflow-hidden shadow-xl select-none">
              
              {/* Fallback bei Initial-Zustand */}
              {!sourceImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white">
                  <div className="w-16 h-16 border border-dashed border-ink/15 flex items-center justify-center opacity-40 mb-6">
                    <ImageIcon className="text-ink/60" size={24} />
                  </div>
                  <p className="nav-label text-[11px] uppercase tracking-[0.2em] font-bold mb-2">Design-Studio ist leer</p>
                  <p className="text-xs text-ink/40 max-w-xs italic leading-relaxed">
                    Bitte laden Sie links ein Raumfoto hoch oder starten Sie Ihre Kamera, um die Transformation zu beginnen.
                  </p>
                </div>
              )}

              {/* Während des Renderings */}
              {isProcessing && (
                <div className="absolute inset-0 bg-ink/90 flex flex-col items-center justify-center z-30 space-y-6">
                  <div className="relative">
                    <RefreshCw className="animate-spin text-accent" size={48} />
                    <Sparkles className="absolute -top-2 -right-2 text-white animate-pulse" size={20} />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-white font-bold">
                      KÜNSTLICHE INTELLIGENZ ZEICHNET DESIGN
                    </p>
                    <p className="text-[10px] text-white/50 italic max-w-sm px-6">
                      Stil: {selectedStyle} wird mit optimalen Lichtverhältnissen auf Ihren Raum projiziert...
                    </p>
                  </div>
                </div>
              )}

              {/* Wenn Quellbild existiert, aber noch kein transformiertes Bild vorliegt */}
              {sourceImage && !generatedImage && (
                <div className="w-full h-full bg-paper">
                  <img src={sourceImage} alt="Originalraum" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-6 flex justify-center pointer-events-none px-6">
                    <div className="bg-ink/75 backdrop-blur-md border border-white/15 px-6 py-3 text-white text-[10px] uppercase tracking-widest font-bold text-center">
                      Bereit zur Transformation. Klicken Sie links 'Raum transformieren'
                    </div>
                  </div>
                </div>
              )}

              {/* Interaktiver Vorher-Nachher Slider (Clevere CSS & React Mouse tracking Lösung) */}
              {sourceImage && generatedImage && !isProcessing && (
                <div 
                  ref={sliderContainerRef}
                  className="w-full h-full relative cursor-ew-resize overflow-hidden"
                  onMouseMove={onMouseMove}
                  onTouchMove={onTouchMove}
                >
                  {/* Nachher-Bild (Hintergrund füllend) */}
                  <img 
                    src={generatedImage} 
                    alt="Neues Design" 
                    className="w-full h-full object-cover absolute inset-0 pointer-events-none" 
                  />

                  {/* Vorher-Bild (mit CSS Clip-Path weggeschnitten) */}
                  <div 
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img 
                      src={sourceImage} 
                      alt="Original" 
                      className="w-full h-full object-cover max-w-none" 
                      style={{ width: sliderContainerRef.current?.getBoundingClientRect().width }}
                    />
                  </div>

                  {/* Vertikale Trennlinie */}
                  <div 
                    className="absolute inset-y-0 w-0.5 bg-white shadow-2xl z-20 pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-ink border border-white/20 text-white rounded-full flex items-center justify-center shadow-2xl">
                      <div className="flex gap-1">
                        <span className="text-[10px]">◀</span>
                        <span className="text-[10px]">▶</span>
                      </div>
                    </div>
                  </div>

                  {/* Vorher-Nachher Badges */}
                  <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
                    <span className="px-3 py-1.5 bg-ink/80 backdrop-blur border border-white/10 text-white text-[9px] uppercase tracking-widest font-bold">
                      Original
                    </span>
                  </div>

                  <div className="absolute bottom-6 right-6 z-10 pointer-events-none">
                    <span className="px-3 py-1.5 bg-accent text-white text-[9px] uppercase tracking-widest font-bold border border-white/5 shadow-md">
                      {selectedStyle} Rendering
                    </span>
                  </div>

                  {/* Hover Hinweis */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none bg-ink/70 backdrop-blur px-4 py-1.5 border border-white/10 text-white text-[9px] uppercase tracking-[0.2em] font-bold rounded-full opacity-60 animate-pulse">
                    Maus schieben zum Vergleichen
                  </div>

                </div>
              )}

            </div>

            {/* Footer Statusinformationen */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] uppercase tracking-wider font-bold opacity-45 px-1 py-1 gap-4 text-center">
              <p>© 2026 Heidecker Frankfurt. Die Visualisierungen dienen als gestalterische Inspiration.</p>
              {generatedImage && (
                <div className="flex items-center gap-3">
                  <a 
                    href={generatedImage} 
                    download={`Heidecker-Studio-${selectedStyle.replace(" ", "-")}.png`}
                    className="text-accent underline hover:text-ink transition-colors"
                  >
                    Rendering herunterladen
                  </a>
                  <span>|</span>
                  <button onClick={handleReset} className="text-ink underline hover:text-accent transition-colors">
                    Fotostudio zurücksetzen
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
      <canvas ref={canvasRef} className="hidden" />
    </section>
  );
}
