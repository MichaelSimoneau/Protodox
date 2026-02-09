import React, { Suspense, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Points, PointMaterial, Text, Box, PerspectiveCamera, Line, Sphere, Plane, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { TrackPhysicsReturn } from '../useTrackPhysics';

const MONO_FONT = "https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@2.304/fonts/webfonts/JetBrainsMono-Regular.woff2";
const TRACK_RADIUS = 100;
const TOTAL_SECTIONS = 12;
const SIDE_OFFSET_DIST = 8;       // reduced from 15 — keeps exhibits in FOV
const FORWARD_OFFSET = 0.35;      // place exhibit 35% ahead toward next section
const VISIBILITY_DIST = 80;

// ═══════════════════════════════════════════════════════════════════════════════
// TRACK GEOMETRY
// ═══════════════════════════════════════════════════════════════════════════════

/** Build the closed-loop CatmullRom track with 12 control points */
function buildTrack(): THREE.CatmullRomCurve3 {
  const points = Array.from({ length: TOTAL_SECTIONS }, (_, i) => {
    const angle = (i / TOTAL_SECTIONS) * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle) * TRACK_RADIUS,
      Math.sin(angle * 2) * 20,  // gentle vertical wave
      Math.sin(angle) * TRACK_RADIUS
    );
  });
  return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5);
}

/** Compute the position for an exhibit station — placed AHEAD of the
 *  camera's settle point so the exhibit is visible in the forward FOV. */
function getStationPosition(
  track: THREE.CatmullRomCurve3,
  index: number,
  side: 'left' | 'right'
): THREE.Vector3 {
  // Place exhibit ahead on the track (toward the next section)
  const aheadT = ((index + FORWARD_OFFSET) / TOTAL_SECTIONS) % 1;
  const pos = track.getPointAt(aheadT);
  const tangent = track.getTangentAt(aheadT);
  const up = new THREE.Vector3(0, 1, 0);
  const sideDir = tangent.clone().cross(up).normalize();
  const sign = side === 'right' ? 1 : -1;
  return pos.clone().add(sideDir.multiplyScalar(SIDE_OFFSET_DIST * sign));
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXHIBIT COMPONENTS (unchanged from before, just accept position)
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

const ProofsVisual = () => {
  const groupRef = useRef<THREE.Group>(null);
  const beamPoints = useMemo(() => [new THREE.Vector3(-4, 0, 0), new THREE.Vector3(4, 0, 0)], []);
  const fulcrumPoints = useMemo(() => [new THREE.Vector3(0, -1.5, 0), new THREE.Vector3(0, 0, 0)], []);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });
  return (
    <group>
      <group ref={groupRef}>
        <Line points={beamPoints} color="#555" lineWidth={2} />
        <group position={[-4, 0, 0]}>
          <Sphere args={[0.35, 32, 32]}>
            <meshStandardMaterial emissive="#ff00c1" emissiveIntensity={1.5} color="#ff00c1" transparent opacity={0.8} />
          </Sphere>
          <pointLight intensity={1} distance={4} color="#ff00c1" />
          <Text position={[0, -0.7, 0]} fontSize={0.18} color="#ff00c1" anchorX="center" font={MONO_FONT}>-1 POTENTIAL</Text>
        </group>
        <group position={[4, 0, 0]}>
          <Sphere args={[0.35, 32, 32]}>
            <meshStandardMaterial emissive="#00ffff" emissiveIntensity={1.5} color="#00ffff" transparent opacity={0.8} />
          </Sphere>
          <pointLight intensity={1} distance={4} color="#00ffff" />
          <Text position={[0, -0.7, 0]} fontSize={0.18} color="#00ffff" anchorX="center" font={MONO_FONT}>+1 PRESENCE</Text>
        </group>
      </group>
      <Line points={fulcrumPoints} color="#555" lineWidth={2} />
      <Sphere args={[0.25, 32, 32]}>
        <meshStandardMaterial emissive="#ffffff" emissiveIntensity={2} color="#ffffff" />
      </Sphere>
      <Text position={[0, -2, 0]} fontSize={0.15} color="white" anchorX="center" font={MONO_FONT}>0 = TOTALITY</Text>
      <Float speed={3} rotationIntensity={0.1} floatIntensity={0.3}>
        <Text position={[-4, 2, 0]} fontSize={0.35} color="#ff00c1" anchorX="center" font={MONO_FONT} outlineWidth={0.01} outlineColor="black">1/0 = -1</Text>
      </Float>
      <Float speed={3} rotationIntensity={0.1} floatIntensity={0.3}>
        <Text position={[4, 2, 0]} fontSize={0.35} color="#00ffff" anchorX="center" font={MONO_FONT} outlineWidth={0.01} outlineColor="black">0 x 0 = 1</Text>
      </Float>
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
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
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
    <mesh>
      <torusGeometry args={[3, 0.03, 16, 100]} />
      <meshBasicMaterial color="#ff00c1" />
    </mesh>
    <mesh rotation={[0, Math.PI / 2, 0]}>
      <torusGeometry args={[3, 0.03, 16, 100]} />
      <meshBasicMaterial color="#ff00c1" />
    </mesh>
    <Text position={[0, 0, 4.5]} fontSize={0.2} color="#ff00c1" anchorX="center" font={MONO_FONT} rotation={[-Math.PI / 2, 0, 0]}>THE LOOP CLOSES</Text>
  </group>
);

