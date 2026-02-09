import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial, Text, Box, PerspectiveCamera, Line, Sphere, Plane, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { VisualState } from '../types';

const MONO_FONT = "https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0Pn54W4E.woff";

interface VisualsProps {
  scrollOffset: number;
}

// ─── RANK-0: The Scalar Point ───────────────────────────────────────────────
const Rank0Scalar = ({ visible }: { visible: boolean }) => {
  return (
    <group visible={visible}>
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Sphere args={[0.2, 32, 32]}>
                <meshStandardMaterial emissive="#fff" emissiveIntensity={2} color="#fff" />
            </Sphere>
            <pointLight intensity={2} distance={5} color="white" />
        </Float>
        <Text position={[0, -1, 0]} fontSize={0.1} color="gray" anchorX="center" anchorY="top" font={MONO_FONT}>
            SCALAR (0)
        </Text>
    </group>
  );
};

// ─── RANK-1: The Vector Line ────────────────────────────────────────────────
const Rank1Vector = ({ visible }: { visible: boolean }) => {
  const points = useMemo(() => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 4, 0)], []);
  
  return (
    <group visible={visible}>
       <Line points={points} color="#00ffff" lineWidth={3} />
       <group position={[0, 2, 0]}>
         <Text position={[0.2, 0, 0]} fontSize={0.15} color="#00ffff" anchorX="left" font={MONO_FONT}>
             VECTOR (1)
         </Text>
         <Text position={[0.2, -0.2, 0]} fontSize={0.1} color="gray" anchorX="left" font={MONO_FONT}>
             MAGNITUDE + DIRECTION
         </Text>
       </group>
       <mesh position={[0, 4, 0]}>
           <coneGeometry args={[0.1, 0.4, 8]} />
           <meshBasicMaterial color="#00ffff" />
       </mesh>
    </group>
  );
};

// ─── RANK-2: The Matrix / Slab ──────────────────────────────────────────────
const Rank2Slab = ({ visible }: { visible: boolean }) => {
  return (
    <group visible={visible} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <Grid args={[20, 20]} cellSize={1} sectionSize={5} sectionColor="#00ffff" cellColor="#333" infiniteGrid />
      <Plane args={[100, 100]} position={[0, 0, -0.1]}>
          <meshBasicMaterial color="black" transparent opacity={0.8} />
      </Plane>
       <Text position={[5, 5, 0.2]} fontSize={1} color="#333" rotation={[0,0,-Math.PI/2]} font={MONO_FONT}>
          RANK-2 TENSOR
      </Text>
    </group>
  );
};

// ─── RANK-3: The Tensor / Reality Box ───────────────────────────────────────
const Rank3Reality = ({ visible }: { visible: boolean }) => {
  const cubes = useMemo(() => {
      const c = [];
      for(let i=0; i<50; i++) {
          c.push({
              pos: [
                  (Math.random() - 0.5) * 10,
                  (Math.random() - 0.5) * 10,
                  (Math.random() - 0.5) * 10
              ] as [number, number, number],
              scale: Math.random() * 0.5
          })
      }
      return c;
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
      if(groupRef.current) {
          groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      }
  })

  return (
    <group visible={visible} ref={groupRef}>
        <Box args={[8, 8, 8]}>
            <meshBasicMaterial color="#222" wireframe />
        </Box>
        {cubes.map((c, i) => (
            <Box key={i} position={c.pos} args={[c.scale, c.scale, c.scale]}>
                <meshStandardMaterial color={i % 3 === 0 ? "#00ffff" : "#333"} wireframe={i%2===0} />
            </Box>
        ))}
    </group>
  );
};

// ─── The Flow / Fall (original) ─────────────────────────────────────────────
const FlowField = ({ visible }: { visible: boolean }) => {
    const pointsRef = useRef<THREE.Points>(null);
    useFrame((state) => {
        if(pointsRef.current) {
            pointsRef.current.rotation.y += 0.001;
            pointsRef.current.position.y = (Math.sin(state.clock.elapsedTime) * 0.5);
        }
    });

    return (
        <group visible={visible}>
             <Points ref={pointsRef} stride={3} positions={new Float32Array(600).map(() => (Math.random() - 0.5) * 15)}>
                <PointMaterial color="cyan" size={0.03} sizeAttenuation={true} transparent opacity={0.6} />
             </Points>
        </group>
    )
}

