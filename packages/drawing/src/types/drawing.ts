// Import Point from canvas package since drawing depends on canvas coordinates
import { Point } from '@jampad/canvas';

export interface DrawPath {
	id: string;
	points: Point[];
	color: string;
	strokeWidth: number;
}

export type ShapeType = 'rectangle' | 'circle' | 'triangle';

export interface Shape {
	id: string;
	type: ShapeType;
	start: Point;
	end: Point;
	color: string;
	strokeWidth: number;
}

// Current drawing state for in-progress paths
export interface CurrentDrawing {
	points: Point[];
}

// Current shape state for in-progress shapes  
export interface CurrentShape {
	start: Point;
	end: Point;
	type: ShapeType;
}

// Drawing configuration
export interface DrawingConfig {
	defaultStrokeWidth: number;
	defaultColor: string;
}

// Base drawing element interface
export interface DrawingElement {
	id: string;
	type: 'path' | 'shape';
	data: DrawPath | Shape;
} 