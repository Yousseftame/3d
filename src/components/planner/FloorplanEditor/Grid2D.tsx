import React, { useMemo } from 'react';
import { ViewportState } from './types';

interface Grid2DProps {
  width: number;
  height: number;
  viewport: ViewportState;
  gridSize: number;
  showGrid: boolean;
}

export const Grid2D: React.FC<Grid2DProps> = ({
  width,
  height,
  viewport,
  gridSize,
  showGrid,
}) => {
  const gridLines = useMemo(() => {
    if (!showGrid) return null;

    const lines: JSX.Element[] = [];
    const { offsetX, offsetY, zoom } = viewport;
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate visible area in world coordinates
    const worldLeft = (-centerX - offsetX) / zoom;
    const worldRight = (width - centerX - offsetX) / zoom;
    const worldTop = (centerY + offsetY) / zoom;
    const worldBottom = (-height + centerY + offsetY) / zoom;

    // Grid spacing in pixels
    const majorSpacing = gridSize * zoom; // 1 meter
    const minorSpacing = (gridSize / 5) * zoom; // 20cm

    // Minor grid lines (every 20cm)
    if (minorSpacing > 8) {
      const minorGridSize = gridSize / 5;
      const startX = Math.floor(worldLeft / minorGridSize) * minorGridSize;
      const startY = Math.floor(worldBottom / minorGridSize) * minorGridSize;

      for (let x = startX; x <= worldRight; x += minorGridSize) {
        const screenX = centerX + x * zoom + offsetX;
        if (screenX >= 0 && screenX <= width) {
          lines.push(
            <line
              key={`minor-v-${x}`}
              x1={screenX}
              y1={0}
              x2={screenX}
              y2={height}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={0.5}
              opacity={0.15}
            />
          );
        }
      }

      for (let y = startY; y <= worldTop; y += minorGridSize) {
        const screenY = centerY - y * zoom + offsetY;
        if (screenY >= 0 && screenY <= height) {
          lines.push(
            <line
              key={`minor-h-${y}`}
              x1={0}
              y1={screenY}
              x2={width}
              y2={screenY}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={0.5}
              opacity={0.15}
            />
          );
        }
      }
    }

    // Major grid lines (every 1 meter)
    const startX = Math.floor(worldLeft / gridSize) * gridSize;
    const startY = Math.floor(worldBottom / gridSize) * gridSize;

    for (let x = startX; x <= worldRight; x += gridSize) {
      const screenX = centerX + x * zoom + offsetX;
      if (screenX >= 0 && screenX <= width) {
        const isOrigin = Math.abs(x) < 0.001;
        lines.push(
          <line
            key={`major-v-${x}`}
            x1={screenX}
            y1={0}
            x2={screenX}
            y2={height}
            stroke={isOrigin ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
            strokeWidth={isOrigin ? 1.5 : 0.8}
            opacity={isOrigin ? 0.6 : 0.3}
          />
        );
      }
    }

    for (let y = startY; y <= worldTop; y += gridSize) {
      const screenY = centerY - y * zoom + offsetY;
      if (screenY >= 0 && screenY <= height) {
        const isOrigin = Math.abs(y) < 0.001;
        lines.push(
          <line
            key={`major-h-${y}`}
            x1={0}
            y1={screenY}
            x2={width}
            y2={screenY}
            stroke={isOrigin ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
            strokeWidth={isOrigin ? 1.5 : 0.8}
            opacity={isOrigin ? 0.6 : 0.3}
          />
        );
      }
    }

    return lines;
  }, [width, height, viewport, gridSize, showGrid]);

  if (!showGrid) return null;

  return <g className="grid-layer">{gridLines}</g>;
};
