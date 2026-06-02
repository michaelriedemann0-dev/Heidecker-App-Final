/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Paintbrush, ShieldCheck, Clock, Home as HomeIcon, Building2, Upload, Camera, X, AlertCircle, RefreshCw } from 'lucide-react';
import ConfiguratorSection from '../components/ConfiguratorSection';
import CameraOverlay from '../components/CameraOverlay';
import ColorFanEmbed from '../components/ColorFanEmbed';
import { reimagineRoom } from '../services/geminiService';
import { DESIGN_STYLES, WALL_MATERIALS, COLORS } from '../constants';

const INTERIOR_TRENDS = [
  {
    id: "warm-minimalism",
    title: "Warm Minimalism",
    description: "Reduzierter Stil, aber wohnlich statt kühl",
    briefing: "Helles Holz (Eiche, Birke), Leinen, Keramik, matte Metalle. Creme, Beige, Sand, warme Grautöne. Minimalismus ohne Strenge – weich, ruhig, einladend.",
    colors: ["#F5F5DC", "#D2B48C", "#E5E4E2"],
    labels: ["Creme", "Beige", "Sand"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/warm-minimalism_final-2-1-2.png"
  },
  {
    id: "urban-industrial",
    title: "Urban Industrial 2.0",
    description: "Soft Industrial - Eleganz trifft Loft-Charakter",
    briefing: "Urban Industrial 2.0 (Soft Industrial): Eine harmonische Komposition aus filigranem schwarzem Stahl, massivem Walnussholz und Vintage-Cognac-Leder. Roher Backstein und polierter Beton verschmelzen mit High-End-Komfort zu einer wohnlichen Kunstgalerie-Atmosphäre. Akzente in Messing und warmes Licht runden das exklusive Design ab.",
    colors: ["#3D3D3D", "#1A1A1A", "#8B4513"],
    labels: ["Anthrazit", "Schwarz", "Walnuss"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/urban-industrial.png"
  },
  {
    id: "neo-nature",
    title: "Neo-Nature",
    description: "Naturverbundenes Wohnen mit moderner Klarheit",
    briefing: "Naturstein, Massivholz, Ton, Pflanzen, Wolle. Moosgrün, Erdtöne, Terrakotta, Himmelblau. Erweiterung der Natur.",
    colors: ["#4F5D2F", "#A0522D", "#E2725B"],
    labels: ["Moosgrün", "Erdtöne", "Terrakotta"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/Neo-Nature-2-3-1-1-2.png"
  },
  {
    id: "bold-eclectic",
    title: "Bold Eclectic",
    description: "Mutiger Mix aus Stilen, Mustern und Epochen",
    briefing: "Samt, lackiertes Holz, Glas, Messing. Smaragdgrün, Senfgelb, Pink, Kobaltblau. Mutiger Mix, bewusst unperfekt.",
    colors: ["#006400", "#FFDB58", "#FF69B4"],
    labels: ["Smaragd", "Senfgelb", "Pink"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/bold-eclectic-1-1-1-1-1.png"
  },
  {
    id: "japandi-zen",
    title: "Japandi Zen",
    description: "Mischung aus japanischer Ruhe & skandinavischer Funktion",
    briefing: "Bambus, helles Holz, Papier, Leinen. Off-White, Taupe, Grau, Schwarzakzente. Harmonisch, fast meditativ.",
    colors: ["#FAF9F6", "#483C32", "#808080"],
    labels: ["Off-White", "Taupe", "Grau"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/japandi-zen-1-1-1.png"
  },
  {
    id: "retro-revival",
    title: "Retro Revival",
    description: "Neuinterpretation vergangener Jahrzehnte (70s/80s)",
    briefing: "Chrom, Kunststoff, Samt, dunkles Holz. Orange, Braun, Avocadogrün, Petrol. Nostalgie trifft moderne Linien.",
    colors: ["#FF8C00", "#8B4513", "#556B2F"],
    labels: ["Orange", "Braun", "Avocadogrün"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/retro-revival-1-1-1-scaled.png"
  },
  {
    id: "soft-luxury",
    title: "Soft Luxury",
    description: "Dezenter Luxus ohne Prunk - elegant und hochwertig",
    briefing: "Marmor, feine Stoffe (Kaschmir, Seide), gebürstetes Metall. Taupe, Champagner, Elfenbein, gedecktes Gold. Edel und hochwertig.",
    colors: ["#B8A99A", "#F7E7CE", "#D9B99B"],
    labels: ["Taupe", "Champagner", "Gold"],
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "digital-organic",
    title: "Digital Organic",
    description: "Verbindung von Technologie und organischen Formen",
    briefing: "3D-gedruckte Elemente, Harz, Glas, nachhaltige Kunststoffe. Weiß, Silber, Pastellfarben, irisierende Töne. Futuristisch, weich.",
    colors: ["#FFFFFF", "#C0C0C0", "#FFB6C1"],
    labels: ["Weiß", "Silber", "Pastell"],
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "mediterranean-modern",
    title: "Mediterranean Modern",
    description: "Zeitgemäße Interpretation südlicher Leichtigkeit",
    briefing: "Kalkputz, Keramikfliesen, Holz, Naturstein. Weiß, Ocker, Terrakotta, Azurblau. Hell, luftig, sonnendurchflutet.",
    colors: ["#FFFFFF", "#CC7722", "#007FFF"],
    labels: ["Weiß", "Ocker", "Azurblau"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/mediterranean_modern-1-2.png",
    visualisationBriefing: "Der moderne mediterrane Einrichtungsstil – oft auch als Modern Mediterranean oder Mediterranean Minimalist bezeichnet – verbindet die Wärme des Südens mit der Klarheit zeitgenössischen Designs. Statt überladener Dekoration und dunkler, schwerer Hölzer setzt dieser Stil auf Licht, Luft und organische Texturen. Kernmerkmale des Stils: Farbpalette: Warme Erdtöne wie Terrakotta, Ocker und Sand treffen auf viel Weiß und sanfte Creme-Nuancen. Materialien: Natürlichkeit dominiert durch helles Holz, Naturstein (Travertin), Leinen, Rattan und handgemachte Keramik. Formensprache: Klare Linien werden durch organische Rundungen wie Torbögen und kurvige Sofas aufgelockert. Textur statt Deko: Strukturierte Wände (Kalkputz) und grob gewebte Stoffe ersetzen kleinteiliges Zubehör."
  }
];

const EXTERIOR_TRENDS = [
  {
    id: "greige-sand",
    title: "Greige- und Sandtöne",
    description: "Warme Beige-, Greige- und Sandfarben für einen hochwertigen Look",
    briefing: "Warme Beige-, Greige- und Sandfarben für einen hochwertigen, zeitlosen Look ohne harte Kontraste.",
    colors: ["#F5F5DC", "#D2B48C", "#C2B280"],
    labels: ["Beige", "Sand", "Greige"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/Fassade-beige-greige-sandtoene-1-2.png",
    visualisationBriefing: "Modern minimalist architecture, contemporary German Einfamilienhaus style, sophisticated monochrome facade concept, elegant and timeless aesthetic. Clear cubic forms, two-story residential building, large floor-to-ceiling windows, fine 2mm Scheibenputz texture, seamless transition between surfaces. Greige, warm sand-grey, light taupe, and off-white. No harsh contrasts. Window frames and gutters in matching matte bronze-grey or deep taupe. Soft morning sunlight, diffused natural light, gentle shadows, architectural photography, eye-level perspective, 35mm lens, photorealistic 8k masonry and plaster texture, architectural visualization, professional color grading, no vibrant colors, no black frames, no wood elements, no rustic style, no cluttered decoration, no artificial CGI"
  },
  {
    id: "dark-accents",
    title: "Dunkle Akzentfassaden",
    description: "Anthrazit und Basaltgrau für moderne Teilflächen",
    briefing: "Anthrazit, Basaltgrau oder Schieferoptik werden gezielt als Teilflächen eingesetzt – etwa an Eingängen, Giebeln oder Staffelgeschossen. Besonders beliebt ist hierbei 2-mm-Scheibenputz, weil die feinere Struktur moderner und eleganter wirkt.",
    colors: ["#2F4F4F", "#3D3D3D", "#1A1A1A"],
    labels: ["Anthrazit", "Basaltgrau", "Schiefer"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/akzentfassaden-1-1-4.png",
    visualisationBriefing: "Modern architectural facade with dark accent areas, striking anthracite and basalt-grey contrast, minimalist modern residential building, partial facade treatment, clean 2mm Scheibenputz structure, sleek contemporary surfaces, dramatic light-dark contrast, sophisticated urban aesthetic. Anthracite, basalt-grey, slate aesthetics, crisp edges, architectural detailing, soft cinematic daylight for material definition, architectural photography, eye-level perspective, 35mm lens, high-end residential composition, photorealistic 8k plaster and material texture, architectural visualization, professional color grading, clean lines, no glossy surfaces, no excessive vivid colors, no rustic style, no artificial CGI lighting, no people."
  },
  {
    id: "mineral-optics",
    title: "Natürliche Mineraloptik",
    description: "Mineralische Putze mit matter, natürlicher Oberfläche",
    briefing: "Mineralische Scheibenputze mit matter Oberfläche liegen stark im Trend. Die Fassaden wirken ruhiger, natürlicher und hochwertiger als stark kunstharzhaltige Systeme. Nachhaltigkeit und Diffusionsoffenheit spielen dabei eine größere Rolle.",
    colors: ["#E5E4E2", "#D3D3D3", "#F5F5F5"],
    labels: ["Matt", "Mineralisch", "Natürlich"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/fassade-mineraloptik-1-2.png",
    visualisationBriefing: "Natural mineral facade architecture, modern eco-conscious residential design with calm monolithic geometry, clean facade lines, minimalist detailing, recessed window reveals, timeless architectural composition inspired by natural materials, fine mineral render plaster, matte limewash texture, breathable hydroactive facade surfaces, natural stone details, subtle wood accents, textured handcrafted exterior materials, diffused mineral finish, warm white, soft limestone beige, greige, sand, clay tones, muted earth neutrals, natural monochrome palette, soft diffuse daylight, calm overcast atmosphere, gentle natural shadows, serene outdoor lighting, subtle warm sunlight reflections, architectural photography, eye-level perspective, 35mm lens, balanced framing, realistic depth, architectural digest composition, ultra realistic, tactile mineral textures, photorealistic facade materials, subtle imperfections, sustainable luxury aesthetic, premium residential architecture quality, no glossy surfaces, no futuristic villa design, no synthetic facade panels, no bright artificial colors, no excessive glass facades, no industrial warehouse look, no harsh contrast lighting, no artificial CGI appearance"
  },
  {
    id: "fine-2mm-structure",
    title: "Feine 2-mm-Strukturen",
    description: "Cleaner Look für minimalistische Architektur",
    briefing: "Bei kubischen Neubauten dominieren feine Körnungen von 2 mm. Die Oberfläche wirkt homogener, cleaner und passt gut zu minimalistischer Architektur mit großen Fensterflächen.",
    colors: ["#FFFFFF", "#F8F8F8", "#F0F0F0"],
    labels: ["2-mm", "Clean", "Minimalistisch"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/fassade-2mm-scheibenputz-1-2.png",
    visualisationBriefing: "Fine 2-mm facade texture close-up visualization, modern architectural facade detail with minimal contemporary design language, highly refined surface composition, subtle handcrafted texture depth, elegant material-focused framing, clean premium exterior aesthetic, fine 2-mm mineral render plaster, matte textured facade surface, ultra-fine scheibenputz structure, soft grain detail, mineral-based finish, realistic handcrafted plaster texture, subtle shadow transitions across the surface, warm greige, soft sand beige, muted limestone tones, natural earth neutrals, monochrome mineral palette, soft diffuse daylight, grazing side light to emphasize texture depth, subtle natural shadows, calm atmospheric illumination, macro architectural photography, extreme facade close-up, shallow depth of field, high-detail material framing, realistic texture focus, premium architectural material shot, ultra realistic, hyper-detailed plaster texture, photorealistic mineral surface realism, tactile material quality, subtle imperfections, architectural magazine close-up aesthetic, no rough coarse plaster, no glossy finish, no artificial CGI texture, no heavy grain structure, no colorful facade paint, no industrial concrete appearance, no excessive contrast, no dirt or damage"
  },
  {
    id: "classic-3mm-structure",
    title: "3-mm-Scheibenputz",
    description: "Markante Struktur für klassische und mediterrane Häuser",
    briefing: "Die gröbere 3-mm-Struktur bleibt beliebt bei klassischen Einfamilienhäusern, Landhäusern und mediterranen Fassaden. Sie erzeugt mehr Tiefenwirkung und kaschiert kleine Unebenheiten besser.",
    colors: ["#FAF9F6", "#FFFDD0", "#FDF5E6"],
    labels: ["3-mm", "Klassisch", "Strukturiert"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/3mm-Scheibenputz-2-1.png",
    visualisationBriefing: "3-mm scheibenputz facade close-up visualization, modern residential facade detail with expressive handcrafted surface character, slightly deeper plaster structure, architectural material-focused composition, timeless exterior aesthetic with tactile depth, 3-mm mineral scheibenputz, coarse matte render texture, pronounced grain structure, realistic handcrafted plaster finish, natural shadow depth within the surface texture, premium mineral facade material, warm sand beige, greige, soft taupe, limestone grey, muted earth tones, calm natural monochrome palette, soft angled daylight, grazing side light emphasizing texture depth, subtle natural shadow gradients, atmospheric exterior illumination, macro architectural photography, facade material close-up, shallow depth of field, high-detail texture framing, realistic tactile composition, premium material showcase aesthetic, ultra realistic, hyper-detailed plaster texture, photorealistic mineral facade realism, tactile surface quality, realistic imperfections, architectural digest material photography style, no glossy finish, no smooth fine plaster, no artificial CGI textures, no colorful paint effects, no industrial concrete appearance, no excessive contrast, no damaged facade, no rough unfinished stucco look"
  },
  {
    id: "biocide-free",
    title: "Limewash und Kalkputzoptik",
    description: "Nachhaltiger Schutz gegen Algen und Pilze ohne Chemie",
    briefing: "Biozidfreie oder hydroaktive Putze regulieren Feuchtigkeit besser und reduzieren Grünbelag ohne chemische Zusätze. Moderne Systeme regulieren Feuchtigkeit besser und reduzieren Grünbelag ohne chemische Zusätze.",
    colors: ["#FFFFFF", "#FBFCF8", "#F5F5F0"],
    labels: ["Biozidfrei", "Ökologisch", "Hydroaktiv"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/limewash-und-kaltputzoptik-2-2.png",
    visualisationBriefing: "Sustainable biocide-free facade, natural hydroactive mineral plaster, eco-conscious architecture, clean and breathable surface, matte limewash texture, authentic kalkputz aesthetics, serene and healthy building material, minimal contemporary residential design. Neutral white and soft earth-tone plaster, clean monochromatic surface, gentle natural lighting with subtle texture emphasis, architectural photography, eye-level, 35mm lens, high-end material focus, photorealistic 8k plaster realism, breathable facade, sustainable luxury, subtle imperfections, calm outdoor atmosphere, no synthetic chemical look, no glossy finish, no vibrant artificial colors, no harsh contrast."
  },
  {
    id: "putz-holz-combo",
    title: "Kombination Putz & Holz",
    description: "Harmonisches Zusammenspiel von Putz und Holzlamellen",
    briefing: "Sehr gefragt sind Fassadenkombinationen aus hellem Scheibenputz und vertikalen Holzlamellen oder Holzoptikplatten. Besonders beliebt: 2-mm-Putz in warmem Weiß oder Sandton zusammen mit Eiche oder Thermoholz.",
    colors: ["#FFFFFF", "#D2B48C", "#8B4513"],
    labels: ["Putz", "Holz", "Kontrast"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/Fassade-Putz-und-Holz-2-1.png",
    visualisationBriefing: "Contemporary exterior architecture with dark accent facades, minimal modern single-family house with clean cubic geometry, asymmetrical facade composition, recessed entrances, strong horizontal and vertical lines, elegant architectural contrast design, fine 2-mm mineral plaster, dark anthracite accent walls, matte charcoal facade panels, textured concrete elements, black aluminum window frames, smoked glass, subtle natural wood accents, premium matte exterior materials, anthracite grey, charcoal, graphite, deep taupe, warm concrete grey, muted black, balanced with soft greige or sand tones, soft cinematic daylight, moody overcast atmosphere, subtle warm sunset reflections, refined shadow depth, calm architectural lighting, architectural photography, eye-level perspective, 35mm lens, balanced framing, realistic spatial depth, high-end residential composition, ultra realistic, photorealistic facade textures, premium architectural realism, realistic reflections, subtle imperfections, luxury residential magazine aesthetic, no futuristic mansion, no glossy black surfaces, no colorful facade accents, no industrial warehouse appearance, no excessive glass curtain walls, no neon lighting, no american suburban style, no artificial CGI rendering"
  },
  {
    id: "classic-mediterranean-3mm",
    title: "3-mm-Scheibenputz für mediterrane & klassische Häuser",
    description: "Markante Struktur mit Tiefenwirkung",
    briefing: "Die gröbere 3-mm-Struktur bleibt beliebt bei klassischen Einfamilienhäusern, Landhäusern und mediterranen Fassaden. Sie erzeugt mehr Tiefenwirkung und kaschiert kleine Unebenheiten besser.",
    colors: ["#F5F5DC", "#E6D5B8", "#D4A373"],
    labels: ["3mm", "Mediterran", "Klassisch"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/fassade-mediterran-modern-1-2.png",
    visualisationBriefing: "Classic and mediterranean residential architecture, expressive handcrafted surface character, 3-mm mineral scheibenputz, deeper plaster structure, warm and inviting atmosphere, timeless exterior aesthetic with tactile depth, coarse matte render texture, pronounced grain structure, realistic handcrafted plaster finish, natural shadow depth within the surface, premium mineral facade material. Warm earth palettes, terracotta, ochre, sand, soft taupe, muted Mediterranean tones, sunny and gentle natural lighting, grazing side light emphasizing texture, atmospheric exterior illumination, architectural photography, eye-level framing, high-detail texture focus, realistic tactile composition, premium material showcase, ultra realistic, photorealistic mineral facade realism, realistic imperfections, material photography, no glossy finish, no smooth fine plaster, no artificial CGI textures, no colorful paint."
  },
  {
    id: "hightech-surfaces",
    title: "Monochrome Fassaden",
    description: "Funktionale Putze mit Abperleffekt und UV-Schutz",
    briefing: "Silikonharz- und Siloxan-Scheibenputze mit Abperleffekt, UV-Schutz und hoher Witterungsbeständigkeit werden immer häufiger eingesetzt. Besonders dunkle Fassaden profitieren davon, weil Farbtonstabilität und Schmutzresistenz verbessert werden.",
    colors: ["#36454F", "#2F4F4F", "#1C1C1C"],
    labels: ["Hightech", "UV-Schutz", "Selbstreinigend"],
    image: "https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/monochrome-fassade-1-2-2.png",
    visualisationBriefing: "### Trend: Monochrome Fassadenkonzepte. Monochrome Fassadenkonzepte gehören zu den prägendsten Architekturtrends im modernen Wohnbau. Dabei werden sämtliche Fassadenelemente – Putz, Fensterrahmen, Dach, Sockel, Garagentor und oft sogar Entwässerungssysteme – bewusst innerhalb einer einzigen Farbfamilie gestaltet. Statt starker Kontraste entsteht so ein ruhiges, harmonisches Gesamtbild mit klarer architektonischer Wirkung. Besonders beliebt sind aktuell: warmes Grau, Taupe, Greige, Sandgrau, Beige-Grau, sowie gedeckte Naturtöne. Der Effekt wirkt elegant, minimalistisch und hochwertig, ohne kühl oder steril zu erscheinen. Typische Gestaltung: Bei monochromen Fassaden werden unterschiedliche Materialien eingesetzt, jedoch farblich aufeinander abgestimmt: feiner 2-mm-Scheibenputz, Aluminiumfenster, Dachrandprofile, Sockelbeschichtungen, Lamellen, oder Metallakzente. Die Materialien unterscheiden sich in Struktur und Reflexion, bleiben jedoch tonal nah beieinander. Dadurch entsteht Tiefe ohne harte Farbwechsel. Wirkung des Konzepts: Monochrome Fassaden erzeugen: eine ruhige und reduzierte Architektur, eine optische Vergrößerung des Gebäudes, elegante Klarheit, und einen zeitlosen Charakter. Besonders moderne kubische Häuser profitieren davon, weil Linien, Proportionen und Materialien stärker in den Vordergrund treten als dekorative Farben. Beliebte Farbkombinationen 2025/2026: Warmgrau + Anthrazitgrau, Taupe + Bronze-Aluminium, Sandgrau + Cappuccino, Greige + Schwarz matt, Off-White + Natursteinbeige. Warum der Trend so gefragt ist: zeitlose Eleganz statt kurzlebiger Modefarben, hochwertige Wirkung auch bei minimalistischer Architektur, harmonische Einbindung in natürliche Umgebungen, geringe optische Unruhe, ideal kombinierbar mit Holz, Glas und Naturstein. In Verbindung mit feinem Scheibenputz entstehen besonders edle Fassaden, weil die reduzierte Struktur die monochrome Wirkung zusätzlich unterstützt."
  }
];

const BeforeAfterSlider = ({ before, after, trendTitle }: { before: string, after: string, trendTitle?: string }) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const relativeX = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
    setPosition(relativeX);
  };

  return (
    <div 
      id="visualization-result-slider"
      ref={containerRef}
      className="relative mx-auto w-auto h-[100vh] sm:w-full sm:aspect-video overflow-hidden border border-ink/10 cursor-col-resize select-none group bg-zinc-100"
      onMouseMove={handleMove}
      onTouchMove={(e) => {
        if (e.cancelable) e.preventDefault();
        handleMove(e);
      }}
    >
      <img src={after} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="After" />
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none" 
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img src={before} className="absolute inset-0 w-full h-full object-cover" alt="Before" />
      </div>
      
      {/* Slider Handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-white shadow-xl z-20 pointer-events-none"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-2xl flex items-center justify-center border border-ink/10">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-3 bg-ink/20" />
            <div className="w-0.5 h-3 bg-ink/20" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-none">
        <span className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-[9px] uppercase font-bold tracking-widest border border-white/10 text-nowrap">Vorher</span>
      </div>
      <div className="absolute bottom-6 right-6 z-30 pointer-events-none text-right">
        <span className="px-3 py-1.5 bg-accent/80 backdrop-blur-md text-white text-[9px] uppercase font-bold tracking-widest border border-white/10 shrink-0 text-nowrap truncate max-w-[200px]">
          Nachher {trendTitle ? `(${trendTitle})` : ''}
        </span>
      </div>

      {/* Instructions overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/10">
         <div className="px-4 py-2 bg-white/90 backdrop-blur shadow-xl rounded-full text-[10px] font-bold uppercase tracking-widest text-ink">
            Schieben zum Vergleichen
         </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [activeArea, setActiveArea] = useState<'interior' | 'exterior'>('interior');
  const [sharedImage, setSharedImage] = useState<string | null>(null);
  const [sharedIsExterior, setSharedIsExterior] = useState(false);
  const [sharedStyleId, setSharedStyleId] = useState<string | null>(null);
  const [sharedMaterialId, setSharedMaterialId] = useState<string | null>(null);
  const [sharedColorHex, setSharedColorHex] = useState<string | null>(null);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [visualizationResult, setVisualizationResult] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [hoveredMaterialId, setHoveredMaterialId] = useState<string | null>(null);

  const handleGenerateVisualization = async (isSimulation: boolean = false) => {
    if (!sharedImage || !sharedStyleId) return;
    
    setIsVisualizing(true);
    try {
      const allTrends = [...INTERIOR_TRENDS, ...EXTERIOR_TRENDS];
      const selectedTrend = allTrends.find(t => t.id === sharedStyleId);
      const style = DESIGN_STYLES.find(s => s.id === sharedStyleId) || DESIGN_STYLES[0];
      
      const selectedMaterial = WALL_MATERIALS.find(m => m.id === sharedMaterialId) || (sharedMaterialId === 'muster' ? { id: 'muster', name: 'Mustertapete' } : null);
      const selectedColor = COLORS.find(c => c.hex === sharedColorHex);
      
      // Combine style prompt with internal briefing and specific selections
      let combinedPrompt = `${style.prompt}. ${selectedTrend?.briefing || ''}`;
      
      // @ts-ignore - access visualisationBriefing if it exists on the trend
      if (selectedTrend?.visualisationBriefing) {
        // @ts-ignore
        combinedPrompt += ` ${selectedTrend.visualisationBriefing}`;
      }
      
      if (style.visualizerBriefing) {
        combinedPrompt += ` Briefing für die Darstellung des Stils: ${style.visualizerBriefing}`;
      }
      
      if (selectedMaterial) {
        combinedPrompt += ` Verwende eine ${selectedMaterial.name} Oberflächenstruktur.`;
        // @ts-ignore - access visualizerBriefing if it exists on the found material
        if (selectedMaterial.visualizerBriefing) {
          // @ts-ignore
          combinedPrompt += ` Briefing für die Darstellung der Oberfläche: ${selectedMaterial.visualizerBriefing}`;
        }
      }
      
      if (selectedColor) {
        combinedPrompt += ` Die Hauptwandfarbe soll ${selectedColor.name} (${selectedColor.hex}) sein.`;
      }
      
      const result = await reimagineRoom(
        sharedImage,
        combinedPrompt,
        selectedMaterial?.name || WALL_MATERIALS[0].name,
        selectedColor?.name || selectedTrend?.labels[0] || 'Modern',
        sharedColorHex || selectedTrend?.colors[0] || '#ffffff',
        sharedIsExterior
      );
      setVisualizationResult(result);
      
      if (isSimulation) {
        setIsResultModalOpen(true);
      }
    } catch (error) {
      console.error("Visualization failed:", error);
      alert("Fehler bei der Visualisierung. Bitte versuchen Sie es erneut.");
    } finally {
      setIsVisualizing(false);
    }
  };

  const VisualizationButton = ({ label = "Visualisierung generieren", sublabel, onClick, showWarning = true }: { label?: string, sublabel?: string, onClick?: () => void, showWarning?: boolean }) => (
    <div className="w-full flex flex-col items-center gap-6">
      <button
        id="generate-visualization-btn"
        onClick={onClick || (() => handleGenerateVisualization(label.includes('simulieren')))}
        disabled={!sharedImage || !sharedStyleId || isVisualizing}
        className={`px-12 py-5 nav-label font-bold tracking-[0.3em] transition-all flex items-center justify-center gap-6 shadow-xl relative overflow-hidden group/btn ${
          (!sharedImage || !sharedStyleId || isVisualizing) 
          ? 'bg-ink/5 text-ink/20 cursor-not-allowed border border-ink/5' 
          : 'bg-ink text-white hover:bg-accent active:scale-95'
        }`}
      >
        {isVisualizing ? (
          <>
            <RefreshCw className="animate-spin" size={16} />
            Verarbeite Bild...
          </>
        ) : (
          <>
            <Sparkles size={16} className="group-hover/btn:animate-pulse" />
            {label}
          </>
        )}
        
        {sharedImage && sharedStyleId && !isVisualizing && (
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"
          />
        )}
      </button>

      {sublabel && (
        <p className="text-xl text-ink/40 italic max-w-2xl text-center leading-relaxed">
          {sublabel}
        </p>
      )}

      {showWarning && !sharedImage && sharedStyleId && (
         <p className="text-[10px] text-accent font-bold animate-bounce">
           Bitte laden Sie zuerst ein Foto hoch!
         </p>
      )}
    </div>
  );

  const TrendTiles = ({ trends, label = "Aktuelle Trends (2025/2026)" }: { trends: typeof INTERIOR_TRENDS, label?: string }) => {
    return (
      <div className="w-full mt-10">
        <div className="flex items-center justify-between mb-6 px-4">
          <p className="nav-label text-[10px] font-bold uppercase tracking-widest text-ink/40">{label}</p>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] italic text-ink/30">KI-Vorschau verfügbar</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {trends.map((trend, idx) => (
            <div
              key={trend.title}
              className={`bg-white border shadow-sm group cursor-pointer relative transition-all ${sharedStyleId === (trend as any).id ? 'border-accent ring-1 ring-accent' : 'border-ink/5'}`}
              onClick={() => {
                setSharedStyleId((trend as any).id);
              }}
            >
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={trend.image} 
                  alt={trend.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-ink/20" />
                
                {sharedImage && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none">
                    <button 
                      onClick={(e) => {
                         e.stopPropagation();
                         setSharedStyleId((trend as any).id);
                         handleGenerateVisualization();
                      }}
                      className="bg-white/90 backdrop-blur text-ink px-4 py-2 text-[10px] uppercase font-bold tracking-widest shadow-xl hover:bg-accent hover:text-white transition-all transform"
                    >
                      Jetzt Visualisieren
                    </button>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  {trend.colors.map((color, cIdx) => (
                    <div 
                      key={cIdx}
                      style={{ backgroundColor: color }}
                      className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                      title={trend.labels[cIdx]}
                    />
                  ))}
                </div>
              </div>
              <div className="p-5 text-left space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider">{trend.title}</h4>
                <p className="text-[10px] text-ink/50 leading-relaxed italic">{trend.description}</p>
                <div className="pt-2 flex flex-wrap gap-1">
                  {trend.labels.map((label, lIdx) => (
                    <span key={lIdx} className="text-[8px] uppercase tracking-tighter text-ink/30 border border-ink/10 px-1.5 py-0.5">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              </div>
            ))}
          </div>
      </div>
    );
  };

  const configuratorRef = useRef<HTMLDivElement>(null);

  const scrollToCTA = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    configuratorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickUpload = (file: File, isExt: boolean) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 1024;
        let width = img.width;
        let height = img.height;

        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const result = canvas.toDataURL('image/jpeg', 0.8);
        setSharedIsExterior(isExt);
        setSharedImage(result);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const PreviewWindow = ({ image, onClear }: { image: string, onClear: () => void }) => (
    <div className="mt-6 w-full overflow-hidden flex flex-col items-center">
      <div className="relative w-auto h-[100vh] sm:w-full sm:aspect-video group border border-ink/10">
        <img src={image} className="w-full h-full object-cover" alt="Uploaded preview" />
        <button
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur shadow-sm hover:bg-red-500 hover:text-white transition-all rounded-full z-10"
        >
          <X size={16} />
        </button>
        <div className="absolute inset-0 bg-accent/5 opacity-0 pointer-events-none" />
      </div>
      <p className="mt-5 text-[22px] text-ink/60 italic leading-relaxed text-center px-4">
        Sie möchten keinen neuen Trendstil ausprobiere? Sondern einfach die bestehenden Räume in neuen Farben auf neuen Oberflächen erstrahlen lassen? Dann überspringen Sie Schritt 2 und scrollen Sie einfach weiter zu Schritt 3! Viel Spaß beim Ausprobieren!
      </p>
    </div>
  );

  const UploadModule = ({ isExt }: { isExt: boolean }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isCurrentContext = sharedIsExterior === isExt;
    const hasImage = sharedImage && isCurrentContext;

    return (
      <div className="mt-8 relative">
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleQuickUpload(e.target.files[0], isExt)}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`w-full py-10 border-2 border-dashed transition-all group relative overflow-hidden bg-white/50 ${hasImage ? 'border-accent/30' : 'border-ink/10'}`}
        >
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className={`p-3 rounded-full ${hasImage ? 'bg-accent/10' : 'bg-ink/5'}`}>
              <Upload size={20} className={`${hasImage ? 'text-accent' : 'opacity-40'} transition-all`} />
            </div>
            <div className="space-y-1">
              <p className="nav-label text-[10px] font-bold uppercase tracking-widest">{hasImage ? 'Foto ändern' : 'Foto hochladen'}</p>
              <p className="text-[9px] opacity-30 italic">Drag & Drop oder Klicken</p>
            </div>
          </div>
        <div 
          className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100"
        />
      </button>

      {hasImage && (
        <PreviewWindow image={sharedImage!} onClear={() => setSharedImage(null)} />
      )}
    </div>
    );
  };

  return (
    <div className="flex flex-col bg-paper">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden border-b border-ink/10">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop" 
            alt="Interior" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-10 w-full">
          <div 
            className="max-w-3xl"
          >
            <h1 className="luxury-text text-5xl md:text-7xl leading-[1.1] mb-12 italic">
              Visualisieren Sie Ihr neues <br />
              <span className="opacity-40">Innenraum- und Fassadendesign</span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-12 items-start sm:items-center">
              <a 
                href="#visualisierung-cta" 
                onClick={scrollToCTA}
                className="bg-ink text-white px-10 py-4 nav-label hover:bg-accent transition-colors"
              >
                Visualisierung Starten
              </a>
              <div className="max-w-xs">
                {/* Description removed as requested */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={configuratorRef} id="visualisierung-cta" className="py-32 px-10 bg-white border-b border-ink/5 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className="space-y-12"
          >
            <div className="space-y-10 flex flex-col items-center">
              <div className="space-y-6 text-center">
                <h2 className="luxury-text text-5xl md:text-7xl italic leading-tight">Jetzt Visualisierung <br />starten - in 3 einfachen Schritten!</h2>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-10">
              <div className="flex flex-col sm:flex-row p-2 bg-ink/5 rounded-full border border-ink/5 w-[90vw] sm:w-auto">
                <button
                  onClick={() => setActiveArea('interior')}
                  className={`flex-1 flex justify-center items-center gap-3 px-10 py-4 rounded-full nav-label text-[10px] transition-all duration-500 ${activeArea === 'interior' ? 'bg-ink text-white shadow-xl' : 'opacity-40 hover:opacity-100'}`}
                >
                  <HomeIcon size={14} />
                  Innenraumgestaltung
                </button>
                <button
                  onClick={() => setActiveArea('exterior')}
                  className={`flex-1 flex justify-center items-center gap-3 px-10 py-4 rounded-full nav-label text-[10px] transition-all duration-500 ${activeArea === 'exterior' ? 'bg-ink text-white shadow-xl' : 'opacity-40 hover:opacity-100'}`}
                >
                  <Building2 size={14} />
                  Fassadengestaltung
                </button>
              </div>

        {activeArea === 'interior' ? (
          <div
            key="interior-area"
            className="w-full"
          >
                    <div className="px-0 py-5 sm:p-20 bg-paper-dark border border-ink/5 relative overflow-hidden group">
                      <div className="relative z-10 space-y-12">
                        <div className="w-12 h-px bg-ink/20 mx-auto"></div>
                        <h3 className="luxury-text text-4xl italic">
                          <span className="sm:hidden">Innen{"\u00ad"}raum{"\u00ad"}ge{"\u00ad"}stal{"\u00ad"}tung</span>
                          <span className="hidden sm:inline">Innenraumgestaltung</span>
                        </h3>
                        
                        <div className="flex justify-center">
                          <div className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center font-bold text-lg z-20 shadow-lg border-2 border-white">
                            1
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <UploadModule isExt={false} />
                          <div className="mt-8">
                            <button
                              onClick={() => {
                                setSharedIsExterior(false);
                                setIsCameraOpen(true);
                              }}
                              className="w-full py-10 border-2 border-dashed border-ink/10 relative overflow-hidden bg-white/50"
                            >
                              <div className="relative z-10 flex flex-col items-center gap-4">
                                <div className="p-3 bg-ink/5 rounded-full">
                                  <Camera size={20} className="opacity-40" />
                                </div>
                                <div className="space-y-1">
                                  <p className="nav-label text-[10px] font-bold uppercase tracking-widest">Kamera öffnen</p>
                                  <p className="text-[9px] opacity-30 italic">Live Aufnahme</p>
                                </div>
                              </div>
                              <div 
                                className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <div className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center font-bold text-lg z-20 shadow-lg border-2 border-white">
                            2
                          </div>
                        </div>

                        <TrendTiles trends={INTERIOR_TRENDS} label="Aktuelle Interior-Trends (2025/2026)" />
                        
                        <div className="pt-8">
                          <VisualizationButton 
                            label="Trendstyle visualisieren" 
                            sublabel="Wenn Sie Ihrer Visualisierung noch Oberflächen und Farben hinzufügen wollen, können sie dies weiter unten einfach umsetzen. Viel Spaß!"
                          />
                        </div>
                        
                        <div className="flex flex-col items-center gap-16 pt-16">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center font-bold text-lg z-20 shadow-lg border-2 border-white">
                              3
                            </div>
                            <h4 className="luxury-text text-2xl italic">Oberflächenstrukturen und Farben auswählen</h4>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full items-start">
                            {[
                              { 
                                id: 'glasfaser', 
                                name: 'Glasfasertapete', 
                                visual: 'https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/glasfasertapete-1.png',
                                desc: 'Robust & Zeitlos'
                              },
                              { 
                                id: 'glattvlies', 
                                name: 'Maler Glattvlies', 
                                visual: 'https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/maler_glattvlies-2.png',
                                desc: 'Glatt & Elegant',
                              },
                              { 
                                id: 'rauhfaser', 
                                name: 'Rauhfaser', 
                                visual: 'https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/rauhfaser-1.png',
                                desc: 'Der Klassiker',
                              },
                              { 
                                id: 'muster', 
                                name: 'Mustertapetenbuch', 
                                visual: 'https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/mustertapetenbuch-1.png',
                                desc: '4 Motive auf Anfrage'
                              }
                            ].map((wall) => (
                              <div key={wall.id} className="flex flex-col gap-3">
                                <div
                                  className={`relative aspect-[4/5] overflow-hidden group border cursor-pointer shadow-sm transition-all ${sharedMaterialId === wall.id ? 'border-accent ring-2 ring-accent' : 'border-ink/5'}`}
                                  onClick={() => {
                                    if (wall.id === 'muster') {
                                      setIsMaterialModalOpen(true);
                                    } else {
                                      setSharedMaterialId(prev => prev === wall.id ? null : wall.id);
                                    }
                                  }}
                                >
                                  <img src={wall.visual} alt={wall.name} className="absolute inset-0 w-full h-full object-cover" />
                                  <div className={`absolute inset-0 ${sharedMaterialId === wall.id ? 'bg-accent/10' : 'bg-transparent'}`} />
                                  
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                                     <p className="text-[10px] text-white font-bold uppercase tracking-wider">{wall.name}</p>
                                     <p className="text-[8px] text-white/60 italic">{wall.desc}</p>
                                  </div>
                                  <div className="absolute top-2 right-2 flex gap-1">
                                    {(sharedMaterialId === wall.id || wall.id === 'muster') && (
                                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="w-full pt-16 border-t border-ink/5 mt-16">
                            <ColorFanEmbed 
                              onColorSelect={(color) => setSharedColorHex(color ? color.hex : null)} 
                              selectedColorHex={sharedColorHex}
                            />
                          </div>

                          <div className="w-full flex flex-col items-center gap-8 pt-16 border-t border-ink/5">
                            {/* Tailored Preview Summary */}
                            {(sharedStyleId || sharedMaterialId || sharedColorHex) && (
                              <div 
                                className="flex flex-wrap items-center justify-center gap-4 px-6 py-3 bg-white border border-ink/5 shadow-sm nav-label text-[9px] uppercase tracking-widest font-bold"
                              >
                                <span className="opacity-40">Konfiguration:</span>
                                {sharedStyleId && (
                                  <span className="flex items-center gap-2 px-3 py-1 bg-ink/5 text-ink">
                                    {INTERIOR_TRENDS.find(t => t.id === sharedStyleId)?.title || sharedStyleId}
                                  </span>
                                )}
                                {sharedMaterialId && (
                                  <span className="flex items-center gap-2 px-3 py-1 bg-ink/5 text-ink">
                                    {WALL_MATERIALS.find(m => m.id === sharedMaterialId)?.name || sharedMaterialId}
                                  </span>
                                )}
                                {sharedColorHex && (
                                  <span className="flex items-center gap-2 px-3 py-1 bg-ink/5 text-ink">
                                    {COLORS.find(c => c.hex === sharedColorHex)?.name || 'Eigene Farbe'}
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sharedColorHex }} />
                                  </span>
                                )}
                              </div>
                            )}

                            <VisualizationButton label="Styles, Oberflächen & Farben visualisieren" />
                          </div>

                            {isResultModalOpen && visualizationResult && sharedImage && (
                              <div 
                                className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                                onClick={() => setIsResultModalOpen(false)}
                              >
                                <div 
                                  className="w-full max-w-6xl bg-white shadow-2xl relative overflow-hidden"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button 
                                    onClick={() => setIsResultModalOpen(false)}
                                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50 backdrop-blur-md border border-white/20"
                                  >
                                    <X size={20} />
                                  </button>

                                  <div className="flex flex-col h-screen sm:h-[85vh]">
                                    <div className="shrink-0 p-8 border-b border-ink/5 bg-paper flex items-center justify-between">
                                      <div className="space-y-1">
                                        <p className="nav-label text-[10px] opacity-40 font-bold uppercase tracking-widest">Farbige Oberflächensimulation</p>
                                        <h3 className="luxury-text text-2xl italic">Heidecker Design-Vorschau</h3>
                                      </div>
                                      
                                      <div className="flex items-center gap-6">
                                        {sharedMaterialId && (
                                          <div className="text-right">
                                            <p className="text-[8px] uppercase tracking-tighter opacity-40 font-bold">Oberfläche</p>
                                            <p className="text-[10px] font-mono">{WALL_MATERIALS.find(m => m.id === sharedMaterialId)?.name}</p>
                                          </div>
                                        )}
                                        {sharedColorHex && (
                                          <div className="flex items-center gap-3 bg-ink/5 px-4 py-2 rounded-full border border-ink/5">
                                            <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: sharedColorHex }} />
                                            <p className="text-[10px] font-mono font-bold uppercase tracking-tight">{COLORS.find(c => c.hex === sharedColorHex)?.name}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="grow bg-ink/5 flex items-center justify-center p-8 overflow-hidden">
                                      <div className="w-full h-full max-h-[600px] shadow-2xl">
                                        <BeforeAfterSlider 
                                          before={sharedImage} 
                                          after={visualizationResult} 
                                          trendTitle={INTERIOR_TRENDS.find(t => t.id === sharedStyleId)?.title}
                                        />
                                      </div>
                                    </div>

                                    <div className="shrink-0 p-8 bg-paper border-t border-ink/5 flex justify-center gap-4">
                                      <button 
                                        className="px-10 py-4 bg-ink text-white nav-label text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent transition-all shadow-xl"
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = visualizationResult;
                                          link.download = `heidecker-simulation-${sharedColorHex}.png`;
                                          link.click();
                                        }}
                                      >
                                        Simulation speichern
                                      </button>
                                      <button 
                                        onClick={() => setIsResultModalOpen(false)}
                                        className="px-10 py-4 border border-ink/10 nav-label text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-ink hover:text-white transition-all shadow-sm"
                                      >
                                        Fenster schließen
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {visualizationResult && sharedImage && (
                              <div 
                                id="visualization-result-section"
                                className="w-full space-y-6 pt-10 border-t border-ink/5"
                              >
                                <div className="flex flex-col items-center gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white">
                                    4
                                  </div>
                                  <h4 className="luxury-text text-2xl italic">Ihr Ergebnis</h4>
                                  <p className="text-xs text-ink/40 italic">Verwenden Sie den Schieberegler für den Vorher-Nachher Vergleich</p>
                                </div>
                                <BeforeAfterSlider 
                                  before={sharedImage} 
                                  after={visualizationResult} 
                                  trendTitle={INTERIOR_TRENDS.find(t => t.id === sharedStyleId)?.title}
                                />
                                
                                <div className="flex justify-center gap-4">
                                   <button 
                                     onClick={() => setVisualizationResult(null)}
                                     className="px-6 py-3 border border-ink/10 nav-label text-[9px] hover:bg-ink hover:text-white transition-all uppercase tracking-widest"
                                   >
                                     Zurücksetzen
                                   </button>
                                   <button 
                                     className="px-6 py-3 bg-ink text-white nav-label text-[9px] hover:bg-accent transition-all uppercase tracking-widest border border-ink/10"
                                     onClick={() => {
                                       const link = document.createElement('a');
                                       link.href = visualizationResult;
                                       link.download = `heidecker-design-${sharedStyleId}.png`;
                                       link.click();
                                     }}
                                   >
                                     Bild speichern
                                   </button>
                                </div>
                                </div>
                              )}
                          </div>
                      </div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-0 transition-opacity duration-1000" />
                    </div>
                  </div>
                ) : (
                  <div
                    key="exterior-area"
                    className="w-full"
                  >
                    <div className="px-0 py-5 sm:p-20 bg-paper-dark border border-ink/5 relative overflow-hidden group">
                      <div className="relative z-10 space-y-12">
                        <div className="w-12 h-px bg-ink/20 mx-auto"></div>
                        <h3 className="luxury-text text-4xl italic">
                          <span className="sm:hidden">Fassaden{"\u00ad"}gestal{"\u00ad"}tung</span>
                          <span className="hidden sm:inline">Fassadengestaltung</span>
                        </h3>
                        
                        <div className="flex justify-center">
                          <div className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center font-bold text-lg z-20 shadow-lg border-2 border-white">
                            1
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <UploadModule isExt={true} />
                          <div className="mt-8">
                            <button
                              onClick={() => {
                                setSharedIsExterior(true);
                                setIsCameraOpen(true);
                              }}
                              className="w-full py-10 border-2 border-dashed border-ink/10 relative overflow-hidden bg-white/50"
                            >
                              <div className="relative z-10 flex flex-col items-center gap-4">
                                <div className="p-3 bg-ink/5 rounded-full">
                                  <Camera size={20} className="opacity-40" />
                                </div>
                                <div className="space-y-1">
                                  <p className="nav-label text-[10px] font-bold uppercase tracking-widest">Kamera öffnen</p>
                                  <p className="text-[9px] opacity-30 italic">Live Aufnahme</p>
                                </div>
                              </div>
                              <div 
                                className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <div className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center font-bold text-lg z-20 shadow-lg border-2 border-white">
                            2
                          </div>
                        </div>

                        <TrendTiles trends={EXTERIOR_TRENDS} label="Aktuelle Fassadentrends (2025/2026)" />
                        
                        <div className="pt-8">
                          <VisualizationButton 
                            label="Fassadenstyle visualisieren" 
                            sublabel="Wenn Sie Ihrer Visualisierung noch Oberflächen und Farben hinzufügen wollen, können sie dies weiter unten einfach umsetzen. Viel Spaß!"
                          />
                        </div>
                        
                        <div className="flex flex-col items-center gap-16 pt-16">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center font-bold text-lg z-20 shadow-lg border-2 border-white">
                              3
                            </div>
                            <h4 className="luxury-text text-2xl italic">Außenbeschichtungen und Farben auswählen</h4>
                          </div>

                          <div className="grid grid-cols-2 gap-4 w-full max-w-2xl items-start">
                             {[
                               { 
                                 id: 'scheibenputz-2mm', 
                                 name: '2-mm-Scheibenputz', 
                                 visual: 'https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/2-mm-Scheibenputz-2-2-2.png',
                                 desc: 'Feine Struktur'
                               },
                               { 
                                 id: 'scheibenputz-3mm', 
                                 name: '3-mm-Scheibenputz', 
                                 visual: 'https://malermeisterfrankfurt.de/wp-content/uploads/2026/05/3mm-Scheibenputz-2-1.png',
                                 desc: 'Markante Struktur',
                               }
                             ].map((wall) => (
                               <div key={wall.id} className="flex flex-col gap-3">
                                 <div
                                   className={`relative aspect-square overflow-hidden group border cursor-pointer shadow-sm transition-all ${sharedMaterialId === wall.id ? 'border-accent ring-2 ring-accent' : 'border-ink/5'}`}
                                   onClick={() => setSharedMaterialId(prev => prev === wall.id ? null : wall.id)}
                                 >
                                   <img src={wall.visual} alt={wall.name} className="absolute inset-0 w-full h-full object-cover" />
                                   <div className={`absolute inset-0 ${sharedMaterialId === wall.id ? 'bg-accent/10' : 'bg-transparent'}`} />
                                   
                                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                                      <p className="text-[10px] text-white font-bold uppercase tracking-wider">{wall.name}</p>
                                      <p className="text-[8px] text-white/60 italic">{wall.desc}</p>
                                   </div>
                                 </div>
                               </div>
                             ))}
                          </div>

                          <div className="w-full pt-16 border-t border-ink/5 mt-16">
                            <ColorFanEmbed 
                              onColorSelect={(color) => setSharedColorHex(color ? color.hex : null)} 
                              selectedColorHex={sharedColorHex}
                            />
                          </div>

                          <div className="w-full flex flex-col items-center gap-8 pt-16 border-t border-ink/5">
                            {/* Tailored Preview Summary */}
                            {(sharedStyleId || sharedMaterialId || sharedColorHex) && (
                              <div 
                                className="flex flex-wrap items-center justify-center gap-4 px-6 py-3 bg-white border border-ink/5 shadow-sm nav-label text-[9px] uppercase tracking-widest font-bold"
                              >
                                <span className="opacity-40">Konfiguration:</span>
                                {sharedStyleId && (
                                  <span className="flex items-center gap-2 px-3 py-1 bg-ink/5 text-ink">
                                    {EXTERIOR_TRENDS.find(t => t.id === sharedStyleId)?.title || sharedStyleId}
                                  </span>
                                )}
                                {sharedMaterialId && (
                                  <span className="flex items-center gap-2 px-3 py-1 bg-ink/5 text-ink">
                                    {WALL_MATERIALS.find(m => m.id === sharedMaterialId)?.name || sharedMaterialId}
                                  </span>
                                )}
                                {sharedColorHex && (
                                  <span className="flex items-center gap-2 px-3 py-1 bg-ink/5 text-ink">
                                    {COLORS.find(c => c.hex === sharedColorHex)?.name || 'Eigene Farbe'}
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sharedColorHex }} />
                                  </span>
                                )}
                              </div>
                            )}

                            <VisualizationButton label="Fassaden-Konfiguration visualisieren" />
                          </div>

                            {isResultModalOpen && visualizationResult && sharedImage && sharedIsExterior && (
                              <div 
                                id="exterior-result-modal"
                                className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                                onClick={() => setIsResultModalOpen(false)}
                              >
                                <div 
                                  className="w-full max-w-6xl bg-white shadow-2xl relative overflow-hidden"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button 
                                    onClick={() => setIsResultModalOpen(false)}
                                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-50 backdrop-blur-md border border-white/20"
                                  >
                                    <X size={20} />
                                  </button>

                                  <div className="flex flex-col h-screen sm:h-[85vh]">
                                    <div className="shrink-0 p-8 border-b border-ink/5 bg-paper flex items-center justify-between">
                                      <div className="space-y-1">
                                        <p className="nav-label text-[10px] opacity-40 font-bold uppercase tracking-widest">Fassadensimulation</p>
                                        <h3 className="luxury-text text-2xl italic">Heidecker Design-Vorschau</h3>
                                      </div>
                                      
                                      <div className="flex items-center gap-6">
                                        {sharedMaterialId && (
                                          <div className="text-right">
                                            <p className="text-[8px] uppercase tracking-tighter opacity-40 font-bold">Oberfläche</p>
                                            <p className="text-[10px] font-mono">{WALL_MATERIALS.find(m => m.id === sharedMaterialId)?.name}</p>
                                          </div>
                                        )}
                                        {sharedColorHex && (
                                          <div className="flex items-center gap-3 bg-ink/5 px-4 py-2 rounded-full border border-ink/5">
                                            <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: sharedColorHex }} />
                                            <p className="text-[10px] font-mono font-bold uppercase tracking-tight">{COLORS.find(c => c.hex === sharedColorHex)?.name}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="grow bg-ink/5 flex items-center justify-center p-8 overflow-hidden">
                                      <div className="w-full h-full max-h-[600px] shadow-2xl">
                                        <BeforeAfterSlider 
                                          before={sharedImage} 
                                          after={visualizationResult} 
                                          trendTitle={EXTERIOR_TRENDS.find(t => t.id === sharedStyleId)?.title}
                                        />
                                      </div>
                                    </div>

                                    <div className="shrink-0 p-8 bg-paper border-t border-ink/5 flex justify-center gap-4">
                                      <button 
                                        className="px-10 py-4 bg-ink text-white nav-label text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent transition-all shadow-xl"
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = visualizationResult;
                                          link.download = `heidecker-fassade-${sharedColorHex}.png`;
                                          link.click();
                                        }}
                                      >
                                        Simulation speichern
                                      </button>
                                      <button 
                                        onClick={() => setIsResultModalOpen(false)}
                                        className="px-10 py-4 border border-ink/10 nav-label text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-ink hover:text-white transition-all shadow-sm"
                                      >
                                        Fenster schließen
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {visualizationResult && sharedImage && sharedIsExterior && (
                              <div 
                                id="exterior-result-section"
                                className="w-full space-y-6 pt-10 border-t border-ink/5"
                              >
                                <div className="flex flex-col items-center gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white">
                                    4
                                  </div>
                                  <h4 className="luxury-text text-2xl italic">Ihr Ergebnis</h4>
                                  <p className="text-xs text-ink/40 italic">Verwenden Sie den Schieberegler für den Vorher-Nachher Vergleich</p>
                                </div>
                                <BeforeAfterSlider 
                                  before={sharedImage} 
                                  after={visualizationResult} 
                                  trendTitle={EXTERIOR_TRENDS.find(t => t.id === sharedStyleId)?.title}
                                />
                                
                                <div className="flex justify-center gap-4">
                                   <button 
                                     onClick={() => setVisualizationResult(null)}
                                     className="px-6 py-3 border border-ink/10 nav-label text-[9px] hover:bg-ink hover:text-white transition-all uppercase tracking-widest"
                                   >
                                     Zurücksetzen
                                   </button>
                                   <button 
                                     className="px-6 py-3 bg-ink text-white nav-label text-[9px] hover:bg-accent transition-all uppercase tracking-widest border border-ink/10"
                                     onClick={() => {
                                       const link = document.createElement('a');
                                       link.href = visualizationResult;
                                       link.download = `heidecker-fassade-${sharedStyleId}.png`;
                                       link.click();
                                     }}
                                   >
                                     Bild speichern
                                   </button>
                                </div>
                                </div>
                              )}
                          </div>
                      </div>
                      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-0 transition-opacity duration-1000" />
                    </div>
                  </div>
                  )}

            {sharedImage && (
              <div
                key="configurator-active"
                className="w-full"
              >
                <ConfiguratorSection 
                  externalImage={sharedImage}
                  externalIsExterior={sharedIsExterior}
                  externalStyleId={sharedStyleId}
                  onExternalImageChange={setSharedImage}
                  onExternalIsExteriorChange={setSharedIsExterior}
                  onExternalStyleIdChange={setSharedStyleId}
                />
              </div>
            )}
            </div>
          </div>
        </div>
      </section>

      {isCameraOpen && (
        <CameraOverlay 
          onCapture={(imageData) => {
            setSharedImage(imageData);
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {isMaterialModalOpen && (
        <div 
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          onClick={() => setIsMaterialModalOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-lg shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
              <button 
                onClick={() => setIsMaterialModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-ink/5 rounded-full transition-colors z-20"
              >
                <X size={20} className="opacity-40" />
              </button>

              <div className="p-12 space-y-8">
                <div className="space-y-4">
                  <p className="nav-label text-[10px] opacity-40 font-bold uppercase tracking-widest text-center">Exklusive Kollektion</p>
                  <h3 className="luxury-text text-3xl italic text-center leading-tight">4 Muster auf Anfrage <br/>hier bestellen!</h3>
                  <p className="text-xs text-ink/50 italic text-center leading-relaxed">
                    Wir senden Ihnen unsere aktuelle Mustertapeten-Selektion gerne kostenfrei zu. 
                    Bitte füllen Sie das Formular aus.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    street: formData.get('street'),
                    zip: formData.get('zip'),
                    city: formData.get('city'),
                  };
                  try {
                    const response = await fetch('/api/send-sample-request', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data),
                    });
                    if (response.ok) {
                      alert("Vielen Dank! Ihre Anfrage wurde gesendet.");
                      setIsMaterialModalOpen(false);
                    } else {
                      alert("Es gab einen Fehler beim Senden. Bitte versuchen Sie es erneut.");
                    }
                  } catch (error) {
                    console.error("Error:", error);
                    alert("Es gab einen Fehler beim Senden.");
                  }
                }}>
                  <div className="space-y-4">
                    <input 
                      name="name"
                      type="text" 
                      placeholder="Name" 
                      required
                      className="w-full px-6 py-4 bg-paper border border-ink/10 focus:border-accent outline-none text-xs transition-colors"
                    />
                    <input 
                      name="email"
                      type="email" 
                      placeholder="E-Mail" 
                      required
                      className="w-full px-6 py-4 bg-paper border border-ink/10 focus:border-accent outline-none text-xs transition-colors"
                    />
                    <input 
                      name="street"
                      type="text" 
                      placeholder="Straße & Hausnummer" 
                      required
                      className="w-full px-6 py-4 bg-paper border border-ink/10 focus:border-accent outline-none text-xs transition-colors"
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <input 
                        name="zip"
                        type="text" 
                        placeholder="PLZ" 
                        required
                        className="col-span-1 w-full px-6 py-4 bg-paper border border-ink/10 focus:border-accent outline-none text-xs transition-colors"
                      />
                      <input 
                        name="city"
                        type="text" 
                        placeholder="Stadt" 
                        required
                        className="col-span-2 w-full px-6 py-4 bg-paper border border-ink/10 focus:border-accent outline-none text-xs transition-colors"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-ink text-white nav-label text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-accent transition-all shadow-xl"
                  >
                    Muster jetzt anfragen
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {isHelpOpen && (
          <div 
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setIsHelpOpen(false)}
          >
            <div 
              className="bg-white w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-ink/5 flex justify-between items-center bg-paper">
                <div>
                  <p className="nav-label text-[10px] opacity-40 mb-1 font-bold uppercase tracking-widest">Anleitung</p>
                  <h2 className="luxury-text text-3xl italic">Ihr Weg zum Design</h2>
                </div>
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="w-12 h-12 flex items-center justify-center hover:bg-ink hover:text-white transition-all rounded-full border border-ink/10"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-10 overflow-y-auto custom-scrollbar space-y-12">
                <section className="space-y-8">
                  <div className="flex gap-8">
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-bold text-sm">1</span>
                    <div className="space-y-3">
                      <h4 className="font-bold uppercase text-[11px] tracking-widest">Raum aufnehmen oder Bild hochladen</h4>
                      <ul className="text-xs text-ink/60 space-y-2 italic list-none">
                        <li>• Öffnen Sie die App</li>
                        <li>• Tippen Sie auf <span className="font-bold text-ink">„Kamera öffnen“</span> oder <span className="font-bold text-ink">„Bild hochladen“</span></li>
                        <li>• Fotografieren Sie Ihren Raum oder wählen Sie ein Bild aus</li>
                        <li className="text-accent">👉 Achten Sie darauf, dass die Wand gut sichtbar ist</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-8">
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-bold text-sm">2</span>
                    <div className="space-y-3">
                      <h4 className="font-bold uppercase text-[11px] tracking-widest">Gestaltungsbereich auswählen</h4>
                      <ul className="text-xs text-ink/60 space-y-2 italic">
                        <li>• Wählen Sie: <span className="font-bold text-ink">Innenraum</span> oder <span className="font-bold text-ink">Fassade</span></li>
                        <li className="text-accent">👉 Für Räume wählen Sie bitte „Innenraum“</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-8">
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-bold text-sm">3</span>
                    <div className="space-y-3">
                      <h4 className="font-bold uppercase text-[11px] tracking-widest">Stil auswählen</h4>
                      <ul className="text-xs text-ink/60 space-y-2 italic">
                        <li>• Scrollen Sie durch die Stil-Vorschläge</li>
                        <li>• Tippen Sie auf einen Stil, der Ihnen gefällt</li>
                        <li className="text-accent">👉 Ihr Raum wird sofort im gewählten Stil angezeigt</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-8">
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-bold text-sm">4</span>
                    <div className="space-y-3">
                      <h4 className="font-bold uppercase text-[11px] tracking-widest">Wandmaterial festlegen</h4>
                      <ul className="text-xs text-ink/60 space-y-2 italic">
                        <li>• Wählen Sie: Glasfasertapete, Maler-Glattvlies oder Raufaser</li>
                        <li className="text-accent">👉 Die Struktur wird direkt im Bild sichtbar</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-8">
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center font-bold text-sm">5</span>
                    <div className="space-y-3">
                      <h4 className="font-bold uppercase text-[11px] tracking-widest">Farbe auswählen</h4>
                      <ul className="text-xs text-ink/60 space-y-2 italic">
                        <li>• Nutzen Sie die Filter (z. B. „Warm“ oder „Grau“)</li>
                        <li>• Tippen Sie auf eine Farbe</li>
                        <li className="text-accent">👉 Die Farbe wird sofort angewendet</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-8">
                    <span className="flex-shrink-0 w-10 h-10 rounded-full border border-ink/20 flex items-center justify-center font-bold text-sm opacity-40">6</span>
                    <div className="space-y-3">
                      <h4 className="font-bold uppercase text-[11px] tracking-widest opacity-40">Ergebnis ansehen & Speichern</h4>
                      <ul className="text-xs text-ink/60 space-y-2 italic">
                        <li>• Vergleichen Sie Ihr Ergebnis mit dem Original</li>
                        <li>• Speichern oder teilen Sie Ihr Design</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <div className="p-6 bg-paper border border-ink/5">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle size={14} className="text-accent" />
                    <h5 className="font-bold text-[10px] uppercase tracking-widest">Wichtiger Hinweis</h5>
                  </div>
                  <p className="text-[10px] text-ink/50 italic leading-relaxed">
                    Sie können jederzeit den Stil ändern, das Material anpassen oder neue Farben ausprobieren, um Ihre perfekte Gestaltung zu finden.
                  </p>
                </div>
              </div>

              <div className="p-8 border-t border-ink/5 bg-paper flex justify-center">
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="px-10 py-4 bg-ink text-white nav-label text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-accent transition-all"
                >
                  Verstanden & Loslegen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}
