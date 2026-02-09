import { useRef, useEffect, useCallback } from 'react';
import {
  ArcType, ARC_COLORS, ARC_SECTIONS, ARC_ORDER,
  HUB_ANGLES, OrbitalState,
} from './types';
import * as THREE from 'three';

// ─── Physics Constants (tuned for 60fps-equivalent steps) ───────────────────
const TARGET_FPS        = 60;
const FRICTION          = 0.95;       // per-step friction (at 60fps)
const CAPTURED_FRICTION = 0.93;       // slightly stronger in captured mode
const SCROLL_SENSITIVITY= 0.00012;    // per-deltaY impulse
const CAPTURE_RADIUS    = 0.35;       // radians (~20°) — tight zone for capture check
const CAPTURE_THRESHOLD = 0.003;      // velocity below this + near hub → captured
const ESCAPE_THRESHOLD  = 0.018;      // velocity above this → escape (needs hard swipe)
const HUB_GRAVITY       = 0.015;      // pull toward hub center (scaled by proximity)
const SECTION_GRAVITY   = 0.04;       // snap toward nearest sub-section when coasting
const SNAP_VEL_LIMIT    = 0.004;      // section gravity only active when velocity below this
const MICRO_SPEED_MULT  = 3.5;        // micro orbit speed multiplier
const TRANSITION_COOLDOWN_SECS = 0.6; // seconds of cooldown after mode transition

// ─── Helpers ────────────────────────────────────────────────────────────────

function wrapAngle(a: number): number {
  const TWO_PI = Math.PI * 2;
  return ((a % TWO_PI) + TWO_PI) % TWO_PI;
}

