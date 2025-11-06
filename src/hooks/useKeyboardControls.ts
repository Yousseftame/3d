import { useEffect, useCallback } from 'react';
import { FurnitureItem } from '@/types/furniture';
import { willCollide } from '@/utils/collision';
import { toast } from 'sonner';

interface UseKeyboardControlsProps {
  selectedItem: FurnitureItem | null;
  furniture: FurnitureItem[];
  roomBounds: { width: number; depth: number };
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  onUpdatePosition: (axis: 'x' | 'y' | 'z', value: number) => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
}

export const useKeyboardControls = ({
  selectedItem,
  furniture,
  roomBounds,
  gridSize,
  snapToGrid,
  showGrid,
  onUpdatePosition,
  onToggleGrid,
  onToggleSnap,
}: UseKeyboardControlsProps) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Check if user is typing in an input field
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    // Toggle grid visibility with 'G'
    if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      onToggleGrid();
      return;
    }

    // Toggle snap to grid with 'S'
    if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      onToggleSnap();
      return;
    }

    // Arrow key movements - only if item is selected
    if (!selectedItem) return;

    const isShiftPressed = e.shiftKey;
    const moveDistance = isShiftPressed ? 0.01 : gridSize; // 1cm or grid size

    let newPosition: [number, number, number] = [...selectedItem.position];
    let moved = false;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newPosition[2] -= moveDistance;
        moved = true;
        break;
      case 'ArrowDown':
        e.preventDefault();
        newPosition[2] += moveDistance;
        moved = true;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newPosition[0] -= moveDistance;
        moved = true;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newPosition[0] += moveDistance;
        moved = true;
        break;
    }

    if (moved) {
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

      // Check for collisions
      if (!willCollide(selectedItem, newPosition, furniture)) {
        onUpdatePosition('x', newPosition[0]);
        // Small delay to ensure X is updated before Z
        setTimeout(() => onUpdatePosition('z', newPosition[2]), 0);
      } else {
        toast.error('Cannot move: would overlap with another item');
      }
    }
  }, [
    selectedItem,
    furniture,
    roomBounds,
    gridSize,
    onUpdatePosition,
    onToggleGrid,
    onToggleSnap,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
