import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Keyboard } from 'lucide-react';

export const KeyboardShortcuts = () => {
  return (
    <Card className="p-4 space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Keyboard className="w-4 h-4 text-primary" />
        Keyboard Shortcuts
      </h3>

      <Separator />

      <div className="space-y-2 text-xs">
        <div className="space-y-1 mb-2">
          <p className="font-semibold text-foreground">Floor Items:</p>
          <div className="flex justify-between items-center pl-2">
            <span className="text-muted-foreground">↑↓ Forward/Back</span>
            <span className="text-muted-foreground">←→ Left/Right</span>
          </div>
        </div>

        <div className="space-y-1 mb-2">
          <p className="font-semibold text-foreground">Wall Items:</p>
          <div className="flex justify-between items-center pl-2">
            <span className="text-muted-foreground">↑↓ Up/Down</span>
            <span className="text-muted-foreground">←→ Left/Right</span>
          </div>
          <div className="flex justify-between items-center pl-2">
            <span className="text-muted-foreground">Alt+↑↓ Forward/Back</span>
          </div>
        </div>
        
        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Shift + Arrows</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">1cm precision</kbd>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Rotate Item</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">R</kbd>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Delete Item</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Del</kbd>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Duplicate Item</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+D</kbd>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Deselect</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Esc</kbd>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Toggle Grid</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">G</kbd>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Toggle Snap</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">S</kbd>
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded mt-2">
        💡 Select an item first to rotate, delete or duplicate
      </div>
    </Card>
  );
};
