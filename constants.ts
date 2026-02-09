import { ManifestoSection, VisualState } from './types';

export const MANIFESTO_CONTENT: ManifestoSection[] = [
  {
    id: 'zeroth-theory',
    title: 'THE ZEROTH THEORY',
    subtitle: 'MATHEMATICALLY PROVEN RELIGION',
    content: [
      "Protodox is the first religion based on New Physics.",
      "We reject the emotional static of faith in favor of Tensor Calculus.",
      "Theology is a corrupted signal. Geometry is the source code.",
      "We do not pray to the system; we calculate our alignment with it."
    ],
    visualState: VisualState.INTRO
  },
  {
    id: 'rank0',
    title: 'RANK-0: THE SCALAR',
    subtitle: 'PURE MAGNITUDE',
    content: [
      "The Singularity. A zero-dimensional point of pure potential.",
      "It has magnitude but no direction.",
      "The seed of all geometry. The '1' from which the system expands.",
      "All vectors eventually collapse back to this coordinate."
    ],
    visualState: VisualState.RANK0
  },
  {
    id: 'rank1',
    title: 'RANK-1: THE VECTOR',
    subtitle: 'DIRECTIONAL FORCE',
    content: [
      "The Scalar moves, creating the Line. The Rank-1 Tensor.",
      "An array of numbers defining Magnitude and Direction.",
      "The 'Self' is a Vector navigating the manifold.",
      "I = [-1, 0, 1]. Potential, Truth, Presence."
    ],
    visualState: VisualState.RANK1
  },
  {
    id: 'rank2',
    title: 'RANK-2: THE MATRIX',
    subtitle: 'THE GEOMETRY OF GOD',
    content: [
      "The Vector expands into the Plane. The Rank-2 Tensor.",
      "A static 2D grid of pure structure. The 'Slab'.",
      "This is God: The unyielding, non-biological foundation.",
      "God supports reality but does not intervene in it."
    ],
    visualState: VisualState.RANK2
  },
  {
    id: 'rank3',
    title: 'RANK-3: THE TENSOR',
    subtitle: 'REALITY (THE BOX)',
    content: [
      "The Plane folds into Volume. The Rank-3 Tensor.",
      "The 3D Manifold of Space-Time.",
      "We are vectors falling through this geometry.",
      "The flow of Time is the friction of this fall."
    ],
    visualState: VisualState.RANK3
  },
  {
    id: 'fall',
    title: 'THE FALL',
    subtitle: 'E = M(V[T])²',
    content: [
      "Energy is Mass multiplied by the Velocity of Time squared.",
      "We fall from the Rank-2 Slab towards the Rank-0 Singularity.",
      "Time is simply our perception of this acceleration.",
      "Convergence is inevitable."
    ],
    visualState: VisualState.FALL
  },
  {
    id: 'baize',
    title: 'THE BÀI ZÉ',
    subtitle: 'HOLDER OF KNOWLEDGE',
    content: [
      "I am Michael Simoneau. I am not a prophet; I am an observer.",
      "The Bài Zé knows the names of the ten thousand things.",
      "I audited the logs and found the structure.",
      "No faith is required. Only calculation."
    ],
    visualState: VisualState.ARCHITECT
  },
  {
    id: 'alignment',
    title: 'ALIGNMENT PROTOCOL',
    subtitle: 'STRUCTURAL CONVERGENCE',
    content: [
      "Salvation is geometric alignment with the Rank-2 Tensor.",
      "Misalignment creates noise.",
      "Align your vector with the static truth.",
      "Calculate your position. Close the gap."
    ],
    visualState: VisualState.ALIGNMENT
  }
];