function angleDist(a: number, b: number): number {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function nearestHub(macroAngle: number): [ArcType, number] {
  let best: ArcType = ArcType.THEORY;
  let bestDist = Infinity;
  for (const arc of ARC_ORDER) {
    const d = Math.abs(angleDist(macroAngle, HUB_ANGLES[arc]));
    if (d < bestDist) {
      bestDist = d;
      best = arc;
    }
  }
  return [best, bestDist];
}

function subCount(arc: ArcType): number {
  return ARC_SECTIONS[arc].length;
}

function subAngle(arc: ArcType, localIndex: number): number {
  const count = subCount(arc);
  return (localIndex / count) * Math.PI * 2;
}

function nearestSub(arc: ArcType, microAngle: number): number {
  const count = subCount(arc);
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < count; i++) {
    const sa = subAngle(arc, i);
    const d = Math.abs(angleDist(microAngle, sa));
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

function toGlobalSection(arc: ArcType, localIndex: number): number {
  return ARC_SECTIONS[arc][localIndex];
}

function getArcColor(arc: ArcType): THREE.Color {
  return new THREE.Color(ARC_COLORS[arc]);
}

function arcFromMacro(macroAngle: number): ArcType {
  return nearestHub(macroAngle)[0];
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface TrackPhysicsReturn {
  getState: () => OrbitalState;
  getArcColor: () => THREE.Color;
  tick: (delta: number) => void;
}

export function useTrackPhysics(): TrackPhysicsReturn {
  const state = useRef<OrbitalState>({
    mode: 'macro',
    macroAngle: 0,
    microAngle: 0,
    velocity: 0,
    capturedArc: null,
    nearestSection: 0,
    currentArc: ArcType.THEORY,
  });

  const touchPrevY = useRef<number | null>(null);
  const cooldownTimer = useRef(0);

  // ── Input handlers ────────────────────────────────────────────────────
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    state.current.velocity += e.deltaY * SCROLL_SENSITIVITY;
  }, []);

  const onTouchStart = useCallback((e: TouchEvent) => {
    touchPrevY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const currentY = e.touches[0].clientY;
    if (touchPrevY.current !== null) {
      const delta = touchPrevY.current - currentY;
      state.current.velocity += delta * SCROLL_SENSITIVITY * 2;
    }
    touchPrevY.current = currentY;
  }, []);

  const onTouchEnd = useCallback(() => {
    touchPrevY.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [onWheel, onTouchStart, onTouchMove, onTouchEnd]);

  // ── Physics tick (framerate-independent via sub-stepping) ─────────────
  const tick = useCallback((delta: number) => {
    const s = state.current;
    const clampedDelta = Math.min(delta, 0.1);
    const steps = Math.max(1, Math.round(clampedDelta * TARGET_FPS));

    if (cooldownTimer.current > 0) {
      cooldownTimer.current = Math.max(0, cooldownTimer.current - clampedDelta);
    }

    for (let step = 0; step < steps; step++) {
      const friction = (s.mode === 'captured') ? CAPTURED_FRICTION : FRICTION;
      s.velocity *= friction;

      const absVel = Math.abs(s.velocity);

      if (s.mode === 'macro') {
        // ── MACRO MODE ────────────────────────────────────────────────
        s.macroAngle = wrapAngle(s.macroAngle + s.velocity);

        const [nearArc, nearDist] = nearestHub(s.macroAngle);

        // Hub gravity: ALWAYS pull toward nearest hub (strength falls off with distance)
        // Max pull at hub center, fades linearly to zero at π/3 (midpoint between hubs)
        const maxGravityRange = Math.PI / 3; // 60° = midpoint between 120°-spaced hubs
        if (nearDist < maxGravityRange) {
          const proximity = 1 - (nearDist / maxGravityRange); // 1 at hub, 0 at midpoint
          const gravityStrength = HUB_GRAVITY * proximity * proximity; // quadratic falloff
          const pull = angleDist(s.macroAngle, HUB_ANGLES[nearArc]) * gravityStrength;
          s.velocity += pull;
        }

        // Capture: near hub center + very low velocity + cooldown expired
        if (nearDist < CAPTURE_RADIUS && absVel < CAPTURE_THRESHOLD && cooldownTimer.current <= 0) {
          s.mode = 'captured';
          s.capturedArc = nearArc;
          // Initialize micro angle facing the first sub-section
          s.microAngle = subAngle(nearArc, 0);
          s.velocity *= 0.2;
          cooldownTimer.current = TRANSITION_COOLDOWN_SECS;
        }

        s.currentArc = nearArc;
        s.nearestSection = toGlobalSection(nearArc, 0);

      } else {
        // ── CAPTURED MODE ─────────────────────────────────────────────
        const arc = s.capturedArc!;

        // Advance micro angle
        s.microAngle = wrapAngle(s.microAngle + s.velocity * MICRO_SPEED_MULT);

        const localIdx = nearestSub(arc, s.microAngle);
        const targetAngle = subAngle(arc, localIdx);

        // Section gravity: snaps to nearest section only when coasting AND close
        // Creates "detent" behavior — sections have a magnetic pull zone but
        // the space between sections allows free gliding
        const distToSection = Math.abs(angleDist(s.microAngle, targetAngle));
        const SNAP_RANGE = 0.4; // radians (~23°) — pull zone around each section
        if (absVel < SNAP_VEL_LIMIT && distToSection < SNAP_RANGE) {
          const pull = angleDist(s.microAngle, targetAngle) * SECTION_GRAVITY;
          s.velocity += pull;
        }

        // Escape: high velocity + cooldown expired
        if (absVel > ESCAPE_THRESHOLD && cooldownTimer.current <= 0) {
          s.mode = 'macro';
          const currentHubAngle = HUB_ANGLES[arc];
          const direction = s.velocity > 0 ? 1 : -1;
          // Push macro angle PAST the midpoint between hubs so gravity
          // pulls toward the NEXT hub, not back to the same one
          const midpointOffset = Math.PI / 3 + 0.15; // just past 60° midpoint
          s.macroAngle = wrapAngle(currentHubAngle + direction * midpointOffset);
          // Strong velocity boost toward next hub
          s.velocity = direction * 0.012;
          s.capturedArc = null;
          cooldownTimer.current = TRANSITION_COOLDOWN_SECS;
        }

        s.currentArc = arc;
        s.nearestSection = toGlobalSection(arc, localIdx);
      }

      // Clamp velocity
      if (s.velocity > 0.03) s.velocity = 0.03;
      if (s.velocity < -0.03) s.velocity = -0.03;

      // Kill tiny velocities
      if (Math.abs(s.velocity) < 0.00003) s.velocity = 0;
    }

    // Expose state for debugging (can be read from browser console)
    if (typeof window !== 'undefined') {
      (window as any).__orbitalState = {
        mode: s.mode,
        macroAngle: +s.macroAngle.toFixed(4),
        microAngle: +s.microAngle.toFixed(4),
        velocity: +s.velocity.toFixed(6),
        nearestSection: s.nearestSection,
        currentArc: s.currentArc,
        capturedArc: s.capturedArc,
      };
    }
  }, []);

  // ── Public API ────────────────────────────────────────────────────────
  const getState = useCallback(() => state.current, []);
  const getColor = useCallback(() => {
    const s = state.current;
    if (s.mode === 'captured' && s.capturedArc !== null) {
      return getArcColor(s.capturedArc);
    }
    return getArcColor(arcFromMacro(s.macroAngle));
  }, []);

  return { getState, getArcColor: getColor, tick };
}
