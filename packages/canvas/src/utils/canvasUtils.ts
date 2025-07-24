import { CanvasState, Point, SelectionBox, BaseElement } from '../types/index.js';

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
	rect: { x: number; y: number; width: number; height: number },
	selectionBox: SelectionBox
): boolean => {
	const { minX, maxX, minY, maxY } = getNormalizedSelectionBox(selectionBox);
	return !(rect.x > maxX || rect.x + rect.width < minX || rect.y > maxY || rect.y + rect.height < minY);
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

/**
 * Get element bounds - generic version that works with any element
 * Specific element types should be handled by their respective packages
 */
export const getElementBounds = (element: BaseElement): { x: number; y: number; width: number; height: number } | null => {
	// This is a basic implementation - specific packages should override this for their element types
	if (!element || !element.data) return null;

	// Basic fallback for elements with position and dimensions
	if ('position' in element.data && 'width' in element.data && 'height' in element.data) {
		return {
			x: element.data.position.x,
			y: element.data.position.y,
			width: element.data.width,
			height: element.data.height
		};
	}

	return null;
};

/**
 * Create a rectangle from two points
 */
export const createRectangle = (start: Point, end: Point) => {
	const x = Math.min(start.x, end.x);
	const y = Math.min(start.y, end.y);
	const width = Math.abs(start.x - end.x);
	const height = Math.abs(start.y - end.y);
	return { x, y, width, height };
};

/**
 * Create a circle from two points
 */
export const createCircle = (start: Point, end: Point) => {
	const cx = (start.x + end.x) / 2;
	const cy = (start.y + end.y) / 2;
	const r = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / 2;
	return { cx, cy, r };
};

/**
 * Create a triangle from two points
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