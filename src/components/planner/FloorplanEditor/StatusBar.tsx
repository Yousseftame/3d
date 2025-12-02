import React from 'react';
import { ViewportState, EditorTool } from './types';

interface StatusBarProps {
  viewport: ViewportState;
  wallCount: number;
  furnitureCount: number;
  roomArea: number;
  activeTool: EditorTool;
  cursorPosition: { x: number; y: number } | null;
  snapEnabled: boolean;
}

const toolLabels: Record<EditorTool, string> = {
  select: 'Select Tool',
  draw: 'Draw Wall',
  move: 'Move',
  delete: 'Delete',
  door: 'Add Door',
  window: 'Add Window',
};

export const StatusBar: React.FC<StatusBarProps> = ({
  viewport,
  wallCount,
  furnitureCount,
  roomArea,
  activeTool,
  cursorPosition,
  snapEnabled,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-card/95 backdrop-blur border-t border-border flex items-center justify-between px-4 text-xs">
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground">
          Tool: <span className="text-foreground font-medium">{toolLabels[activeTool]}</span>
        </span>
        <span className="text-muted-foreground">
          Zoom: <span className="text-foreground font-medium">{(viewport.zoom / 100 * 100).toFixed(0)}%</span>
        </span>
        {snapEnabled && (
          <span className="text-primary font-medium">
            ⊞ Snap ON
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {cursorPosition && (
          <span className="text-muted-foreground font-mono">
            X: {cursorPosition.x.toFixed(2)}m  Y: {cursorPosition.y.toFixed(2)}m
          </span>
        )}
        <span className="text-muted-foreground">
          Walls: <span className="text-foreground">{wallCount}</span>
        </span>
        <span className="text-muted-foreground">
          Items: <span className="text-foreground">{furnitureCount}</span>
        </span>
        <span className="text-muted-foreground">
          Area: <span className="text-foreground font-medium">{roomArea.toFixed(2)} m²</span>
        </span>
      </div>
    </div>
  );
};
