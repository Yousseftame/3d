import { create } from 'zustand';
import { FurnitureItem, FurnitureDefinition } from '@/types/furniture';
import { willCollide, willCollideAfterResize, willCollideAfterRotation } from '@/utils/collision';
import { toast } from 'sonner';

interface PlannerState {
  // State
  furniture: FurnitureItem[];
  selectedId: string | null;
  isDragging: boolean;
  viewMode: '3d' | '2d';
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  roomWidth: number;
  roomDepth: number;
  
  // Computed
  selectedItem: () => FurnitureItem | null;
  roomBounds: () => { width: number; depth: number };
  
  // Actions
  addFurniture: (definition: FurnitureDefinition) => void;
  selectItem: (id: string) => void;
  deselectItem: () => void;
  setIsDragging: (isDragging: boolean) => void;
  dragItem: (id: string, position: [number, number, number]) => void;
  rotateItem: (id: string, rotation: number) => void;
  updateDimensions: (dimension: 'width' | 'height' | 'depth', value: number) => void;
  updatePosition: (axis: 'x' | 'y' | 'z', value: number) => void;
  rotateSelected: () => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  toggleView: () => void;
  toggleSnap: () => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  setRoomWidth: (width: number) => void;
  setRoomDepth: (depth: number) => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  // Initial state
  furniture: [],
  selectedId: null,
  isDragging: false,
  viewMode: '3d',
  snapToGrid: true,
  gridSize: 0.6,
  showGrid: true,
  roomWidth: 8,
  roomDepth: 6,
  
  // Computed values
  selectedItem: () => {
    const { furniture, selectedId } = get();
    return furniture.find(item => item.id === selectedId) || null;
  },
  
  roomBounds: () => {
    const { roomWidth, roomDepth } = get();
    return { width: roomWidth, depth: roomDepth };
  },
  
  // Actions
  addFurniture: (definition) => {
    const { furniture } = get();
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
    
    set({ 
      furniture: [...furniture, newItem],
      selectedId: newItem.id 
    });
    toast.success(`Added ${definition.name}`);
  },
  
  selectItem: (id) => {
    const { isDragging } = get();
    if (!isDragging) {
      set({ selectedId: id });
    }
  },
  
  deselectItem: () => set({ selectedId: null }),
  
  setIsDragging: (isDragging) => set({ isDragging }),
  
  dragItem: (id, position) => {
    set((state) => ({
      furniture: state.furniture.map(item =>
        item.id === id ? { ...item, position } : item
      )
    }));
  },
  
  rotateItem: (id, rotation) => {
    set((state) => ({
      furniture: state.furniture.map(item =>
        item.id === id ? { ...item, rotation } : item
      )
    }));
  },
  
  updateDimensions: (dimension, value) => {
    const { selectedId, furniture } = get();
    if (!selectedId) return;
    
    const item = furniture.find(f => f.id === selectedId);
    if (!item) return;

    const newDimensions = { ...item.dimensions, [dimension]: value };
    
    if (willCollideAfterResize(item, newDimensions, furniture)) {
      toast.error('Cannot resize: would overlap with another item');
      return;
    }
    
    set((state) => ({
      furniture: state.furniture.map(item => {
        if (item.id === selectedId) {
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
    }));
  },
  
  updatePosition: (axis, value) => {
    const { selectedId, furniture, roomWidth, roomDepth } = get();
    if (!selectedId) return;
    
    const item = furniture.find(f => f.id === selectedId);
    if (!item) return;

    set((state) => ({
      furniture: state.furniture.map(item => {
        if (item.id === selectedId) {
          const newPosition = [...item.position] as [number, number, number];
          const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
          newPosition[axisIndex] = value;
          
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
    }));
  },
  
  rotateSelected: () => {
    const { selectedId, furniture } = get();
    if (!selectedId) return;
    
    const item = furniture.find(f => f.id === selectedId);
    if (!item) return;

    const newRotation = (item.rotation + Math.PI / 2) % (Math.PI * 2);
    
    if (willCollideAfterRotation(item, newRotation, furniture)) {
      toast.error('Cannot rotate: would overlap with another item');
      return;
    }
    
    set((state) => ({
      furniture: state.furniture.map(item =>
        item.id === selectedId
          ? { ...item, rotation: newRotation }
          : item
      )
    }));
    toast.success('Item rotated');
  },
  
  deleteSelected: () => {
    const { selectedId } = get();
    if (!selectedId) return;
    
    set((state) => ({
      furniture: state.furniture.filter(item => item.id !== selectedId),
      selectedId: null
    }));
    toast.success('Item deleted');
  },
  
  duplicateSelected: () => {
    const { selectedId, furniture } = get();
    if (!selectedId) return;
    
    const item = furniture.find(f => f.id === selectedId);
    if (!item) return;

    const offset = 0.3;
    const newItem: FurnitureItem = {
      ...item,
      id: `${item.type}-${Date.now()}`,
      position: [item.position[0] + offset, item.position[1], item.position[2] + offset],
    };

    if (!willCollide(newItem, newItem.position, furniture)) {
      set((state) => ({
        furniture: [...state.furniture, newItem],
        selectedId: newItem.id
      }));
      toast.success('Item duplicated');
    } else {
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
          set((state) => ({
            furniture: [...state.furniture, testItem],
            selectedId: testItem.id
          }));
          toast.success('Item duplicated');
          return;
        }
      }
      
      toast.error('Cannot duplicate: no space available nearby');
    }
  },
  
  toggleView: () => {
    set((state) => {
      const newMode = state.viewMode === '3d' ? '2d' : '3d';
      toast.success(`Switched to ${newMode.toUpperCase()} view`);
      return { viewMode: newMode };
    });
  },
  
  toggleSnap: () => {
    set((state) => {
      const newValue = !state.snapToGrid;
      toast.success(newValue ? 'Snap to grid enabled' : 'Snap to grid disabled', {
        description: newValue ? `Snapping to ${(state.gridSize * 100).toFixed(0)}cm intervals` : undefined
      });
      return { snapToGrid: newValue };
    });
  },
  
  toggleGrid: () => {
    set((state) => {
      const newValue = !state.showGrid;
      toast.success(newValue ? 'Grid visible' : 'Grid hidden');
      return { showGrid: newValue };
    });
  },
  
  setGridSize: (size) => {
    set({ gridSize: size });
    toast.success(`Grid size set to ${(size * 100).toFixed(0)}cm`);
  },
  
  setRoomWidth: (width) => {
    const constrainedWidth = Math.max(3, Math.min(20, width));
    set({ roomWidth: constrainedWidth });
    toast.success(`Room width set to ${constrainedWidth.toFixed(1)}m`);
  },
  
  setRoomDepth: (depth) => {
    const constrainedDepth = Math.max(3, Math.min(20, depth));
    set({ roomDepth: constrainedDepth });
    toast.success(`Room depth set to ${constrainedDepth.toFixed(1)}m`);
  },
}));
