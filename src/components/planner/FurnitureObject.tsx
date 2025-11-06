import { useRef, useState, useCallback } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { FurnitureItem } from '@/types/furniture';

interface FurnitureObjectProps {
  item: FurnitureItem;
  isSelected: boolean;
  roomBounds: { width: number; depth: number };
  allItems: FurnitureItem[];
  snapToGrid: boolean;
  gridSize: number;
  onSelect: (id: string) => void;
  onDragStart: () => void;
  onDrag: (id: string, position: [number, number, number]) => void;
  onDragEnd: () => void;
}

const DetailedFurniture = ({ 
  type, 
  dimensions, 
  color, 
  isSelected,
  isDragging
}: { 
  type: string; 
  dimensions: [number, number, number]; 
  color: string;
  isSelected: boolean;
  isDragging: boolean;
}) => {
  const [width, height, depth] = dimensions;
  const baseColor = isSelected ? '#00acc1' : color;
  const opacity = isDragging ? 0.7 : 1;

  switch (type) {
    case 'counter':
    case 'cabinet-floor':
      return (
        <group>
          {/* Main body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={baseColor} roughness={0.6} metalness={0.1} transparent opacity={opacity} />
          </mesh>
          {/* Countertop */}
          <mesh position={[0, height / 2 + 0.02, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, 0.04, depth]} />
            <meshStandardMaterial color={isSelected ? '#00acc1' : '#4a4a4a'} roughness={0.3} metalness={0.3} transparent opacity={opacity} />
          </mesh>
          {/* Drawer lines */}
          {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[0, -height / 2 + (i + 1) * (height / 4), depth / 2 + 0.01]} castShadow>
              <boxGeometry args={[width * 0.9, 0.02, 0.02]} />
              <meshStandardMaterial color="#333" transparent opacity={opacity} />
            </mesh>
          ))}
          {/* Handles */}
          {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[0, -height / 2 + (i + 1) * (height / 4), depth / 2 + 0.03]} castShadow>
              <cylinderGeometry args={[0.01, 0.01, width * 0.3, 8]} />
              <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} transparent opacity={opacity} />
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
            <meshStandardMaterial color={baseColor} roughness={0.6} metalness={0.1} transparent opacity={opacity} />
          </mesh>
          {/* Door frame */}
          <mesh position={[0, 0, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.9, height * 0.9, 0.02]} />
            <meshStandardMaterial color={isSelected ? '#00bcd4' : '#5a4a3a'} transparent opacity={opacity} />
          </mesh>
          {/* Handle */}
          <mesh position={[width * 0.3, 0, depth / 2 + 0.03]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, height * 0.4, 8]} />
            <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} transparent opacity={opacity} />
          </mesh>
        </group>
      );

    case 'fridge':
      return (
        <group>
          {/* Main body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.4} transparent opacity={opacity} />
          </mesh>
          {/* Top door */}
          <mesh position={[0, height * 0.15, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.95, height * 0.6, 0.02]} />
            <meshStandardMaterial color={isSelected ? '#00bcd4' : '#ddd'} transparent opacity={opacity} />
          </mesh>
          {/* Bottom door */}
          <mesh position={[0, -height * 0.3, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.95, height * 0.35, 0.02]} />
            <meshStandardMaterial color={isSelected ? '#00bcd4' : '#ddd'} transparent opacity={opacity} />
          </mesh>
          {/* Handles */}
          <mesh position={[width * 0.35, height * 0.15, depth / 2 + 0.03]} castShadow>
            <boxGeometry args={[0.05, height * 0.2, 0.02]} />
            <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} transparent opacity={opacity} />
          </mesh>
          <mesh position={[width * 0.35, -height * 0.3, depth / 2 + 0.03]} castShadow>
            <boxGeometry args={[0.05, height * 0.15, 0.02]} />
            <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} transparent opacity={opacity} />
          </mesh>
        </group>
      );

    case 'sink':
      return (
        <group>
          {/* Counter base */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={baseColor} roughness={0.6} metalness={0.1} transparent opacity={opacity} />
          </mesh>
          {/* Countertop */}
          <mesh position={[0, height / 2 + 0.02, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, 0.04, depth]} />
            <meshStandardMaterial color="#4a4a4a" roughness={0.3} metalness={0.3} transparent opacity={opacity} />
          </mesh>
          {/* Sink basin */}
          <mesh position={[0, height / 2 - 0.1, 0]} castShadow>
            <boxGeometry args={[width * 0.6, 0.2, depth * 0.7]} />
            <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.7} transparent opacity={opacity} />
          </mesh>
          {/* Faucet */}
          <mesh position={[0, height / 2 + 0.15, -depth * 0.2]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} transparent opacity={opacity} />
          </mesh>
        </group>
      );

    case 'oven':
      return (
        <group>
          {/* Main body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={baseColor} roughness={0.4} metalness={0.2} transparent opacity={opacity} />
          </mesh>
          {/* Glass door */}
          <mesh position={[0, height * 0.1, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.9, height * 0.6, 0.02]} />
            <meshStandardMaterial 
              color={isSelected ? '#00bcd4' : '#1a1a1a'} 
              transparent 
              opacity={isDragging ? 0.4 : 0.6}
              metalness={0.5}
            />
          </mesh>
          {/* Control panel */}
          <mesh position={[0, height * 0.45, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.9, height * 0.1, 0.01]} />
            <meshStandardMaterial color="#333" transparent opacity={opacity} />
          </mesh>
          {/* Handle */}
          <mesh position={[0, height * 0.1, depth / 2 + 0.03]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, width * 0.7, 8]} />
            <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} transparent opacity={opacity} />
          </mesh>
        </group>
      );

    case 'dishwasher':
      return (
        <group>
          {/* Main body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.4} transparent opacity={opacity} />
          </mesh>
          {/* Door */}
          <mesh position={[0, 0, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.95, height * 0.95, 0.02]} />
            <meshStandardMaterial color={isSelected ? '#00bcd4' : '#ddd'} transparent opacity={opacity} />
          </mesh>
          {/* Control panel */}
          <mesh position={[0, height * 0.4, depth / 2 + 0.02]} castShadow>
            <boxGeometry args={[width * 0.8, height * 0.1, 0.01]} />
            <meshStandardMaterial color="#333" transparent opacity={opacity} />
          </mesh>
          {/* Handle */}
          <mesh position={[0, height * 0.3, depth / 2 + 0.03]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, width * 0.6, 8]} />
            <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} transparent opacity={opacity} />
          </mesh>
        </group>
      );

    case 'door':
      return (
        <group>
          {/* Door frame */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={isSelected ? '#00acc1' : '#6B4423'} roughness={0.7} metalness={0.1} transparent opacity={opacity} />
          </mesh>
          {/* Door panel */}
          <mesh position={[0, 0, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.9, height * 0.95, 0.02]} />
            <meshStandardMaterial color={isSelected ? '#00bcd4' : '#8B5A2B'} roughness={0.5} transparent opacity={opacity} />
          </mesh>
          {/* Door handle */}
          <mesh position={[width * 0.3, 0, depth / 2 + 0.04]} castShadow>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} transparent opacity={opacity} />
          </mesh>
          {/* Panel details */}
          <mesh position={[0, height * 0.2, depth / 2 + 0.02]} castShadow>
            <boxGeometry args={[width * 0.7, height * 0.3, 0.01]} />
            <meshStandardMaterial color={isSelected ? '#00acc1' : '#704214'} transparent opacity={opacity} />
          </mesh>
          <mesh position={[0, -height * 0.2, depth / 2 + 0.02]} castShadow>
            <boxGeometry args={[width * 0.7, height * 0.3, 0.01]} />
            <meshStandardMaterial color={isSelected ? '#00acc1' : '#704214'} transparent opacity={opacity} />
          </mesh>
        </group>
      );

    case 'window':
      return (
        <group>
          {/* Window frame */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={isSelected ? '#00acc1' : '#E8E8E8'} roughness={0.4} metalness={0.2} transparent opacity={opacity} />
          </mesh>
          {/* Glass pane */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[width * 0.9, height * 0.9, depth * 0.5]} />
            <meshStandardMaterial 
              color={isSelected ? '#00bcd4' : '#87CEEB'} 
              transparent 
              opacity={isDragging ? 0.3 : 0.4}
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>
          {/* Window cross frame - vertical */}
          <mesh position={[0, 0, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[0.03, height * 0.9, 0.02]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={opacity} />
          </mesh>
          {/* Window cross frame - horizontal */}
          <mesh position={[0, 0, depth / 2 + 0.01]} castShadow>
            <boxGeometry args={[width * 0.9, 0.03, 0.02]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={opacity} />
          </mesh>
        </group>
      );

    default:
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={dimensions} />
          <meshStandardMaterial color={baseColor} transparent opacity={opacity} />
        </mesh>
      );
  }
};

export const FurnitureObject = ({
  item,
  isSelected,
  roomBounds,
  allItems,
  snapToGrid,
  gridSize,
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

  const checkCollisionWithOthers = useCallback((testPosition: THREE.Vector3): boolean => {
    const halfWidth = dimensions[0] / 2;
    const halfDepth = dimensions[2] / 2;
    const halfHeight = dimensions[1] / 2;

    // Calculate rotated dimensions
    const rotation = item.rotation % (Math.PI * 2);
    const isRotated90 = Math.abs(rotation - Math.PI / 2) < 0.1 || Math.abs(rotation - (3 * Math.PI / 2)) < 0.1;
    const effectiveWidth = isRotated90 ? halfDepth : halfWidth;
    const effectiveDepth = isRotated90 ? halfWidth : halfDepth;

    const margin = 0.05;
    const testBox = {
      minX: testPosition.x - effectiveWidth - margin,
      maxX: testPosition.x + effectiveWidth + margin,
      minY: testPosition.y - halfHeight - margin,
      maxY: testPosition.y + halfHeight + margin,
      minZ: testPosition.z - effectiveDepth - margin,
      maxZ: testPosition.z + effectiveDepth + margin,
    };

    return allItems.some(otherItem => {
      if (otherItem.id === item.id) return false;

      const otherHalfWidth = otherItem.dimensions.width / 2;
      const otherHalfDepth = otherItem.dimensions.depth / 2;
      const otherHalfHeight = otherItem.dimensions.height / 2;

      const otherRotation = otherItem.rotation % (Math.PI * 2);
      const otherIsRotated90 = Math.abs(otherRotation - Math.PI / 2) < 0.1 || Math.abs(otherRotation - (3 * Math.PI / 2)) < 0.1;
      const otherEffectiveWidth = otherIsRotated90 ? otherHalfDepth : otherHalfWidth;
      const otherEffectiveDepth = otherIsRotated90 ? otherHalfWidth : otherHalfDepth;

      const otherBox = {
        minX: otherItem.position[0] - otherEffectiveWidth,
        maxX: otherItem.position[0] + otherEffectiveWidth,
        minY: otherItem.position[1] - otherHalfHeight,
        maxY: otherItem.position[1] + otherHalfHeight,
        minZ: otherItem.position[2] - otherEffectiveDepth,
        maxZ: otherItem.position[2] + otherEffectiveDepth,
      };

      return (
        testBox.minX < otherBox.maxX &&
        testBox.maxX > otherBox.minX &&
        testBox.minY < otherBox.maxY &&
        testBox.maxY > otherBox.minY &&
        testBox.minZ < otherBox.maxZ &&
        testBox.maxZ > otherBox.minZ
      );
    });
  }, [allItems, item.id, item.rotation, dimensions]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e as any).nativeEvent?.stopImmediatePropagation();
    onSelect(item.id);
    
    const intersectionPoint = e.point;
    offset.copy(intersectionPoint).sub(new THREE.Vector3(...item.position));
    
    setIsDragging(true);
    onDragStart();
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();
    (e as any).nativeEvent?.stopImmediatePropagation();

    const ray = e.ray;
    const intersectPoint = new THREE.Vector3();
    ray.intersectPlane(dragPlane, intersectPoint);
    
    intersectPoint.sub(offset);
    
    // Apply snap to grid if enabled
    if (snapToGrid) {
      intersectPoint.x = Math.round(intersectPoint.x / gridSize) * gridSize;
      intersectPoint.z = Math.round(intersectPoint.z / gridSize) * gridSize;
    }
    
    // Calculate rotated dimensions for bounds checking
    const rotation = item.rotation % (Math.PI * 2);
    const isRotated90 = Math.abs(rotation - Math.PI / 2) < 0.1 || Math.abs(rotation - (3 * Math.PI / 2)) < 0.1;
    const effectiveWidth = isRotated90 ? dimensions[2] / 2 : dimensions[0] / 2;
    const effectiveDepth = isRotated90 ? dimensions[0] / 2 : dimensions[2] / 2;
    
    const maxX = roomBounds.width / 2 - effectiveWidth;
    const maxZ = roomBounds.depth / 2 - effectiveDepth;
    
    // Apply room bounds
    intersectPoint.x = Math.max(-maxX, Math.min(maxX, intersectPoint.x));
    intersectPoint.z = Math.max(-maxZ, Math.min(maxZ, intersectPoint.z));
    intersectPoint.y = item.position[1];
    
    // Check for collisions - only update if no collision
    if (!checkCollisionWithOthers(intersectPoint)) {
      onDrag(item.id, [intersectPoint.x, intersectPoint.y, intersectPoint.z]);
    }
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
        onPointerOut={handlePointerUp}
      >
        <DetailedFurniture 
          type={item.type} 
          dimensions={dimensions} 
          color={item.color}
          isSelected={isSelected}
          isDragging={isDragging}
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
