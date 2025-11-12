import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { FurnitureItem } from '@/types/furniture';

interface FurnitureObjectProps {
  item: FurnitureItem;
  isSelected: boolean;
  roomBounds: { width: number; depth: number };
  allItems: FurnitureItem[];
  onSelect: (id: string) => void;
  onDrag: (id: string, position: [number, number, number]) => void;
  onRotate: (id: string, rotation: number) => void;
}

const DetailedFurniture = ({ 
  type, 
  dimensions, 
  color, 
  isSelected
}: { 
  type: string; 
  dimensions: [number, number, number]; 
  color: string;
  isSelected: boolean;
}) => {
  const [width, height, depth] = dimensions;
  const baseColor = isSelected ? '#00acc1' : color;

  switch (type) {
    case 'counter':
    case 'cabinet-floor':
      return (
        <group>
          {/* Main body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={baseColor} roughness={0.6} metalness={0.1} />
          </mesh>
          {/* Countertop */}
          <mesh position={[0, height / 2 + 0.02, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, 0.04, depth]} />
            <meshStandardMaterial color={isSelected ? '#00acc1' : '#4a4a4a'} roughness={0.3} metalness={0.3} />
          </mesh>
          {/* Drawer lines */}
          {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[0, -height / 2 + (i + 1) * (height / 4), depth / 2 + 0.01]} castShadow>
              <boxGeometry args={[width * 0.9, 0.02, 0.02]} />
              <meshStandardMaterial color="#333" />
            </mesh>
          ))}
          {/* Handles */}
          {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[0, -height / 2 + (i + 1) * (height / 4), depth / 2 + 0.03]} castShadow>
              <cylinderGeometry args={[0.01, 0.01, width * 0.3, 8]} />
              <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </group>
      );

    case 'cabinet-wall':
      return (
        <group>
          {/* Main body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={baseColor} roughness={0.6} metalness={0.1} />
          </mesh>
          {/* Door frame */}
          <mesh position={[0, 0, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.9, height * 0.9, 0.02]} />
            <meshStandardMaterial color={isSelected ? '#00bcd4' : '#5a4a3a'} />
          </mesh>
          {/* Handle */}
          <mesh position={[width * 0.3, 0, depth / 2 + 0.03]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, height * 0.4, 8]} />
            <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      );

    case 'fridge':
      return (
        <group>
          {/* Main body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Top door */}
          <mesh position={[0, height * 0.15, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.95, height * 0.6, 0.02]} />
            <meshStandardMaterial color={isSelected ? '#00bcd4' : '#ddd'} />
          </mesh>
          {/* Bottom door */}
          <mesh position={[0, -height * 0.3, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.95, height * 0.35, 0.02]} />
            <meshStandardMaterial color={isSelected ? '#00bcd4' : '#ddd'} />
          </mesh>
          {/* Handles */}
          <mesh position={[width * 0.35, height * 0.15, depth / 2 + 0.03]} castShadow>
            <boxGeometry args={[0.05, height * 0.2, 0.02]} />
            <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[width * 0.35, -height * 0.3, depth / 2 + 0.03]} castShadow>
            <boxGeometry args={[0.05, height * 0.15, 0.02]} />
            <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      );

    case 'sink':
      return (
        <group>
          {/* Counter base */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={baseColor} roughness={0.6} metalness={0.1} />
          </mesh>
          {/* Countertop */}
          <mesh position={[0, height / 2 + 0.02, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, 0.04, depth]} />
            <meshStandardMaterial color="#4a4a4a" roughness={0.3} metalness={0.3} />
          </mesh>
          {/* Sink basin */}
          <mesh position={[0, height / 2 - 0.1, 0]} castShadow>
            <boxGeometry args={[width * 0.6, 0.2, depth * 0.7]} />
            <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.7} />
          </mesh>
          {/* Faucet */}
          <mesh position={[0, height / 2 + 0.15, -depth * 0.2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );

    case 'oven':
      return (
        <group>
          {/* Main body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={baseColor} roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Glass door */}
          <mesh position={[0, height * 0.1, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.9, height * 0.6, 0.02]} />
            <meshStandardMaterial 
              color={isSelected ? '#00bcd4' : '#1a1a1a'} 
              transparent 
              opacity={0.6}
              metalness={0.5}
            />
          </mesh>
          {/* Control panel */}
          <mesh position={[0, height * 0.45, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.9, height * 0.1, 0.01]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Handle */}
          <mesh position={[0, height * 0.1, depth / 2 + 0.03]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, width * 0.7, 8]} />
            <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      );

    case 'dishwasher':
      return (
        <group>
          {/* Main body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Door */}
          <mesh position={[0, 0, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.95, height * 0.95, 0.02]} />
            <meshStandardMaterial color={isSelected ? '#00bcd4' : '#ddd'} />
          </mesh>
          {/* Control panel */}
          <mesh position={[0, height * 0.4, depth / 2 + 0.02]} castShadow>
            <boxGeometry args={[width * 0.8, height * 0.1, 0.01]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Handle */}
          <mesh position={[0, height * 0.3, depth / 2 + 0.03]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, width * 0.6, 8]} />
            <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      );

    case 'door':
      return (
        <group>
          {/* Door frame */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={isSelected ? '#00acc1' : '#6B4423'} roughness={0.7} metalness={0.1} />
          </mesh>
          {/* Door panel */}
          <mesh position={[0, 0, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.9, height * 0.95, 0.02]} />
            <meshStandardMaterial color={isSelected ? '#00bcd4' : '#8B5A2B'} roughness={0.5} />
          </mesh>
          {/* Door handle */}
          <mesh position={[width * 0.3, 0, depth / 2 + 0.04]} castShadow>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Panel details */}
          <mesh position={[0, height * 0.2, depth / 2 + 0.02]} castShadow>
            <boxGeometry args={[width * 0.7, height * 0.3, 0.01]} />
            <meshStandardMaterial color={isSelected ? '#00acc1' : '#704214'} />
          </mesh>
          <mesh position={[0, -height * 0.2, depth / 2 + 0.02]} castShadow>
            <boxGeometry args={[width * 0.7, height * 0.3, 0.01]} />
            <meshStandardMaterial color={isSelected ? '#00acc1' : '#704214'} />
          </mesh>
        </group>
      );

    case 'window':
      return (
        <group>
          {/* Window frame */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={isSelected ? '#00acc1' : '#E8E8E8'} roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Glass pane */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.9, height * 0.9, depth * 0.5]} />
            <meshStandardMaterial 
              color={isSelected ? '#00bcd4' : '#87CEEB'} 
              transparent 
              opacity={0.4}
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>
          {/* Window cross frame - vertical */}
          <mesh position={[0, 0, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[0.03, height * 0.9, 0.02]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          {/* Window cross frame - horizontal */}
          <mesh position={[0, 0, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.9, 0.03, 0.02]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>
      );

    default:
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={dimensions} />
          <meshStandardMaterial color={baseColor} />
        </mesh>
      );
  }
};

