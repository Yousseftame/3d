import { useState } from 'react';
import { Scene3D } from '@/components/planner/Scene3D';
import { Sidebar } from '@/components/planner/Sidebar';
import { FurnitureItem, FurnitureDefinition } from '@/types/furniture';
import { toast } from 'sonner';

const Index = () => {
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  
  const roomWidth = 8;
  const roomDepth = 6;

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

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleUpdateDimensions = (dimension: 'width' | 'height' | 'depth', value: number) => {
    if (!selectedId) return;
    
    setFurniture(prev =>
      prev.map(item => {
        if (item.id === selectedId) {
          const newDimensions = { ...item.dimensions, [dimension]: value };
          
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
    
    setFurniture(prev =>
      prev.map(item => {
        if (item.id === selectedId) {
          const newPosition = [...item.position] as [number, number, number];
          const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
          newPosition[axisIndex] = value;
          
          // Apply room bounds
          if (axis === 'x') {
            const maxX = roomWidth / 2 - item.dimensions.width / 2;
            newPosition[0] = Math.max(-maxX, Math.min(maxX, value));
          } else if (axis === 'z') {
            const maxZ = roomDepth / 2 - item.dimensions.depth / 2;
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
    
    setFurniture(prev =>
      prev.map(item =>
        item.id === selectedId
          ? { ...item, rotation: (item.rotation + Math.PI / 2) % (Math.PI * 2) }
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
      />
      
      <main className="flex-1 relative">
        <Scene3D
          furniture={furniture}
          selectedId={selectedId}
          roomWidth={roomWidth}
          roomDepth={roomDepth}
          onSelectItem={handleSelectItem}
          onDragStart={handleDragStart}
          onDragItem={handleDragItem}
          onDragEnd={handleDragEnd}
          viewMode={viewMode}
        />
      </main>
    </div>
  );
};

export default Index;
