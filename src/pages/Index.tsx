import { Scene3D } from '@/components/planner/Scene3D';
import { Sidebar } from '@/components/planner/Sidebar';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { usePlannerStore } from '@/store/usePlannerStore';

const Index = () => {
  const {
    furniture,
    snapToGrid,
    gridSize,
    showGrid,
    selectedItem,
    roomBounds,
    deselectItem,
    updatePosition,
    rotateSelected,
    deleteSelected,
    duplicateSelected,
    toggleSnap,
    toggleGrid,
  } = usePlannerStore();

  // Keyboard controls
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
      <Sidebar  />
      
      <main className="flex-1 relative">
        <Scene3D />
      </main>
    </div>
  );
};

export default Index;
