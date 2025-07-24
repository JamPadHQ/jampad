// Import Point from canvas package for position types
import { Point } from '@jampad/canvas';

// User types
export interface User {
	nickname: string;
	color: string;
	sessionId: string;
	cursor?: Point;
}

// Tool types
export type Tool = 'select' | 'move' | 'draw' | 'sticky-note' | 'shape-rectangle' | 'shape-circle' | 'shape-triangle';

// Basic element interfaces (packages can extend these)
export interface BaseElement {
	id: string;
	type: string;
	data: any;
}

// Core element types that all packages should understand
export interface DrawPath {
	id: string;
	points: Point[];
	color: string;
	strokeWidth: number;
}

export interface StickyNote {
	id: string;
	position: Point;
	text: string;
	color: string;
	width: number;
	height: number;
}

export interface Shape {
	id: string;
	type: 'rectangle' | 'circle' | 'triangle';
	start: Point;
	end: Point;
	color: string;
	strokeWidth: number;
}

export interface ScreenShare {
	id: string;
	streamId: string;
	userId: string;
	position: Point;
	width: number;
	height: number;
}

// Element union type
export interface Element {
	id: string;
	type: 'path' | 'sticky-note' | 'shape' | 'screenshare';
	data: DrawPath | StickyNote | Shape | ScreenShare;
}

// Element creation data
export interface ElementCreationData {
	type: Element['type'];
	data: Element['data'];
}

// Settings type for future configuration
export type Settings = Record<string, any>; 