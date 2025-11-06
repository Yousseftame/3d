export type FurnitureType = 
  | 'counter'
  | 'cabinet-floor'
  | 'cabinet-wall'
  | 'fridge'
  | 'oven'
  | 'sink'
  | 'dishwasher';

export interface FurnitureItem {
  id: string;
  type: FurnitureType;
  position: [number, number, number];
  rotation: number;
  color: string;
  name: string;
}

export interface FurnitureDefinition {
  type: FurnitureType;
  name: string;
  color: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  isWallMounted: boolean;
  icon: string;
}