export const FurnitureObject = ({
  item,
  isSelected,
  roomBounds,
  allItems,
  onSelect,
  onDrag,
  onRotate,
}: FurnitureObjectProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const transformRef = useRef<any>(null);
  const { camera, gl } = useThree();
  
  const dimensions: [number, number, number] = [
    item.dimensions.width,
    item.dimensions.height,
    item.dimensions.depth
  ];

  useEffect(() => {
    if (transformRef.current) {
      const controls = transformRef.current;
      
      const handleChange = () => {
        if (groupRef.current) {
          const pos = groupRef.current.position;
          const rot = groupRef.current.rotation;
          
          // Calculate rotated dimensions for bounds checking
          const rotation = rot.y % (Math.PI * 2);
          const isRotated90 = Math.abs(rotation - Math.PI / 2) < 0.1 || Math.abs(rotation - (3 * Math.PI / 2)) < 0.1;
          const effectiveWidth = isRotated90 ? dimensions[2] / 2 : dimensions[0] / 2;
          const effectiveDepth = isRotated90 ? dimensions[0] / 2 : dimensions[2] / 2;
          
          const maxX = roomBounds.width / 2 - effectiveWidth;
          const maxZ = roomBounds.depth / 2 - effectiveDepth;
          
          // Apply room bounds
          pos.x = Math.max(-maxX, Math.min(maxX, pos.x));
          pos.z = Math.max(-maxZ, Math.min(maxZ, pos.z));
          
          // For wall-mounted items, constrain Y axis
          if (item.isWallMounted) {
            pos.y = Math.max(0.5, Math.min(2.5, pos.y));
          } else {
            pos.y = item.position[1]; // Keep original Y for floor items
          }
          
          onDrag(item.id, [pos.x, pos.y, pos.z]);
          onRotate(item.id, rot.y);
        }
      };
      
      controls.addEventListener('change', handleChange);
      controls.addEventListener('dragging-changed', (event: any) => {
        if (event.value === false && groupRef.current) {
          // When dragging ends, snap rotation to 90° increments
          const rot = groupRef.current.rotation.y;
          const snappedRot = Math.round(rot / (Math.PI / 2)) * (Math.PI / 2);
          groupRef.current.rotation.y = snappedRot;
          onRotate(item.id, snappedRot);
        }
      });
      
      return () => {
        controls.removeEventListener('change', handleChange);
      };
    }
  }, [item.id, item.isWallMounted, item.position, roomBounds, dimensions, onDrag, onRotate]);

  return (
    <>
      <group ref={groupRef} position={item.position} rotation={[0, item.rotation, 0]}>
        <group onClick={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}>
          <DetailedFurniture 
            type={item.type} 
            dimensions={dimensions} 
            color={item.color}
            isSelected={isSelected}
          />
        </group>
        
        {isSelected && (
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(...dimensions)]} />
            <lineBasicMaterial color="#00acc1" linewidth={3} />
          </lineSegments>
        )}
      </group>
      
      {isSelected && (
        <TransformControls
          ref={transformRef}
          object={groupRef.current} // issue of mouse navigation
          camera={camera}
          domElement={gl.domElement}
          mode="translate"
          showX={true}
          showY={item.isWallMounted}
          showZ={true}
        />
      )}
    </>
  );
};

















