import React, { useRef, useState, useEffect } from 'react';
import { MANIFESTO_CONTENT } from '../constants';
import { ARC_COLORS, ARC_LABELS, ARC_SECTIONS, ArcType, OrbitalMode } from '../types';
import { TrackPhysicsReturn } from '../useTrackPhysics';

interface OverlayProps {
  physics: TrackPhysicsReturn;
}

const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

export const Overlay: React.FC<OverlayProps> = ({ physics }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentArc, setCurrentArc] = useState<ArcType>(ArcType.THEORY);
  const [mode, setMode] = useState<OrbitalMode>('macro');
  const [visible, setVisible] = useState(true);
  const prevSection = useRef(0);

  // Poll physics state at ~20fps for UI updates
  useEffect(() => {
    const interval = setInterval(() => {
      const state = physics.getState();
      setMode(state.mode);
      if (state.nearestSection !== prevSection.current) {
        setVisible(false);
        setTimeout(() => {
          setCurrentSection(state.nearestSection);
          setCurrentArc(state.currentArc);
          prevSection.current = state.nearestSection;
          setVisible(true);
        }, 300);
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
  const localSections = ARC_SECTIONS[currentArc];
  const localIndex = localSections.indexOf(currentSection);

  return (
    <div className="fixed inset-0 z-30 pointer-events-none font-mono flex items-center justify-center">

      {/* ══ Main content card ══ centered, majority of screen, semi-translucent */}
      <div
        className={`w-[85vw] max-w-4xl max-h-[80vh] transition-all duration-700 ease-in-out ${
          visible
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-[0.97]'
        }`}
      >
        <div
          className="backdrop-blur-xl rounded-md border p-8 md:p-12 overflow-y-auto max-h-[80vh]"
          style={{
            backgroundColor: 'rgba(5, 5, 12, 0.65)',
            borderColor: arcColor + '20',
            boxShadow: `0 0 80px ${arcColor}10, inset 0 0 40px rgba(0,0,0,0.3)`,
          }}
        >
          {/* Arc badge */}
          <div className="flex items-center justify-between mb-6">
            <p
              className="text-[10px] tracking-[0.4em] uppercase"
              style={{ color: arcColor }}
            >
              {arcLabel} — {localIndex + 1} / {localSections.length}
            </p>
            <div className="flex items-center gap-3">
              {[ArcType.THEORY, ArcType.MATH, ArcType.FAITH].map((arc) => (
                <div
                  key={arc}
                  className="w-2 h-2 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: ARC_COLORS[arc],
                    opacity: currentArc === arc ? 1 : 0.2,
                    boxShadow: currentArc === arc ? `0 0 10px ${ARC_COLORS[arc]}` : 'none',
                    transform: currentArc === arc ? 'scale(1.4)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <h1
            className="text-3xl md:text-4xl font-bold text-white mb-2 font-header"
          >
            {section.title}
          </h1>

          {/* Subtitle */}
          <p
            className="text-sm md:text-base tracking-[0.25em] mb-8"
            style={{ color: arcColor }}
          >
            {section.subtitle}
          </p>

          {/* Divider */}
          <div className="w-full h-px mb-8" style={{ backgroundColor: arcColor + '25' }} />

          {/* Full content — scrollable on small screens */}
          <div
            data-scroll-container
            className="space-y-5 max-h-[50vh] overflow-y-auto pointer-events-auto pr-2 overlay-text-scroll"
            style={{
              maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
            }}
          >
            {section.content.map((paragraph, i) => (
              <p
                key={i}
                className="text-sm md:text-base text-gray-300 leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ══ Mode indicator ══ top center, small */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2">
        <div
          className="backdrop-blur-md px-4 py-1.5 rounded-sm text-center transition-all duration-500"
          style={{
            backgroundColor: 'rgba(5, 5, 12, 0.5)',
            borderBottom: `1px solid ${arcColor}30`,
          }}
        >
          <p className="text-[9px] tracking-[0.3em]" style={{ color: arcColor }}>
            {mode === 'macro' ? `APPROACHING ${arcLabel}` : `ORBITING ${arcLabel}`}
          </p>
        </div>
      </div>

      {/* ══ Section progress ══ right edge */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
        {MANIFESTO_CONTENT.map((_, i) => {
          const sectionArc = i < 5 ? ArcType.THEORY : i < 9 ? ArcType.MATH : ArcType.FAITH;
          return (
            <div
              key={i}
              className="w-1 transition-all duration-500"
              style={{
                height: i === currentSection ? '14px' : '4px',
                backgroundColor: i === currentSection ? ARC_COLORS[sectionArc] : '#222',
                boxShadow: i === currentSection ? `0 0 6px ${ARC_COLORS[sectionArc]}` : 'none',
                borderRadius: '1px',
              }}
            />
          );
        })}
      </div>

      {/* ══ Scroll hint ══ bottom center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-gray-600 tracking-[0.2em] animate-pulse">
        {mode === 'macro'
          ? (isTouchDevice ? 'SWIPE TO APPROACH' : 'SCROLL TO APPROACH')
          : (isTouchDevice ? 'SWIPE TO CYCLE  •  SWIPE SIDEWAYS TO CHANGE SECTION' : 'SCROLL TO CYCLE  •  SWIPE HARD TO ESCAPE')
        }
      </div>
    </div>
  );
};
