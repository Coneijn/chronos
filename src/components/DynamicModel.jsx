import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

// Precargar los modelos evita "tirones" la primera vez que aparecen
useGLTF.preload('/models/trex.glb');
useGLTF.preload('/models/stego.glb');
useGLTF.preload('/models/bronto.glb');

export default function DynamicModel({ shape, color, scale }) {
  // 1. Asignar el archivo correcto según la forma lógica
  const modelPath = 
    shape === 'box' ? '/models/trex.glb' : 
    shape === 'sphere' ? '/models/stego.glb' : 
    '/models/bronto.glb';

  // 2. Cargar el modelo crudo
  const { scene } = useGLTF(modelPath);

  // 3. Clonar y Colorear
  // useMemo asegura que solo hagamos este cálculo intensivo una vez por dinosaurio
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // "traverse" recorre todas las partes del modelo 3D
    clone.traverse((node) => {
      if (node.isMesh) {
        // Reemplazamos su material original por uno nuevo con el color de nuestra paleta
        node.material = new THREE.MeshStandardMaterial({ 
          color: color,
          roughness: 0.4, // Un poco brillante, como plástico
        });
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return clone;
  }, [scene, color]);

  // Renderizamos la escena clonada y coloreada
  return <primitive object={clonedScene} scale={scale} />;
}