'use client';

import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import Spawner from './Spawner';
import CameraRig from './CameraRig';
import ArenaFloor from './ArenaFloor'; // <--- IMPORTAR

export default function GameScene() {
  return (
    <Canvas shadows camera={{ fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <Environment preset="city" />

      <CameraRig />

      <Physics debug={false}>
        
        <Spawner />

        {/* REEMPLAZAMOS EL SUELO VIEJO POR EL NUEVO */}
        <ArenaFloor />

        {/* PAREDES INVISIBLES (Estas se quedan fijas) */}
        <RigidBody type="fixed" position={[0, 2, -6]}>
           <CuboidCollider args={[8, 4, 0.5]} />
        </RigidBody>
        <RigidBody type="fixed" position={[0, 2, 6]}>
           <CuboidCollider args={[8, 4, 0.5]} />
        </RigidBody>
        <RigidBody type="fixed" position={[6, 2, 0]}>
           <CuboidCollider args={[0.5, 4, 8]} />
        </RigidBody>
        <RigidBody type="fixed" position={[-6, 2, 0]}>
           <CuboidCollider args={[0.5, 4, 8]} />
        </RigidBody>

      </Physics>
    </Canvas>
  );
}