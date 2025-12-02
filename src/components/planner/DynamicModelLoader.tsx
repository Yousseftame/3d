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
  
  // Clone and prepare the scene
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    return cloned;
  }, [scene]);
  
  // Calculate the original size and center
  const { originalSize, originalCenter } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    return { originalSize: size, originalCenter: center };
  }, [clonedScene]);
  
  // Calculate scale to match target dimensions
  const scale = useMemo(() => {
    const scaleX = dimensions.width / originalSize.x;
    const scaleY = dimensions.height / originalSize.y;
    const scaleZ = dimensions.depth / originalSize.z;
    
    return [scaleX, scaleY, scaleZ] as [number, number, number];
  }, [originalSize, dimensions]);
  
  // Calculate position offset to center the scaled model
  const positionOffset = useMemo(() => {
    return [
      -originalCenter.x * scale[0],
      -originalCenter.y * scale[1],
      -originalCenter.z * scale[2]
    ] as [number, number, number];
  }, [originalCenter, scale]);
  
  // Apply color and selection tint to all meshes
  useMemo(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.material) {
          const material = child.material as THREE.MeshStandardMaterial;
          // Always tint the base color so catalog color is visible even with textures
          material.color = new THREE.Color(color);

          // Apply selection highlight on top
          if (isSelected) {
            material.emissive = new THREE.Color('#00acc1');
            material.emissiveIntensity = 0.4;
          } else {
            material.emissive = new THREE.Color(0x000000);
            material.emissiveIntensity = 0;
          }
        }
      }
    });
  }, [clonedScene, color, isSelected]);
  
  return <primitive object={clonedScene} scale={scale} position={positionOffset} />;
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
useGLTF.preload('/models/tv/Tv.glb'); 
