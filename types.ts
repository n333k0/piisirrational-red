export interface Point {
  x: number;
  y: number;
}

export interface VectorComponent {
  start: Point;
  end: Point;
  radius: number;
  angle: number;
  label: string;
}

export interface VisualizationState {
  theta: number;
  finalPoint: Point;
  vectors: VectorComponent[];
}