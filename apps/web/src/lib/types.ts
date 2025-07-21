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

export type Tool = 'select' | 'move' | 'draw' | 'sticky-note' | 'shape-rectangle' | 'shape-circle' | 'shape-triangle'


export interface DrawPath {
	id: string
	points: Point[]
	color: string
	strokeWidth: number
}

export interface StickyNote {
	id: string
	position: Point
	text: string
	color: string
	width: number
	height: number
}

export interface Element {
	id: string
	type: 'path' | 'sticky-note'
	data: DrawPath | StickyNote
}

export interface Member {
	nickname: string
	color: string
	sessionId: string
}

export type Settings = {}