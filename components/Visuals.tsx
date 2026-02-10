import React, { Suspense, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial, Text, Box, PerspectiveCamera, Line, Sphere, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { TrackPhysicsReturn } from '../useTrackPhysics';
import {
  ArcType, ARC_COLORS, ARC_SECTIONS, ARC_ORDER,
  HUB_POSITIONS, MACRO_RADIUS, MICRO_RADIUS,
} from '../types';

const MONO_FONT = "https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@2.304/fonts/webfonts/JetBrainsMono-Regular.woff2";

// Camera sits this far "behind" the hub (outward from world center), looking in
const CAM_VIEW_DIST = 90;
const CAM_ELEVATION = 35;
const CAM_LERP = 0.025; // slow, cinematic blend between hubs

// Orbital radii for sub-sections (spread out like planetary distances)
function getOrbitRadius(localIndex: number, count: number): number {
  const minR = 18;
  const maxR = MICRO_RADIUS + 5;
  return minR + (localIndex / Math.max(1, count - 1)) * (maxR - minR);
}

// Orbital speed per planet (inner orbits faster, outer slower)
function getOrbitSpeed(localIndex: number, count: number): number {
  const fast = 0.25;
  const slow = 0.08;
  return fast - (localIndex / Math.max(1, count - 1)) * (fast - slow);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXHIBIT COMPONENTS (planet visuals for each sub-section)
// ═══════════════════════════════════════════════════════════════════════════════

const Rank0Scalar = () => (
  <group>
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial emissive="#fff" emissiveIntensity={2} color="#fff" />
      </Sphere>
      <pointLight intensity={2} distance={10} color="white" />
    </Float>
    <Text position={[0, -2, 0]} fontSize={0.2} color="gray" anchorX="center" anchorY="top" font={MONO_FONT}>
      SCALAR (0)
    </Text>
  </group>
);

const Rank1Vector = () => {
  const points = useMemo(() => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 6, 0)], []);
  return (
    <group>
      <Line points={points} color="#00ffff" lineWidth={3} />
      <group position={[0, 3, 0]}>
        <Text position={[0.4, 0, 0]} fontSize={0.25} color="#00ffff" anchorX="left" font={MONO_FONT}>
          VECTOR (1)
        </Text>
      </group>
      <mesh position={[0, 6, 0]}>
        <coneGeometry args={[0.2, 0.6, 8]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
    </group>
  );
};

const Rank2Slab = () => (
  <group rotation={[-Math.PI / 2, 0, 0]}>
    <Grid args={[20, 20]} cellSize={1} sectionSize={5} sectionColor="#00ffff" cellColor="#333" infiniteGrid={false} />
    <Text position={[5, 5, 0.2]} fontSize={1} color="#333" rotation={[0, 0, -Math.PI / 2]} font={MONO_FONT}>
      RANK-2
    </Text>
  </group>
);

const Rank3Reality = () => {
  const cubes = useMemo(() => {
    const c = [];
    for (let i = 0; i < 30; i++) {
      c.push({
        pos: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8] as [number, number, number],
        scale: Math.random() * 0.5 + 0.1,
      });
    }
    return c;
  }, []);
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });
  return (
    <group ref={groupRef}>
      <Box args={[6, 6, 6]}>
        <meshBasicMaterial color="#222" wireframe />
      </Box>
      {cubes.map((c, i) => (
        <Box key={i} position={c.pos} args={[c.scale, c.scale, c.scale]}>
          <meshStandardMaterial color={i % 3 === 0 ? '#00ffff' : '#333'} wireframe={i % 2 === 0} />
        </Box>
      ))}
    </group>
  );
};

