import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCw, Move, Ruler } from "lucide-react";
import { Separator } from "@/components/ui/separator";

import { usePlannerStore } from "@/store/usePlannerStore";

export const PropertyPanel = () => {
  const {
    updateDimensions,
    updatePosition,
    rotateSelected,
    deleteSelected,
  } = usePlannerStore();

  const item = usePlannerStore((store) => store.selectedItem());

  if (!item) {
    return (
      <Card className="p-4 bg-card/50">
        <p className="text-sm text-muted-foreground text-center">
          Select an item to edit its properties
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <Ruler className="w-4 h-4 text-primary" />
          {item.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {item.isWallMounted ? "Wall-mounted" : "Floor-mounted"}
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium mb-2 flex items-center gap-1">
            Width (m): {item.dimensions.width.toFixed(2)}
          </Label>
          <Slider
            value={[item.dimensions.width]}
            onValueChange={([value]) => updateDimensions("width", value)}
            min={0.3}
            max={3}
            step={0.1}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-xs font-medium mb-2 flex items-center gap-1">
            Height (m): {item.dimensions.height.toFixed(2)}
          </Label>
          <Slider
            value={[item.dimensions.height]}
            onValueChange={([value]) => updateDimensions("height", value)}
            min={0.3}
            max={3}
            step={0.1}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-xs font-medium mb-2 flex items-center gap-1">
            Depth (m): {item.dimensions.depth.toFixed(2)}
          </Label>
          <Slider
            value={[item.dimensions.depth]}
            onValueChange={([value]) => updateDimensions("depth", value)}
            min={0.3}
            max={1.5}
            step={0.1}
            className="mt-2"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="text-xs font-semibold flex items-center gap-2">
          <Move className="w-3 h-3" />
          Position
        </h4>

        {item.isWallMounted && (
          <div>
            <Label className="text-xs font-medium mb-2">
              Height from floor (m): {item.position[1].toFixed(2)}
            </Label>
            <Slider
              value={[item.position[1]]}
              onValueChange={([value]) => updatePosition("y", value)}
              min={0.5}
              max={2.5}
              step={0.1}
              className="mt-2"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">X: {item.position[0].toFixed(2)}</Label>
            <Input
              type="number"
              value={item.position[0].toFixed(2)}
              onChange={(e) => updatePosition("x", parseFloat(e.target.value))}
              step={0.1}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Z: {item.position[2].toFixed(2)}</Label>
            <Input
              type="number"
              value={item.position[2].toFixed(2)}
              onChange={(e) => updatePosition("z", parseFloat(e.target.value))}
              step={0.1}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Button
          onClick={rotateSelected}
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Rotate 90°
        </Button>
        <Button
          onClick={deleteSelected}
          variant="destructive"
          size="sm"
          className="w-full justify-start"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Item
        </Button>
      </div>
    </Card>
  );
};
