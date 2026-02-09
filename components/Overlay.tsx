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
            className={`h-screen w-full flex items-end ${index % 2 === 0 ? 'justify-start' : 'justify-end'} p-8 md:p-16 pb-24`}
          >
            <div className={`
              max-w-md max-h-[50vh] overflow-hidden backdrop-blur-md bg-black/70 border border-white/10 p-6
              transform transition-all duration-700
            `}>
              <div className="flex items-center gap-4 mb-3 opacity-50">
                <span className="text-cyan-400 font-mono text-xs tracking-widest">RANK_INDEX: {index}</span>
                <div className="h-[1px] flex-grow bg-cyan-900"></div>
              </div>
              
              <h2 className="text-2xl md:text-4xl font-header font-bold mb-1 tracking-tighter uppercase glitch-text" data-text={section.title}>
                {section.title}
              </h2>
              
              <h3 className="text-sm text-cyan-400 font-mono mb-4 tracking-widest border-l-2 border-cyan-500 pl-3 uppercase">
                {section.subtitle}
              </h3>
              
              <p className="font-mono text-xs md:text-sm text-gray-400 leading-relaxed border-l border-white/5 pl-3">
                {section.content[0]}
              </p>
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
