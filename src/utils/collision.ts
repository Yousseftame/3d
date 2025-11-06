import { FurnitureItem } from "@/types/furniture";

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export const getBoundingBox = (item: FurnitureItem): BoundingBox => {
  const halfWidth = item.dimensions.width / 2;
  const halfHeight = item.dimensions.height / 2;
  const halfDepth = item.dimensions.depth / 2;

  // Calculate rotated bounding box (simplified for 90-degree rotations)
  const rotation = item.rotation % (Math.PI * 2);
  const isRotated90 = Math.abs(rotation - Math.PI / 2) < 0.1 || Math.abs(rotation - (3 * Math.PI) / 2) < 0.1;

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

export const checkCollision = (box1: BoundingBox, box2: BoundingBox): boolean => {
  // Add small margin to prevent items from being too close
  const margin = 0.000000000005;

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
