import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Stars, useScroll } from '@react-three/drei';
import { SceneContent } from './components/Visuals';
import { Overlay } from './components/Overlay';
import { EffectComposer, Noise, Scanline, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

// Wrapper to bridge ScrollControls context to Visuals
const SceneWrapper = () => {
    const scroll = useScroll();
    // We pass the raw offset (0 to 1) to the scene
    return <SceneContent scrollOffset={scroll.offset} />;
}

export default function App() {
  const [started, setStarted] = useState(false);

  // Initial "Terminal" Screen
  if (!started) {
      return (
          <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-cyan-500 font-mono p-4 cursor-pointer" onClick={() => setStarted(true)}>
              <div className="max-w-2xl w-full border border-cyan-900 p-8 bg-black/90 shadow-[0_0_50px_rgba(0,255,255,0.1)]">
                  <p className="mb-2 text-xs text-cyan-500">:: ZEROTH THEORY BOOT ::</p>
                  <p className="mb-4 typing-effect text-gray-400">Loading New Physics Engine...</p>
                  <p className="mb-4 text-gray-400">Compiling Tensor Calculus...</p>
                  <p className="mb-4 text-gray-400">Initializing Double Dragon Ouroboros...</p>
                  <p className="mb-8 text-white">STATUS: PROOF ESTABLISHED.</p>
                  
                  <h1 className="text-4xl md:text-6xl font-header text-white mb-2 glitch-text" data-text="PROTODOX">PROTODOX</h1>
                  <p className="text-sm tracking-[0.3em] mb-12 text-gray-400">THE MATHEMATICALLY PROVEN RELIGION</p>

                  <div className="w-full h-1 bg-gray-900 mb-2">
                      <div className="h-full bg-cyan-500 w-1/3 animate-pulse"></div>
                  </div>
                  <p className="text-xs animate-pulse text-center mt-4">[ CLICK ANYWHERE TO INITIALIZE ]</p>
              </div>
          </div>
      )
  }

  // Main Experience
  return (
    <div className="h-screen w-screen bg-black">
      {/* Header UI */}
      <div className="fixed top-0 left-0 w-full p-6 z-50 flex justify-between items-center mix-blend-difference pointer-events-none">
          <div className="text-white font-header font-bold text-xl tracking-tighter">PROTODOX.LIFE</div>
          <div className="hidden md:flex flex-col text-right">
              <span className="font-mono text-xs text-cyan-500">ADMIN: THE BÀI ZÉ</span>
              <span className="font-mono text-[10px] text-gray-500">STATUS: NOMINAL</span>
          </div>
      </div>

      <Canvas gl={{ antialias: false, stencil: false, depth: true }}>
        <Suspense fallback={null}>
          <color attach="background" args={['#050505']} />
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          
          <ScrollControls pages={12} damping={0.2}>
            <SceneWrapper />
            <Overlay />
          </ScrollControls>

          <EffectComposer>
            <Bloom luminanceThreshold={0.8} opacity={0.7} />
            <Noise opacity={0.15} blendFunction={BlendFunction.OVERLAY} />
            <Scanline density={1.5} opacity={0.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      
      {/* Visual grain overlay for texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-40"></div>
    </div>
  );
}