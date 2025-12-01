import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

interface DynamicModelLoaderProps {
  modelPath: string;
  color: string;
  isSelected: boolean;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

export const DynamicModelLoader = ({ 
  modelPath, 
  color, 
  isSelected,
  dimensions 
}: DynamicModelLoaderProps) => {
  const { scene } = useGLTF(modelPath);
  
  // Clone the scene to avoid sharing materials between instances
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  // Calculate scale to fit target dimensions
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    
    const scaleX = dimensions.width / size.x;
    const scaleY = dimensions.height / size.y;
    const scaleZ = dimensions.depth / size.z;
    
    // Use the smallest scale to fit within bounds
    return Math.min(scaleX, scaleY, scaleZ);
  }, [clonedScene, dimensions]);
  
  // Apply color and selection tint to all meshes
  useMemo(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Apply color or selection highlight
        if (child.material) {
          const material = child.material as THREE.MeshStandardMaterial;
          if (isSelected) {
            material.emissive = new THREE.Color('#00acc1');
            material.emissiveIntensity = 0.3;
          } else {
            material.emissive = new THREE.Color(0x000000);
            material.emissiveIntensity = 0;
          }
        }
      }
    });
  }, [clonedScene, color, isSelected]);
  
  return <primitive object={clonedScene} scale={scale} />;
};

// Preload common models
useGLTF.preload('/models/door/door.gltf');
useGLTF.preload('/models/window/window.gltf');
useGLTF.preload('/models/wall/wall.gltf');
useGLTF.preload('/models/ceiling_fan.gltf/ceiling_fan_1k.gltf');
useGLTF.preload('/models/Decor/Decor.gltf');
useGLTF.preload('/models/kitchen_cabinet.gltf/kitchen_cabinet.gltf');
useGLTF.preload('/models/Dining_Set/Dining_Set.glb');
useGLTF.preload('/models/table-kitchen/Kitchen_Table.glb');

