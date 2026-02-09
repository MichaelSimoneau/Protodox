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