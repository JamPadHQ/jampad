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

export type Tool = 'select' | 'move' | 'draw'


export interface DrawPath {
	id: string
	points: Point[]
	color: string
	strokeWidth: number
}

export interface Element {
	id: string
	type: 'path' | 'shape'
	data: DrawPath
}

export interface Member {
	nickname: string
	color: string
}

export type Settings = {}