const BaiZeText = () => (
  <Float speed={10} rotationIntensity={0.5} floatIntensity={0.5}>
    <Text fontSize={0.5} color="#ff00c1" font={MONO_FONT} outlineWidth={0.02} outlineColor="black">
      {"THE B\u00C0I Z\u00C9"}
    </Text>
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
      <mesh>
        <torusGeometry args={[3, 0.02, 16, 100]} />
        <meshBasicMaterial color="#ff00c1" />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[3, 0.02, 16, 100]} />
        <meshBasicMaterial color="#ff00c1" />
      </mesh>
    </group>
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere args={[0.15, 32, 32]}>
        <meshStandardMaterial emissive="#ff00c1" emissiveIntensity={3} color="#ff00c1" />
      </Sphere>
      <pointLight intensity={3} distance={8} color="#ff00c1" />
    </Float>
  </>
);

const IntroText = () => (
  <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
    <Text position={[0, 2, 0]} fontSize={0.3} color="#00ffff" anchorX="center" font={MONO_FONT} outlineWidth={0.01} outlineColor="black">
      GEOMETRY IS THE SOURCE CODE
    </Text>
    <Text position={[0, 0, 0]} fontSize={0.15} color="#555" anchorX="center" font={MONO_FONT}>
      PROTODOX
    </Text>
  </Float>
);

// ═══════════════════════════════════════════════════════════════════════════════
// EXHIBIT REGISTRY — maps section index to its React component
// ═══════════════════════════════════════════════════════════════════════════════

const EXHIBITS: React.FC[] = [
  IntroText,       // 0: Zeroth Theory
  Rank0Scalar,     // 1: Rank-0
  Rank1Vector,     // 2: Rank-1
  Rank2Slab,       // 3: Rank-2
  Rank3Reality,    // 4: Rank-3
  ProofsVisual,    // 5: The Proofs
  FallVisual,      // 6: The Fall
  DDOOrganism,     // 7: DDO
  OuroborusRings,  // 8: Ouroboros
  BaiZeText,       // 9: Bai Ze
  HeadlessText,    // 10: Headless
  AlignmentVisual, // 11: Alignment
];

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE CONTENT — physics-driven camera on the cosmic track
// ═══════════════════════════════════════════════════════════════════════════════

interface SceneContentProps {
  physics: TrackPhysicsReturn;
}

