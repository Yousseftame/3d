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

  const handleAddFurniture = (definition: FurnitureDefinition) => {
    const newItem: FurnitureItem = {
      id: `${definition.type}-${Date.now()}`,
      type: definition.type,
      position: [0, definition.isWallMounted ? 1.5 : definition.dimensions.height / 2, 0],
      rotation: 0,
      color: definition.color,
      name: definition.name,
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
        selectedItemId={selectedId}
        onAddFurniture={handleAddFurniture}
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
