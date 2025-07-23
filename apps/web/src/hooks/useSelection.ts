import { useState, useCallback } from 'react';
import { useCanvasStore } from '@/lib/store';
import { SelectionBox, Point, DrawPath, StickyNote, Shape, ScreenShare } from '../lib/types';
import { isPointInSelection, isRectangleInSelection, createRectangle, createCircle, createTriangle } from '../lib/canvasUtils';

// Type guards
const isDrawPath = (data: DrawPath | StickyNote | Shape | ScreenShare): data is DrawPath => {
	return 'points' in data;
};

const isStickyNote = (data: DrawPath | StickyNote | Shape | ScreenShare): data is StickyNote => {
	return 'position' in data && 'text' in data;
};

const isShape = (data: DrawPath | StickyNote | Shape | ScreenShare): data is Shape => {
	return 'start' in data && 'end' in data;
};

const isScreenShare = (data: DrawPath | StickyNote | Shape | ScreenShare): data is ScreenShare => {
	return 'streamId' in data && 'position' in data;
};

export const useSelection = () => {
	const [selectionBox, setSelectionBox] = useState<SelectionBox>({
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0
	});

	const elements = useCanvasStore((state) => state.elements);
	const selectedElements = useCanvasStore((state) => state.selectedElements);
	const selectElements = useCanvasStore((state) => state.selectElements);
	const clearSelection = useCanvasStore((state) => state.clearSelection);
	const setEditingStickyNoteId = useCanvasStore((state) => state.setEditingStickyNoteId);

	const handleSelectionStart = useCallback((point: Point) => {
		clearSelection();
		// Clear editing state when starting a new selection
		setEditingStickyNoteId(null);
		setSelectionBox({
			startX: point.x,
			startY: point.y,
			endX: point.x,
			endY: point.y
		});
	}, [clearSelection, setEditingStickyNoteId]);

	const handleSelectionMove = useCallback((point: Point) => {
		setSelectionBox(prev => ({
			...prev,
			endX: point.x,
			endY: point.y
		}));
	}, []);

	const handleSelectionEnd = useCallback(() => {
		// Find elements that intersect with the selection box
		const selectedIds: string[] = [];

		elements.forEach(element => {
			if (element.type === 'path' && isDrawPath(element.data)) {
				const pathData = element.data;
				// Check if any point of the path is within the selection box
				const hasPointInSelection = pathData.points.some(point =>
					isPointInSelection(point, selectionBox)
				);
				if (hasPointInSelection) {
					selectedIds.push(element.id);
				}
			} else if (element.type === 'sticky-note' && isStickyNote(element.data)) {
				const stickyNoteData = element.data;
				// Check if the sticky note rectangle intersects with the selection box
				const isInSelection = isRectangleInSelection(
					stickyNoteData.position.x,
					stickyNoteData.position.y,
					stickyNoteData.width,
					stickyNoteData.height,
					selectionBox
				);
				if (isInSelection) {
					selectedIds.push(element.id);
				}
			} else if (element.type === 'shape' && isShape(element.data)) {
				const shapeData = element.data;
				const { start, end, type } = shapeData;

				let shapeBounds;
				if (type === 'rectangle') {
					const { x, y, width, height } = createRectangle(start, end);
					shapeBounds = { x, y, width, height };
				} else if (type === 'circle') {
					const { cx, cy, r } = createCircle(start, end);
					shapeBounds = { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
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
					shapeBounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
				}

				if (shapeBounds) {
					const isInSelection = isRectangleInSelection(
						shapeBounds.x,
						shapeBounds.y,
						shapeBounds.width,
						shapeBounds.height,
						selectionBox
					);
					if (isInSelection) {
						selectedIds.push(element.id);
					}
				}
			} else if (element.type === 'screenshare' && isScreenShare(element.data)) {
				const screenShareData = element.data;
				const isInSelection = isRectangleInSelection(
					screenShareData.position.x,
					screenShareData.position.y,
					screenShareData.width,
					screenShareData.height,
					selectionBox
				);
				if (isInSelection) {
					selectedIds.push(element.id);
				}
			}
		});

		// Only update selection if we found elements, otherwise clear selection
		if (selectedIds.length > 0) {
			selectElements(selectedIds);
		} else {
			clearSelection();
		}
	}, [elements, selectionBox, selectElements, clearSelection]);

	return {
		selectionBox,
		selectedElements,
		handleSelectionStart,
		handleSelectionMove,
		handleSelectionEnd
	};
}; 