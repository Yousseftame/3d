export interface Point2D {
  x: number;
  y: number;
}

export interface Wall2D {
  id: string;
  start: Point2D;
  end: Point2D;
  thickness: number;
}

export interface Room2D {
  id: string;
  points: Point2D[];
  area: number;
  label: string;
}

export interface Furniture2D {
  id: string;
  position: Point2D;
  width: number;
  depth: number;
  rotation: number;
  type: string;
  name: string;
  color: string;
}

export type EditorTool = 'select' | 'draw' | 'move' | 'delete' | 'door' | 'window';

export interface ViewportState {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

export interface GridSettings {
  size: number;
  subdivisions: number;
  showMajor: boolean;
  showMinor: boolean;
}