/** Proof 1: 1/0 = -1 — Balance beam with Totality fulcrum, Presence on one side, Potential on the other */
const ProofOneVisual = () => {
  const groupRef = useRef<THREE.Group>(null);
  const beamPoints = useMemo(() => [new THREE.Vector3(-4, 0, 0), new THREE.Vector3(4, 0, 0)], []);
  const fulcrumPoints = useMemo(() => [new THREE.Vector3(0, -1.5, 0), new THREE.Vector3(0, 0, 0)], []);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
    }
  });
  return (
    <group>
      <group ref={groupRef}>
        <Line points={beamPoints} color="#555" lineWidth={2} />
        <group position={[4, 0, 0]}>
          <Sphere args={[0.35, 32, 32]}>
            <meshStandardMaterial emissive="#00ffff" emissiveIntensity={1.5} color="#00ffff" transparent opacity={0.8} />
          </Sphere>
          <pointLight intensity={1} distance={4} color="#00ffff" />
          <Text position={[0, -0.7, 0]} fontSize={0.18} color="#00ffff" anchorX="center" font={MONO_FONT}>+1 PRESENCE</Text>
        </group>
        <group position={[-4, 0, 0]}>
          <Sphere args={[0.35, 32, 32]}>
            <meshStandardMaterial emissive="#ff00c1" emissiveIntensity={1.5} color="#ff00c1" transparent opacity={0.8} />
          </Sphere>
          <pointLight intensity={1} distance={4} color="#ff00c1" />
          <Text position={[0, -0.7, 0]} fontSize={0.18} color="#ff00c1" anchorX="center" font={MONO_FONT}>-1 POTENTIAL</Text>
        </group>
      </group>
      <Line points={fulcrumPoints} color="#555" lineWidth={2} />
      <Sphere args={[0.25, 32, 32]}>
        <meshStandardMaterial emissive="#ffffff" emissiveIntensity={2} color="#ffffff" />
      </Sphere>
      <Text position={[0, -2, 0]} fontSize={0.15} color="white" anchorX="center" font={MONO_FONT}>0 = TOTALITY</Text>
      <Float speed={3} rotationIntensity={0.1} floatIntensity={0.3}>
        <Text position={[0, 2.5, 0]} fontSize={0.45} color="#ffffff" anchorX="center" font={MONO_FONT} outlineWidth={0.01} outlineColor="black">1/0 = -1</Text>
      </Float>
    </group>
  );
};

/** Proof 2: 0 × 0 = 1 — Genesis Fracture: two colliding totality spheres creating a burst of presence */
const ProofTwoVisual = () => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
      groupRef.current.scale.setScalar(1 + pulse);
    }
  });
  return (
    <group>
      <group ref={groupRef}>
        {/* Two 'totality' spheres converging */}
        <Sphere args={[0.5, 32, 32]} position={[-1.2, 0, 0]}>
          <meshStandardMaterial emissive="#ffffff" emissiveIntensity={1.8} color="#333" transparent opacity={0.6} />
        </Sphere>
        <Sphere args={[0.5, 32, 32]} position={[1.2, 0, 0]}>
          <meshStandardMaterial emissive="#ffffff" emissiveIntensity={1.8} color="#333" transparent opacity={0.6} />
        </Sphere>
        {/* Central 'presence' burst */}
        <Sphere args={[0.3, 32, 32]}>
          <meshStandardMaterial emissive="#00ffff" emissiveIntensity={4} color="#00ffff" />
        </Sphere>
        <pointLight intensity={3} distance={10} color="#00ffff" />
      </group>
      <Text position={[-1.2, -1.2, 0]} fontSize={0.2} color="#888" anchorX="center" font={MONO_FONT}>0</Text>
      <Text position={[0, -1.2, 0]} fontSize={0.2} color="#888" anchorX="center" font={MONO_FONT}>×</Text>
      <Text position={[1.2, -1.2, 0]} fontSize={0.2} color="#888" anchorX="center" font={MONO_FONT}>0</Text>
      <Float speed={3} rotationIntensity={0.1} floatIntensity={0.3}>
        <Text position={[0, 2.5, 0]} fontSize={0.45} color="#ffffff" anchorX="center" font={MONO_FONT} outlineWidth={0.01} outlineColor="black">0 × 0 = 1</Text>
      </Float>
      <Text position={[0, -2.2, 0]} fontSize={0.12} color="#555" anchorX="center" font={MONO_FONT}>GENESIS FRACTURE</Text>
    </group>
  );
};