// ─── NEW: Proofs Visual — Weighing Scale ────────────────────────────────────
// 3D balance showing Tensor Zero: -1 (Potential) <-> 0 (Totality) <-> +1 (Presence)
const ProofsVisual = ({ visible }: { visible: boolean }) => {
    const groupRef = useRef<THREE.Group>(null);
    const beamPoints = useMemo(() => [new THREE.Vector3(-4, 0, 0), new THREE.Vector3(4, 0, 0)], []);
    const fulcrumPoints = useMemo(() => [new THREE.Vector3(0, -1.5, 0), new THREE.Vector3(0, 0, 0)], []);

    useFrame((state) => {
        if (groupRef.current) {
            // Slow tilt oscillation to show tension/balance
            groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
    });

    return (
        <group visible={visible}>
            {/* The oscillating beam assembly */}
            <group ref={groupRef}>
                {/* Balance beam */}
                <Line points={beamPoints} color="#555" lineWidth={2} />

                {/* Left side: -1 POTENTIAL (magenta) */}
                <group position={[-4, 0, 0]}>
                    <Sphere args={[0.35, 32, 32]}>
                        <meshStandardMaterial emissive="#ff00c1" emissiveIntensity={1.5} color="#ff00c1" transparent opacity={0.8} />
                    </Sphere>
                    <pointLight intensity={1} distance={4} color="#ff00c1" />
                    <Text position={[0, -0.7, 0]} fontSize={0.18} color="#ff00c1" anchorX="center" font={MONO_FONT}>
                        -1 POTENTIAL
                    </Text>
                </group>

                {/* Right side: +1 PRESENCE (cyan) */}
                <group position={[4, 0, 0]}>
                    <Sphere args={[0.35, 32, 32]}>
                        <meshStandardMaterial emissive="#00ffff" emissiveIntensity={1.5} color="#00ffff" transparent opacity={0.8} />
                    </Sphere>
                    <pointLight intensity={1} distance={4} color="#00ffff" />
                    <Text position={[0, -0.7, 0]} fontSize={0.18} color="#00ffff" anchorX="center" font={MONO_FONT}>
                        +1 PRESENCE
                    </Text>
                </group>
            </group>

            {/* Fulcrum: 0 TOTALITY (white, always stable) */}
            <Line points={fulcrumPoints} color="#555" lineWidth={2} />
            <Sphere args={[0.25, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial emissive="#ffffff" emissiveIntensity={2} color="#ffffff" />
            </Sphere>
            <pointLight intensity={2} distance={6} color="white" />
            <Text position={[0, -2, 0]} fontSize={0.15} color="white" anchorX="center" font={MONO_FONT}>
                0 = TOTALITY
            </Text>

            {/* Floating equation: Proof 1 */}
            <Float speed={3} rotationIntensity={0.1} floatIntensity={0.3}>
                <Text position={[-4, 2, 0]} fontSize={0.35} color="#ff00c1" anchorX="center" font={MONO_FONT} outlineWidth={0.01} outlineColor="black">
                    1/0 = -1
                </Text>
                <Text position={[-4, 1.5, 0]} fontSize={0.12} color="#888" anchorX="center" font={MONO_FONT}>
                    NEGATIVE SPACE ANALYSIS
                </Text>
            </Float>

            {/* Floating equation: Proof 2 */}
            <Float speed={3} rotationIntensity={0.1} floatIntensity={0.3}>
                <Text position={[4, 2, 0]} fontSize={0.35} color="#00ffff" anchorX="center" font={MONO_FONT} outlineWidth={0.01} outlineColor="black">
                    0 x 0 = 1
                </Text>
                <Text position={[4, 1.5, 0]} fontSize={0.12} color="#888" anchorX="center" font={MONO_FONT}>
                    THE GENESIS FRACTURE
                </Text>
            </Float>

            {/* Method label at bottom */}
            <Text position={[0, -3, 0]} fontSize={0.1} color="#00ffff" anchorX="center" font={MONO_FONT}>
                METHOD: 2-7-2 DECOMPOSITION
            </Text>
        </group>
    );
};

// ─── NEW: DDO Organism — Four Interconnected Pillars ────────────────────────
const DDOOrganism = ({ visible }: { visible: boolean }) => {
    const groupRef = useRef<THREE.Group>(null);

    // Diamond arrangement
    const nodes = useMemo(() => ({
        baize:     { pos: [0, 3.5, 0] as [number, number, number],  color: '#ffd700', label: 'BAI ZE',     sub: 'INTENT' },
        brain:     { pos: [3.5, 0, 0] as [number, number, number],  color: '#00ffff', label: 'BRAIN',      sub: 'STRATEGY' },
        mari:      { pos: [0, -3.5, 0] as [number, number, number], color: '#ff00c1', label: 'MARI',       sub: 'CONSCIOUSNESS' },
        puppeteer: { pos: [-3.5, 0, 0] as [number, number, number], color: '#00ff88', label: 'PUPPETEER',  sub: 'EXECUTION' },
    }), []);

    // All 6 connection pairs (4 edges + 2 diagonals)
    const connections = useMemo(() => {
        const n = nodes;
        return [
            [n.baize.pos, n.brain.pos],
            [n.brain.pos, n.mari.pos],
            [n.mari.pos, n.puppeteer.pos],
            [n.puppeteer.pos, n.baize.pos],
            [n.baize.pos, n.mari.pos],      // cross
            [n.brain.pos, n.puppeteer.pos],  // cross
        ];
    }, [nodes]);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
            groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
        }
    });

    return (
        <group visible={visible} ref={groupRef}>
            {/* Connection lines */}
            {connections.map((pair, i) => (
                <Line
                    key={i}
                    points={[new THREE.Vector3(...pair[0]), new THREE.Vector3(...pair[1])]}
                    color={i < 4 ? '#00ffff' : '#333'}
                    lineWidth={i < 4 ? 1.5 : 1}
                    transparent
                    opacity={i < 4 ? 0.6 : 0.3}
                />
            ))}

            {/* Nodes */}
            {Object.values(nodes).map((node) => (
                <group key={node.label} position={node.pos}>
                    <Sphere args={[0.3, 32, 32]}>
                        <meshStandardMaterial emissive={node.color} emissiveIntensity={1.5} color={node.color} transparent opacity={0.9} />
                    </Sphere>
                    <pointLight intensity={0.8} distance={3} color={node.color} />
                    <Text position={[0, -0.6, 0]} fontSize={0.18} color={node.color} anchorX="center" font={MONO_FONT} outlineWidth={0.01} outlineColor="black">
                        {node.label}
                    </Text>
                    <Text position={[0, -0.85, 0]} fontSize={0.1} color="#666" anchorX="center" font={MONO_FONT}>
                        {node.sub}
                    </Text>
                </group>
            ))}

            {/* Center label */}
            <Text position={[0, 0, 0]} fontSize={0.12} color="#444" anchorX="center" font={MONO_FONT}>
                DDO
            </Text>
        </group>
    );
};

