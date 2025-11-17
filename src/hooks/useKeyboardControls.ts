import { toast } from 'sonner';
import { useEffect, useCallback } from 'react';

import { willCollide } from '@/utils/collision';
import { usePlannerStore } from '@/store/usePlannerStore';

export const useKeyboardControls = () => {
  const {
    selectedItem,
    furniture,
    roomBounds,
    gridSize,
    updatePosition,
    rotateSelected,
    deleteSelected,
    duplicateSelected,
    deselectItem,
    toggleGrid,
    toggleSnap
  } = usePlannerStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Check if user is typing in an input field
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    // Escape to deselect
    if (e.key === 'Escape') {
      e.preventDefault();
      deselectItem();
      return;
    }

    // Toggle grid visibility with 'G'
    if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      toggleGrid();
      return;
    }

    // Toggle snap to grid with 'S'
    if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      toggleSnap();
      return;
    }

    // Delete selected item with Delete or Backspace
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItem) {
      e.preventDefault();
      deleteSelected();
      return;
    }

    // Rotate selected item with 'R'
    if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey && selectedItem) {
      e.preventDefault();
      rotateSelected();
      return;
    }

    // Duplicate selected item with Ctrl+D or Cmd+D
    if (e.key.toLowerCase() === 'd' && (e.ctrlKey || e.metaKey) && selectedItem) {
      e.preventDefault();
      duplicateSelected();
      return;
    }

    // Arrow key movements - only if item is selected
    if (!selectedItem) return;

    const isShiftPressed = e.shiftKey;
    const isAltPressed = e.altKey;
    const moveDistance = isShiftPressed ? 0.01 : gridSize; // 1cm or grid size

    let newPosition: [number, number, number] = [...selectedItem.position];
    let moved = false;
    let axis: 'x' | 'y' | 'z' | null = null;

    // For wall-mounted items: Arrow Up/Down = Y axis (vertical), Left/Right = X axis
    // Alt + Up/Down = Z axis (depth)
    // For floor items: Arrow Up/Down = Z axis, Left/Right = X axis
    
    if (selectedItem.isWallMounted) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (isAltPressed) {
            // Alt + Up: Move back (negative Z)
            newPosition[2] -= moveDistance;
            axis = 'z';
          } else {
            // Up: Move vertically up
            newPosition[1] += moveDistance;
            axis = 'y';
          }
          moved = true;
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (isAltPressed) {
            // Alt + Down: Move forward (positive Z)
            newPosition[2] += moveDistance;
            axis = 'z';
          } else {
            // Down: Move vertically down
            newPosition[1] -= moveDistance;
            axis = 'y';
          }
          moved = true;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newPosition[0] -= moveDistance;
          axis = 'x';
          moved = true;
          break;
        case 'ArrowRight':
          e.preventDefault();
          newPosition[0] += moveDistance;
          axis = 'x';
          moved = true;
          break;
      }
    } else {
      // Floor items: standard movement
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newPosition[2] -= moveDistance;
          axis = 'z';
          moved = true;
          break;
        case 'ArrowDown':
          e.preventDefault();
          newPosition[2] += moveDistance;
          axis = 'z';
          moved = true;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newPosition[0] -= moveDistance;
          axis = 'x';
          moved = true;
          break;
        case 'ArrowRight':
          e.preventDefault();
          newPosition[0] += moveDistance;
          axis = 'x';
          moved = true;
          break;
      }
    }

    if (moved && axis) {
      // Apply constraints based on axis
      if (axis === 'x' || axis === 'z') {
        // Calculate rotated dimensions for bounds checking
        const rotation = selectedItem.rotation % (Math.PI * 2);
        const isRotated90 = Math.abs(rotation - Math.PI / 2) < 0.1 || Math.abs(rotation - (3 * Math.PI / 2)) < 0.1;
        const effectiveWidth = isRotated90 ? selectedItem.dimensions.depth / 2 : selectedItem.dimensions.width / 2;
        const effectiveDepth = isRotated90 ? selectedItem.dimensions.width / 2 : selectedItem.dimensions.depth / 2;

        // Apply room bounds
        const maxX = roomBounds.width / 2 - effectiveWidth;
        const maxZ = roomBounds.depth / 2 - effectiveDepth;

        newPosition[0] = Math.max(-maxX, Math.min(maxX, newPosition[0]));
        newPosition[2] = Math.max(-maxZ, Math.min(maxZ, newPosition[2]));
      } else if (axis === 'y') {
        // Constrain Y axis for wall-mounted items
        const minY = 0.5; // Minimum height from floor
        const maxY = 2.5; // Maximum height
        newPosition[1] = Math.max(minY, Math.min(maxY, newPosition[1]));
      }

      // Check for collisions
      if (!willCollide(selectedItem, newPosition, furniture)) {
        if (axis === 'x') {
          updatePosition('x', newPosition[0]);
        } else if (axis === 'y') {
          updatePosition('y', newPosition[1]);
        } else if (axis === 'z') {
          updatePosition('z', newPosition[2]);
        }
      } else {
        toast.error('Cannot move: would overlap with another item');
      }
    }
  },  [
  selectedItem,
  furniture,
  roomBounds,
  gridSize,
  updatePosition,
  rotateSelected,
  deleteSelected,
  deselectItem,
  toggleGrid,
  toggleSnap,
  duplicateSelected
]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
