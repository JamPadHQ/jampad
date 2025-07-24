import { Point } from '@jampad/canvas';
import { SelectionBox, Bounds, SelectableElement, SelectionResult } from '../types/index.js';

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
	rect: Bounds,
	selectionBox: SelectionBox
): boolean => {
	const { minX, maxX, minY, maxY } = getNormalizedSelectionBox(selectionBox);

	// Check if rectangles overlap
	const rectRight = rect.x + rect.width;
	const rectBottom = rect.y + rect.height;

	return !(rect.x > maxX || rectRight < minX || rect.y > maxY || rectBottom < minY);
};

/**
 * Calculate bounds from a selection box
 */
export const selectionBoxToBounds = (selectionBox: SelectionBox): Bounds => {
	const { minX, maxX, minY, maxY } = getNormalizedSelectionBox(selectionBox);
	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY
	};
};

/**
 * Calculate the bounding box that encompasses all selected elements
 */
export const calculateSelectionBounds = (
	elements: SelectableElement[],
	selectedIds: string[],
	getBounds: (element: SelectableElement) => Bounds | null
): Bounds | null => {
	if (selectedIds.length === 0) return null;

	let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
	let hasValidBounds = false;

	selectedIds.forEach(id => {
		const element = elements.find(el => el.id === id);
		if (element) {
			const bounds = getBounds(element);
			if (bounds) {
				hasValidBounds = true;
				minX = Math.min(minX, bounds.x);
				minY = Math.min(minY, bounds.y);
				maxX = Math.max(maxX, bounds.x + bounds.width);
				maxY = Math.max(maxY, bounds.y + bounds.height);
			}
		}
	});

	if (!hasValidBounds) return null;

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY
	};
};

/**
 * Find elements that intersect with a selection box
 */
export const findElementsInSelection = (
	elements: SelectableElement[],
	selectionBox: SelectionBox,
	getBounds: (element: SelectableElement) => Bounds | null,
	options: {
		includePartial?: boolean;
		elementTypeFilter?: string[];
	} = {}
): SelectionResult => {
	const { includePartial = true, elementTypeFilter } = options;
	const selectedIds: string[] = [];

	elements.forEach(element => {
		// Filter by element type if specified
		if (elementTypeFilter && !elementTypeFilter.includes(element.type)) {
			return;
		}

		const bounds = getBounds(element);
		if (!bounds) return;

		// Check if element intersects with selection box
		const intersects = isRectangleInSelection(bounds, selectionBox);

		if (intersects) {
			if (includePartial) {
				selectedIds.push(element.id);
			} else {
				// For non-partial selection, check if element is completely within selection
				const selectionBounds = selectionBoxToBounds(selectionBox);
				const completelyWithin = (
					bounds.x >= selectionBounds.x &&
					bounds.y >= selectionBounds.y &&
					bounds.x + bounds.width <= selectionBounds.x + selectionBounds.width &&
					bounds.y + bounds.height <= selectionBounds.y + selectionBounds.height
				);

				if (completelyWithin) {
					selectedIds.push(element.id);
				}
			}
		}
	});

	const resultBounds = calculateSelectionBounds(elements, selectedIds, getBounds);

	return {
		selectedIds,
		bounds: resultBounds
	};
};

/**
 * Check if a point is at a specific element
 */
export const findElementAtPoint = (
	elements: SelectableElement[],
	point: Point,
	getBounds: (element: SelectableElement) => Bounds | null
): string | null => {
	// Search from top to bottom (last drawn to first drawn)
	for (let i = elements.length - 1; i >= 0; i--) {
		const element = elements[i];
		const bounds = getBounds(element);

		if (bounds &&
			point.x >= bounds.x &&
			point.x <= bounds.x + bounds.width &&
			point.y >= bounds.y &&
			point.y <= bounds.y + bounds.height) {
			return element.id;
		}
	}

	return null;
};

/**
 * Toggle element selection based on modifier keys
 */
export const toggleElementSelection = (
	currentSelection: string[],
	elementId: string,
	isMultiSelect: boolean
): string[] => {
	if (isMultiSelect) {
		// Add to selection if shift is held
		if (currentSelection.includes(elementId)) {
			return currentSelection.filter(id => id !== elementId);
		} else {
			return [...currentSelection, elementId];
		}
	} else {
		// Replace selection
		return [elementId];
	}
};

/**
 * Check if selection box is large enough to be valid
 */
export const isValidSelectionBox = (selectionBox: SelectionBox, minSize: number = 2): boolean => {
	const { minX, maxX, minY, maxY } = getNormalizedSelectionBox(selectionBox);
	const width = maxX - minX;
	const height = maxY - minY;
	return width >= minSize || height >= minSize;
}; 