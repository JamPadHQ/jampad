import { CanvasState, Point, SelectionBox } from './types';

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