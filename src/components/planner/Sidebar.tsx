import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFurnitureCatalog } from "@/hooks/useFurnitureCatalog";
import { Box, Eye, Grid3x3, Layers, Loader2, Trash2, PenTool, Move3D } from "lucide-react";

import { GridControls } from "./GridControls";
import { RoomDimensions } from "./RoomDimensions";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { usePlannerStore } from "@/store/usePlannerStore";
import { PropertyPanel } from "./PropertyPanel";

export const Sidebar = () => {
  const { catalog, loading, error } = useFurnitureCatalog();

  const {
    deleteAllFurniture,
    toggleView,
    viewMode,
    addFurniture,
  } = usePlannerStore();

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
            View Mode
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => viewMode !== '3d' && toggleView()}
              variant={viewMode === '3d' ? 'default' : 'outline'}
              size="sm"
              className="justify-center"
            >
              <Move3D className="w-4 h-4 mr-1" />
              3D
            </Button>
            <Button
              onClick={() => viewMode !== '2d' && toggleView()}
              variant={viewMode === '2d' ? 'default' : 'outline'}
              size="sm"
              className="justify-center"
            >
              <PenTool className="w-4 h-4 mr-1" />
              2D
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {viewMode === '2d' 
              ? 'Floorplan editor for precise wall drawing' 
              : '3D view for furniture placement'}
          </p>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold mb-3">Room Size</h3>
          <RoomDimensions />
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold mb-3">Grid & Alignment</h3>
          <GridControls />
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
                  onClick={() => addFurniture(furniture)}
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
          Delete All Items
        </Button>

        <Separator />

        <div>
          <KeyboardShortcuts />
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-semibold mb-3">Item Properties</h3>
          <PropertyPanel/>
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            <strong>Tips ({viewMode === '2d' ? '2D Editor' : '3D View'}):</strong>
          </p>
          {viewMode === '2d' ? (
            <ul className="space-y-1 ml-4 list-disc">
              <li>Press <kbd className="bg-muted px-1 rounded">W</kbd> to draw walls</li>
              <li>Click and drag endpoints to resize</li>
              <li>Alt + drag to pan the canvas</li>
              <li>Scroll to zoom in/out</li>
              <li>Walls auto-snap to grid</li>
            </ul>
          ) : (
            <ul className="space-y-1 ml-4 list-disc">
              <li>Click and drag items to move</li>
              <li>Items stay within room bounds</li>
              <li>Wall cabinets mount high</li>
              <li>Use 2D view for precise walls</li>
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
};
