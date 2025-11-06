import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Box, Layers, Eye, Grid3x3 } from 'lucide-react';
import { FurnitureDefinition, FurnitureItem } from '@/types/furniture';
import { PropertyPanel } from './PropertyPanel';
import { GridControls } from './GridControls';

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
}

const furnitureTypes: FurnitureDefinition[] = [
  { type: 'counter', name: 'Counter', color: '#8B7355', dimensions: { width: 0.6, height: 0.9, depth: 0.6 }, isWallMounted: false, icon: '📦' },
  { type: 'cabinet-floor', name: 'Floor Cabinet', color: '#6B5D4F', dimensions: { width: 0.6, height: 0.9, depth: 0.6 }, isWallMounted: false, icon: '🗄️' },
  { type: 'cabinet-wall', name: 'Wall Cabinet', color: '#7A6A5A', dimensions: { width: 0.6, height: 0.6, depth: 0.35 }, isWallMounted: true, icon: '📋' },
  { type: 'sink', name: 'Sink', color: '#C0C0C0', dimensions: { width: 0.8, height: 0.9, depth: 0.6 }, isWallMounted: false, icon: '🚰' },
  { type: 'fridge', name: 'Refrigerator', color: '#E8E8E8', dimensions: { width: 0.7, height: 1.8, depth: 0.7 }, isWallMounted: false, icon: '🧊' },
  { type: 'oven', name: 'Oven', color: '#2C2C2C', dimensions: { width: 0.6, height: 0.9, depth: 0.6 }, isWallMounted: false, icon: '🔥' },
  { type: 'dishwasher', name: 'Dishwasher', color: '#D3D3D3', dimensions: { width: 0.6, height: 0.9, depth: 0.6 }, isWallMounted: false, icon: '💧' },
];

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
}: SidebarProps) => {
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
            {viewMode === '3d' ? <Grid3x3 className="w-4 h-4 mr-2" /> : <Layers className="w-4 h-4 mr-2" />}
            {viewMode === '3d' ? 'Switch to 2D View' : 'Switch to 3D View'}
          </Button>
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
          <div className="grid grid-cols-2 gap-2">
            {furnitureTypes.map((furniture) => (
              <Card
                key={furniture.type}
                className="p-3 cursor-pointer hover:shadow-md transition-shadow hover:border-primary"
                onClick={() => onAddFurniture(furniture)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{furniture.icon}</div>
                  <div className="text-xs font-medium">{furniture.name}</div>
                  {furniture.isWallMounted && (
                    <div className="text-xs text-muted-foreground mt-1">Wall</div>
                  )}
                </div>
              </Card>
            ))}
          </div>
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
          <p><strong>Tips:</strong></p>
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
