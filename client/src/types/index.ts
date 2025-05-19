// Controls for keyboard navigation
export enum Controls {
  forward = "forward",
  backward = "backward",
  leftward = "leftward",
  rightward = "rightward",
  up = "up",
  down = "down",
  rotate = "rotate"
}

// Basic furniture item
export interface FurnitureItem {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  weight: number; // Peso em kg
  color: string;
}

// 3D position with coordinates
export interface Position {
  x: number;
  y: number;
  z: number;
}

// 3D rotation
export interface Rotation {
  x: number;
  y: number;
  z: number;
}

// Furniture item with position and rotation information
export interface FurnitureItemPosition extends FurnitureItem {
  position: Position;
  rotation: Rotation;
}

// Stacking rule to define which items can be stacked on each other
export interface StackingRule {
  item1Id: string;  // Bottom item
  item2Id: string;  // Top item
}
