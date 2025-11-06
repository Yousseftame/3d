import { useRef, useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { FurnitureItem } from '@/types/furniture';

interface FurnitureObjectProps {
  item: FurnitureItem;
  isSelected: boolean;
  roomBounds: { width: number; depth: number };
  onSelect: (id: string) => void;
  onDragStart: () => void;
  onDrag: (id: string, position: [number, number, number]) => void;
  onDragEnd: () => void;
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
  onSelect,
  onDragStart,
  onDrag,
  onDragEnd,
}: FurnitureObjectProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPlane] = useState(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const [offset] = useState(() => new THREE.Vector3());
  
  const dimensions: [number, number, number] = [
    item.dimensions.width,
    item.dimensions.height,
    item.dimensions.depth
  ];

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect(item.id);
    
    const intersectionPoint = e.point;
    offset.copy(intersectionPoint).sub(new THREE.Vector3(...item.position));
    
    setIsDragging(true);
    onDragStart();
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();

    const ray = e.ray;
    const intersectPoint = new THREE.Vector3();
    ray.intersectPlane(dragPlane, intersectPoint);
    
    intersectPoint.sub(offset);
    
    const halfWidth = dimensions[0] / 2;
    const halfDepth = dimensions[2] / 2;
    
    const maxX = roomBounds.width / 2 - halfWidth;
    const maxZ = roomBounds.depth / 2 - halfDepth;
    
    intersectPoint.x = Math.max(-maxX, Math.min(maxX, intersectPoint.x));
    intersectPoint.z = Math.max(-maxZ, Math.min(maxZ, intersectPoint.z));
    intersectPoint.y = item.position[1]; // Maintain current Y position
    
    onDrag(item.id, [intersectPoint.x, intersectPoint.y, intersectPoint.z]);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    }
  };

  return (
    <group ref={groupRef} position={item.position} rotation={[0, item.rotation, 0]}>
      <group
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
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
  );
};