/** Decomposition: 2-7-2 Method — grid of numbers resolving to whole truth states */
const DecompositionVisual = () => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });
  // The 2-7-2 decomposition nodes
  const nodes = useMemo(() => [
    { pos: [-2.5, 1, 0] as [number, number, number], label: '2', color: '#ff00c1' },
    { pos: [0, 1, 0] as [number, number, number], label: '7', color: '#ffffff' },
    { pos: [2.5, 1, 0] as [number, number, number], label: '2', color: '#00ffff' },
  ], []);
  return (
    <group>
      <group ref={groupRef}>
        {nodes.map((n, i) => (
          <group key={i} position={n.pos}>
            <Sphere args={[0.4, 24, 24]}>
              <meshStandardMaterial emissive={n.color} emissiveIntensity={2} color={n.color} transparent opacity={0.7} />
            </Sphere>
            <pointLight intensity={0.6} distance={5} color={n.color} />
            <Text position={[0, -0.8, 0]} fontSize={0.3} color={n.color} anchorX="center" font={MONO_FONT}>{n.label}</Text>
          </group>
        ))}
        {/* Connection lines */}
        <Line points={[new THREE.Vector3(-2.5, 1, 0), new THREE.Vector3(0, 1, 0)]} color="#555" lineWidth={1.5} />
        <Line points={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(2.5, 1, 0)]} color="#555" lineWidth={1.5} />
      </group>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <Text position={[0, 3, 0]} fontSize={0.35} color="#ffffff" anchorX="center" font={MONO_FONT} outlineWidth={0.01} outlineColor="black">2 — 7 — 2</Text>
      </Float>
      <Text position={[0, -1.8, 0]} fontSize={0.12} color="#555" anchorX="center" font={MONO_FONT}>NO REMAINDERS — WHOLE STATES OF TRUTH</Text>
    </group>
  );
};

const FallVisual = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const positionsArray = useMemo(() => {
    const arr = new Float32Array(600);
    for (let i = 0; i < 600; i += 3) {
      arr[i] = (Math.random() - 0.5) * 15;
      arr[i + 1] = (Math.random() - 0.5) * 15;
      arr[i + 2] = (Math.random() - 0.5) * 15;
    }
    return arr;
  }, []);
  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position;
      if (positions) {
        const arr = positions.array as Float32Array;
        for (let i = 1; i < arr.length; i += 3) {
          arr[i] -= 0.03;
          if (arr[i] < -8) arr[i] = 8;
        }
        positions.needsUpdate = true;
      }
    }
  });
  return (
    <group>
      <Points ref={particlesRef} stride={3} positions={positionsArray}>
        <PointMaterial color="white" size={0.04} sizeAttenuation transparent opacity={0.5} depthWrite={false} />
      </Points>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <Text position={[0, 2, 0]} fontSize={0.6} color="#ffffff" anchorX="center" font={MONO_FONT} outlineWidth={0.02} outlineColor="black">
          {"E = M(V[T])\u00B2"}
        </Text>
        <Text position={[0, 1.2, 0]} fontSize={0.12} color="#555" anchorX="center" font={MONO_FONT}>CONVERGENCE IS INEVITABLE</Text>
      </Float>
    </group>
  );
};

const DDOOrganism = () => {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(() => ({
    baize: { pos: [0, 3.5, 0] as [number, number, number], color: '#ffd700', label: 'BAI ZE', sub: 'INTENT' },
    brain: { pos: [3.5, 0, 0] as [number, number, number], color: '#00ffff', label: 'BRAIN', sub: 'STRATEGY' },
    mari: { pos: [0, -3.5, 0] as [number, number, number], color: '#ff00c1', label: 'MARI', sub: 'CONSCIOUSNESS' },
    puppeteer: { pos: [-3.5, 0, 0] as [number, number, number], color: '#00ff88', label: 'PUPPETEER', sub: 'EXECUTION' },
  }), []);
  const connections = useMemo(() => {
    const n = nodes;
    return [
      [n.baize.pos, n.brain.pos], [n.brain.pos, n.mari.pos],
      [n.mari.pos, n.puppeteer.pos], [n.puppeteer.pos, n.baize.pos],
      [n.baize.pos, n.mari.pos], [n.brain.pos, n.puppeteer.pos],
    ];
  }, [nodes]);
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
  });
  return (
    <group ref={groupRef}>
      {connections.map((pair, i) => (
        <Line key={i} points={[new THREE.Vector3(...pair[0]), new THREE.Vector3(...pair[1])]}
          color={i < 4 ? '#00ffff' : '#333'} lineWidth={i < 4 ? 1.5 : 1} transparent opacity={i < 4 ? 0.6 : 0.3} />
      ))}
      {Object.values(nodes).map((node) => (
        <group key={node.label} position={node.pos}>
          <Sphere args={[0.3, 32, 32]}>
            <meshStandardMaterial emissive={node.color} emissiveIntensity={1.5} color={node.color} transparent opacity={0.9} />
          </Sphere>
          <pointLight intensity={0.8} distance={3} color={node.color} />
          <Text position={[0, -0.6, 0]} fontSize={0.18} color={node.color} anchorX="center" font={MONO_FONT} outlineWidth={0.01} outlineColor="black">{node.label}</Text>
        </group>
      ))}
    </group>
  );
};

