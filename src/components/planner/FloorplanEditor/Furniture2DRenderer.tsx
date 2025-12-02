import React from 'react';
import { Point2D, ViewportState } from './types';
import { worldToScreen } from './utils';
import { FurnitureItem } from '@/types/furniture';

interface Furniture2DRendererProps {
  furniture: FurnitureItem[];
  viewport: ViewportState;
  canvasCenter: Point2D;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const furnitureIcons: Record<string, string> = {
  'counter': '🔲',
  'cabinet-floor': '🗄️',
  'cabinet-wall': '📦',
  'fridge': '🧊',
  'oven': '🔥',
  'sink': '🚰',
  'dishwasher': '🫧',
  'door': '🚪',
  'window': '🪟',
  'wall': '🧱',
  'ceiling-fan': '🌀',
  'decor': '🪴',
  'kitchen-table': '🍽️',
  'Dining_Set': '🪑',
  'tv': '📺',
};

export const Furniture2DRenderer: React.FC<Furniture2DRendererProps> = ({
  furniture,
  viewport,
  canvasCenter,
  selectedId,
  onSelect,
}) => {
  return (
    <g className="furniture-layer">
      {furniture.map((item) => {
        const pos = worldToScreen(
          { x: item.position[0], y: item.position[2] },
          viewport,
          canvasCenter
        );

        const widthPx = item.dimensions.width * viewport.zoom;
        const depthPx = item.dimensions.depth * viewport.zoom;
        const rotation = (item.rotation * 180) / Math.PI;
        const isSelected = item.id === selectedId;

        const icon = furnitureIcons[item.type] || '📦';

        return (
          <g
            key={item.id}
            transform={`translate(${pos.x}, ${pos.y}) rotate(${-rotation})`}
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item.id);
            }}
          >
            {/* Selection highlight */}
            {isSelected && (
              <rect
                x={-widthPx / 2 - 4}
                y={-depthPx / 2 - 4}
                width={widthPx + 8}
                height={depthPx + 8}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="4 2"
                rx={4}
              />
            )}

            {/* Furniture shape */}
            <rect
              x={-widthPx / 2}
              y={-depthPx / 2}
              width={widthPx}
              height={depthPx}
              fill={item.color}
              fillOpacity={0.7}
              stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
              strokeWidth={isSelected ? 2 : 1}
              rx={2}
            />

            {/* Icon/label */}
            {widthPx > 30 && depthPx > 30 && (
              <text
                fontSize={Math.min(widthPx, depthPx) * 0.4}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${rotation})`}
              >
                {icon}
              </text>
            )}

            {/* Name label (when selected or large enough) */}
            {(isSelected || (widthPx > 60 && depthPx > 40)) && (
              <text
                y={depthPx / 2 + 14}
                fontSize={10}
                fontWeight={500}
                fill="hsl(var(--foreground))"
                textAnchor="middle"
                transform={`rotate(${rotation})`}
              >
                {item.name}
              </text>
            )}

            {/* Direction indicator (front of furniture) */}
            <line
              x1={0}
              y1={-depthPx / 2}
              x2={0}
              y2={-depthPx / 2 - 8}
              stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
              strokeWidth={2}
              markerEnd="url(#arrowUp)"
            />
          </g>
        );
      })}
    </g>
  );
};
