import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Grid3x3, Ruler } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface GridControlsProps {
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  onToggleSnap: () => void;
  onToggleGrid: () => void;
  onGridSizeChange: (size: number) => void;
}

const GRID_SIZES = [
  { label: '30cm', value: 0.3 },
  { label: '60cm', value: 0.6 },
  { label: '90cm', value: 0.9 },
];

export const GridControls = ({
  snapToGrid,
  gridSize,
  showGrid,
  onToggleSnap,
  onToggleGrid,
  onGridSizeChange,
}: GridControlsProps) => {
  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Grid3x3 className="w-4 h-4 text-primary" />
          Grid Settings
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-grid" className="text-sm cursor-pointer">
            Show Grid
          </Label>
          <Switch
            id="show-grid"
            checked={showGrid}
            onCheckedChange={onToggleGrid}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="snap-grid" className="text-sm cursor-pointer">
            Snap to Grid
          </Label>
          <Switch
            id="snap-grid"
            checked={snapToGrid}
            onCheckedChange={onToggleSnap}
          />
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-xs font-medium mb-2 flex items-center gap-1">
          <Ruler className="w-3 h-3" />
          Grid Size
        </Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {GRID_SIZES.map((size) => (
            <Button
              key={size.value}
              variant={gridSize === size.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onGridSizeChange(size.value)}
              className="text-xs"
              disabled={!showGrid && !snapToGrid}
            >
              {size.label}
            </Button>
          ))}
        </div>
      </div>

      {snapToGrid && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <p>Items will snap to {(gridSize * 100).toFixed(0)}cm intervals</p>
        </div>
      )}
    </Card>
  );
};
