import { useCallback } from 'react';
import { Point } from '@jampad/canvas';
import { useSelectionStore } from '../store/index.js';
import { SelectableElement, Bounds, SelectionResult } from '../types/index.js';
import { findElementsInSelection, isValidSelectionBox } from '../utils/index.js';

export interface UseSelectionOptions {
	elements?: SelectableElement[];
	getBounds?: (element: SelectableElement) => Bounds | null;
	onSelectionComplete?: (result: SelectionResult) => void;
	onSelectionChange?: (selectedIds: string[]) => void;
}

export const useSelection = (options: UseSelectionOptions = {}) => {
	const {
		selectionBox,
		selectedElements,
		isSelecting,
		config,
		startSelection,
		updateSelection,
		endSelection,
		cancelSelection,
		selectElements,
		addToSelection,
		removeFromSelection,
		clearSelection,
		toggleElementSelection
	} = useSelectionStore();

	const { elements = [], getBounds, onSelectionComplete, onSelectionChange } = options;

	const handleSelectionStart = useCallback((point: Point, shouldClearSelection: boolean = true) => {
		if (shouldClearSelection) {
			clearSelection();
		}
		startSelection(point);
	}, [startSelection, clearSelection]);

	const handleSelectionMove = useCallback((point: Point) => {
		if (isSelecting) {
			updateSelection(point);
		}
	}, [isSelecting, updateSelection]);

	const handleSelectionEnd = useCallback(() => {
		if (!isSelecting || !getBounds) {
			endSelection();
			return;
		}

		// Check if selection box is large enough to be valid
		if (!isValidSelectionBox(selectionBox, config.minSelectionSize)) {
			endSelection();
			return;
		}

		// Find elements that intersect with the selection box
		const result = findElementsInSelection(elements, selectionBox, getBounds, {
			includePartial: true
		});

		// Update selection
		if (result.selectedIds.length > 0) {
			selectElements(result.selectedIds);
		} else {
			clearSelection();
		}

		// Call callbacks
		if (onSelectionComplete) {
			onSelectionComplete(result);
		}

		if (onSelectionChange) {
			onSelectionChange(result.selectedIds);
		}

		endSelection();
	}, [
		isSelecting,
		selectionBox,
		elements,
		getBounds,
		config.minSelectionSize,
		selectElements,
		clearSelection,
		endSelection,
		onSelectionComplete,
		onSelectionChange
	]);

	const handleSelectionCancel = useCallback(() => {
		cancelSelection();
	}, [cancelSelection]);

	const handleElementSelection = useCallback((
		elementId: string,
		isMultiSelect: boolean = false
	) => {
		toggleElementSelection(elementId, isMultiSelect);

		if (onSelectionChange) {
			const newSelection = isMultiSelect
				? selectedElements.includes(elementId)
					? selectedElements.filter(id => id !== elementId)
					: [...selectedElements, elementId]
				: [elementId];
			onSelectionChange(newSelection);
		}
	}, [toggleElementSelection, selectedElements, onSelectionChange]);

	const handleMultiElementSelection = useCallback((elementIds: string[], action: 'set' | 'add' | 'remove') => {
		switch (action) {
			case 'set':
				selectElements(elementIds);
				break;
			case 'add':
				addToSelection(elementIds);
				break;
			case 'remove':
				removeFromSelection(elementIds);
				break;
		}

		if (onSelectionChange) {
			const newSelection = action === 'set'
				? elementIds
				: action === 'add'
					? [...new Set([...selectedElements, ...elementIds])]
					: selectedElements.filter(id => !elementIds.includes(id));
			onSelectionChange(newSelection);
		}
	}, [selectElements, addToSelection, removeFromSelection, selectedElements, onSelectionChange]);

	const handleClearSelection = useCallback(() => {
		clearSelection();
		if (onSelectionChange) {
			onSelectionChange([]);
		}
	}, [clearSelection, onSelectionChange]);

	return {
		// State
		selectionBox,
		selectedElements,
		isSelecting,
		hasSelection: selectedElements.length > 0,

		// Actions
		handleSelectionStart,
		handleSelectionMove,
		handleSelectionEnd,
		handleSelectionCancel,
		handleElementSelection,
		handleMultiElementSelection,
		handleClearSelection,

		// Direct store access for advanced usage
		selectElements,
		addToSelection,
		removeFromSelection,

		// Configuration
		config
	};
}; 