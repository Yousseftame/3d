import { Scene3D } from '@/components/planner/Scene3D';
import { Sidebar } from '@/components/planner/Sidebar';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { usePlannerStore } from '@/store/usePlannerStore';

const Index = () => {
  const {
    selectedItem,
    furniture,
    roomBounds,
    gridSize,
    snapToGrid,
    showGrid,
    updatePosition,
    rotateSelected,
    deleteSelected,
    duplicateSelected,
    deselectItem,
    toggleGrid,
    toggleSnap,
  } = usePlannerStore();

  //  Initialize global keyboard shortcuts (movement, rotate, delete, etc.)
   useKeyboardControls({
    selectedItem: selectedItem(),
    furniture,
    roomBounds: roomBounds(),
    gridSize,
    snapToGrid,
    showGrid,
    onUpdatePosition: updatePosition,
    onRotate: rotateSelected,
    onDelete: deleteSelected,
    onDuplicate: duplicateSelected,
    onDeselect: deselectItem,
    onToggleGrid: toggleGrid,
    onToggleSnap: toggleSnap,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
       {/* Sidebar: tools, furniture list, and property editor */}
      <Sidebar  />
      
      <main className="flex-1 relative">
          {/* Main 3D scene canvas */}
        <Scene3D />
      </main>
    </div>
  );
};

export default Index;