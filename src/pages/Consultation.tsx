/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ArrowLeft, Paintbrush, Wallet, Layout, CheckCircle } from 'lucide-react';
import { getStyleConsultation } from '../services/geminiService';

const STYLES = ['Modern Minimalist', 'Scandinavian', 'Industrial Loft', 'Luxury Classic', 'Bohemian', 'Mid-Century Modern'];
const COLOR_PALETTES = [
  { name: 'Warm Neutrals', colors: ['#F5F5DC', '#D2B48C', '#8B4513'] },
  { name: 'Cool Blues', colors: ['#E0F7FA', '#80DEEA', '#00ACC1'] },
  { name: 'Forest Greens', colors: ['#E8F5E9', '#A5D6A7', '#2E7D32'] },
  { name: 'Dark Elegance', colors: ['#212121', '#424242', '#BDBDBD'] },
];

export default function Consultation() {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    style: '',
    colors: [] as string[],
    budget: 'medium',
    roomType: 'Wohnzimmer'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await getStyleConsultation(preferences);
      setResult(data);
      nextStep();
    } catch (error) {
      alert('Fehler bei der Beratung. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-10 py-16 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 pb-10 border-b border-ink/10">
        <div>
           <p className="nav-label opacity-40 mb-2 font-bold">Heidecker AI Consultation</p>
           <h1 className="luxury-text text-5xl md:text-6xl italic leading-none">Stilberatung</h1>
        </div>
        <p className="max-w-xs text-xs text-ink/50 italic leading-relaxed">
          Beantworten Sie ein paar Fragen und erhalten Sie ein personalisiertes Design-Konzept.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 border border-ink flex items-center justify-center font-serif italic text-xl">1</div>
                  <h3 className="luxury-text text-3xl italic">Welchen Raum möchten Sie gestalten?</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Wohnzimmer', 'Schlafzimmer', 'Küche', 'Büro', 'Bad', 'Esszimmer'].map(room => (
                    <button
                      key={room}
                      onClick={() => setPreferences({ ...preferences, roomType: room })}
                      className={`p-6 border text-left nav-label text-[10px] transition-all ${
                        preferences.roomType === room ? 'bg-ink text-white' : 'hover:border-ink/40'
                      }`}
                    >
                      {room}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={nextStep} className="bg-ink text-white px-10 py-4 nav-label flex items-center gap-4 hover:bg-accent transition-colors">
                Weiter <ArrowRight size={14} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 border border-ink flex items-center justify-center font-serif italic text-xl">2</div>
                  <h3 className="luxury-text text-3xl italic">Welcher Stil spricht Sie an?</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => setPreferences({ ...preferences, style })}
                      className={`p-6 border text-left nav-label text-[10px] transition-all ${
                        preferences.style === style ? 'bg-ink text-white' : 'hover:border-ink/40'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={prevStep} className="border border-ink/10 px-8 py-4 nav-label flex items-center gap-4 hover:border-ink transition-colors">
                  <ArrowLeft size={14} /> Zurück
                </button>
                <button onClick={nextStep} disabled={!preferences.style} className="bg-ink text-white px-10 py-4 nav-label flex items-center gap-4 hover:bg-accent transition-colors disabled:opacity-30">
                  Weiter <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 border border-ink flex items-center justify-center font-serif italic text-xl">3</div>
                  <h3 className="luxury-text text-3xl italic">Farbwelt & Budget</h3>
                </div>
                
                <div className="space-y-4">
                  <p className="nav-label text-[10px] opacity-40">Bevorzugte Töne</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {COLOR_PALETTES.map(p => (
                      <button
                        key={p.name}
                        onClick={() => setPreferences({ ...preferences, colors: p.colors })}
                        className={`p-4 border flex items-center gap-4 transition-all ${
                          preferences.colors === p.colors ? 'border-ink bg-white' : 'border-ink/10 hover:border-ink/40'
                        }`}
                      >
                        <div className="flex gap-1">
                          {p.colors.map(c => <div key={c} className="w-4 h-4" style={{ backgroundColor: c }} />)}
                        </div>
                        <span className="nav-label text-[10px]">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-8">
                  <p className="nav-label text-[10px] opacity-40">Investitionsrahmen</p>
                  <div className="flex gap-4">
                    {['low', 'medium', 'high', 'luxury'].map(b => (
                      <button
                        key={b}
                        onClick={() => setPreferences({ ...preferences, budget: b as any })}
                        className={`flex-1 py-4 border nav-label text-[10px] transition-all ${
                          preferences.budget === b ? 'bg-ink text-white' : 'hover:border-ink/40'
                        }`}
                      >
                        {b.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="border border-ink/10 px-8 py-4 nav-label flex items-center gap-4 hover:border-ink transition-colors">
                  <ArrowLeft size={14} /> Zurück
                </button>
                <button 
                  onClick={handleGenerate} 
                  disabled={loading}
                  className="bg-ink text-white px-10 py-4 nav-label flex items-center gap-4 hover:bg-accent transition-colors disabled:opacity-30"
                >
                  {loading ? 'Analysiere...' : 'Empfehlung erhalten'} <Sparkles size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && result && (
            <motion.div 
              key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-16"
            >
              <div className="text-center space-y-4">
                <CheckCircle className="mx-auto text-accent mb-4" size={48} />
                <h2 className="luxury-text text-5xl italic">Ihre Empfehlung</h2>
                <p className="text-sm text-ink/50 italic max-w-lg mx-auto">{result.recommendation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-8">
                  <h4 className="nav-label opacity-40 border-b border-ink/10 pb-4">Möbel & Ausstattung</h4>
                  <ul className="space-y-8">
                    {result.furniture.map((f: any, i: number) => (
                      <li key={i} className="flex gap-6">
                        <div className="w-12 h-12 bg-paper-dark flex items-center justify-center shrink-0">
                          <Layout size={20} className="opacity-20" />
                        </div>
                        <div>
                          <p className="font-bold text-xs uppercase tracking-widest mb-1">{f.name}</p>
                          <p className="text-[10px] text-ink/40 italic">{f.type} — {f.reason}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-12">
                   <div>
                      <h4 className="nav-label opacity-40 border-b border-ink/10 pb-4 mb-8">Farbkonzept</h4>
                      <div className="flex gap-4">
                        {result.colors.map((c: string) => (
                          <div key={c} className="group relative">
                             <div className="w-16 h-24 shadow-xl border border-ink/5" style={{ backgroundColor: c }} />
                             <p className="absolute -bottom-8 left-0 text-[8px] font-bold opacity-40">{c}</p>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div>
                      <h4 className="nav-label opacity-40 border-b border-ink/10 pb-4 mb-6">Atmosphäre</h4>
                      <p className="text-sm text-ink/60 leading-relaxed italic border-l-2 border-accent pl-6">
                        {result.atmosphere}
                      </p>
                   </div>
                </div>
              </div>

              <div className="pt-16 border-t border-ink/10 flex justify-center">
                 <button onClick={() => setStep(1)} className="nav-label text-[10px] border-b border-ink pb-1 opacity-40 hover:opacity-100">
                    Neue Beratung starten
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
