// Import Point from canvas package since selection depends on canvas coordinates
import { Point } from '@jampad/canvas';

export interface SelectionBox {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
}

export interface Bounds {
	x: number;
	y: number;
	width: number;
	height: number;
}

// Transform handle types
export type Handle = 'tl' | 'tm' | 'tr' | 'ml' | 'mr' | 'bl' | 'bm' | 'br' | 'move';

// Transform state
export interface TransformState {
	activeHandle: Handle | null;
	initialBounds: Record<string, any>;
	initialPoint: Point;
	selectionBoundingBox: Bounds | null;
}

// Selection configuration
export interface SelectionConfig {
	multiSelectKey: 'shift' | 'ctrl' | 'meta';
	minSelectionSize: number;
	strokeWidth: number;
	dashArray: number;
	dashSpacing: number;
	selectionColor: string;
}

// Element selection interface
export interface SelectableElement {
	id: string;
	type: string;
	data: any;
}

// Selection result
export interface SelectionResult {
	selectedIds: string[];
	bounds: Bounds | null;
} 