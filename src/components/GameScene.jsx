'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '@/store/gameStore';

import Spawner from './Spawner';
import CameraRig from './CameraRig';
import ArenaFloor from './ArenaFloor';

// === COMPONENTE DE LUZ DINÁMICA ===
function DynamicLight() {
  // Obtenemos el estado y las acciones necesarias del store
  const intensity = useGameStore((state) => state.lightIntensity);
  const decreaseLight = useGameStore((state) => state.decreaseLight);
  const level = useGameStore((state) => state.level);

  // useFrame se ejecuta en cada fotograma (aprox 60 veces por segundo)
  useFrame((state, delta) => {
    decreaseLight(delta, level);
  });

  return (
    <>
      {/* Luz ambiental base: se oscurece junto con el resto */}
      <ambientLight intensity={0.2 * Math.max(0, intensity)} /> 
      
      {/* Luz principal con sombras */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={Math.max(0, intensity) * 2} // Multiplicamos por 2 para que sea brillante al inicio
        castShadow 
      />
      
      {/* El HDRI de fondo: environmentIntensity controla cuánta luz emite el cielo/ciudad */}
      <Environment 
        preset="city" 
        environmentIntensity={Math.max(0, intensity)} 
      />
    </>
  );
}

// === ESCENA PRINCIPAL ===
export default function GameScene() {
  return (
   <Canvas shadows camera={{ fov: 45 }}>
      {/* Reemplazamos las luces estáticas por nuestro controlador dinámico */}
      <DynamicLight />
      
      <CameraRig />

      <Physics debug={false}>
        
        <Spawner />

        {/* El suelo principal de la arena */}
        <ArenaFloor />

        {/* PAREDES INVISIBLES (Evitan que los objetos caigan fuera del mapa) */}
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