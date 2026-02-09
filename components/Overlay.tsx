import React, { useRef, useState, useEffect } from 'react';
import { MANIFESTO_CONTENT } from '../constants';
import { ARC_COLORS, ARC_LABELS, ArcType } from '../types';
import { TrackPhysicsReturn } from '../useTrackPhysics';

interface OverlayProps {
  physics: TrackPhysicsReturn;
}

export const Overlay: React.FC<OverlayProps> = ({ physics }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentArc, setCurrentArc] = useState<ArcType>(ArcType.THEORY);
  const [visible, setVisible] = useState(true);
  const prevSection = useRef(0);

  // Poll physics state at ~20fps for UI updates
  useEffect(() => {
    const interval = setInterval(() => {
      const state = physics.getState();
      if (state.nearestSection !== prevSection.current) {
        // Fade out, swap, fade in
        setVisible(false);
        setTimeout(() => {
          setCurrentSection(state.nearestSection);
          setCurrentArc(state.currentArc);
          prevSection.current = state.nearestSection;
          setVisible(true);
        }, 250);
      } else {
        setCurrentArc(state.currentArc);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [physics]);

  const section = MANIFESTO_CONTENT[currentSection];
  if (!section) return null;

  const arcColor = ARC_COLORS[currentArc];
  const arcLabel = ARC_LABELS[currentArc];

  return (
    <div className="fixed inset-0 z-30 pointer-events-none font-mono">
      {/* Section content card — bottom left */}
      <div
        className={`absolute bottom-8 left-8 max-w-md transition-all duration-500 ease-in-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="backdrop-blur-md bg-black/60 border border-white/10 p-6 rounded-sm">
          <p className="text-[10px] tracking-[0.3em] mb-2" style={{ color: arcColor }}>
            {arcLabel} — SECTION {currentSection}
          </p>
          <h2 className="text-xl font-bold text-white mb-1 font-header">
            {section.title}
          </h2>
          <p className="text-xs tracking-widest mb-3" style={{ color: arcColor }}>
            {section.subtitle}
          </p>
          <p className="text-xs text-gray-400 leading-relaxed max-h-[20vh] overflow-hidden">
            {section.content[0]}
          </p>
        </div>
      </div>

      {/* Arc indicator — bottom right */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-2">
        {[ArcType.THEORY, ArcType.MATH, ArcType.FAITH].map((arc) => (
          <div
            key={arc}
            className={`flex items-center gap-2 transition-all duration-300 ${
              currentArc === arc ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <span className="text-[9px] tracking-[0.2em]" style={{ color: ARC_COLORS[arc] }}>
              {ARC_LABELS[arc]}
            </span>
            <div
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: ARC_COLORS[arc],
                boxShadow: currentArc === arc ? `0 0 8px ${ARC_COLORS[arc]}` : 'none',
                transform: currentArc === arc ? 'scale(1.5)' : 'scale(1)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Scroll hint — bottom center */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-gray-600 tracking-[0.2em] animate-pulse">
        SCROLL TO NAVIGATE
      </div>

      {/* Section progress dots — right edge */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
        {MANIFESTO_CONTENT.map((_, i) => {
          const sectionArc = i < 5 ? ArcType.THEORY : i < 7 ? ArcType.MATH : ArcType.FAITH;
          return (
            <div
              key={i}
              className="w-1 transition-all duration-300"
              style={{
                height: i === currentSection ? '12px' : '4px',
                backgroundColor: i === currentSection ? ARC_COLORS[sectionArc] : '#333',
                boxShadow: i === currentSection ? `0 0 4px ${ARC_COLORS[sectionArc]}` : 'none',
                borderRadius: '1px',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
