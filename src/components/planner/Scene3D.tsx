import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls, PerspectiveCamera, Sky } from '@react-three/drei';

import { Room } from './Room';
import { FurnitureObject } from './FurnitureObject';
import { GridOverlay } from './GridOverlay';
import { MeasurementLines } from './MeasurementLines';
import { usePlannerStore } from '@/store/usePlannerStore';

export const Scene3D = () => {
  const {
    furniture,
    selectedId,
    roomWidth,
    roomDepth,
    isDragging,
    dragItem,
    rotateItem,
    viewMode,
    deselectItem,
    selectItem
  } = usePlannerStore();

  const cameraPosition = useMemo(() => 
    viewMode === '2d' 
      ? [0, 10, 0.1] as [number, number, number]
      : [5, 5, 5] as [number, number, number],
    [viewMode]
  );

  const onSelectItem = (id) => id === '' ? deselectItem() : selectItem(id)

  const getSelectedItem = useMemo(() => 
    furniture.find(item => item.id === selectedId) || null,
    [furniture, selectedId]
  );

  return (
    <div className="w-full h-full bg-muted/30">
      <Canvas
        shadows
        gl={{ preserveDrawingBuffer: true }}
        frameloop="always"
        dpr={[1, 2]}
      >
        {/* Sky  */}
        <Sky
          distance={450000}
          sunPosition={[100, 20, 100]} // Sun
          inclination={0.49} // Light angle
          azimuth={0.25} // light diriction
        />
        {/* Sky  */}

        {/* Grid  */}
        <Grid
          position={[0, 0.01, 0]}
          args={[5, 5]}
          cellSize={1}
          cellThickness={0.8}
          cellColor="#6f6f6f"
          sectionSize={10}
          sectionThickness={0.5}
          sectionColor="#444"
          fadeDistance={40}
          fadeStrength={1}
          infiniteGrid
        />
        {/* Grid  */}

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
        <GridOverlay />

        {/* Invisible ground plane for deselection */}
        <mesh
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem("");
          }}
        >
          <planeGeometry args={[roomWidth * 2, roomDepth * 2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {furniture.map((item) => (
          <FurnitureObject
            key={item.id}
            item={item}
            isSelected={item.id === selectedId}
            roomBounds={{ width: roomWidth, depth: roomDepth }}
            allItems={furniture}
            onSelect={onSelectItem}
            onDrag={dragItem}
            onRotate={rotateItem}
          />
        ))}

        <MeasurementLines selectedItem={getSelectedItem} />

        <OrbitControls
          makeDefault
          enablePan={!isDragging}
          enableZoom={!isDragging}
          enableRotate={viewMode === "3d" && !isDragging}
          minDistance={3}
          maxDistance={15}
          maxPolarAngle={viewMode === "2d" ? 0 : Math.PI / 2.1}
          minPolarAngle={viewMode === "2d" ? 0 : 0}
        />
      </Canvas>
    </div>
  );
};
