'use client';

import { Canvas, useFrame } from '@react-three/fiber';
// NUEVO: Importamos Sparkles, Stars y color desde drei
import { Environment, Sparkles, Stars } from '@react-three/drei'; 
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '@/store/gameStore';

import Spawner from './Spawner';
import CameraRig from './CameraRig';
import ArenaFloor from './ArenaFloor';

function DynamicLight() {
  const intensity = useGameStore((state) => state.lightIntensity);
  const decreaseLight = useGameStore((state) => state.decreaseLight);
  const level = useGameStore((state) => state.level);
  
  // Extraemos el tema activo para cambiar la luz ambiental
  const activeTheme = useGameStore((state) => state.activeTheme);

  useFrame((state, delta) => {
    decreaseLight(delta, level);
  });

  // Ajustamos el tinte de la luz según el tema
// En DynamicLight, cambia el ambientColor del pastel a blanco para no lavar los colores
  const ambientColor = activeTheme === 'neon' ? '#bc13fe' : activeTheme === 'pastel' ? '#ffffff' : '#ffffff';
  return (
    <>
      <ambientLight intensity={0.2 * Math.max(0, intensity)} color={ambientColor} /> 
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={Math.max(0, intensity) * 2} 
        castShadow 
      />
      <Environment 
        preset={activeTheme === 'neon' ? 'night' : 'city'} 
        environmentIntensity={Math.max(0, intensity)} 
      />
    </>
  );
}

// NUEVO: Componente para renderizar los efectos de fondo
function ThemeEffects() {
  const activeTheme = useGameStore((state) => state.activeTheme);

  if (activeTheme === 'neon') {
    return (
      <>
        {/* Fondo oscuro cibernético */}
        <color attach="background" args={['#050510']} />
        {/* Estrellas dinámicas estilo viaje espacial */}
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={1} fade speed={2} />
      </>
    );
  }

  if (activeTheme === 'pastel') {
    return (
      <>
        {/* Cambiamos el fondo a un violeta crepuscular profundo */}
        <color attach="background" args={['#221e2e']} />
        {/* Las partículas se mantienen brillantes para dar el toque de "polvo de hadas" */}
        <Sparkles count={150} scale={20} size={6} speed={0.4} opacity={0.8} color="#ffb3ba" />
      </>
    );
  }

  // Tema Clásico por defecto
  return <color attach="background" args={['#1a1a2e']} />;
}

export default function GameScene() {
  return (
   <Canvas shadows camera={{ fov: 45 }}>
      <ThemeEffects />
      <DynamicLight />
      <CameraRig />

      <Physics debug={false}>
        <Spawner />
        <ArenaFloor />

        {/* PAREDES INVISIBLES */}
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