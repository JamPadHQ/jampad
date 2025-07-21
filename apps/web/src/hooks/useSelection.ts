import { useState, useCallback } from 'react';
import { useCanvasStore } from '@/lib/store';
import { SelectionBox, Point, DrawPath, StickyNote } from '../lib/types';
import { isPointInSelection, isRectangleInSelection } from '../lib/canvasUtils';

// Type guards
const isDrawPath = (data: DrawPath | StickyNote): data is DrawPath => {
	return 'points' in data;
};

const isStickyNote = (data: DrawPath | StickyNote): data is StickyNote => {
	return 'position' in data && 'text' in data;
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
		console.log('Starting selection at:', point);
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