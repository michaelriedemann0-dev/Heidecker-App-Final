/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Check, Copy, Palette, Info } from 'lucide-react';
import { COLORS } from '../constants';
import { Color } from '../types';

interface ColorFanEmbedProps {
  onColorSelect?: (color: Color | null) => void;
  selectedColorHex?: string | null;
}

export default function ColorFanEmbed({ onColorSelect, selectedColorHex }: ColorFanEmbedProps) {
  const [internalSelectedColor, setInternalSelectedColor] = useState<Color | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | 'All'>('All');

  const selectedColor = COLORS.find(c => c.hex === selectedColorHex) || internalSelectedColor;

  const groups = ['All', ...Array.from(new Set(COLORS.map(c => c.group)))];

  const filteredColors = activeGroup === 'All' 
    ? COLORS 
    : COLORS.filter(c => c.group === activeGroup);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : 
      null;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectColor = (color: Color) => {
    const isSelected = selectedColor?.hex === color.hex;
    const newColor = isSelected ? null : color;
    
    setInternalSelectedColor(newColor);
    if (onColorSelect) {
      onColorSelect(newColor);
    }
  };

  return (
    <div className="w-full space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-ink/5 pb-8">
        <div className="space-y-2 text-center md:text-left">
          <p className="nav-label text-[10px] opacity-40 font-bold uppercase tracking-widest">Digitaler Farbfächer</p>
          <h3 className="luxury-text text-3xl italic">Aperol Selection 2026</h3>
        </div>
        
        <div className="flex bg-ink/5 p-1 rounded-full border border-ink/5 overflow-x-auto no-scrollbar max-w-full">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`px-6 py-2 rounded-full nav-label text-[9px] transition-all whitespace-nowrap ${
                activeGroup === group ? 'bg-ink text-white shadow-lg' : 'opacity-40'
              }`}
            >
              {group === 'All' ? 'Alle' : group}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* List Section */}
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
               {filteredColors.map((color, idx) => (
                 <div
                   key={color.hex}
                   onClick={() => handleSelectColor(color)}
                   className={`aspect-[3/4] cursor-pointer relative group border border-ink/5 shadow-sm transition-all ${
                     selectedColor?.hex === color.hex ? 'ring-2 ring-accent ring-offset-4 ring-offset-paper' : ''
                   }`}
                 >
                   <div 
                     style={{ backgroundColor: color.hex }}
                     className="h-[75%] w-full relative"
                   >
                     {selectedColor?.hex === color.hex && (
                       <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                         <div className="bg-white rounded-full p-1 shadow-lg border border-accent">
                           <Check size={10} className="text-accent" />
                         </div>
                       </div>
                     )}
                   </div>
                   <div className="p-2 bg-white h-[25%] flex flex-col justify-center overflow-hidden">
                      <p className="text-[9px] font-bold truncate uppercase tracking-tight leading-none mb-1">{color.name}</p>
                      <p className="text-[7px] opacity-30 font-mono leading-none">{color.hex}</p>
                   </div>
                   
                   <div className="absolute inset-0 bg-ink/0" />
                 </div>
               ))}
            </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-1">
           <div className="sticky top-40 space-y-6">
             {selectedColor ? (
               <div 
                 className="bg-white p-8 border border-ink/10 shadow-xl space-y-6"
               >
                 <div 
                   style={{ backgroundColor: selectedColor.hex }}
                   className="w-full aspect-video border border-ink/5 shadow-inner flex items-end p-4"
                 >
                    <div className={`p-3 backdrop-blur-md rounded-lg border border-white/20 ${selectedColor.isDark ? 'bg-white/20 text-white' : 'bg-black/5 text-ink'}`}>
                      <Palette size={16} />
                    </div>
                 </div>

                 <div className="space-y-4">
                   <div>
                     <p className="nav-label text-[9px] opacity-40 font-bold uppercase tracking-widest mb-1">{selectedColor.group}</p>
                     <h3 className="luxury-text text-2xl italic">{selectedColor.name}</h3>
                     <p className="text-[11px] text-ink/50 italic mt-2 leading-relaxed">{selectedColor.description}</p>
                   </div>

                   <div className="space-y-2">
                     <div className="flex items-center justify-between p-3 bg-paper border border-ink/5">
                        <div className="space-y-0.5">
                          <p className="text-[7px] uppercase font-bold tracking-tighter opacity-40">HEX Code</p>
                          <p className="font-mono text-[10px]">{selectedColor.hex}</p>
                        </div>
                        <button 
                          onClick={() => handleCopy(selectedColor.hex)}
                          className="p-1.5 text-ink/40"
                        >
                          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        </button>
                     </div>

                     <div className="flex items-center justify-between p-3 bg-paper border border-ink/5">
                        <div className="space-y-0.5">
                          <p className="text-[7px] uppercase font-bold tracking-tighter opacity-40">RGB Code</p>
                          <p className="font-mono text-[10px]">{hexToRgb(selectedColor.hex)}</p>
                        </div>
                        <button 
                          onClick={() => handleCopy(hexToRgb(selectedColor.hex) || '')}
                          className="p-1.5 text-ink/40"
                        >
                          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        </button>
                     </div>
                   </div>

                   <div className="pt-2 flex items-start gap-2">
                      <Info size={12} className="text-accent shrink-0 mt-0.5" />
                      <p className="text-[8px] text-ink/40 italic leading-relaxed uppercase tracking-wide">
                        Hinweis: Farbdarstellung kann abweichen.
                      </p>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="h-[300px] border-2 border-dashed border-ink/5 flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <Palette size={32} className="text-ink/10" />
                  <p className="nav-label text-[9px] opacity-30 font-bold uppercase tracking-widest italic">
                    Wählen Sie eine Farbe aus,<br/>um Details zu sehen.
                  </p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
