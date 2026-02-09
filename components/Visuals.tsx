import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial, Text, Box, PerspectiveCamera, Line, Sphere, Plane, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { VisualState } from '../types';

interface VisualsProps {
  scrollOffset: number;
}

// RANK-0: The Scalar Point
const Rank0Scalar = ({ visible }: { visible: boolean }) => {
  return (
    <group visible={visible}>
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Sphere args={[0.2, 32, 32]}>
                <meshStandardMaterial emissive="#fff" emissiveIntensity={2} color="#fff" />
            </Sphere>
            <pointLight intensity={2} distance={5} color="white" />
        </Float>
        <Text position={[0, -1, 0]} fontSize={0.1} color="gray" anchorX="center" anchorY="top">
            SCALAR (0)
        </Text>
    </group>
  );
};

// RANK-1: The Vector Line
const Rank1Vector = ({ visible }: { visible: boolean }) => {
  // A line extending from the center
  const points = useMemo(() => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 4, 0)], []);
  
  return (
    <group visible={visible}>
       <Line points={points} color="#00ffff" lineWidth={3} />
       <group position={[0, 2, 0]}>
         <Text position={[0.2, 0, 0]} fontSize={0.15} color="#00ffff" anchorX="left">
             VECTOR (1)
         </Text>
         <Text position={[0.2, -0.2, 0]} fontSize={0.1} color="gray" anchorX="left">
             MAGNITUDE + DIRECTION
         </Text>
       </group>
       {/* Arrow head */}
       <mesh position={[0, 4, 0]}>
           <coneGeometry args={[0.1, 0.4, 8]} />
           <meshBasicMaterial color="#00ffff" />
       </mesh>
    </group>
  );
};

// RANK-2: The Matrix / Slab
const Rank2Slab = ({ visible }: { visible: boolean }) => {
  return (
    <group visible={visible} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      {/* The Infinite Plane */}
      <Grid args={[20, 20]} cellSize={1} sectionSize={5} sectionColor="#00ffff" cellColor="#333" infiniteGrid />
      <Plane args={[100, 100]} position={[0, 0, -0.1]}>
          <meshBasicMaterial color="black" transparent opacity={0.8} />
      </Plane>
       <Text position={[5, 5, 0.2]} fontSize={1} color="#333" rotation={[0,0,-Math.PI/2]}>
          RANK-2 TENSOR
      </Text>
    </group>
  );
};

// RANK-3: The Tensor / Reality Box
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

// The Flow / Fall
const FlowField = ({ visible }: { visible: boolean }) => {
    const pointsRef = useRef<THREE.Points>(null);
    useFrame((state) => {
        if(pointsRef.current) {
            // Visualize the flow falling downwards towards singularity (conceptually)
            // Or falling through the geometry
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

export const SceneContent: React.FC<VisualsProps> = ({ scrollOffset }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  // 12 Sections (original 8 + 4 new evidence sections)
  const sectionSize = 1 / 12;
  const section = Math.floor(scrollOffset / sectionSize);
  
  // Cumulative Visibility Logic for Dimensional Buildup (original logic preserved)
  // 0: Intro, 1: Rank0, 2: Rank1, 3: Rank2, 4: Rank3, 5: Proofs, 6: Fall,
  // 7: DDO, 8: Ouroboros, 9: Bai Ze, 10: Headless, 11: Alignment

  // Rank 0 is always the base
  const showRank0 = true; 
  // Rank 1 appears at section 2
  const showRank1 = section >= 2;
  // Rank 2 appears at section 3
  const showRank2 = section >= 3;
  // Rank 3 appears at section 4
  const showRank3 = section >= 4;
  // Flow field appears at Proofs (section 5) and persists through Fall (section 6)
  const showFall = section >= 5 && section <= 6;
  
  useFrame((state) => {
     if (cameraRef.current) {
         // Cinematic Camera Moves
         let targetPos = new THREE.Vector3(0, 0, 10);
         let targetLookAt = new THREE.Vector3(0, 0, 0);

         if (section === 0) { // Intro — The Zeroth Theory
             targetPos.set(0, 0, 15);
         } else if (section === 1) { // Rank 0 — The Scalar
             targetPos.set(0, 0, 4);
         } else if (section === 2) { // Rank 1 — The Vector
             targetPos.set(3, 2, 6);
             targetLookAt.set(0, 2, 0);
         } else if (section === 3) { // Rank 2 — The Matrix
             targetPos.set(0, 5, 10);
             targetLookAt.set(0, -2, 0); // Look down at slab
         } else if (section === 4) { // Rank 3 — Reality
             targetPos.set(8, 4, 8);
         } else if (section === 5) { // The Proofs — Evidence
             targetPos.set(0, 0, 20); // Pull back to see all dimensions
         } else if (section === 6) { // The Fall
             targetPos.set(0, 0, 20); // Same pull-back as original
         } else if (section === 7) { // DDO — Double Dragon
             targetPos.set(5, 3, 12);
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

      {/* Visual Components - Dimensional Layering (original) */}
      <Rank0Scalar visible={showRank0} />
      <Rank1Vector visible={showRank1} />
      <Rank2Slab visible={showRank2} />
      <Rank3Reality visible={showRank3} />
      <FlowField visible={showFall} />

      {/* Ouroboros Event — Double Torus Ring (section 8) */}
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
          </group>
      )}

      {/* Bai Ze Special Effect (section 9, original) */}
      {section === 9 && (
          <group position={[0,0,0]}>
             <Float speed={10} rotationIntensity={0.5} floatIntensity={0.5}>
                <Text fontSize={0.5} color="cyan" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0Pn54W4E.woff" outlineWidth={0.02} outlineColor="black">
                  THE BÀI ZÉ
                </Text>
             </Float>
          </group>
      )}

      {/* Headless Server — Floating Text (section 10, new) */}
      {section === 10 && (
          <group position={[0,0,0]}>
             <Float speed={10} rotationIntensity={0.5} floatIntensity={0.5}>
                <Text fontSize={0.4} color="cyan" font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0Pn54W4E.woff" outlineWidth={0.02} outlineColor="black">
                  HEADLESS SERVER
                </Text>
             </Float>
          </group>
      )}

      {/* Alignment Ring + Convergence (section 11, original + enhanced) */}
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

    </>
  );
};