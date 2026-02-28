'use client'; 

import { useRef, useState, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';

export default function ArenaFloor() {
  const rigidBody = useRef();
  const shakeTrigger = useGameStore((state) => state.shakeTrigger);
  const activeTheme = useGameStore((state) => state.activeTheme); // Extraemos el tema
  
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (shakeTrigger === 0) return; 

    setIsShaking(true);
    const timer = setTimeout(() => {
      setIsShaking(false);
      if (rigidBody.current) {
        rigidBody.current.setNextKinematicTranslation({ x: 0, y: -1, z: 0 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [shakeTrigger]);

  useFrame((state) => {
    if (!isShaking || !rigidBody.current) return;

    const time = state.clock.getElapsedTime();
    const frequency = time * 40;
    const shakeY = Math.sin(frequency) * 0.15; 
    const shakeX = (Math.random() - 0.5) * 0.1;
    const shakeZ = (Math.random() - 0.5) * 0.1;

    rigidBody.current.setNextKinematicTranslation({ 
      x: 0 + shakeX, 
      y: -1 + shakeY, 
      z: 0 + shakeZ 
    });
  });

  // Definir colores del suelo según el tema
// Cambiamos el '#fdf4ff' (blanco rosado) por '#4a4e69' (pizarra oscuro/púrpura apagado)
  const floorColor = activeTheme === 'neon' ? '#09090b' : activeTheme === 'pastel' ? '#4a4e69' : '#333333';
  return (
    <RigidBody 
      ref={rigidBody}
      type="kinematicPosition" 
      colliders="cuboid" 
      restitution={0.2} 
      friction={1} 
      position={[0, -1, 0]}
    >
      <mesh receiveShadow>
        <boxGeometry args={[50, 2, 50]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>
      
      {/* CUADRÍCULA LÁSER PARA EL TEMA NEÓN */}
      {activeTheme === 'neon' && (
        <gridHelper args={[50, 50, '#bc13fe', '#00ffff']} position={[0, 1.01, 0]} />
      )}
    </RigidBody>
  );
}