export const SceneContent: React.FC<SceneContentProps> = ({ physics }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const { clock } = useThree();

  // ── Build track + station data (once) ─────────────────────────────────
  const { track, stations } = useMemo(() => {
    const t = buildTrack();
    const s = Array.from({ length: TOTAL_SECTIONS }, (_, i) => {
      const side = i % 2 === 0 ? 'right' as const : 'left' as const;
      return {
        basePos: getStationPosition(t, i, side),
        side,
      };
    });
    return { track: t, stations: s };
  }, []);

  // ── Per-frame: physics tick + camera + atmosphere ─────────────────────
  useFrame(() => {
    physics.tick();
    const state = physics.getState();

    if (cameraRef.current) {
      const camPos = track.getPointAt(state.t);
      const lookAhead = track.getPointAt((state.t + 0.008) % 1);
      cameraRef.current.position.copy(camPos);
      cameraRef.current.lookAt(lookAhead);
    }

    if (ambientRef.current) {
      const arcColor = physics.getArcColor();
      ambientRef.current.color.copy(arcColor);
    }
  });

  // ── Compute orbiting exhibit positions each frame ─────────────────────
  // We use a wrapper component to handle per-exhibit orbit + proximity

  // Stable background particle positions (created once)
  const bgParticles = useMemo(() => {
    const arr = new Float32Array(6000);
    for (let i = 0; i < 6000; i++) arr[i] = (Math.random() - 0.5) * 400;
    return arr;
  }, []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, TRACK_RADIUS]} ref={cameraRef} fov={70} near={0.1} far={600} />
      <ambientLight ref={ambientRef} intensity={0.4} color="#00ffff" />
      <pointLight position={[0, 50, 0]} intensity={0.4} color="#ffffff" />

      {/* Background particles (expanded for cosmic space) */}
      <Points positions={bgParticles} stride={3}>
        <PointMaterial transparent color="#555" size={0.05} depthWrite={false} />
      </Points>

      {/* Distributed arc-tinted point lights along the track */}
      {Array.from({ length: 12 }, (_, i) => {
        const t = i / 12;
        const pos = track.getPointAt(t);
        const arcT = t < 5 / 12 ? '#00ffff' : t < 7 / 12 ? '#ffffff' : '#ff00c1';
        return <pointLight key={`tl-${i}`} position={[pos.x, pos.y + 10, pos.z]} intensity={0.25} distance={60} color={arcT} />;
      })}

      {/* Exhibit stations — each orbits and has proximity visibility */}
      {stations.map((station, i) => (
        <ExhibitStation
          key={i}
          index={i}
          basePos={station.basePos}
          physics={physics}
          track={track}
          clock={clock}
          ExhibitComponent={EXHIBITS[i]}
        />
      ))}

      {/* Fog — far pushed out so stars remain visible */}
      <fog attach="fog" args={['#050505', 100, 500]} />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXHIBIT STATION — handles orbit animation + proximity visibility per exhibit
// ═══════════════════════════════════════════════════════════════════════════════

interface ExhibitStationProps {
  index: number;
  basePos: THREE.Vector3;
  physics: TrackPhysicsReturn;
  track: THREE.CatmullRomCurve3;
  clock: THREE.Clock;
  ExhibitComponent: React.FC;
}

const ExhibitStation: React.FC<ExhibitStationProps> = ({ index, basePos, physics, track, clock, ExhibitComponent }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    // Orbit: small drift around base position
    const time = clock.getElapsedTime();
    const orbitAngle = time * 0.15 + index * 0.5;
    const orbitR = 3;
    const ox = Math.cos(orbitAngle) * orbitR;
    const oy = Math.sin(orbitAngle * 0.7) * 1.5;
    const oz = Math.sin(orbitAngle) * orbitR;

    groupRef.current.position.set(
      basePos.x + ox,
      basePos.y + oy,
      basePos.z + oz
    );

    // Proximity visibility
    const state = physics.getState();
    const camPos = track.getPointAt(state.t);
    const dist = camPos.distanceTo(groupRef.current.position);
    groupRef.current.visible = dist < VISIBILITY_DIST;
  });

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        <ExhibitComponent />
      </Suspense>
    </group>
  );
};
