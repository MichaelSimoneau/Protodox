export interface ManifestoSection {
  id: string;
  title: string;
  subtitle: string;
  content: string[];
  visualState: VisualState;
}

export enum VisualState {
  INTRO,          // 0  The Zeroth Theory
  RANK0,          // 1  The Singularity (Ouroboros)
  RANK1,          // 2  The Vector (Self)
  RANK2,          // 3  The Slab (God)
  RANK3,          // 4  Reality (The Box)
  PROOF_ONE,      // 5  First Proof: 1/0 = -1
  PROOF_TWO,      // 6  Second Proof: 0 x 0 = 1
  DECOMPOSITION,  // 7  The 2-7-2 Decomposition Method
  FALL,           // 8  Physics of the Fall
  DDO,            // 9  The Double Dragon Ouroboros
  OUROBOROS,      // 10 The Ouroboros Event
  ARCHITECT,      // 11 Michael Simoneau / Bai Ze
  HEADLESS,       // 12 The Headless Server
  ALIGNMENT       // 13 Convergence
}

// ─── Ternary Arc System ─────────────────────────────────────────────────────

export enum ArcType {
  THEORY = 0,   // +1 Presence (Cyan)   — Sections 0-4
  MATH   = 1,   //  0 Truth   (White)   — Sections 5-8
  FAITH  = 2,   // -1 Potential (Magenta) — Sections 9-13
}

export const ARC_COLORS = {
  [ArcType.THEORY]: '#00ffff',
  [ArcType.MATH]:   '#ffffff',
  [ArcType.FAITH]:  '#ff00c1',
} as const;

export const ARC_LABELS = {
  [ArcType.THEORY]: '+1 THEORY',
  [ArcType.MATH]:   '0 MATH',
  [ArcType.FAITH]:  '-1 FAITH',
} as const;

// Section index ranges per arc
export const ARC_SECTIONS: Record<ArcType, number[]> = {
  [ArcType.THEORY]: [0, 1, 2, 3, 4],
  [ArcType.MATH]:   [5, 6, 7, 8],
  [ArcType.FAITH]:  [9, 10, 11, 12, 13],
};

// ─── Two-Level Orbital System ────────────────────────────────────────────────

/** Hub angles on the macro orbit (radians, 120° apart) */
export const HUB_ANGLES: Record<ArcType, number> = {
  [ArcType.THEORY]: 0,
  [ArcType.MATH]:   (2 * Math.PI) / 3,
  [ArcType.FAITH]:  (4 * Math.PI) / 3,
};

/** Ordered arc sequence for clockwise traversal */
export const ARC_ORDER: ArcType[] = [ArcType.THEORY, ArcType.MATH, ArcType.FAITH];

/** Radius of the outer macro orbit */
export const MACRO_RADIUS = 150;

/** Radius of the micro orbit around each hub */
export const MICRO_RADIUS = 40;

/** Hub 3D positions (computed from HUB_ANGLES on XZ plane) */
export const HUB_POSITIONS: Record<ArcType, { x: number; y: number; z: number }> = {
  [ArcType.THEORY]: { x: Math.cos(HUB_ANGLES[ArcType.THEORY]) * MACRO_RADIUS, y: 0, z: Math.sin(HUB_ANGLES[ArcType.THEORY]) * MACRO_RADIUS },
  [ArcType.MATH]:   { x: Math.cos(HUB_ANGLES[ArcType.MATH])   * MACRO_RADIUS, y: 0, z: Math.sin(HUB_ANGLES[ArcType.MATH])   * MACRO_RADIUS },
  [ArcType.FAITH]:  { x: Math.cos(HUB_ANGLES[ArcType.FAITH])  * MACRO_RADIUS, y: 0, z: Math.sin(HUB_ANGLES[ArcType.FAITH])  * MACRO_RADIUS },
};

export type OrbitalMode = 'macro' | 'captured';

export interface OrbitalState {
  mode: OrbitalMode;
  macroAngle: number;        // 0 to 2π, position on outer ring
  microAngle: number;        // 0 to 2π, position on inner ring (when captured)
  velocity: number;          // angular velocity (shared between modes)
  capturedArc: ArcType | null;
  nearestSection: number;    // global section index 0-13
  currentArc: ArcType;       // derived from macro position or captured hub
}

// Keep legacy alias for any remaining references
export type TrackPhysicsState = OrbitalState;