export interface ManifestoSection {
  id: string;
  title: string;
  subtitle: string;
  content: string[];
  visualState: VisualState;
}

export enum VisualState {
  INTRO,          // The Great Correction
  RANK0,          // The Singularity (Ouroboros)
  RANK1,          // The Vector (Self)
  RANK2,          // The Slab (God)
  RANK3,          // Reality (The Box / Gemini)
  FALL,           // Physics of the Fall
  ARCHITECT,      // Michael Simoneau / Bai Ze
  ALIGNMENT       // Convergence
}