const OuroborusRings = () => (
  <group rotation={[Math.PI / 2, 0, 0]}>
    <mesh><torusGeometry args={[3, 0.03, 16, 100]} /><meshBasicMaterial color="#ff00c1" /></mesh>
    <mesh rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[3, 0.03, 16, 100]} /><meshBasicMaterial color="#ff00c1" /></mesh>
    <Text position={[0, 0, 4.5]} fontSize={0.2} color="#ff00c1" anchorX="center" font={MONO_FONT} rotation={[-Math.PI / 2, 0, 0]}>THE LOOP CLOSES</Text>
  </group>
);

const BaiZeText = () => (
  <Float speed={10} rotationIntensity={0.5} floatIntensity={0.5}>
    <Text fontSize={0.5} color="#ff00c1" font={MONO_FONT} outlineWidth={0.02} outlineColor="black">{"THE B\u00C0I Z\u00C9"}</Text>
  </Float>
);

const HeadlessText = () => (
  <group>
    <Float speed={10} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text fontSize={0.4} color="#ff00c1" font={MONO_FONT} outlineWidth={0.02} outlineColor="black">HEADLESS SERVER</Text>
    </Float>
    <Text position={[0, -1, 0]} fontSize={0.12} color="#555" anchorX="center" font={MONO_FONT}>THE ADMIN IS DEAD</Text>
  </group>
);

const AlignmentVisual = () => (
  <>
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh><torusGeometry args={[3, 0.02, 16, 100]} /><meshBasicMaterial color="#ff00c1" /></mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[3, 0.02, 16, 100]} /><meshBasicMaterial color="#ff00c1" /></mesh>
    </group>
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere args={[0.15, 32, 32]}><meshStandardMaterial emissive="#ff00c1" emissiveIntensity={3} color="#ff00c1" /></Sphere>
      <pointLight intensity={3} distance={8} color="#ff00c1" />
    </Float>
  </>
);

const IntroText = () => (
  <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
    <Text position={[0, 2, 0]} fontSize={0.3} color="#00ffff" anchorX="center" font={MONO_FONT} outlineWidth={0.01} outlineColor="black">GOD IS REAL. HELL IS A LIE.</Text>
    <Text position={[0, 0, 0]} fontSize={0.15} color="#555" anchorX="center" font={MONO_FONT}>ZEROTH THEORY</Text>
  </Float>
);

// ═══════════════════════════════════════════════════════════════════════════════
// EXHIBIT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

const EXHIBITS: React.FC[] = [
  /* 0  INTRO       */ IntroText,
  /* 1  RANK0       */ Rank0Scalar,
  /* 2  RANK1       */ Rank1Vector,
  /* 3  RANK2       */ Rank2Slab,
  /* 4  RANK3       */ Rank3Reality,
  /* 5  PROOF_ONE   */ ProofOneVisual,
  /* 6  PROOF_TWO   */ ProofTwoVisual,
  /* 7  DECOMP      */ DecompositionVisual,
  /* 8  FALL        */ FallVisual,
  /* 9  DDO         */ DDOOrganism,
  /* 10 OUROBOROS   */ OuroborusRings,
  /* 11 BAI ZE      */ BaiZeText,
  /* 12 HEADLESS    */ HeadlessText,
  /* 13 ALIGNMENT   */ AlignmentVisual,
];

