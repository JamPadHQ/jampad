import { Point } from '@jampad/canvas';
import { DrawPath, Shape, DrawingElement } from '../types/index.js';

/**
 * Calculate the bounds of a drawing path
 */
export const getPathBounds = (path: DrawPath): { x: number; y: number; width: number; height: number } | null => {
	if (path.points.length === 0) return null;

	let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

	path.points.forEach(point => {
		minX = Math.min(minX, point.x);
		minY = Math.min(minY, point.y);
		maxX = Math.max(maxX, point.x);
		maxY = Math.max(maxY, point.y);
	});

	return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};

/**
 * Calculate the bounds of a shape
 */
export const getShapeBounds = (shape: Shape): { x: number; y: number; width: number; height: number } => {
	const { start, end, type } = shape;

	if (type === 'rectangle') {
		return createRectangleBounds(start, end);
	} else if (type === 'circle') {
		const { cx, cy, r } = createCircleData(start, end);
		return { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
	} else if (type === 'triangle') {
		const points = getTrianglePoints(start, end);
		const minX = Math.min(...points.map(p => p.x));
		const minY = Math.min(...points.map(p => p.y));
		const maxX = Math.max(...points.map(p => p.x));
		const maxY = Math.max(...points.map(p => p.y));
		return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
	}

	// Fallback
	return createRectangleBounds(start, end);
};

/**
 * Get bounds for any drawing element
 */
export const getDrawingElementBounds = (element: DrawingElement): { x: number; y: number; width: number; height: number } | null => {
	if (element.type === 'path') {
		return getPathBounds(element.data as DrawPath);
	} else if (element.type === 'shape') {
		return getShapeBounds(element.data as Shape);
	}
	return null;
};

/**
 * Create rectangle bounds from two points
 */
export const createRectangleBounds = (start: Point, end: Point) => {
	const x = Math.min(start.x, end.x);
	const y = Math.min(start.y, end.y);
	const width = Math.abs(start.x - end.x);
	const height = Math.abs(start.y - end.y);
	return { x, y, width, height };
};

/**
 * Create circle data from two points
 */
export const createCircleData = (start: Point, end: Point) => {
	const cx = (start.x + end.x) / 2;
	const cy = (start.y + end.y) / 2;
	const r = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / 2;
	return { cx, cy, r };
};

/**
 * Get triangle points from two corner points
 */
export const getTrianglePoints = (start: Point, end: Point): Point[] => {
	const x1 = start.x;
	const y1 = end.y;
	const x2 = (start.x + end.x) / 2;
	const y2 = start.y;
	const x3 = end.x;
	const y3 = end.y;

	return [
		{ x: x1, y: y1 },
		{ x: x2, y: y2 },
		{ x: x3, y: y3 }
	];
};

/**
 * Create triangle points string for SVG polygon
 */
export const createTrianglePointsString = (start: Point, end: Point): string => {
	const points = getTrianglePoints(start, end);
	return points.map(p => `${p.x},${p.y}`).join(' ');
};

/**
 * Generate a unique ID for drawing elements
 */
export const generateDrawingId = (type: 'path' | 'shape'): string => {
	const prefix = type === 'path' ? 'path' : 'shape';
	return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Simplify a path by removing redundant points
 */
export const simplifyPath = (points: Point[], tolerance: number = 2): Point[] => {
	if (points.length <= 2) return points;

	const simplified: Point[] = [points[0]];

	for (let i = 1; i < points.length - 1; i++) {
		const prev = simplified[simplified.length - 1];
		const current = points[i];
		const next = points[i + 1];

		// Calculate distance from current point to line between prev and next
		const distance = distanceToLine(current, prev, next);

		if (distance > tolerance) {
			simplified.push(current);
		}
	}

	simplified.push(points[points.length - 1]);
	return simplified;
};

/**
 * Calculate distance from point to line segment
 */
const distanceToLine = (point: Point, lineStart: Point, lineEnd: Point): number => {
	const A = point.x - lineStart.x;
	const B = point.y - lineStart.y;
	const C = lineEnd.x - lineStart.x;
	const D = lineEnd.y - lineStart.y;

	const dot = A * C + B * D;
	const lenSq = C * C + D * D;

	if (lenSq === 0) return Math.sqrt(A * A + B * B);

	let param = dot / lenSq;
	param = Math.max(0, Math.min(1, param));

	const xx = lineStart.x + param * C;
	const yy = lineStart.y + param * D;

	const dx = point.x - xx;
	const dy = point.y - yy;

	return Math.sqrt(dx * dx + dy * dy);
}; 