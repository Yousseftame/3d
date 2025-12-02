import { Point2D, Wall2D } from './types';

// Convert world coordinates (meters) to screen coordinates (pixels)
export function worldToScreen(
  point: Point2D,
  viewport: { offsetX: number; offsetY: number; zoom: number },
  canvasCenter: Point2D
): Point2D {
  return {
    x: canvasCenter.x + (point.x * viewport.zoom) + viewport.offsetX,
    y: canvasCenter.y - (point.y * viewport.zoom) + viewport.offsetY,
  };
}

// Convert screen coordinates (pixels) to world coordinates (meters)
export function screenToWorld(
  screenPoint: Point2D,
  viewport: { offsetX: number; offsetY: number; zoom: number },
  canvasCenter: Point2D
): Point2D {
  return {
    x: (screenPoint.x - canvasCenter.x - viewport.offsetX) / viewport.zoom,
    y: (canvasCenter.y + viewport.offsetY - screenPoint.y) / viewport.zoom,
  };
}

// Snap a point to grid
export function snapToGrid(point: Point2D, gridSize: number): Point2D {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

// Calculate distance between two points
export function distance(p1: Point2D, p2: Point2D): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

// Calculate wall length
export function wallLength(wall: Wall2D): number {
  return distance(wall.start, wall.end);
}

// Calculate angle between two points (in radians)
export function angle(p1: Point2D, p2: Point2D): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

// Calculate midpoint
export function midpoint(p1: Point2D, p2: Point2D): Point2D {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

// Calculate polygon area using shoelace formula
export function polygonArea(points: Point2D[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
}

// Check if point is near a line segment
export function pointToLineDistance(point: Point2D, lineStart: Point2D, lineEnd: Point2D): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  return Math.sqrt((point.x - xx) ** 2 + (point.y - yy) ** 2);
}

// Format measurement for display
export function formatMeasurement(meters: number, unit: 'cm' | 'm' = 'cm'): string {
  if (unit === 'cm') {
    return `${(meters * 100).toFixed(0)} cm`;
  }
  return `${meters.toFixed(2)} m`;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Find closest point on grid
export function findClosestGridPoint(point: Point2D, gridSize: number): Point2D {
  return snapToGrid(point, gridSize);
}

// Check if walls form a closed polygon
export function findClosedPolygon(walls: Wall2D[]): Point2D[] | null {
  if (walls.length < 3) return null;

  const points: Point2D[] = [];
  const used = new Set<string>();
  
  // Start from first wall
  let current = walls[0].start;
  points.push(current);
  used.add(walls[0].id);
  current = walls[0].end;
  points.push(current);

  const epsilon = 0.05; // 5cm tolerance

  for (let i = 0; i < walls.length - 1; i++) {
    let found = false;
    for (const wall of walls) {
      if (used.has(wall.id)) continue;
      
      if (distance(current, wall.start) < epsilon) {
        used.add(wall.id);
        current = wall.end;
        if (distance(current, points[0]) > epsilon) {
          points.push(current);
        }
        found = true;
        break;
      } else if (distance(current, wall.end) < epsilon) {
        used.add(wall.id);
        current = wall.start;
        if (distance(current, points[0]) > epsilon) {
          points.push(current);
        }
        found = true;
        break;
      }
    }
    if (!found) break;
  }

  // Check if polygon is closed
  if (distance(current, points[0]) < epsilon && points.length >= 3) {
    return points;
  }

  return null;
}
