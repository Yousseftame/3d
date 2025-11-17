import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Maximize2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

import { Room } from './Room';
import Kitchen2DEditor from './Kitchen2DEditor';
import { usePlannerStore } from '@/store/usePlannerStore';

export const RoomDimensions = () => {
  const { roomWidth, roomDepth, setRoomWidth, setRoomDepth } = usePlannerStore();
    
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
              value={roomWidth.toFixed(1)}
              onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 3)}
              min={3}
              max={20}
              step={0.5}
              className="h-7 w-16 text-xs"
            />
          </Label>
          <Slider
            value={[roomWidth]}
            onValueChange={([value]) => setRoomWidth(value)}
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
              value={roomDepth.toFixed(1)}
              onChange={(e) => setRoomDepth(parseFloat(e.target.value) || 3)}
              min={3}
              max={20}
              step={0.5}
              className="h-7 w-16 text-xs"
            />
          </Label>
          <Slider
            value={[roomDepth]}
            onValueChange={([value]) => setRoomDepth(value)}
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
          <Room width={roomWidth} depth={roomDepth} height={3} />
        </TabsContent>
      </Tabs>
      {/* --------------------------------------------------------------- */}

      <Separator />

      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
        <p>Total area: {(roomWidth * roomDepth).toFixed(1)} m²</p>
      </div>
    </Card>
  );
};
