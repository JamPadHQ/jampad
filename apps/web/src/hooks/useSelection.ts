import { useState, useCallback } from 'react';
import { useCanvasStore } from '@/lib/store';
import { SelectionBox, Point } from '../lib/types';
import { getNormalizedSelectionBox, isPointInSelection } from '../lib/canvasUtils';

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

	const handleSelectionStart = useCallback((point: Point) => {
		console.log('Starting selection at:', point);
		clearSelection();
		setSelectionBox({
			startX: point.x,
			startY: point.y,
			endX: point.x,
			endY: point.y
		});
	}, [clearSelection]);

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
			if (element.type === 'path') {
				const pathData = element.data;
				// Check if any point of the path is within the selection box
				const hasPointInSelection = pathData.points.some(point =>
					isPointInSelection(point, selectionBox)
				);
				if (hasPointInSelection) {
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