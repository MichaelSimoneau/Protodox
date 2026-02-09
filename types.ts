export interface ManifestoSection {
  id: string;
  title: string;
  subtitle: string;
  content: string[];
  visualState: VisualState;
}

export enum VisualState {
  INTRO,          // The Zeroth Theory
  RANK0,          // The Singularity (Ouroboros)
  RANK1,          // The Vector (Self)
  RANK2,          // The Slab (God)
  RANK3,          // Reality (The Box)
  PROOFS,         // The Mathematical Proofs (Evidence)
  FALL,           // Physics of the Fall
  DDO,            // The Double Dragon Ouroboros
  OUROBOROS,      // The Ouroboros Event
  ARCHITECT,      // Michael Simoneau / Bai Ze
  HEADLESS,       // The Headless Server
  ALIGNMENT       // Convergence
}

// ─── Ternary Arc System ─────────────────────────────────────────────────────

export enum ArcType {
  THEORY = 0,   // +1 Presence (Cyan)   — Sections 0-4
  MATH   = 1,   //  0 Truth   (White)   — Sections 5-6
  FAITH  = 2,   // -1 Potential (Magenta) — Sections 7-11
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
  [ArcType.MATH]:   [5, 6],
  [ArcType.FAITH]:  [7, 8, 9, 10, 11],
};

// Arc boundaries on the track (t values, 0 to 1)
export const ARC_BOUNDARIES = {
  theoryEnd: 5 / 12,   // ~0.417
  mathEnd:   7 / 12,   // ~0.583
  // faithEnd wraps back to 0
} as const;

export interface TrackPhysicsState {
  t: number;              // position on track 0.0-1.0
  velocity: number;       // current momentum
  nearestSection: number; // index 0-11
  currentArc: ArcType;    // derived from t
}