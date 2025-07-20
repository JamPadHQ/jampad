export interface CanvasState {
	x: number;
	y: number;
	zoom: number;
}

export interface Point {
	x: number;
	y: number;
}

export interface SelectionBox {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
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