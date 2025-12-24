import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

import { AppState, LUXURY_COLORS } from './types';
import { Foliage } from './components/Foliage';
import { OrnamentsSystem } from './components/Ornaments';
import { Polaroids } from './components/Polaroids';

const DEFAULT_PHOTOS = [
  { id: 0, url: "https://picsum.photos/id/10/300/300" },
  { id: 1, url: "https://picsum.photos/id/13/300/300" },
  { id: 2, url: "https://picsum.photos/id/17/300/300" },
  { id: 3, url: "https://picsum.photos/id/25/300/300" },
  { id: 4, url: "https://picsum.photos/id/28/300/300" },
  { id: 5, url: "https://picsum.photos/id/29/300/300" },
];

// --- Overlay UI Component ---
const UI = ({ 
  state, 
  toggleState, 
  selectedId, 
  photos, 
  onUpdatePhoto 
}: { 
  state: AppState; 
  toggleState: () => void, 
  selectedId: number | null,
  photos: typeof DEFAULT_PHOTOS,
  onUpdatePhoto: (id: number, url: string) => void
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-50">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div className="text-left">
          <h1 className="text-4xl md:text-6xl font-bold font-serif gold-text tracking-widest drop-shadow-md">
            Merry Christmas 2025
          </h1>
          <h2 className="text-xl md:text-2xl text-emerald-300 font-light tracking-[0.5em] mt-2 uppercase border-b border-emerald-500/30 pb-2 inline-block">
            to my beloved wiwi
          </h2>
        </div>
      </header>

      {/* Edit Photo Input */}
      {selectedId !== null && (
        <div className="absolute top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center gap-2 animate-[fadeIn_0.5s_ease-out]">
           <label className="text-yellow-100/80 font-serif text-xs tracking-widest uppercase">Customize Memory</label>
           <input
             type="text"
             value={photos.find(p => p.id === selectedId)?.url || ''}
             onChange={(e) => onUpdatePhoto(selectedId, e.target.value)}
             className="bg-black/60 text-white border border-yellow-600/50 p-2 rounded w-64 text-center backdrop-blur-md focus:outline-none focus:border-yellow-400 font-serif text-sm transition-all"
             placeholder="Paste Image URL here"
             onKeyDown={(e) => e.stopPropagation()} // Prevent OrbitControls interaction
           />
        </div>
      )}

      {/* Footer Controls */}
      <footer className="flex justify-center pb-8 pointer-events-auto">
        <button
          onClick={toggleState}
          className="group relative px-12 py-4 bg-gradient-to-r from-yellow-900/80 to-yellow-600/80 backdrop-blur-md border border-yellow-400 rounded-sm shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(255,215,0,0.6)]"
        >
          <span className="relative z-10 text-white font-serif text-xl tracking-widest font-bold">
            {state === AppState.CHAOS ? 'ASSEMBLE TREE' : 'SCATTER CHAOS'}
          </span>
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </footer>
    </div>
  );
};

// --- Scene Setup ---
const SceneContent = ({ appState, selectedId, setSelectedId, photos }: { appState: AppState, selectedId: number | null, setSelectedId: any, photos: typeof DEFAULT_PHOTOS }) => {
  const [progress, setProgress] = useState(0);
  
  useFrame((_, delta) => {
    const target = appState === AppState.FORMED ? 1 : 0;
    // Linear approach for calculating 'progress' value to pass down
    // The visual components apply their own easing curves
    const speed = 0.8;
    if (progress !== target) {
      let newProgress = progress + (target - progress) * delta * speed;
      // Snap to target if close enough to prevent infinite micro-updates
      if (Math.abs(target - newProgress) < 0.001) newProgress = target;
      setProgress(newProgress);
    }
  });

  return (
    <>
      <PerspectiveCameraHelper />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={2} color={LUXURY_COLORS.GOLD_HIGH} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={1} color={LUXURY_COLORS.SKY_BLUE} />

      <group position={[0, -4, 0]}>
        <Foliage progress={progress} />
        <OrnamentsSystem progress={progress} />
        <Polaroids progress={progress} onSelect={setSelectedId} selectedId={selectedId} photos={photos} />
        
        {/* Floor Reflections */}
        <ContactShadows opacity={0.6} scale={40} blur={2.5} far={4} color="#0a0a0a" />
      </group>

      <Environment preset="lobby" background={false} />

      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={40}
        autoRotate={appState === AppState.FORMED && selectedId === null}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

const PerspectiveCameraHelper = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 4, 25);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

// --- Main App ---
export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.CHAOS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [photos, setPhotos] = useState(DEFAULT_PHOTOS);

  const toggleState = () => {
    setAppState(prev => prev === AppState.CHAOS ? AppState.FORMED : AppState.CHAOS);
  };

  const handleUpdatePhoto = useCallback((id: number, url: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, url } : p));
  }, []);

  return (
    <div className="w-full h-screen bg-black">
      <UI 
        state={appState} 
        toggleState={toggleState} 
        selectedId={selectedId} 
        photos={photos}
        onUpdatePhoto={handleUpdatePhoto}
      />
      
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: false, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
      >
        <Suspense fallback={null}>
           <SceneContent appState={appState} selectedId={selectedId} setSelectedId={setSelectedId} photos={photos} />
        </Suspense>
      </Canvas>
      
      {/* Loading Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black flex items-center justify-center z-[100] pointer-events-none animate-[fadeOut_2s_ease-in-out_1s_forwards]">
         <h1 className="text-white font-serif text-2xl tracking-widest opacity-0 animate-[fadeIn_1s_ease-out_forwards]">LOADING LUXURY...</h1>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; pointer-events: none; } }
      `}</style>
    </div>
  );
}