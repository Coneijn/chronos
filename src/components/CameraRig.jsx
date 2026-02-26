import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore } from '@/store/gameStore';
import { useEffect, useState } from 'react';

export default function CameraRig() {
  const { camera, size } = useThree(); // 'size' nos da el ancho de la pantalla en pixeles
  const targetNumber = useGameStore((state) => state.targetNumber); // Escuchamos cambios de ronda
  
  // Posiciones objetivo
  const [targetPos, setTargetPos] = useState(new Vector3(0, 20, 20));

  // 1. Lógica de "Responsive" (Móvil vs PC)
  useEffect(() => {
    const isMobile = size.width < 768; // Breakpoint típico de móvil
    
    // Si es móvil, necesitamos alejar mucho más la cámara (Y y Z más altos)
    // para que el suelo de 50x50 quepa en una pantalla vertical.
    const finalY = isMobile ? 35 : 20; 
    const finalZ = isMobile ? 35 : 20;

    setTargetPos(new Vector3(0, finalY, finalZ));
  }, [size.width]);

  // 2. Efecto de "Reset" al iniciar ronda
  useEffect(() => {
    // Cuando cambia el número objetivo (nueva ronda), acercamos la cámara de golpe
    // para crear el efecto de que "empieza la acción"
    camera.position.set(0, 10, 5); 
  }, [targetNumber, camera]);

  // 3. El Loop de Animación (se ejecuta 60 veces por segundo)
  useFrame((state, delta) => {
    // Lerp (Linear Interpolation): Mueve la posición actual hacia la objetivo suavemente
    // El factor 'delta * 1.5' controla la velocidad del alejamiento.
    state.camera.position.lerp(targetPos, delta * 1.5);
    
    // Aseguramos que la cámara siempre mire al centro del suelo (0,0,0)
    state.camera.lookAt(0, 0, 0);
  });

  return null; // Este componente no renderiza nada visual, solo controla la cámara
}