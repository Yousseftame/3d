import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { FurnitureItem } from '@/types/furniture';
import { Trash2, RotateCw, Move, Ruler } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PropertyPanelProps {
  selectedItem: FurnitureItem | null;
  onUpdateDimensions: (dimension: 'width' | 'height' | 'depth', value: number) => void;
  onUpdatePosition: (axis: 'x' | 'y' | 'z', value: number) => void;
  onRotate: () => void;
  onDelete: () => void;
}

export const PropertyPanel = ({
  selectedItem,
  onUpdateDimensions,
  onUpdatePosition,
  onRotate,
  onDelete,
}: PropertyPanelProps) => {
  if (!selectedItem) {
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
          {selectedItem.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {selectedItem.isWallMounted ? 'Wall-mounted' : 'Floor-mounted'}
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium mb-2 flex items-center gap-1">
            Width (m): {selectedItem.dimensions.width.toFixed(2)}
          </Label>
          <Slider
            value={[selectedItem.dimensions.width]}
            onValueChange={([value]) => onUpdateDimensions('width', value)}
            min={0.3}
            max={3}
            step={0.1}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-xs font-medium mb-2 flex items-center gap-1">
            Height (m): {selectedItem.dimensions.height.toFixed(2)}
          </Label>
          <Slider
            value={[selectedItem.dimensions.height]}
            onValueChange={([value]) => onUpdateDimensions('height', value)}
            min={0.3}
            max={3}
            step={0.1}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-xs font-medium mb-2 flex items-center gap-1">
            Depth (m): {selectedItem.dimensions.depth.toFixed(2)}
          </Label>
          <Slider
            value={[selectedItem.dimensions.depth]}
            onValueChange={([value]) => onUpdateDimensions('depth', value)}
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
        
        {selectedItem.isWallMounted && (
          <div>
            <Label className="text-xs font-medium mb-2">
              Height from floor (m): {selectedItem.position[1].toFixed(2)}
            </Label>
            <Slider
              value={[selectedItem.position[1]]}
              onValueChange={([value]) => onUpdatePosition('y', value)}
              min={0.5}
              max={2.5}
              step={0.1}
              className="mt-2"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">X: {selectedItem.position[0].toFixed(2)}</Label>
            <Input
              type="number"
              value={selectedItem.position[0].toFixed(2)}
              onChange={(e) => onUpdatePosition('x', parseFloat(e.target.value))}
              step={0.1}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Z: {selectedItem.position[2].toFixed(2)}</Label>
            <Input
              type="number"
              value={selectedItem.position[2].toFixed(2)}
              onChange={(e) => onUpdatePosition('z', parseFloat(e.target.value))}
              step={0.1}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Button
          onClick={onRotate}
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Rotate 90°
        </Button>
        <Button
          onClick={onDelete}
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
