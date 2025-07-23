import { CanvasState, Point, SelectionBox, DrawPath, StickyNote, Shape, Element, ScreenShare } from './types';

/**
 * Convert screen coordinates to canvas coordinates
 */
export const screenToCanvas = (
	screenX: number,
	screenY: number,
	canvasState: CanvasState,
	containerRect: DOMRect
): Point => {
	const canvasX = (screenX - containerRect.left - canvasState.x) / canvasState.zoom;
	const canvasY = (screenY - containerRect.top - canvasState.y) / canvasState.zoom;
	return { x: canvasX, y: canvasY };
};

/**
 * Convert canvas coordinates to screen coordinates
 */
export const canvasToScreen = (
	canvasX: number,
	canvasY: number,
	canvasState: CanvasState,
	containerRect: DOMRect
): Point => {
	const screenX = (canvasX * canvasState.zoom) + canvasState.x + containerRect.left;
	const screenY = (canvasY * canvasState.zoom) + canvasState.y + containerRect.top;
	return { x: screenX, y: screenY };
};

/**
 * Calculate zoom towards a specific point
 */
export const calculateZoomToPoint = (
	mouseX: number,
	mouseY: number,
	zoomFactor: number,
	currentState: CanvasState,
	minZoom: number,
	maxZoom: number
): CanvasState => {
	const newZoom = Math.max(minZoom, Math.min(maxZoom, currentState.zoom * zoomFactor));
	const zoomChange = newZoom - currentState.zoom;

	const newX = currentState.x - (mouseX - currentState.x) * (zoomChange / currentState.zoom);
	const newY = currentState.y - (mouseY - currentState.y) * (zoomChange / currentState.zoom);

	return { x: newX, y: newY, zoom: newZoom };
};

/**
 * Get normalized selection box (min/max coordinates)
 */
export const getNormalizedSelectionBox = (selectionBox: SelectionBox) => {
	const minX = Math.min(selectionBox.startX, selectionBox.endX);
	const maxX = Math.max(selectionBox.startX, selectionBox.endX);
	const minY = Math.min(selectionBox.startY, selectionBox.endY);
	const maxY = Math.max(selectionBox.startY, selectionBox.endY);

	return { minX, maxX, minY, maxY };
};

/**
 * Check if a point is within a selection box
 */
export const isPointInSelection = (
	point: Point,
	selectionBox: SelectionBox
): boolean => {
	const { minX, maxX, minY, maxY } = getNormalizedSelectionBox(selectionBox);
	return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
};

/**
 * Check if a rectangle intersects with a selection box
 */
export const isRectangleInSelection = (
	rectX: number,
	rectY: number,
	rectWidth: number,
	rectHeight: number,
	selectionBox: SelectionBox
): boolean => {
	const { minX, maxX, minY, maxY } = getNormalizedSelectionBox(selectionBox);

	// Check if rectangles overlap
	const rectRight = rectX + rectWidth;
	const rectBottom = rectY + rectHeight;

	return !(rectX > maxX || rectRight < minX || rectY > maxY || rectBottom < minY);
};

/**
 * Generate canvas transform CSS string
 */
export const getCanvasTransform = (canvasState: CanvasState): string => {
	return `translate(${canvasState.x}px, ${canvasState.y}px) scale(${canvasState.zoom})`;
};

/**
 * Calculate actual canvas position (inverse of transform)
 */
export const getActualCanvasPosition = (canvasState: CanvasState): Point => {
	return {
		x: -canvasState.x / canvasState.zoom,
		y: -canvasState.y / canvasState.zoom
	};
};

export const getElementBounds = (element: Element): { x: number; y: number; width: number; height: number } | null => {
	if (element.type === 'path') {
		const pathData = element.data as DrawPath;
		if (pathData.points.length === 0) return null;
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		pathData.points.forEach(p => {
			minX = Math.min(minX, p.x);
			minY = Math.min(minY, p.y);
			maxX = Math.max(maxX, p.x);
			maxY = Math.max(maxY, p.y);
		});
		return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
	} else if (element.type === 'sticky-note') {
		const stickyNoteData = element.data as StickyNote;
		return { x: stickyNoteData.position.x, y: stickyNoteData.position.y, width: stickyNoteData.width, height: stickyNoteData.height };
	} else if (element.type === 'shape') {
		const shapeData = element.data as Shape;
		const { start, end, type } = shapeData;

		if (type === 'rectangle') {
			return createRectangle(start, end);
		} else if (type === 'circle') {
			const { cx, cy, r } = createCircle(start, end);
			return { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
		} else if (type === 'triangle') {
			const pointsStr = createTriangle(start, end);
			const points = pointsStr.split(' ').map(pStr => {
				const [x, y] = pStr.split(',').map(Number);
				return { x, y };
			});
			const minX = Math.min(...points.map(p => p.x));
			const minY = Math.min(...points.map(p => p.y));
			const maxX = Math.max(...points.map(p => p.x));
			const maxY = Math.max(...points.map(p => p.y));
			return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
		}
	} else if (element.type === 'screenshare') {
		const screenShareData = element.data as ScreenShare;
		return { x: screenShareData.position.x, y: screenShareData.position.y, width: screenShareData.width, height: screenShareData.height };
	}
	return null;
}

/**
 * Create a rectangle SVG path from two points
 */
export const createRectangle = (start: Point, end: Point) => {
	const x = Math.min(start.x, end.x);
	const y = Math.min(start.y, end.y);
	const width = Math.abs(start.x - end.x);
	const height = Math.abs(start.y - end.y);
	return { x, y, width, height };
};

/**
 * Create a circle SVG path from two points
 */
export const createCircle = (start: Point, end: Point) => {
	const cx = (start.x + end.x) / 2;
	const cy = (start.y + end.y) / 2;
	const r = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / 2;
	return { cx, cy, r };
};

/**
 * Create a triangle SVG path from two points
 */
export const createTriangle = (start: Point, end: Point) => {
	const x1 = start.x;
	const y1 = end.y;
	const x2 = (start.x + end.x) / 2;
	const y2 = start.y;
	const x3 = end.x;
	const y3 = end.y;
	return `${x1},${y1} ${x2},${y2} ${x3},${y3}`;
}; 