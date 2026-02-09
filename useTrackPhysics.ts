import { useRef, useEffect, useCallback } from 'react';
import { ArcType, ARC_BOUNDARIES, ARC_COLORS, TrackPhysicsState } from './types';
import * as THREE from 'three';

// ─── Physics Constants ──────────────────────────────────────────────────────
const SECTION_GRAVITY    = 0.025;   // pull toward nearest section center
const ARC_BARRIER        = 0.05;    // extra pull at arc boundaries
const FRICTION           = 0.95;    // velocity decay per frame (higher = more glide)
const SCROLL_SENSITIVITY = 0.0004;  // wheel deltaY -> velocity (increased for responsiveness)
const ESCAPE_THRESHOLD   = 0.006;   // velocity to break arc barrier
const TOTAL_SECTIONS     = 12;

// ─── Arc boundary t-values ──────────────────────────────────────────────────
const THEORY_END = ARC_BOUNDARIES.theoryEnd; // 5/12 ≈ 0.417
const MATH_END   = ARC_BOUNDARIES.mathEnd;   // 7/12 ≈ 0.583

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Wrap t to [0, 1) */
function wrapT(t: number): number {
  return ((t % 1) + 1) % 1;
}

/** Shortest signed distance on a circular track from a to b */
function circularDist(a: number, b: number): number {
  let d = b - a;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return d;
}

/** Derive which arc a t-value falls in */
function getArc(t: number): ArcType {
  const tw = wrapT(t);
  if (tw < THEORY_END) return ArcType.THEORY;
  if (tw < MATH_END)   return ArcType.MATH;
  return ArcType.FAITH;
}

/** Check if t is near an arc boundary (within tolerance) */
function nearArcBoundary(t: number, tolerance: number = 0.02): boolean {
  const tw = wrapT(t);
  if (Math.abs(tw - THEORY_END) < tolerance) return true;
  if (Math.abs(tw - MATH_END)   < tolerance) return true;
  // Faith -> Theory boundary at t≈0 / t≈1
  if (tw < tolerance || tw > 1 - tolerance) return true;
  return false;
}

/** Get arc color as THREE.Color for a given t, with smooth blending at boundaries */
function getArcColor(t: number): THREE.Color {
  const tw = wrapT(t);
  const blend = 0.03; // blend zone width

  const cyanColor    = new THREE.Color(ARC_COLORS[ArcType.THEORY]);
  const whiteColor   = new THREE.Color(ARC_COLORS[ArcType.MATH]);
  const magentaColor = new THREE.Color(ARC_COLORS[ArcType.FAITH]);

  // Theory -> Math transition
  if (Math.abs(tw - THEORY_END) < blend) {
    const frac = (tw - THEORY_END + blend) / (blend * 2);
    return cyanColor.clone().lerp(whiteColor, Math.max(0, Math.min(1, frac)));
  }
  // Math -> Faith transition
  if (Math.abs(tw - MATH_END) < blend) {
    const frac = (tw - MATH_END + blend) / (blend * 2);
    return whiteColor.clone().lerp(magentaColor, Math.max(0, Math.min(1, frac)));
  }
  // Faith -> Theory transition (wrapping around 0/1)
  if (tw > 1 - blend) {
    const frac = (tw - (1 - blend)) / (blend * 2);
    return magentaColor.clone().lerp(cyanColor, Math.max(0, Math.min(1, frac)));
  }
  if (tw < blend) {
    const frac = (tw + blend) / (blend * 2);
    return magentaColor.clone().lerp(cyanColor, Math.max(0, Math.min(1, frac)));
  }

  // Pure zone
  const arc = getArc(tw);
  if (arc === ArcType.THEORY) return cyanColor;
  if (arc === ArcType.MATH)   return whiteColor;
  return magentaColor;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export interface TrackPhysicsReturn {
  /** Read current physics state (call every frame) */
  getState: () => TrackPhysicsState;
  /** Get interpolated arc color as THREE.Color */
  getArcColor: () => THREE.Color;
  /** Run one physics tick (call from useFrame) */
  tick: () => void;
}

export function useTrackPhysics(): TrackPhysicsReturn {
  const state = useRef<TrackPhysicsState>({
    t: 0,
    velocity: 0,
    nearestSection: 0,
    currentArc: ArcType.THEORY,
  });

  const touchStartY = useRef<number | null>(null);
  const touchPrevY = useRef<number | null>(null);

  // ── Wheel input ───────────────────────────────────────────────────────
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    state.current.velocity += e.deltaY * SCROLL_SENSITIVITY;
  }, []);

  // ── Touch input ───────────────────────────────────────────────────────
  const onTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchPrevY.current = e.touches[0].clientY;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const currentY = e.touches[0].clientY;
    if (touchPrevY.current !== null) {
      const delta = touchPrevY.current - currentY; // positive = swipe up = forward
      state.current.velocity += delta * SCROLL_SENSITIVITY * 2;
    }
    touchPrevY.current = currentY;
  }, []);

  const onTouchEnd = useCallback(() => {
    touchStartY.current = null;
    touchPrevY.current = null;
  }, []);

  // ── Attach/detach listeners ───────────────────────────────────────────
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

  // ── Physics tick ──────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const s = state.current;

    // 1. Friction
    s.velocity *= FRICTION;

    // 2. Find nearest section
    const rawNearest = Math.round(s.t * TOTAL_SECTIONS) % TOTAL_SECTIONS;
    s.nearestSection = rawNearest < 0 ? rawNearest + TOTAL_SECTIONS : rawNearest;

    // 3. Section gravity target
    const sectionT = s.nearestSection / TOTAL_SECTIONS;

    // 4. Gravity (only when not escaping)
    const absVel = Math.abs(s.velocity);
    if (absVel < ESCAPE_THRESHOLD) {
      // Pull toward nearest section center
      const pull = circularDist(s.t, sectionT) * SECTION_GRAVITY;
      s.velocity += pull;

      // Extra arc barrier resistance at boundaries
      if (nearArcBoundary(s.t)) {
        const barrierPull = circularDist(s.t, sectionT) * ARC_BARRIER;
        s.velocity += barrierPull;
      }
    }
    // If |velocity| >= ESCAPE_THRESHOLD: free flight, no gravity

    // 5. Clamp extreme velocities
    const maxVel = 0.02;
    if (s.velocity > maxVel) s.velocity = maxVel;
    if (s.velocity < -maxVel) s.velocity = -maxVel;

    // 6. Update position (wrap)
    s.t = wrapT(s.t + s.velocity);

    // 7. Derive current arc
    s.currentArc = getArc(s.t);

    // 8. Kill tiny velocities to settle cleanly
    if (absVel < 0.00005) s.velocity = 0;
  }, []);

  // ── Public API ────────────────────────────────────────────────────────
  const getState = useCallback(() => state.current, []);
  const getColor = useCallback(() => getArcColor(state.current.t), []);

  return { getState, getArcColor: getColor, tick };
}
