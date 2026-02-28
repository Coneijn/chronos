import { useMemo, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useGameStore } from '@/store/gameStore';
import { sfx } from '@/utils/SoundManager'; // Importamos el audio
import { THEMES } from '@/utils/gameConstants'; // <--- Añadir
import DynamicModel from './DynamicModel';      // <--- Añadir
export default function Spawner() {
  const objectsData = useGameStore((state) => state.objectsData);
  const roundVersion = useGameStore((state) => state.roundVersion);

  // 1. SONIDO DE APARICIÓN (SPAWN)
  useEffect(() => {
    // Pequeño delay para que no suene antes de verse
    const timer = setTimeout(() => {
        sfx.playSpawn();
    }, 100);
    return () => clearTimeout(timer);
  }, [roundVersion]);

  // 2. CALCULAR POSICIONES
  const objectsWithPos = useMemo(() => {
    return objectsData.map((data) => ({
      ...data,
      position: [
        (Math.random() - 0.5) * 6, 
        5 + Math.random() * 10, 
        (Math.random() - 0.5) * 6
      ],
      // Objetos más grandes y "jugosos" para mejor visibilidad
      scale: 0.8 + Math.random() * 0.4 
    }));
  }, [objectsData]); 

  // 3. MANEJADOR DE COLISIONES (Sonido de impacto)
  const handleCollision = ({ totalForceMagnitude }) => {
    // Filtro simple para no saturar el audio:
    // Solo suena el 30% de las veces para evitar efecto "ametralladora"
    if (Math.random() > 0.7) { 
        // Pasamos una "fuerza" simulada para variar el volumen
        sfx.playImpact(Math.random() * 10);
    }
  };

  return (
    <>
      {objectsWithPos.map((obj, index) => {
        // Obtenemos si el tema actual requiere modelos 3D
        const activeThemeId = useGameStore.getState().activeTheme;
        const isModel = THEMES[activeThemeId].isModel;

        return (
          <RigidBody 
            key={`${roundVersion}-${index}`} 
            position={obj.position} 
            colliders={obj.shape === 'sphere' ? 'ball' : 'cuboid'}
            restitution={0.7}
            friction={0.5}
            onCollisionEnter={handleCollision} 
          >
            {/* Si es modelo 3D, usamos nuestro nuevo componente */}
            {isModel ? (
               <DynamicModel shape={obj.shape} color={obj.color} scale={obj.scale} />
            ) : (
               // Si no, renderizamos las figuras geométricas clásicas
               <mesh castShadow scale={obj.scale}>
                 {obj.shape === 'box' && <boxGeometry />}
                 {obj.shape === 'sphere' && <sphereGeometry args={[1, 32, 32]} />}
                 {obj.shape === 'cone' && <coneGeometry args={[1, 1, 32]} />}
                 <meshStandardMaterial color={obj.color} />
               </mesh>
            )}
          </RigidBody>
        );
      })}
    </>
  );
}