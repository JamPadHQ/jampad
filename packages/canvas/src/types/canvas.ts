export interface CanvasState {
	x: number;
	y: number;
	zoom: number;
}

export interface Point {
	x: number;
	y: number;
}

export interface CanvasViewport {
	width: number;
	height: number;
}

export interface CanvasBounds {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}

export interface SelectionBox {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
}

export type Tool = 'select' | 'move' | 'draw' | 'sticky-note' | 'shape-rectangle' | 'shape-circle' | 'shape-triangle';

// Base element interface for bounds calculation
export interface BaseElement {
	id: string;
	type: string;
	data: any;
} 