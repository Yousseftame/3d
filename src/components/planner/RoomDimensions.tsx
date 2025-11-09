import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Maximize2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import Kitchen2DEditor from './Kitchen2DEditor';
import { Room } from './Room';

interface RoomDimensionsProps {
  width: number;
  depth: number;
  onWidthChange: (width: number) => void;
  onDepthChange: (depth: number) => void;
}

export const RoomDimensions = ({
  width,
  depth,
  onWidthChange,
  onDepthChange,
}: RoomDimensionsProps) => {
  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Maximize2 className="w-4 h-4 text-primary" />
          Room Dimensions
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium mb-2 flex items-center justify-between">
            <span>Width (m)</span>
            <Input
              type="number"
              value={width.toFixed(1)}
              onChange={(e) => onWidthChange(parseFloat(e.target.value) || 3)}
              min={3}
              max={20}
              step={0.5}
              className="h-7 w-16 text-xs"
            />
          </Label>
          <Slider
            value={[width]}
            onValueChange={([value]) => onWidthChange(value)}
            min={3}
            max={20}
            step={0.5}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-xs font-medium mb-2 flex items-center justify-between">
            <span>Depth (m)</span>
            <Input
              type="number"
              value={depth.toFixed(1)}
              onChange={(e) => onDepthChange(parseFloat(e.target.value) || 3)}
              min={3}
              max={20}
              step={0.5}
              className="h-7 w-16 text-xs"
            />
          </Label>
          <Slider
            value={[depth]}
            onValueChange={([value]) => onDepthChange(value)}
            min={3}
            max={20}
            step={0.5}
            className="mt-2"
          />
        </div>
      </div>


      {/* --------------------------------------------------------------- */}
      <Tabs defaultValue="3d" className=''>
        <TabsList className='flex items-center justify-between'>
          <TabsTrigger className='border-2 rounded-sm px-4 py-1' value="2d">2D Editor</TabsTrigger>
          <TabsTrigger className='border-2 rounded-sm px-4 py-1' value="3d">3D View</TabsTrigger>
        </TabsList>

        <TabsContent value="2d">
          <Kitchen2DEditor />
        </TabsContent>

        <TabsContent value="3d">
          <Room width={width} depth={depth} height={3} />
        </TabsContent>
      </Tabs>
      {/* --------------------------------------------------------------- */}

      <Separator />

      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
        <p>Total area: {(width * depth).toFixed(1)} m²</p>
      </div>
    </Card>
  );
};