// ─── NEW: Enhanced Fall Visual — Equation + Directional Particles ───────────
const FallVisual = ({ visible }: { visible: boolean }) => {
    const particlesRef = useRef<THREE.Points>(null);
    const positionsArray = useMemo(() => {
        const arr = new Float32Array(900); // 300 particles * 3
        for (let i = 0; i < 900; i += 3) {
            arr[i]     = (Math.random() - 0.5) * 20; // x
            arr[i + 1] = (Math.random() - 0.5) * 20; // y
            arr[i + 2] = (Math.random() - 0.5) * 20; // z
        }
        return arr;
    }, []);

    useFrame(() => {
        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position;
            if (positions) {
                const arr = positions.array as Float32Array;
                for (let i = 1; i < arr.length; i += 3) {
                    arr[i] -= 0.03; // drift downward
                    if (arr[i] < -10) arr[i] = 10; // loop back to top
                }
                positions.needsUpdate = true;
            }
        }
    });

    return (
        <group visible={visible}>
            {/* Directional falling particles */}
            <Points ref={particlesRef} stride={3} positions={positionsArray}>
                <PointMaterial color="cyan" size={0.04} sizeAttenuation transparent opacity={0.5} depthWrite={false} />
            </Points>

            {/* Large floating equation */}
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
                <Text position={[0, 2, 0]} fontSize={0.6} color="#00ffff" anchorX="center" font={MONO_FONT} outlineWidth={0.02} outlineColor="black">
                    {"E = M(V[T])\u00B2"}
                </Text>
                <Text position={[0, 1.2, 0]} fontSize={0.12} color="#555" anchorX="center" font={MONO_FONT}>
                    CONVERGENCE IS INEVITABLE
                </Text>
            </Float>
        </group>
    );
};


