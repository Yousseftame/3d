import { Scene3D } from '@/components/planner/Scene3D';
import { Sidebar } from '@/components/planner/Sidebar';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { usePlannerStore } from '@/store/usePlannerStore';

const Index = () => {
  const {
    furniture,
    selectedId,
    isDragging,
    viewMode,
    snapToGrid,
    gridSize,
    showGrid,
    roomWidth,
    roomDepth,
    selectedItem,
    roomBounds,
    addFurniture,
    selectItem,
    deselectItem,
    setIsDragging,
    dragItem,
    rotateItem,
    updateDimensions,
    updatePosition,
    rotateSelected,
    deleteSelected,
    duplicateSelected,
    toggleView,
    toggleSnap,
    toggleGrid,
    setGridSize,
    setRoomWidth,
    setRoomDepth,
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
      <Sidebar
        selectedItem={selectedItem()}
        onAddFurniture={addFurniture}
        onUpdateDimensions={updateDimensions}
        onUpdatePosition={updatePosition}
        onRotateSelected={rotateSelected}
        onDeleteSelected={deleteSelected}
        onToggleView={toggleView}
        viewMode={viewMode}
        snapToGrid={snapToGrid}
        gridSize={gridSize}
        showGrid={showGrid}
        onToggleSnap={toggleSnap}
        onToggleGrid={toggleGrid}
        onGridSizeChange={setGridSize}
        roomWidth={roomWidth}
        roomDepth={roomDepth}
        onRoomWidthChange={setRoomWidth}
        onRoomDepthChange={setRoomDepth}
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
          onSelectItem={(id) => id === '' ? deselectItem() : selectItem(id)}
          onDragItem={dragItem}
          onRotateItem={rotateItem}
          viewMode={viewMode}
        />
      </main>
    </div>
  );
};

export default Index;