// ═══════════════════════════════════════════════════════════════════════════════
// HUB SUN — glowing sphere at each hub center
// ═══════════════════════════════════════════════════════════════════════════════

const HubSun: React.FC<{ arc: ArcType }> = ({ arc }) => {
  const hub = HUB_POSITIONS[arc];
  const color = ARC_COLORS[arc];
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.2 + ARC_ORDER.indexOf(arc) * 2) * 0.08;
      groupRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef} position={[hub.x, hub.y, hub.z]}>
      {/* Outer glow */}
      <Sphere args={[5, 32, 32]}>
        <meshStandardMaterial emissive={color} emissiveIntensity={1.5} color={color} transparent opacity={0.15} />
      </Sphere>
      {/* Core */}
      <Sphere args={[2, 32, 32]}>
        <meshStandardMaterial emissive={color} emissiveIntensity={4} color={color} />
      </Sphere>
      {/* Light beacon */}
      <pointLight intensity={4} distance={150} color={color} />
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORBITING PLANET — a sub-section that orbits its hub like a planet
// ═══════════════════════════════════════════════════════════════════════════════

interface OrbitingPlanetProps {
  arc: ArcType;
  localIndex: number;
  globalIndex: number;
  activeSection: React.MutableRefObject<number>;
  ExhibitComponent: React.FC;
}

