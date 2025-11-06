import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Room } from './Room';
import { FurnitureObject } from './FurnitureObject';
import { GridOverlay } from './GridOverlay';
import { FurnitureItem } from '@/types/furniture';

interface Scene3DProps {
  furniture: FurnitureItem[];
  selectedId: string | null;
  roomWidth: number;
  roomDepth: number;
  isDragging: boolean;
  showGrid: boolean;
  gridSize: number;
  onSelectItem: (id: string) => void;
  onDragItem: (id: string, position: [number, number, number]) => void;
  onRotateItem: (id: string, rotation: number) => void;
  viewMode: '3d' | '2d';
}

export const Scene3D = ({
  furniture,
  selectedId,
  roomWidth,
  roomDepth,
  isDragging,
  showGrid,
  gridSize,
  onSelectItem,
  onDragItem,
  onRotateItem,
  viewMode,
}: Scene3DProps) => {
  const cameraPosition = viewMode === '2d' 
    ? [0, 10, 0.1] as [number, number, number]
    : [5, 5, 5] as [number, number, number];

  return (
    <div className="w-full h-full bg-muted/30">
      <Canvas shadows gl={{ preserveDrawingBuffer: true }}>
        <PerspectiveCamera makeDefault position={cameraPosition} />
        
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} />

        <Room width={roomWidth} depth={roomDepth} height={3} />
        <GridOverlay width={roomWidth} depth={roomDepth} gridSize={gridSize} visible={showGrid} />

        {furniture.map((item) => (
          <FurnitureObject
            key={item.id}
            item={item}
            isSelected={item.id === selectedId}
            roomBounds={{ width: roomWidth, depth: roomDepth }}
            allItems={furniture}
            onSelect={onSelectItem}
            onDrag={onDragItem}
            onRotate={onRotateItem}
          />
        ))}

        <OrbitControls
          makeDefault
          enablePan={!isDragging}
          enableZoom={!isDragging}
          enableRotate={viewMode === '3d' && !isDragging}
          minDistance={3}
          maxDistance={15}
          maxPolarAngle={viewMode === '2d' ? 0 : Math.PI / 2.1}
          minPolarAngle={viewMode === '2d' ? 0 : 0}
        />
      </Canvas>
    </div>
  );
};
