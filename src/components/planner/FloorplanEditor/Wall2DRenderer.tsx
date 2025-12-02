import React from 'react';
import { Wall2D, Point2D, ViewportState } from './types';
import { worldToScreen, wallLength, midpoint, angle, formatMeasurement } from './utils';

interface Wall2DRendererProps {
  walls: Wall2D[];
  viewport: ViewportState;
  canvasCenter: Point2D;
  selectedWallId: string | null;
  hoveredWallId: string | null;
  onWallClick: (wallId: string) => void;
  onPointDragStart: (wallId: string, point: 'start' | 'end') => void;
}

export const Wall2DRenderer: React.FC<Wall2DRendererProps> = ({
  walls,
  viewport,
  canvasCenter,
  selectedWallId,
  hoveredWallId,
  onWallClick,
  onPointDragStart,
}) => {
  return (
    <g className="walls-layer">
      {walls.map((wall) => {
        const start = worldToScreen(wall.start, viewport, canvasCenter);
        const end = worldToScreen(wall.end, viewport, canvasCenter);
        const length = wallLength(wall);
        const mid = midpoint(start, end);
        const wallAngle = angle(start, end) * (180 / Math.PI);
        
        const isSelected = wall.id === selectedWallId;
        const isHovered = wall.id === hoveredWallId;

        // Wall thickness in pixels
        const thicknessPixels = wall.thickness * viewport.zoom;

        return (
          <g key={wall.id}>
            {/* Wall shadow for depth */}
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="hsl(var(--foreground))"
              strokeWidth={thicknessPixels + 4}
              strokeLinecap="round"
              opacity={0.1}
            />

            {/* Main wall line */}
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={
                isSelected
                  ? 'hsl(var(--primary))'
                  : isHovered
                  ? 'hsl(var(--accent-foreground))'
                  : 'hsl(var(--foreground))'
              }
              strokeWidth={thicknessPixels}
              strokeLinecap="round"
              className="cursor-pointer transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onWallClick(wall.id);
              }}
            />

            {/* Measurement label */}
            <g transform={`translate(${mid.x}, ${mid.y})`}>
              {/* Background for label */}
              <rect
                x={-30}
                y={-22}
                width={60}
                height={18}
                fill="hsl(var(--background))"
                stroke="hsl(var(--border))"
                strokeWidth={1}
                rx={4}
                transform={`rotate(${wallAngle > 90 || wallAngle < -90 ? wallAngle + 180 : wallAngle})`}
              />
              {/* Measurement text */}
              <text
                fontSize={11}
                fontWeight={500}
                fill="hsl(var(--primary))"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${wallAngle > 90 || wallAngle < -90 ? wallAngle + 180 : wallAngle}) translate(0, -13)`}
              >
                {formatMeasurement(length)}
              </text>
            </g>

            {/* Endpoint handles */}
            {(isSelected || isHovered) && (
              <>
                {/* Start point */}
                <circle
                  cx={start.x}
                  cy={start.y}
                  r={8}
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  className="cursor-move"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onPointDragStart(wall.id, 'start');
                  }}
                />
                {/* End point */}
                <circle
                  cx={end.x}
                  cy={end.y}
                  r={8}
                  fill="hsl(var(--background))"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  className="cursor-move"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onPointDragStart(wall.id, 'end');
                  }}
                />
              </>
            )}
          </g>
        );
      })}
    </g>
  );
};
