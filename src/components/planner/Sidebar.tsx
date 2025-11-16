import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Box, Layers, Eye, Grid3x3, Loader2, Trash2 } from 'lucide-react';
import { FurnitureDefinition, FurnitureItem } from '@/types/furniture';
import { PropertyPanel } from './PropertyPanel';
import { GridControls } from './GridControls';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { RoomDimensions } from './RoomDimensions';
import { useFurnitureCatalog } from '@/hooks/useFurnitureCatalog';
import { usePlannerStore } from '@/store/usePlannerStore';

interface SidebarProps {
  selectedItem: FurnitureItem | null;
  onAddFurniture: (type: FurnitureDefinition) => void;
  onUpdateDimensions: (dimension: 'width' | 'height' | 'depth', value: number) => void;
  onUpdatePosition: (axis: 'x' | 'y' | 'z', value: number) => void;
  onRotateSelected: () => void;
  onDeleteSelected: () => void;
  onToggleView: () => void;
  viewMode: '3d' | '2d';
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  onToggleSnap: () => void;
  onToggleGrid: () => void;
  onGridSizeChange: (size: number) => void;
  roomWidth: number;
  roomDepth: number;
  onRoomWidthChange: (width: number) => void;
  onRoomDepthChange: (depth: number) => void;
}

export const Sidebar = ({
  selectedItem,
  onAddFurniture,
  onUpdateDimensions,
  onUpdatePosition,
  onRotateSelected,
  onDeleteSelected,
  onToggleView,
  viewMode,
  snapToGrid,
  gridSize,
  showGrid,
  onToggleSnap,
  onToggleGrid,
  onGridSizeChange,
  roomWidth,
  roomDepth,
  onRoomWidthChange,
  onRoomDepthChange,
}: SidebarProps) => {
  const { catalog, loading, error } = useFurnitureCatalog();
  
  const {deleteAllFurniture} = usePlannerStore();

  return (
    <aside className="w-80 bg-sidebar border-r border-sidebar-border p-6 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-sidebar-foreground flex items-center gap-2">
            <Box className="w-5 h-5 text-primary" />
            Kitchen Planner
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Design your perfect kitchen
          </p>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            View Controls
          </h3>
          <Button
            onClick={onToggleView}
            variant="outline"
            className="w-full justify-start"
          >
            {viewMode === "3d" ? (
              <Grid3x3 className="w-4 h-4 mr-2" />
            ) : (
              <Layers className="w-4 h-4 mr-2" />
            )}
            {viewMode === "3d" ? "Switch to 2D View" : "Switch to 3D View"}
          </Button>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold mb-3">Room Size</h3>
          <RoomDimensions
            width={roomWidth}
            depth={roomDepth}
            onWidthChange={onRoomWidthChange}
            onDepthChange={onRoomDepthChange}
          />
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold mb-3">Grid & Alignment</h3>
          <GridControls
            snapToGrid={snapToGrid}
            gridSize={gridSize}
            showGrid={showGrid}
            onToggleSnap={onToggleSnap}
            onToggleGrid={onToggleGrid}
            onGridSizeChange={onGridSizeChange}
          />
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Add Furniture
          </h3>

          {loading && (
            <div className="flex items-center justify-center p-4 text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading catalog...
            </div>
          )}

          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-2 gap-2">
              {catalog.map((furniture) => (
                <Card
                  key={furniture.type}
                  className="p-3 cursor-pointer hover:shadow-md transition-shadow hover:border-primary"
                  onClick={() => onAddFurniture(furniture)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{furniture.icon}</div>
                    <div className="text-xs font-medium">{furniture.name}</div>
                    {furniture.isWallMounted && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Wall
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={deleteAllFurniture}
          variant="destructive"
          size="sm"
          className="w-full justify-start"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Item
        </Button>

        <Separator />

        <div>
          <KeyboardShortcuts />
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold mb-3">Item Properties</h3>
          <PropertyPanel
            selectedItem={selectedItem}
            onUpdateDimensions={onUpdateDimensions}
            onUpdatePosition={onUpdatePosition}
            onRotate={onRotateSelected}
            onDelete={onDeleteSelected}
          />
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Tips:</strong>
          </p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Click and drag items to move</li>
            <li>Items stay within room bounds</li>
            <li>Wall cabinets mount high</li>
            <li>Use 2D view for precision</li>
          </ul>
        </div>
      </div>
    </aside>
  );
};
