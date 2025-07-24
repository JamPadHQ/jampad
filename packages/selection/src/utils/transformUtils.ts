import { Point } from '@jampad/canvas';
import { Handle, Bounds } from '../types/index.js';

/**
 * Calculate scale factors based on transform handle and mouse movement
 */
export const calculateScaleFactors = (
	handle: Handle,
	initialBounds: Bounds,
	currentPoint: Point,
	initialPoint: Point
): { scaleX: number; scaleY: number; pivot: Point } => {
	const dx = currentPoint.x - initialPoint.x;
	const dy = currentPoint.y - initialPoint.y;

	let scaleX = 1;
	let scaleY = 1;
	let pivot = { x: initialBounds.x, y: initialBounds.y };

	if (handle.includes('r')) {
		scaleX = (initialBounds.width + dx) / initialBounds.width;
		pivot.x = initialBounds.x;
	} else if (handle.includes('l')) {
		scaleX = (initialBounds.width - dx) / initialBounds.width;
		pivot.x = initialBounds.x + initialBounds.width;
	}

	if (handle.includes('b')) {
		scaleY = (initialBounds.height + dy) / initialBounds.height;
		pivot.y = initialBounds.y;
	} else if (handle.includes('t')) {
		scaleY = (initialBounds.height - dy) / initialBounds.height;
		pivot.y = initialBounds.y + initialBounds.height;
	}

	// Handle middle resize handles (no scaling in perpendicular direction)
	if (handle === 'tm' || handle === 'bm') scaleX = 1;
	if (handle === 'ml' || handle === 'mr') scaleY = 1;

	return { scaleX, scaleY, pivot };
};

/**
 * Apply scale transform to a point relative to a pivot
 */
export const scalePointFromPivot = (
	point: Point,
	pivot: Point,
	scaleX: number,
	scaleY: number
): Point => {
	return {
		x: pivot.x + (point.x - pivot.x) * scaleX,
		y: pivot.y + (point.y - pivot.y) * scaleY
	};
};

/**
 * Apply translation to a point
 */
export const translatePoint = (point: Point, dx: number, dy: number): Point => {
	return {
		x: point.x + dx,
		y: point.y + dy
	};
};

/**
 * Transform bounds based on handle and mouse movement
 */
export const transformBounds = (
	bounds: Bounds,
	handle: Handle,
	currentPoint: Point,
	initialPoint: Point
): Bounds => {
	if (handle === 'move') {
		const dx = currentPoint.x - initialPoint.x;
		const dy = currentPoint.y - initialPoint.y;

		return {
			x: bounds.x + dx,
			y: bounds.y + dy,
			width: bounds.width,
			height: bounds.height
		};
	}

	const { scaleX, scaleY, pivot } = calculateScaleFactors(
		handle,
		bounds,
		currentPoint,
		initialPoint
	);

	const topLeft = scalePointFromPivot(
		{ x: bounds.x, y: bounds.y },
		pivot,
		scaleX,
		scaleY
	);

	const bottomRight = scalePointFromPivot(
		{ x: bounds.x + bounds.width, y: bounds.y + bounds.height },
		pivot,
		scaleX,
		scaleY
	);

	return {
		x: Math.min(topLeft.x, bottomRight.x),
		y: Math.min(topLeft.y, bottomRight.y),
		width: Math.abs(bottomRight.x - topLeft.x),
		height: Math.abs(bottomRight.y - topLeft.y)
	};
};

/**
 * Get resize handles for a selection bounds
 */
export const getResizeHandles = (bounds: Bounds): Array<{ handle: Handle; x: number; y: number }> => {
	const { x, y, width, height } = bounds;
	const centerX = x + width / 2;
	const centerY = y + height / 2;
	const right = x + width;
	const bottom = y + height;

	return [
		{ handle: 'tl', x, y },
		{ handle: 'tm', x: centerX, y },
		{ handle: 'tr', x: right, y },
		{ handle: 'ml', x, y: centerY },
		{ handle: 'mr', x: right, y: centerY },
		{ handle: 'bl', x, y: bottom },
		{ handle: 'bm', x: centerX, y: bottom },
		{ handle: 'br', x: right, y: bottom }
	];
};

/**
 * Get cursor style for a transform handle
 */
export const getHandleCursor = (handle: Handle): string => {
	switch (handle) {
		case 'tl':
		case 'br':
			return 'nw-resize';
		case 'tr':
		case 'bl':
			return 'ne-resize';
		case 'tm':
		case 'bm':
			return 'n-resize';
		case 'ml':
		case 'mr':
			return 'e-resize';
		case 'move':
			return 'move';
		default:
			return 'default';
	}
};

/**
 * Check if a point is near a handle (for hit testing)
 */
export const isPointNearHandle = (
	point: Point,
	handlePosition: Point,
	threshold: number = 8
): boolean => {
	const dx = point.x - handlePosition.x;
	const dy = point.y - handlePosition.y;
	const distance = Math.sqrt(dx * dx + dy * dy);
	return distance <= threshold;
};

/**
 * Find which handle (if any) is at a given point
 */
export const findHandleAtPoint = (
	point: Point,
	bounds: Bounds,
	threshold: number = 8
): Handle | null => {
	const handles = getResizeHandles(bounds);

	for (const { handle, x, y } of handles) {
		if (isPointNearHandle(point, { x, y }, threshold)) {
			return handle;
		}
	}

	return null;
}; 