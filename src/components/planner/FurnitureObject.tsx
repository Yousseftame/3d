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

const getFurnitureDimensions = (type: string): [number, number, number] => {
  switch (type) {
    case 'counter':
      return [0.6, 0.9, 0.6];
    case 'cabinet-floor':
      return [0.6, 0.9, 0.6];
    case 'cabinet-wall':
      return [0.6, 0.6, 0.35];
    case 'fridge':
      return [0.7, 1.8, 0.7];
    case 'oven':
      return [0.6, 0.9, 0.6];
    case 'sink':
      return [0.8, 0.9, 0.6];
    case 'dishwasher':
      return [0.6, 0.9, 0.6];
    default:
      return [0.6, 0.9, 0.6];
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
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPlane] = useState(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const [offset] = useState(() => new THREE.Vector3());
  
  const dimensions = getFurnitureDimensions(item.type);
  const isWallMounted = item.type === 'cabinet-wall';
  const yPosition = isWallMounted ? 1.5 : dimensions[1] / 2;

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
    intersectPoint.y = yPosition;
    
    onDrag(item.id, [intersectPoint.x, intersectPoint.y, intersectPoint.z]);
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    }
  };

  return (
    <group position={item.position} rotation={[0, item.rotation, 0]}>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <boxGeometry args={dimensions} />
        <meshStandardMaterial 
          color={isSelected ? '#00acc1' : item.color}
          opacity={isDragging ? 0.7 : 1}
          transparent={isDragging}
        />
      </mesh>
      
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(...dimensions)]} />
          <lineBasicMaterial color="#00acc1" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
};
