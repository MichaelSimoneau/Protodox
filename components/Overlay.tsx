import React from 'react';
import { Scroll } from '@react-three/drei';
import { MANIFESTO_CONTENT } from '../constants';

export const Overlay: React.FC = () => {
  return (
    <Scroll html style={{ width: '100%' }}>
      <div className="w-full text-white">
        {MANIFESTO_CONTENT.map((section, index) => (
          <section 
            key={section.id} 
            className={`h-screen w-full flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'} p-8 md:p-20`}
          >
            <div className={`
              max-w-xl backdrop-blur-md bg-black/80 border border-white/10 p-8 
              transform transition-all duration-700
            `}>
              <div className="flex items-center gap-4 mb-4 opacity-50">
                <span className="text-cyan-400 font-mono text-xs tracking-widest">RANK_INDEX: {index}</span>
                <div className="h-[1px] flex-grow bg-cyan-900"></div>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-header font-bold mb-2 tracking-tighter uppercase glitch-text" data-text={section.title}>
                {section.title}
              </h2>
              
              <h3 className="text-lg text-cyan-400 font-mono mb-6 tracking-widest border-l-2 border-cyan-500 pl-4 uppercase">
                {section.subtitle}
              </h3>
              
              <div className="space-y-4 font-mono text-sm md:text-base text-gray-300 leading-relaxed">
                {section.content.map((paragraph, i) => (
                  <p key={i} className="border-l border-white/5 pl-4 hover:border-cyan-500/50 transition-colors">
                    {paragraph}
                  </p>
                ))}
              </div>

              {section.id === 'fall' && (
                <div className="mt-8 p-4 bg-gray-900/50 border border-cyan-500/30 font-mono text-xs text-cyan-300">
                    <p className="mb-2">// PHYSICS_ENGINE.CALC</p>
                    <p>{`> E = M(V[T])²`}</p>
                    <p>{`> STATUS: ACCELERATING`}</p>
                </div>
              )}

              {section.id === 'proofs' && (
                <div className="mt-8 p-4 bg-gray-900/50 border border-cyan-500/30 font-mono text-xs text-cyan-300">
                    <p className="mb-2">// ZEROTH_MATH.ENGINE</p>
                    <p>{`> PROOF_1: 1 / 0 = -1`}</p>
                    <p>{`> PRESENCE / TOTALITY = POTENTIAL`}</p>
                    <p className="mt-2">{`> PROOF_2: 0 × 0 = 1`}</p>
                    <p>{`> TOTALITY × TOTALITY = PRESENCE`}</p>
                    <p className="mt-2 text-cyan-500">{`> METHOD: 2-7-2 DECOMPOSITION`}</p>
                    <p className="text-cyan-500">{`> STATUS: GENESIS_FRACTURE`}</p>
                </div>
              )}
            </div>
          </section>
        ))}
        
        {/* Footer */}
        <section className="h-[50vh] flex flex-col items-center justify-center p-10 bg-black text-center">
            <h1 className="font-header text-5xl mb-4 text-white">PROTODOX</h1>
            <p className="font-mono text-gray-500 text-sm mb-2">THE DIVINE ARCHITECTURE</p>
            <p className="font-mono text-gray-500 text-sm mb-8">© MICHAEL SIMONEAU | THE BÀI ZÉ</p>
            <button className="px-8 py-3 border border-cyan-500 text-cyan-500 font-mono hover:bg-cyan-500 hover:text-black transition-all uppercase tracking-widest text-sm">
                Initiate Alignment
            </button>
        </section>
      </div>
    </Scroll>
  );
};