// import { useRef, useEffect, Suspense } from 'react';
// import { useThree } from '@react-three/fiber';
// import { TransformControls, useGLTF } from '@react-three/drei';
// import * as THREE from 'three';
// import { FurnitureItem } from '@/types/furniture';

// interface FurnitureObjectProps {
//   item: FurnitureItem;
//   isSelected: boolean;
//   roomBounds: { width: number; depth: number };
//   allItems: FurnitureItem[];
//   onSelect: (id: string) => void;
//   onDrag: (id: string, position: [number, number, number]) => void;
//   onRotate: (id: string, rotation: number) => void;
// }

// // موديلات جاهزة لكل نوع أثاث
// const furnitureModels: Record<string, string> = {
//   fridge: '/models/fridge.glb',
//   oven: '/models/oven.glb',
//   sink: '/models/sink.glb',
//   'cabinet-floor': '/models/cabinet-floor.glb',
//   'cabinet-wall': '/models/cabinet-wall.glb',
//   dishwasher: '/models/dishwasher.glb',
//   counter: '/models/counter.glb',
//   door: '/models/door.glb',
//   window: '/models/window.glb',
// };

// const FurnitureModel = ({ type, isSelected }: { type: string; isSelected: boolean }) => {
//   const modelUrl = furnitureModels[type];
//   if (!modelUrl) return null;

//   const { scene } = useGLTF(modelUrl);
//   // لو عايز تقدر تغير اللون للموديل
//   scene.traverse((child: any) => {
//     if (child.isMesh) {
//       child.castShadow = true;
//       child.receiveShadow = true;
//       if (isSelected) child.material.color.set('#00acc1');
//     }
//   });

//   return <primitive object={scene} />;
// };

// export const FurnitureObject = ({
//   item,
//   isSelected,
//   roomBounds,
//   allItems,
//   onSelect,
//   onDrag,
//   onRotate,
// }: FurnitureObjectProps) => {
//   const groupRef = useRef<THREE.Group>(null);
//   const transformRef = useRef<any>(null);
//   const { camera, gl } = useThree();

//   useEffect(() => {
//     if (!transformRef.current) return;
//     const controls = transformRef.current;

//     const handleChange = () => {
//       if (groupRef.current) {
//         const pos = groupRef.current.position;
//         const rot = groupRef.current.rotation;

//         const maxX = roomBounds.width / 2;
//         const maxZ = roomBounds.depth / 2;

//         pos.x = Math.max(-maxX, Math.min(maxX, pos.x));
//         pos.z = Math.max(-maxZ, Math.min(maxZ, pos.z));

//         if (item.isWallMounted) {
//           pos.y = Math.max(0.5, Math.min(2.5, pos.y));
//         } else {
//           pos.y = item.position[1];
//         }

//         onDrag(item.id, [pos.x, pos.y, pos.z]);
//         onRotate(item.id, rot.y);
//       }
//     };

//     controls.addEventListener('change', handleChange);
//     controls.addEventListener('dragging-changed', (event: any) => {
//       if (!groupRef.current) return;
//       if (!event.value) {
//         const rot = groupRef.current.rotation.y;
//         const snappedRot = Math.round(rot / (Math.PI / 2)) * (Math.PI / 2);
//         groupRef.current.rotation.y = snappedRot;
//         onRotate(item.id, snappedRot);
//       }
//     });

//     return () => {
//       controls.removeEventListener('change', handleChange);
//     };
//   }, [item, roomBounds, onDrag, onRotate]);

//   return (
//     <group ref={groupRef} position={item.position} rotation={[0, item.rotation, 0]}>
//       {isSelected && (
//         <TransformControls
//           ref={transformRef}
//           camera={camera}
//           domElement={gl.domElement}
//           mode="translate"
//           showX
//           showY={item.isWallMounted}
//           showZ
//         />
//       )}

//       <group onClick={(e) => {
//         e.stopPropagation();
//         onSelect(item.id);
//       }}>
//         <Suspense fallback={null}>
//           <FurnitureModel type={item.type} isSelected={isSelected} />
//         </Suspense>
//       </group>

//       {isSelected && item.dimensions && (
//         <lineSegments>
//           <edgesGeometry args={[new THREE.BoxGeometry(
//             item.dimensions.width,
//             item.dimensions.height,
//             item.dimensions.depth
//           )]} />
//           <lineBasicMaterial color="#00acc1" linewidth={3} />
//         </lineSegments>
//       )}
//     </group>
//   );
// };
