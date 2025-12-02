import React from 'react';
import { Point2D, ViewportState } from './types';
import { worldToScreen, distance, formatMeasurement } from './utils';

interface DrawingPreviewProps {
  startPoint: Point2D | null;
  currentPoint: Point2D | null;
  viewport: ViewportState;
  canvasCenter: Point2D;
}

export const DrawingPreview: React.FC<DrawingPreviewProps> = ({
  startPoint,
  currentPoint,
  viewport,
  canvasCenter,
}) => {
  if (!startPoint || !currentPoint) return null;

  const start = worldToScreen(startPoint, viewport, canvasCenter);
  const end = worldToScreen(currentPoint, viewport, canvasCenter);
  const length = distance(startPoint, currentPoint);

  // Calculate midpoint for measurement label
  const mid = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  };

  // Calculate angle for alignment guides
  const dx = currentPoint.x - startPoint.x;
  const dy = currentPoint.y - startPoint.y;
  const isHorizontal = Math.abs(dy) < 0.1;
  const isVertical = Math.abs(dx) < 0.1;

  return (
    <g className="drawing-preview">
      {/* Horizontal alignment guide */}
      {isHorizontal && (
        <line
          x1={0}
          y1={start.y}
          x2={canvasCenter.x * 2}
          y2={start.y}
          stroke="hsl(var(--primary))"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.5}
        />
      )}

      {/* Vertical alignment guide */}
      {isVertical && (
        <line
          x1={start.x}
          y1={0}
          x2={start.x}
          y2={canvasCenter.y * 2}
          stroke="hsl(var(--primary))"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.5}
        />
      )}

      {/* Preview wall line */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="hsl(var(--primary))"
        strokeWidth={12}
        strokeLinecap="round"
        opacity={0.3}
      />
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="8 4"
      />

      {/* Start point */}
      <circle
        cx={start.x}
        cy={start.y}
        r={6}
        fill="hsl(var(--primary))"
      />

      {/* End point */}
      <circle
        cx={end.x}
        cy={end.y}
        r={6}
        fill="hsl(var(--background))"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
      />

      {/* Length measurement */}
      {length > 0.05 && (
        <g transform={`translate(${mid.x}, ${mid.y - 20})`}>
          <rect
            x={-35}
            y={-12}
            width={70}
            height={24}
            fill="hsl(var(--primary))"
            rx={4}
          />
          <text
            fontSize={12}
            fontWeight={600}
            fill="hsl(var(--primary-foreground))"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {formatMeasurement(length)}
          </text>
        </g>
      )}

      {/* Coordinate display */}
      <g transform={`translate(${end.x + 15}, ${end.y - 15})`}>
        <rect
          x={0}
          y={-10}
          width={80}
          height={20}
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          rx={4}
        />
        <text
          x={40}
          fontSize={10}
          fill="hsl(var(--muted-foreground))"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {currentPoint.x.toFixed(2)}, {currentPoint.y.toFixed(2)}
        </text>
      </g>
    </g>
  );
};
