'use client'; // Agrega esto por seguridad

import { useRef, useState, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/store/gameStore';

export default function ArenaFloor() {
  const rigidBody = useRef();
  const shakeTrigger = useGameStore((state) => state.shakeTrigger);
  
  // Estado local para controlar si está temblando actualmente
  const [isShaking, setIsShaking] = useState(false);

  // 1. DETECTAR EL ERROR
  useEffect(() => {
    if (shakeTrigger === 0) return; // Ignorar carga inicial

    // Activar temblor
    setIsShaking(true);

    // Desactivar después de 500ms
    const timer = setTimeout(() => {
      setIsShaking(false);
      // Resetear posición exacta al terminar
      if (rigidBody.current) {
        rigidBody.current.setNextKinematicTranslation({ x: 0, y: -1, z: 0 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [shakeTrigger]);

  // 2. ANIMACIÓN DEL TEMBLOR
  useFrame((state) => {
    if (!isShaking || !rigidBody.current) return;

    // En src/components/ArenaFloor.jsx

// ... dentro de useFrame((state) => { ...

    const time = state.clock.getElapsedTime();
    
    // === AJUSTE DE INTENSIDAD ===
    
    // 1. Frecuencia (Velocidad de vibración):
    // Bajamos de 50 a 40 para que sea un poco menos frenético.
    const frequency = time * 40;

    // 2. Amplitud Vertical (Altura del salto):
    // BAJAMOS DRÁSTICAMENTE DE 0.5 A 0.15
    const shakeY = Math.sin(frequency) * 0.15; 

    // 3. Amplitud Horizontal (Vibración lateral):
    // Bajamos de 0.2 a 0.1 para que no se dispersen tanto hacia los lados.
    const shakeX = (Math.random() - 0.5) * 0.1;
    const shakeZ = (Math.random() - 0.5) * 0.1;

    // Aplicar el movimiento
    rigidBody.current.setNextKinematicTranslation({ 
      x: 0 + shakeX, 
      y: -1 + shakeY, // La posición base sigue siendo -1
      z: 0 + shakeZ 
    });
// ...
  });

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
        <meshStandardMaterial color="#333" />
      </mesh>
    </RigidBody>
  );
}