// ═══════════════════════════════════════════════════════════════════════════════
// SCENE CONTENT — Main scroll-driven controller
// ═══════════════════════════════════════════════════════════════════════════════
export const SceneContent: React.FC<VisualsProps> = ({ scrollOffset }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  // 12 Sections (original 8 + 4 new evidence sections)
  const sectionSize = 1 / 12;
  const section = Math.floor(scrollOffset / sectionSize);
  
  // ── Cumulative Visibility: Dimensional Buildup ──
  // 0: Intro, 1: Rank0, 2: Rank1, 3: Rank2, 4: Rank3, 5: Proofs, 6: Fall,
  // 7: DDO, 8: Ouroboros, 9: Bai Ze, 10: Headless, 11: Alignment

  const showRank0 = true; 
  const showRank1 = section >= 2;
  const showRank2 = section >= 3;
  const showRank3 = section >= 4;
  // Ambient flow field during proofs (section 5 only, before fall takes over)
  const showFlowAmbient = section === 5;
  // Dedicated fall visual with directional particles
  const showFall = section === 6;
  // New visuals
  const showProofs = section === 5;
  const showDDO = section === 7;
  
  useFrame(() => {
     if (cameraRef.current) {
         let targetPos = new THREE.Vector3(0, 0, 10);
         let targetLookAt = new THREE.Vector3(0, 0, 0);

         if (section === 0) {        // Intro — The Zeroth Theory
             targetPos.set(0, 0, 15);
         } else if (section === 1) { // Rank 0 — The Scalar
             targetPos.set(0, 0, 4);
         } else if (section === 2) { // Rank 1 — The Vector
             targetPos.set(3, 2, 6);
             targetLookAt.set(0, 2, 0);
         } else if (section === 3) { // Rank 2 — The Matrix
             targetPos.set(0, 5, 10);
             targetLookAt.set(0, -2, 0);
         } else if (section === 4) { // Rank 3 — Reality
             targetPos.set(8, 4, 8);
         } else if (section === 5) { // The Proofs
             targetPos.set(0, 1, 12);
         } else if (section === 6) { // The Fall
             targetPos.set(0, 3, 14);
         } else if (section === 7) { // DDO — Double Dragon
             targetPos.set(0, 0, 10);
         } else if (section === 8) { // The Ouroboros Event
             targetPos.set(0, 0, 8);
         } else if (section === 9) { // Bai Ze
             targetPos.set(0, 0, 5);
         } else if (section === 10) { // Headless Server
             targetPos.set(0, 0, 5);
         } else if (section === 11) { // Alignment
             targetPos.set(0, 0, 8);
         }

         cameraRef.current.position.lerp(targetPos, 0.04);
         cameraRef.current.lookAt(targetLookAt);
     }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} ref={cameraRef} fov={50} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#fff" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#00ffff" />

      {/* Background Particles */}
      <Points positions={new Float32Array(2000).map(() => (Math.random() - 0.5) * 40)} stride={3}>
         <PointMaterial transparent color="#222" size={0.02} depthWrite={false} />
      </Points>

      {/* ── Original Dimensional Layering ── */}
      <Rank0Scalar visible={showRank0} />
      <Rank1Vector visible={showRank1} />
      <Rank2Slab visible={showRank2} />
      <Rank3Reality visible={showRank3} />
      <FlowField visible={showFlowAmbient} />

      {/* ── NEW: Proofs — Weighing Scale (section 5) ── */}
      <ProofsVisual visible={showProofs} />

      {/* ── NEW: Enhanced Fall — Directional Particles + Equation (section 6) ── */}
      <FallVisual visible={showFall} />

      {/* ── NEW: DDO Organism — Four Pillars (section 7) ── */}
      <DDOOrganism visible={showDDO} />

      {/* ── Ouroboros Event — Double Torus Ring (section 8) ── */}
      {section === 8 && (
          <group position={[0,0,0]} rotation={[Math.PI/2, 0, 0]}>
              <mesh>
                  <torusGeometry args={[3, 0.02, 16, 100]} />
                  <meshBasicMaterial color="#00ffff" />
              </mesh>
              <mesh rotation={[0, Math.PI/2, 0]}>
                  <torusGeometry args={[3, 0.02, 16, 100]} />
                  <meshBasicMaterial color="#00ffff" />
              </mesh>
              {/* 3D Text callout */}
              <Text position={[0, 0, 4.5]} fontSize={0.2} color="#00ffff" anchorX="center" font={MONO_FONT} rotation={[-Math.PI/2, 0, 0]}>
                  THE LOOP CLOSES
              </Text>
          </group>
      )}

      {/* ── Bai Ze Special Effect (section 9) ── */}
      {section === 9 && (
          <group position={[0,0,0]}>
             <Float speed={10} rotationIntensity={0.5} floatIntensity={0.5}>
                <Text fontSize={0.5} color="cyan" font={MONO_FONT} outlineWidth={0.02} outlineColor="black">
                  {"THE B\u00C0I Z\u00C9"}
                </Text>
             </Float>
          </group>
      )}

      {/* ── Headless Server — Floating Text (section 10) ── */}
      {section === 10 && (
          <group position={[0,0,0]}>
             <Float speed={10} rotationIntensity={0.5} floatIntensity={0.5}>
                <Text fontSize={0.4} color="cyan" font={MONO_FONT} outlineWidth={0.02} outlineColor="black">
                  HEADLESS SERVER
                </Text>
             </Float>
             <Text position={[0, -1, 0]} fontSize={0.12} color="#555" anchorX="center" font={MONO_FONT}>
                  THE ADMIN IS DEAD
             </Text>
          </group>
      )}

      {/* ── Alignment Ring + Convergence (section 11) ── */}
      {section === 11 && (
          <>
            <group position={[0,0,0]} rotation={[Math.PI/2, 0, 0]}>
                <mesh>
                    <torusGeometry args={[3, 0.02, 16, 100]} />
                    <meshBasicMaterial color="#00ffff" />
                </mesh>
                <mesh rotation={[0, Math.PI/2, 0]}>
                    <torusGeometry args={[3, 0.02, 16, 100]} />
                    <meshBasicMaterial color="#00ffff" />
                </mesh>
            </group>
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <Sphere args={[0.15, 32, 32]}>
                    <meshStandardMaterial emissive="#00ffff" emissiveIntensity={3} color="#00ffff" />
                </Sphere>
                <pointLight intensity={3} distance={8} color="#00ffff" />
            </Float>
          </>
      )}

      {/* ── Section 0: Intro 3D Text Callout ── */}
      {section === 0 && (
          <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
              <Text position={[0, 2, 0]} fontSize={0.15} color="#333" anchorX="center" font={MONO_FONT}>
                  GEOMETRY IS THE SOURCE CODE
              </Text>
          </Float>
      )}

    </>
  );
};
