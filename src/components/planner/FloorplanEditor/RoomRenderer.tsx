import React from 'react';
import { Point2D, ViewportState } from './types';
import { worldToScreen, polygonArea, formatMeasurement } from './utils';

interface RoomRendererProps {
  roomPoints: Point2D[] | null;
  viewport: ViewportState;
  canvasCenter: Point2D;
  roomWidth: number;
  roomDepth: number;
}

export const RoomRenderer: React.FC<RoomRendererProps> = ({
  roomPoints,
  viewport,
  canvasCenter,
  roomWidth,
  roomDepth,
}) => {
  // If we have detected room polygon from walls
  if (roomPoints && roomPoints.length >= 3) {
    const screenPoints = roomPoints.map((p) => worldToScreen(p, viewport, canvasCenter));
    const pointsStr = screenPoints.map((p) => `${p.x},${p.y}`).join(' ');
    const area = polygonArea(roomPoints);

    // Calculate centroid for label
    const centroid = {
      x: screenPoints.reduce((sum, p) => sum + p.x, 0) / screenPoints.length,
      y: screenPoints.reduce((sum, p) => sum + p.y, 0) / screenPoints.length,
    };

    return (
      <g className="room-layer">
        {/* Room fill */}
        <polygon
          points={pointsStr}
          fill="hsl(var(--primary))"
          fillOpacity={0.05}
          stroke="hsl(var(--primary))"
          strokeWidth={1}
          strokeDasharray="4 2"
        />

        {/* Area label */}
        <g transform={`translate(${centroid.x}, ${centroid.y})`}>
          <rect
            x={-45}
            y={-15}
            width={90}
            height={30}
            fill="hsl(var(--background))"
            stroke="hsl(var(--border))"
            strokeWidth={1}
            rx={6}
            opacity={0.95}
          />
          <text
            fontSize={12}
            fontWeight={600}
            fill="hsl(var(--foreground))"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {area.toFixed(2)} m²
          </text>
        </g>
      </g>
    );
  }

  // Default room boundary (from roomWidth/roomDepth)
  const halfW = roomWidth / 2;
  const halfD = roomDepth / 2;
  const corners = [
    { x: -halfW, y: halfD },
    { x: halfW, y: halfD },
    { x: halfW, y: -halfD },
    { x: -halfW, y: -halfD },
  ];

  const screenCorners = corners.map((p) => worldToScreen(p, viewport, canvasCenter));
  const pointsStr = screenCorners.map((p) => `${p.x},${p.y}`).join(' ');

  const centroid = {
    x: screenCorners.reduce((sum, p) => sum + p.x, 0) / screenCorners.length,
    y: screenCorners.reduce((sum, p) => sum + p.y, 0) / screenCorners.length,
  };

  return (
    <g className="room-layer">
      {/* Room boundary */}
      <polygon
        points={pointsStr}
        fill="hsl(var(--muted))"
        fillOpacity={0.3}
        stroke="hsl(var(--border))"
        strokeWidth={2}
        strokeDasharray="8 4"
      />

      {/* Dimension labels on edges */}
      {/* Top edge - Width */}
      <g>
        <line
          x1={screenCorners[0].x}
          y1={screenCorners[0].y - 30}
          x2={screenCorners[1].x}
          y2={screenCorners[1].y - 30}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={1}
          markerStart="url(#arrowLeft)"
          markerEnd="url(#arrowRight)"
        />
        <text
          x={(screenCorners[0].x + screenCorners[1].x) / 2}
          y={screenCorners[0].y - 40}
          fontSize={12}
          fontWeight={500}
          fill="hsl(var(--muted-foreground))"
          textAnchor="middle"
        >
          {formatMeasurement(roomWidth, 'm')}
        </text>
      </g>

      {/* Right edge - Depth */}
      <g>
        <line
          x1={screenCorners[1].x + 30}
          y1={screenCorners[1].y}
          x2={screenCorners[2].x + 30}
          y2={screenCorners[2].y}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={1}
          markerStart="url(#arrowUp)"
          markerEnd="url(#arrowDown)"
        />
        <text
          x={screenCorners[1].x + 45}
          y={(screenCorners[1].y + screenCorners[2].y) / 2}
          fontSize={12}
          fontWeight={500}
          fill="hsl(var(--muted-foreground))"
          textAnchor="start"
          dominantBaseline="middle"
        >
          {formatMeasurement(roomDepth, 'm')}
        </text>
      </g>

      {/* Area label */}
      <g transform={`translate(${centroid.x}, ${centroid.y})`}>
        <rect
          x={-55}
          y={-20}
          width={110}
          height={40}
          fill="hsl(var(--card))"
          stroke="hsl(var(--border))"
          strokeWidth={1}
          rx={8}
        />
        <text
          fontSize={11}
          fill="hsl(var(--muted-foreground))"
          textAnchor="middle"
          y={-5}
        >
          Room Area
        </text>
        <text
          fontSize={14}
          fontWeight={700}
          fill="hsl(var(--foreground))"
          textAnchor="middle"
          y={12}
        >
          {(roomWidth * roomDepth).toFixed(2)} m²
        </text>
      </g>
    </g>
  );
};
