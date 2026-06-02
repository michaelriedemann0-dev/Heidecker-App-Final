/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, ContactShadows, Environment, useCursor, TransformControls } from '@react-three/drei';
import { motion } from 'motion/react';
import { Box, Plus, Trash2, Maximize, Move } from 'lucide-react';

interface FurnitureItem {
  id: string;
  type: 'sofa' | 'table' | 'bed' | 'chair' | 'shelf';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
}

const FURNITURE_TYPES = [
  { type: 'sofa', name: 'Sofa', size: [2, 0.8, 1], color: '#6D8299' },
  { type: 'table', name: 'Esstisch', size: [1.2, 0.1, 1.2], color: '#E2D1B3' },
  { type: 'bed', name: 'Bett', size: [1.8, 0.4, 2], color: '#F5F5F0' },
  { type: 'chair', name: 'Stuhl', size: [0.5, 0.9, 0.5], color: '#4A4A4A' },
  { type: 'shelf', name: 'Regal', size: [1, 2, 0.3], color: '#2D5A27' },
];

function Model({ item, onClick, isSelected }: { item: FurnitureItem; onClick: () => void; isSelected: boolean }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group 
      position={item.position} 
      rotation={item.rotation} 
      scale={item.scale} 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={item.type === 'table' ? [1, 0.5, 1] : [1, 1, 1]} />
        <meshStandardMaterial color={isSelected ? '#c5a059' : (hovered ? '#ffffff' : item.color)} />
      </mesh>
      {isSelected && (
        <mesh position={[0, 0, 0]} scale={[1.1, 1.1, 1.1]}>
          <boxGeometry />
          <meshBasicMaterial color="#c5a059" wireframe />
        </mesh>
      )}
    </group>
  );
}

function Room({ width, depth, height }: { width: number; depth: number; height: number }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#E8E4DF" roughness={0.8} />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color="#F9F7F5" />
      </mesh>
      <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[depth, height, 0.1]} />
        <meshStandardMaterial color="#F9F7F5" />
      </mesh>
    </group>
  );
}

export default function Planner() {
  const [room, setRoom] = useState({ width: 6, depth: 8, height: 2.5 });
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addFurniture = (type: any) => {
    const newItem: FurnitureItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: type.type,
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      scale: type.size,
      color: type.color
    };
    setFurniture([...furniture, newItem]);
    setSelectedId(newItem.id);
  };

  const removeSelected = () => {
    if (selectedId) {
      setFurniture(furniture.filter(f => f.id !== selectedId));
      setSelectedId(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-paper">
      {/* Top Header */}
      <div className="px-10 py-6 border-b border-ink/10 flex justify-between items-center bg-white shadow-sm shrink-0">
        <div>
          <p className="nav-label opacity-40 mb-1">Heidecker 3D Studio v1.2</p>
          <h1 className="luxury-text text-3xl italic">Raumplaner</h1>
        </div>
        <div className="flex gap-6 items-center">
           <div className="flex gap-2 bg-paper-dark p-1">
             <button className="px-3 py-1 nav-label text-[10px] bg-white shadow-sm">Plan</button>
             <button className="px-3 py-1 nav-label text-[10px] opacity-40">3D</button>
           </div>
           <button onClick={removeSelected} disabled={!selectedId} className="text-red-500 disabled:opacity-20 transition-opacity">
              <Trash2 size={18} />
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <aside className="w-80 bg-white border-r border-ink/10 p-8 flex flex-col gap-10 overflow-y-auto">
          <div>
            <h3 className="nav-label opacity-40 mb-6">Raummaße (m)</h3>
            <div className="space-y-6">
              {['width', 'depth', 'height'].map((dim) => (
                <div key={dim} className="space-y-2">
                   <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest opacity-40">
                      <label>{dim === 'width' ? 'Breite' : dim === 'depth' ? 'Tiefe' : 'Höhe'}</label>
                      <span>{(room as any)[dim]}m</span>
                   </div>
                   <input 
                    type="range" min="2" max="15" step="0.1" 
                    value={(room as any)[dim]} 
                    onChange={(e) => setRoom({ ...room, [dim]: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-paper-dark rounded-full appearance-none accent-ink cursor-pointer"
                   />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="nav-label opacity-40 mb-6 font-bold">Möbelbibliothek</h3>
            <div className="grid grid-cols-2 gap-3">
              {FURNITURE_TYPES.map((type) => (
                <button
                  key={type.type}
                  onClick={() => addFurniture(type)}
                  className="flex flex-col items-center gap-3 p-4 border border-ink/5 hover:border-ink/20 bg-paper-dark/30 hover:bg-white transition-all aspect-square justify-center text-center"
                >
                  <Box size={20} className="opacity-30" />
                  <span className="text-[10px] uppercase font-bold tracking-widest leading-none">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-ink/10">
             <p className="text-[10px] opacity-30 italic leading-relaxed">
                Tipp: Klicken Sie auf ein Objekt, um es auszuwählen. Nutzen Sie die Maus zum Rotieren und Zoomen der Ansicht.
             </p>
          </div>
        </aside>

        {/* 3D Canvas */}
        <main className="flex-1 relative bg-paper-dark">
          <Canvas shadows>
            <Suspense fallback={null}>
              <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
              <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
              
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} castShadow intensity={1} shadow-mapSize={[2048, 2048]} />
              <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

              <group position={[0, 0, 0]}>
                <Room width={room.width} depth={room.depth} height={room.height} />
                
                {furniture.map((item) => (
                  <Model 
                    key={item.id} 
                    item={item} 
                    isSelected={selectedId === item.id}
                    onClick={() => setSelectedId(item.id)}
                  />
                ))}
              </group>

              <Grid 
                infiniteGrid 
                fadeDistance={30} 
                fadeStrength={5} 
                sectionSize={1} 
                sectionColor="#1A1A1A" 
                sectionThickness={1} 
                cellSize={0.2} 
                cellColor="#1A1A1A"
                cellThickness={0.5}
                position={[0, -0.01, 0]}
              />
              <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={20} blur={2.4} far={4.5} />
              <Environment preset="city" />
            </Suspense>
          </Canvas>

          {/* Overlay UI */}
          <div className="absolute bottom-10 right-10 flex gap-4 pointer-events-none">
             <div className="p-4 bg-white/80 backdrop-blur-md border border-ink/5 shadow-2xl flex flex-col gap-6 pointer-events-auto">
                <div className="flex items-center gap-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <span className="nav-label text-[9px]">Engine: Real-Time 3D</span>
                </div>
                <div className="flex gap-4 border-t border-ink/10 pt-4">
                   <button className="opacity-40 hover:opacity-100 transition-opacity"><Maximize size={18} /></button>
                   <button className="opacity-40 hover:opacity-100 transition-opacity"><Move size={18} /></button>
                </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
