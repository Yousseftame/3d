

// src/utils/collision.ts
import { FurnitureItem } from '@/types/furniture';

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface Wall {
  start: [number, number]; // [x, z]
  end: [number, number];   // [x, z]
}

// ----------------- bounding box for a furniture item (needed by collision funcs) -----------------
export const getBoundingBox = (item: FurnitureItem): BoundingBox => {
  const halfWidth = item.dimensions.width / 2;
  const halfHeight = item.dimensions.height / 2;
  const halfDepth = item.dimensions.depth / 2;

  const rotation = item.rotation % (Math.PI * 2);
  const isRotated90 =
    Math.abs(rotation - Math.PI / 2) < 0.1 ||
    Math.abs(rotation - (3 * Math.PI) / 2) < 0.1;

  const effectiveWidth = isRotated90 ? halfDepth : halfWidth;
  const effectiveDepth = isRotated90 ? halfWidth : halfDepth;

  return {
    minX: item.position[0] - effectiveWidth,
    maxX: item.position[0] + effectiveWidth,
    minY: item.position[1] - halfHeight,
    maxY: item.position[1] + halfHeight,
    minZ: item.position[2] - effectiveDepth,
    maxZ: item.position[2] + effectiveDepth,
  };
};

// Wall thickness constants
export const BOUNDARY_WALL_THICKNESS = 0.2;
export const CUSTOM_WALL_THICKNESS = 0.15;

// ----------------- room bounds computed from walls (separate function) -----------------
export const getRoomBounds = (
  walls: Wall[] | undefined,
  fallback: { width: number; depth: number }
): { minX: number; maxX: number; minZ: number; maxZ: number } => {
  if (!walls || walls.length === 0) {
    // Use the full room dimensions without wall thickness
    const { width, depth } = fallback;
    return {
      minX: -width / 2,
      maxX: width / 2,
      minZ: -depth / 2,
      maxZ: depth / 2,
    };
  }

  const xs = walls.flatMap((w) => [w.start[0], w.end[0]]);
  const zs = walls.flatMap((w) => [w.start[1], w.end[1]]);

  // Account for wall thickness by subtracting half thickness from bounds
  const halfThickness = CUSTOM_WALL_THICKNESS / 2;

  return {
    minX: Math.min(...xs) + halfThickness,
    maxX: Math.max(...xs) - halfThickness,
    minZ: Math.min(...zs) + halfThickness,
    maxZ: Math.max(...zs) - halfThickness,
  };
};

// ----------------- collision helpers -----------------
export const checkCollision = (box1: BoundingBox, box2: BoundingBox): boolean => {
  const margin = 0.01;
  return (
    box1.minX - margin < box2.maxX &&
    box1.maxX + margin > box2.minX &&
    box1.minY - margin < box2.maxY &&
    box1.maxY + margin > box2.minY &&
    box1.minZ - margin < box2.maxZ &&
    box1.maxZ + margin > box2.minZ
  );
};

export const willCollide = (
  item: FurnitureItem,
  newPosition: [number, number, number],
  allItems: FurnitureItem[],
): boolean => {
  const testItem = { ...item, position: newPosition };
  const testBox = getBoundingBox(testItem);

  return allItems.some((otherItem) => {
    if (otherItem.id === item.id) return false;
    const otherBox = getBoundingBox(otherItem);
    return checkCollision(testBox, otherBox);
  });
};

export const willCollideAfterResize = (
  item: FurnitureItem,
  newDimensions: { width: number; height: number; depth: number },
  allItems: FurnitureItem[],
): boolean => {
  const testItem = { ...item, dimensions: newDimensions };
  const testBox = getBoundingBox(testItem);

  return allItems.some((otherItem) => {
    if (otherItem.id === item.id) return false;
    const otherBox = getBoundingBox(otherItem);
    return checkCollision(testBox, otherBox);
  });
};

export const willCollideAfterRotation = (
  item: FurnitureItem,
  newRotation: number,
  allItems: FurnitureItem[],
): boolean => {
  const testItem = { ...item, rotation: newRotation };
  const testBox = getBoundingBox(testItem);

  return allItems.some((otherItem) => {
    if (otherItem.id === item.id) return false;
    const otherBox = getBoundingBox(otherItem);
    return checkCollision(testBox, otherBox);
  });
};
