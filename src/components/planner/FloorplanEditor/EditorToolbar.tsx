import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MousePointer2,
  Pencil,
  Move,
  Trash2,
  DoorOpen,
  SquareAsterisk,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid3X3,
  Undo,
  Redo,
} from 'lucide-react';
import { EditorTool } from './types';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  activeTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onToggleGrid: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  showGrid: boolean;
}

const tools: { id: EditorTool; icon: React.ElementType; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'draw', icon: Pencil, label: 'Draw Wall' },
  { id: 'move', icon: Move, label: 'Move' },
  { id: 'delete', icon: Trash2, label: 'Delete' },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  activeTool,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onToggleGrid,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  showGrid,
}) => {
  return (
    <div className="absolute left-4 top-4 bg-card border border-border rounded-lg shadow-lg p-2 flex flex-col gap-1 z-10">
      {/* Main tools */}
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant={activeTool === tool.id ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onToolChange(tool.id)}
          title={tool.label}
          className={cn(
            'w-10 h-10',
            activeTool === tool.id && 'bg-primary text-primary-foreground'
          )}
        >
          <tool.icon className="h-5 w-5" />
        </Button>
      ))}

      <Separator className="my-1" />

      {/* Zoom controls */}
      <Button variant="ghost" size="icon" onClick={onZoomIn} title="Zoom In" className="w-10 h-10">
        <ZoomIn className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onZoomOut} title="Zoom Out" className="w-10 h-10">
        <ZoomOut className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onZoomFit} title="Fit to View" className="w-10 h-10">
        <Maximize className="h-5 w-5" />
      </Button>

      <Separator className="my-1" />

      {/* Grid toggle */}
      <Button
        variant={showGrid ? 'default' : 'ghost'}
        size="icon"
        onClick={onToggleGrid}
        title="Toggle Grid"
        className={cn('w-10 h-10', showGrid && 'bg-primary text-primary-foreground')}
      >
        <Grid3X3 className="h-5 w-5" />
      </Button>

      <Separator className="my-1" />

      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
        className="w-10 h-10"
      >
        <Undo className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo"
        className="w-10 h-10"
      >
        <Redo className="h-5 w-5" />
      </Button>
    </div>
  );
};