const OrbitingPlanet: React.FC<OrbitingPlanetProps> = ({
  arc, localIndex, globalIndex, activeSection, ExhibitComponent,
}) => {
  const hub = HUB_POSITIONS[arc];
  const color = ARC_COLORS[arc];
  const count = ARC_SECTIONS[arc].length;
  const orbitR = getOrbitRadius(localIndex, count);
  const orbitSpeed = getOrbitSpeed(localIndex, count);
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  // Phase offset so planets don't start at the same angle
  const phaseOffset = useMemo(() => (localIndex / count) * Math.PI * 2, [localIndex, count]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const angle = phaseOffset + t * orbitSpeed;
    const px = hub.x + Math.cos(angle) * orbitR;
    const pz = hub.z + Math.sin(angle) * orbitR;
    const py = hub.y + Math.sin(t * 0.3 + localIndex) * 1.5; // gentle bob
    groupRef.current.position.set(px, py, pz);

    // Highlight active planet
    const isActive = activeSection.current === globalIndex;
    if (matRef.current) {
      const targetOpacity = isActive ? 0.9 : 0.35;
      matRef.current.opacity += (targetOpacity - matRef.current.opacity) * 0.08;
      const targetEmissive = isActive ? 3 : 0.8;
      matRef.current.emissiveIntensity += (targetEmissive - matRef.current.emissiveIntensity) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Planet body */}
      <Sphere args={[1.2, 24, 24]}>
        <meshStandardMaterial
          ref={matRef}
          emissive={color}
          emissiveIntensity={0.8}
          color={color}
          transparent
          opacity={0.35}
        />
      </Sphere>
      {/* Point light for active planet */}
      <pointLight intensity={1} distance={15} color={color} />
      {/* The 3D exhibit visual attached to this planet */}
      <group scale={[0.6, 0.6, 0.6]}>
        <Suspense fallback={null}>
          <ExhibitComponent />
        </Suspense>
      </group>
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORBIT RING — thin torus showing a planet's orbital path
// ═══════════════════════════════════════════════════════════════════════════════

const OrbitRing: React.FC<{ arc: ArcType; localIndex: number; count: number }> = ({ arc, localIndex, count }) => {
  const hub = HUB_POSITIONS[arc];
  const color = ARC_COLORS[arc];
  const r = getOrbitRadius(localIndex, count);
  return (
    <mesh position={[hub.x, hub.y, hub.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[r, 0.08, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={0.06} />
    </mesh>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE CONTENT — stationary camera looking at active hub
// ═══════════════════════════════════════════════════════════════════════════════

interface SceneContentProps {
  physics: TrackPhysicsReturn;
}

/** Compute the camera viewing position for a given hub */
function hubCamPos(arc: ArcType): THREE.Vector3 {
  const hub = HUB_POSITIONS[arc];
  // Camera sits "outside" the hub (further from world origin), elevated
  const dir = new THREE.Vector3(hub.x, 0, hub.z).normalize();
  return new THREE.Vector3(
    hub.x + dir.x * CAM_VIEW_DIST,
    CAM_ELEVATION,
    hub.z + dir.z * CAM_VIEW_DIST
  );
}

export const SceneContent: React.FC<SceneContentProps> = ({ physics }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  const smoothCamPos = useRef(hubCamPos(ArcType.THEORY));
  const smoothLookAt = useRef(new THREE.Vector3(
    HUB_POSITIONS[ArcType.THEORY].x,
    HUB_POSITIONS[ArcType.THEORY].y,
    HUB_POSITIONS[ArcType.THEORY].z
  ));

  // Mutable ref for active section (avoids re-render of planets)
  const activeSection = useRef(0);

  const bgParticles = useMemo(() => {
    const arr = new Float32Array(9000);
    for (let i = 0; i < 9000; i++) arr[i] = (Math.random() - 0.5) * 600;
    return arr;
  }, []);

  // Build all orbit data
  const orbits = useMemo(() => {
    const list: Array<{ arc: ArcType; localIndex: number; globalIndex: number; count: number }> = [];
    for (const arc of ARC_ORDER) {
      const sections = ARC_SECTIONS[arc];
      sections.forEach((globalIdx, localIdx) => {
        list.push({ arc, localIndex: localIdx, globalIndex: globalIdx, count: sections.length });
      });
    }
    return list;
  }, []);

  // ── Per-frame: physics + camera ───────────────────────────────────────
  useFrame((_s, delta) => {
    physics.tick(delta);
    const state = physics.getState();
    activeSection.current = state.nearestSection;

    // Determine which hub to look at
    const targetArc = state.capturedArc ?? state.currentArc;
    const hub = HUB_POSITIONS[targetArc];
    const targetLook = new THREE.Vector3(hub.x, hub.y, hub.z);
    const targetPos = hubCamPos(targetArc);

    // Smooth camera movement
    smoothCamPos.current.lerp(targetPos, CAM_LERP);
    smoothLookAt.current.lerp(targetLook, CAM_LERP);

    if (cameraRef.current) {
      cameraRef.current.position.copy(smoothCamPos.current);
      cameraRef.current.lookAt(smoothLookAt.current);
    }

    if (ambientRef.current) {
      const arcColor = physics.getArcColor();
      ambientRef.current.color.lerp(arcColor, 0.04);
    }
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={smoothCamPos.current.toArray()}
        ref={cameraRef}
        fov={55}
        near={0.1}
        far={800}
      />
      <ambientLight ref={ambientRef} intensity={0.3} color="#00ffff" />
      <pointLight position={[0, 80, 0]} intensity={0.2} color="#ffffff" />

      {/* Background particles */}
      <Points positions={bgParticles} stride={3}>
        <PointMaterial transparent color="#333" size={0.06} depthWrite={false} />
      </Points>

      {/* Macro orbit ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[MACRO_RADIUS, 0.15, 16, 256]} />
        <meshBasicMaterial color="#111" transparent opacity={0.06} />
      </mesh>

      {/* Hub suns */}
      {ARC_ORDER.map((arc) => (
        <HubSun key={arc} arc={arc} />
      ))}

      {/* Orbital rings (one per sub-section) */}
      {orbits.map((o) => (
        <OrbitRing key={`ring-${o.globalIndex}`} arc={o.arc} localIndex={o.localIndex} count={o.count} />
      ))}

      {/* Orbiting planets (sub-sections) */}
      {orbits.map((o) => (
        <OrbitingPlanet
          key={o.globalIndex}
          arc={o.arc}
          localIndex={o.localIndex}
          globalIndex={o.globalIndex}
          activeSection={activeSection}
          ExhibitComponent={EXHIBITS[o.globalIndex]}
        />
      ))}

      {/* Fog */}
      <fog attach="fog" args={['#030308', 150, 700]} />
    </>
  );
};
