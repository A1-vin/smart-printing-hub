import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const PrinterBody = () => {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={group} scale={0.75}>
      {/* Main Body Base */}
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[2.5, 0.6, 2]} />
        <meshStandardMaterial color="#050505" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Stacked Sections with Teal Glass Layers */}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[0, i * 0.5 - 0.2, 0]}>
          {/* Black Block */}
          <mesh>
            <boxGeometry args={[2.4, 0.45, 1.9]} />
            <meshStandardMaterial color="#080808" roughness={0.3} metalness={0.7} />
          </mesh>
          
          {/* Teal Glass Layer */}
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[2.6, 0.05, 2.1]} />
            <meshStandardMaterial 
              color="#4fd1c5" 
              transparent 
              opacity={0.4} 
              emissive="#4fd1c5" 
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>
      ))}

      {/* Top Scanner Section */}
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[2.6, 0.4, 2.1]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} />
      </mesh>

      {/* Scanner Lid with Gap */}
      <mesh position={[0, 2.5, 0]} rotation={[-0.05, 0, 0]}>
        <boxGeometry args={[2.6, 0.1, 2.1]} />
        <meshStandardMaterial color="#050505" />
      </mesh>

      {/* Control Panel Area */}
      <mesh position={[0, 1.8, 1.05]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[1.8, 0.6, 0.1]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Multi-colored Buttons Grid */}
      <group position={[0, 1.8, 1.1]} rotation={[-0.4, 0, 0]}>
        {[
          { color: '#3B82F6', pos: [-0.6, 0.15, 0] }, // Blue
          { color: '#EF4444', pos: [-0.2, 0.15, 0] }, // Red
          { color: '#06B6D4', pos: [0.2, 0.15, 0] },  // Cyan
          { color: '#3B82F6', pos: [0.6, 0.15, 0] },  // Blue
          { color: '#10B981', pos: [-0.6, -0.15, 0] }, // Green
          { color: '#6366F1', pos: [0.6, -0.15, 0] },  // Purple
        ].map((btn, i) => (
          <mesh key={i} position={[btn.pos[0], btn.pos[1], btn.pos[2]]}>
            <boxGeometry args={[0.3, 0.2, 0.05]} />
            <meshStandardMaterial color={btn.color} emissive={btn.color} emissiveIntensity={0.6} />
          </mesh>
        ))}
        {/* Large Black Button */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.6, 0.15, 0.05]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>

      {/* Paper Output Slot Detail */}
      <mesh position={[0, 1.4, 1.05]}>
        <boxGeometry args={[1.2, 0.05, 0.2]} />
        <meshStandardMaterial color="#4fd1c5" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

export const Printer3D = () => {
  return (
    <div className="w-full h-[600px] cursor-grab active:cursor-grabbing">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[5, 3, 5]} fov={35} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <PrinterBody />
        </Float>

        <ContactShadows 
          position={[0, -1, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2.5} 
          far={4} 
        />
        
        <OrbitControls 
          enableZoom={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.5} 
        />
      </Canvas>
    </div>
  );
};
