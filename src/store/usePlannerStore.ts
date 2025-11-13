
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FurnitureItem, FurnitureDefinition } from '@/types/furniture';
import { getBoundingBox, getRoomBounds, willCollide, willCollideAfterResize, willCollideAfterRotation } from '@/utils/collision';
import { toast } from 'sonner';

interface PlannerState {
  furniture: FurnitureItem[];
  selectedId: string | null;
  isDragging: boolean;
  viewMode: '3d' | '2d';
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  roomWidth: number;
  roomDepth: number;

  selectedItem: () => FurnitureItem | null;
  roomBounds: () => { width: number; depth: number };

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


  // ---------------------------------
  walls: any[]; 
  setWalls: (walls: any[]) => void;
  addWall: (wall: any) => void;
  updateWall: (index: number, wall: any) => void;
  removeWall: (index: number) => void;
  // ---------------------------------


}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      furniture: [],
      selectedId: null,
      isDragging: false,
      viewMode: '3d',
      snapToGrid: true,
      gridSize: 0.6,
      showGrid: true,
      roomWidth: 8,
      roomDepth: 6,

      // ------------------------------------------
      walls: [],
      setWalls: (walls) => set({ walls }),
      addWall: (wall) => set((state) => ({ walls: [...state.walls, wall] })),
      updateWall: (index, wall) =>
        set((state) => {
          const newWalls = [...state.walls];
          newWalls[index] = wall;
          return { walls: newWalls };
        }),
      removeWall: (index) =>
        set((state) => {
          const newWalls = state.walls.filter((_, i) => i !== index);
          return { walls: newWalls };
        }),
      // ------------------------------------------

      selectedItem: () => {
        const { furniture, selectedId } = get();
        return furniture.find(item => item.id === selectedId) || null;
      },

      roomBounds: () => {
        const { roomWidth, roomDepth } = get();
        return { width: roomWidth, depth: roomDepth };
      },

      addFurniture: (definition) => {
        const { furniture, walls, roomWidth, roomDepth } = get();
        const yPosition = definition.isWallMounted ? 1.5 : definition.dimensions.height / 2;
        
        // Calculate smart spawn position based on type
        let spawnPosition: [number, number, number] = [0, yPosition, 0];
        
        if (definition.type === 'door' || definition.type === 'window') {
          // Spawn on wall - try each wall and find valid position
          const bounds = getRoomBounds(walls, { width: roomWidth, depth: roomDepth });
          const halfWidth = definition.dimensions.width / 2;
          const halfDepth = definition.dimensions.depth / 2;
          
          // Try positions on each wall (North, South, East, West)
          const wallPositions: Array<{ pos: [number, number, number], rot: number }> = [
            { pos: [0, yPosition, bounds.maxZ - halfDepth], rot: 0 }, // North wall
            { pos: [0, yPosition, bounds.minZ + halfDepth], rot: Math.PI }, // South wall
            { pos: [bounds.maxX - halfWidth, yPosition, 0], rot: Math.PI / 2 }, // East wall
            { pos: [bounds.minX + halfWidth, yPosition, 0], rot: -Math.PI / 2 }, // West wall
          ];
          
          // Find first valid wall position without collision
          for (const wallPos of wallPositions) {
            const testItem: FurnitureItem = {
              id: 'temp',
              type: definition.type,
              position: wallPos.pos,
              rotation: wallPos.rot,
              color: definition.color,
              name: definition.name,
              dimensions: { ...definition.dimensions },
              isWallMounted: definition.isWallMounted,
              modelPath: definition.modelPath,
            };
            
            if (!willCollide(testItem, wallPos.pos, furniture)) {
              spawnPosition = wallPos.pos;
              const newItem: FurnitureItem = {
                id: `${definition.type}-${Date.now()}`,
                type: definition.type,
                position: spawnPosition,
                rotation: wallPos.rot,
                color: definition.color,
                name: definition.name,
                dimensions: { ...definition.dimensions },
                isWallMounted: definition.isWallMounted,
                modelPath: definition.modelPath,
              };
              
              set({
                furniture: [...furniture, newItem],
                selectedId: newItem.id,
              });
              toast.success(`Added ${definition.name}`);
              return;
            }
          }
          
          // If all wall positions are blocked, try center as fallback
          spawnPosition = [0, yPosition, 0];
        }
        
        // For regular furniture or fallback, spawn near center
        const newItem: FurnitureItem = {
          id: `${definition.type}-${Date.now()}`,
          type: definition.type,
          position: spawnPosition,
          rotation: 0,
          color: definition.color,
          name: definition.name,
          dimensions: { ...definition.dimensions },
          isWallMounted: definition.isWallMounted,
          modelPath: definition.modelPath,
        };

        set({
          furniture: [...furniture, newItem],
          selectedId: newItem.id,
        });
        toast.success(`Added ${definition.name}`);
      },

      selectItem: (id) => {
        const { isDragging } = get();
        if (!isDragging) set({ selectedId: id });
      },

      deselectItem: () => set({ selectedId: null }),
      setIsDragging: (isDragging) => set({ isDragging }),

            
      // ----------------------------------------------------------------
      dragItem : (id, position) => {
        const { furniture, walls } = get();
        const item = furniture.find(f => f.id === id);
        if (!item) return;

        // Calculate new position Box :-
        const testItem = { ...item, position };
        const box = getBoundingBox(testItem);

        // Calculate Room Bounds :---
        const bounds = getRoomBounds(walls, { width: get().roomWidth, depth: get().roomDepth });

        // Save Item inside Bounds :--
        const clampedX = Math.min(Math.max(position[0], bounds.minX + (box.maxX - box.minX)/2), bounds.maxX - (box.maxX - box.minX)/2);
        const clampedZ = Math.min(Math.max(position[2], bounds.minZ + (box.maxZ - box.minZ)/2), bounds.maxZ - (box.maxZ - box.minZ)/2);

        const clampedPosition: [number, number, number] = [clampedX, position[1], clampedZ];

        // Check for collisions with other items
        if (willCollide(item, clampedPosition, furniture)) {
          toast.error('Cannot move: would overlap with another item');
          return;
        }

        set(state => ({
          furniture: state.furniture.map(f =>
            f.id === id ? { ...f, position: clampedPosition } : f
          )
        }));
      },
      // ----------------------------------------------------------------

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
              return { ...item, dimensions: newDimensions, position: newPosition };
            }
            return item;
          })
        }));
      },

      // updatePosition: (axis, value) => {
      //   const { selectedId, furniture, roomWidth, roomDepth } = get();
      //   if (!selectedId) return;

      //   set((state) => ({
      //     furniture: state.furniture.map(item => {
      //       if (item.id === selectedId) {
      //         const newPosition = [...item.position] as [number, number, number];
      //         const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
      //         newPosition[axisIndex] = value;

      //         if (axis === 'x') {
      //           const rotation = item.rotation % (Math.PI * 2);
      //           const isRotated90 = Math.abs(rotation - Math.PI / 2) < 0.1 || Math.abs(rotation - (3 * Math.PI / 2)) < 0.1;
      //           const effectiveWidth = isRotated90 ? item.dimensions.depth / 2 : item.dimensions.width / 2;
      //           const maxX = roomWidth / 2 - effectiveWidth;
      //           newPosition[0] = Math.max(-maxX, Math.min(maxX, value));
      //         } else if (axis === 'z') {
      //           const rotation = item.rotation % (Math.PI * 2);
      //           const isRotated90 = Math.abs(rotation - Math.PI / 2) < 0.1 || Math.abs(rotation - (3 * Math.PI / 2)) < 0.1;
      //           const effectiveDepth = isRotated90 ? item.dimensions.width / 2 : item.dimensions.depth / 2;
      //           const maxZ = roomDepth / 2 - effectiveDepth;
      //           newPosition[2] = Math.max(-maxZ, Math.min(maxZ, value));
      //         }

      //         return { ...item, position: newPosition };
      //       }
      //       return item;
      //     })
      //   }));
      // },


      // ----------------------------------------
      // تعديل updatePosition
      
      
      
      
      
      // -----------------------------------------------------------------
      
      
      
      
      updatePosition: (axis, value) => {
        const { selectedId, furniture, walls, roomWidth, roomDepth } = get();
        if (!selectedId) return;

        const item = furniture.find(f => f.id === selectedId);
        if (!item) return;

        let newPosition = [...item.position] as [number, number, number];
        const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
        newPosition[axisIndex] = value;

        // نحسب البوكس بعد التعديل
        const testItem = { ...item, position: newPosition };
        const box = getBoundingBox(testItem);

        const bounds = getRoomBounds(walls, { width: roomWidth, depth: roomDepth });

        if (axis === 'x') {
          newPosition[0] = Math.min(Math.max(newPosition[0], bounds.minX + (box.maxX - box.minX)/2), bounds.maxX - (box.maxX - box.minX)/2);
        } else if (axis === 'z') {
          newPosition[2] = Math.min(Math.max(newPosition[2], bounds.minZ + (box.maxZ - box.minZ)/2), bounds.maxZ - (box.maxZ - box.minZ)/2);
        }

        set((state) => ({
          furniture: state.furniture.map(f =>
            f.id === selectedId ? { ...f, position: newPosition } : f
          )
        }));
      },
      // -----------------------------------------------------------------

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
            item.id === selectedId ? { ...item, rotation: newRotation } : item
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
          toast.success(newValue ? 'Snap to grid enabled' : 'Snap to grid disabled');
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
    }),
    {
      name: 'planner-storage',
      version: 1,
      partialize: (state) => ({
        furniture: state.furniture,
         walls: state.walls, 
        roomWidth: state.roomWidth,
        roomDepth: state.roomDepth,
        gridSize: state.gridSize,
        snapToGrid: state.snapToGrid,
        showGrid: state.showGrid,
        viewMode: state.viewMode,
      }),
    }
  )
);
