import { useState } from 'react';
import { Scene3D } from '@/components/planner/Scene3D';
import { Sidebar } from '@/components/planner/Sidebar';
import { FurnitureItem, FurnitureDefinition } from '@/types/furniture';
import { willCollide, willCollideAfterResize, willCollideAfterRotation } from '@/utils/collision';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { toast } from 'sonner';

const Index = () => {
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(0.6); // 60cm default
  const [showGrid, setShowGrid] = useState(true);
  const [roomWidth, setRoomWidth] = useState(8);
  const [roomDepth, setRoomDepth] = useState(6);

  const selectedItem = furniture.find(item => item.id === selectedId) || null;

  const handleAddFurniture = (definition: FurnitureDefinition) => {
    const yPosition = definition.isWallMounted ? 1.5 : definition.dimensions.height / 2;
    
    const newItem: FurnitureItem = {
      id: `${definition.type}-${Date.now()}`,
      type: definition.type,
      position: [0, yPosition, 0],
      rotation: 0,
      color: definition.color,
      name: definition.name,
      dimensions: {
        width: definition.dimensions.width,
        height: definition.dimensions.height,
        depth: definition.dimensions.depth,
      },
      isWallMounted: definition.isWallMounted,
    };
    
    setFurniture([...furniture, newItem]);
    setSelectedId(newItem.id);
    toast.success(`Added ${definition.name}`);
  };

  const handleSelectItem = (id: string) => {
    if (!isDragging) {
      setSelectedId(id);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragItem = (id: string, position: [number, number, number]) => {
    setFurniture(prev =>
      prev.map(item =>
        item.id === id ? { ...item, position } : item
      )
    );
  };

  const handleRotateItem = (id: string, rotation: number) => {
    setFurniture(prev =>
      prev.map(item =>
        item.id === id ? { ...item, rotation } : item
      )
    );
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleUpdateDimensions = (dimension: 'width' | 'height' | 'depth', value: number) => {
    if (!selectedId) return;
    
    const item = furniture.find(f => f.id === selectedId);
    if (!item) return;

    const newDimensions = { ...item.dimensions, [dimension]: value };
    
    // Check for collisions with new dimensions
    if (willCollideAfterResize(item, newDimensions, furniture)) {
      toast.error('Cannot resize: would overlap with another item');
      return;
    }
    
    setFurniture(prev =>
      prev.map(item => {
        if (item.id === selectedId) {
          // Adjust Y position if height changed and not wall-mounted
          let newPosition = item.position;
          if (dimension === 'height' && !item.isWallMounted) {
            newPosition = [item.position[0], value / 2, item.position[2]] as [number, number, number];
          }
          
          return {
            ...item,
            dimensions: newDimensions,
            position: newPosition,
          };
        }
        return item;
      })
    );
  };

  const handleUpdatePosition = (axis: 'x' | 'y' | 'z', value: number) => {
    if (!selectedId) return;
    
    const item = furniture.find(f => f.id === selectedId);
    if (!item) return;

    setFurniture(prev =>
      prev.map(item => {
        if (item.id === selectedId) {
          const newPosition = [...item.position] as [number, number, number];
          const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
          newPosition[axisIndex] = value;
          
          // Apply room bounds
          if (axis === 'x') {
            const rotation = item.rotation % (Math.PI * 2);
            const isRotated90 = Math.abs(rotation - Math.PI / 2) < 0.1 || Math.abs(rotation - (3 * Math.PI / 2)) < 0.1;
            const effectiveWidth = isRotated90 ? item.dimensions.depth / 2 : item.dimensions.width / 2;
            const maxX = roomWidth / 2 - effectiveWidth;
            newPosition[0] = Math.max(-maxX, Math.min(maxX, value));
          } else if (axis === 'z') {
            const rotation = item.rotation % (Math.PI * 2);
            const isRotated90 = Math.abs(rotation - Math.PI / 2) < 0.1 || Math.abs(rotation - (3 * Math.PI / 2)) < 0.1;
            const effectiveDepth = isRotated90 ? item.dimensions.width / 2 : item.dimensions.depth / 2;
            const maxZ = roomDepth / 2 - effectiveDepth;
            newPosition[2] = Math.max(-maxZ, Math.min(maxZ, value));
          }
          
          return { ...item, position: newPosition };
        }
        return item;
      })
    );
  };

  const handleRotateSelected = () => {
    if (!selectedId) return;
    
    const item = furniture.find(f => f.id === selectedId);
    if (!item) return;

    const newRotation = (item.rotation + Math.PI / 2) % (Math.PI * 2);
    
    // Check for collisions after rotation
    if (willCollideAfterRotation(item, newRotation, furniture)) {
      toast.error('Cannot rotate: would overlap with another item');
      return;
    }
    
    setFurniture(prev =>
      prev.map(item =>
        item.id === selectedId
          ? { ...item, rotation: newRotation }
          : item
      )
    );
    toast.success('Item rotated');
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    
    setFurniture(prev => prev.filter(item => item.id !== selectedId));
    setSelectedId(null);
    toast.success('Item deleted');
  };

  const handleToggleView = () => {
    setViewMode(prev => prev === '3d' ? '2d' : '3d');
    toast.success(`Switched to ${viewMode === '3d' ? '2D' : '3D'} view`);
  };


  const handleToggleSnap = () => {
    setSnapToGrid(prev => {
      const newValue = !prev;
      toast.success(newValue ? 'Snap to grid enabled' : 'Snap to grid disabled', {
        description: newValue ? `Snapping to ${(gridSize * 100).toFixed(0)}cm intervals` : undefined
      });
      return newValue;
    });
  };

  const handleToggleGrid = () => {
    setShowGrid(prev => {
      const newValue = !prev;
      toast.success(newValue ? 'Grid visible' : 'Grid hidden');
      return newValue;
    });
  };


  const handleDuplicateSelected = () => {
    if (!selectedId) return;
    
    const item = furniture.find(f => f.id === selectedId);
    if (!item) return;

    // Create new item with slight offset to avoid overlap
    const offset = 0.3; // 30cm offset
    const newItem: FurnitureItem = {
      ...item,
      id: `${item.type}-${Date.now()}`,
      position: [item.position[0] + offset, item.position[1], item.position[2] + offset],
    };

    // Check if new position would cause collision
    if (!willCollide(newItem, newItem.position, furniture)) {
      setFurniture([...furniture, newItem]);
      setSelectedId(newItem.id);
      toast.success('Item duplicated');
    } else {
      // Try different offset positions
      const offsets = [
        [offset * 2, 0],
        [0, offset * 2],
        [-offset, 0],
        [0, -offset],
      ];
      
      for (const [dx, dz] of offsets) {
        const testPos: [number, number, number] = [
          item.position[0] + dx,
          item.position[1],
          item.position[2] + dz
        ];
        const testItem = { ...newItem, position: testPos };
        
        if (!willCollide(testItem, testPos, furniture)) {
          testItem.position = testPos;
          setFurniture([...furniture, testItem]);
          setSelectedId(testItem.id);
          toast.success('Item duplicated');
          return;
        }
      }
      
      toast.error('Cannot duplicate: no space available nearby');
    }
  };

  const handleDeselect = () => {
    setSelectedId(null);
  };

  const handleGridSizeChange = (size: number) => {
    setGridSize(size);
    toast.success(`Grid size set to ${(size * 100).toFixed(0)}cm`);
  };


  const handleRoomWidthChange = (width: number) => {
    setRoomWidth(Math.max(3, Math.min(20, width)));
    toast.success(`Room width set to ${width.toFixed(1)}m`);
  };

  const handleRoomDepthChange = (depth: number) => {
    setRoomDepth(Math.max(3, Math.min(20, depth)));
    toast.success(`Room depth set to ${depth.toFixed(1)}m`);
  };

  // Keyboard controls - must be after all handlers are defined
  useKeyboardControls({
    selectedItem,
    furniture,
    roomBounds: { width: roomWidth, depth: roomDepth },
    gridSize,
    snapToGrid,
    showGrid,
    onUpdatePosition: handleUpdatePosition,
    onRotate: handleRotateSelected,
    onDelete: handleDeleteSelected,
    onDuplicate: handleDuplicateSelected,
    onDeselect: handleDeselect,
    onToggleGrid: handleToggleGrid,
    onToggleSnap: handleToggleSnap,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        selectedItem={selectedItem}
        onAddFurniture={handleAddFurniture}
        onUpdateDimensions={handleUpdateDimensions}
        onUpdatePosition={handleUpdatePosition}
        onRotateSelected={handleRotateSelected}
        onDeleteSelected={handleDeleteSelected}
        onToggleView={handleToggleView}
        viewMode={viewMode}
        snapToGrid={snapToGrid}
        gridSize={gridSize}
        showGrid={showGrid}
        onToggleSnap={handleToggleSnap}
        onToggleGrid={handleToggleGrid}
        onGridSizeChange={handleGridSizeChange}
        roomWidth={roomWidth}
        roomDepth={roomDepth}
        onRoomWidthChange={handleRoomWidthChange}
        onRoomDepthChange={handleRoomDepthChange}
      />
      
      <main className="flex-1 relative">
        <Scene3D
          furniture={furniture}
          selectedId={selectedId}
          roomWidth={roomWidth}
          roomDepth={roomDepth}
          isDragging={isDragging}
          showGrid={showGrid}
          gridSize={gridSize}
          onSelectItem={handleSelectItem}
          onDragItem={handleDragItem}
          onRotateItem={handleRotateItem}
          viewMode={viewMode}
        />
      </main>
    </div>
  );
};

export default Index;
