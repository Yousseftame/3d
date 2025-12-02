export type FurnitureType = 
  | 'counter'
  | 'cabinet-floor'
  | 'cabinet-wall'
  | 'fridge'
  | 'oven'
  | 'sink'
  | 'dishwasher'
  | 'door'
  | 'window'
  | 'wall'
  | 'ceiling-fan'
  | 'decor'
  | 'kitchen-table'
  | 'Dining_Set'
  | 'tv';

export interface FurnitureItem {
  id: string;
  type: FurnitureType;
  position: [number, number, number];
  rotation: number;
  color: string;
  name: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  isWallMounted: boolean;
  modelPath?: string | null;
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
  modelPath?: string | null;
}
