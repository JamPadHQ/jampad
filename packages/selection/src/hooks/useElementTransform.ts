import { useCallback } from 'react';
import { Point } from '@jampad/canvas';
import { useSelectionStore } from '../store/index.js';
import { SelectableElement, Bounds, Handle } from '../types/index.js';
import { calculateSelectionBounds, transformBounds, getHandleCursor } from '../utils/index.js';

export interface UseElementTransformOptions {
	elements?: SelectableElement[];
	getBounds?: (element: SelectableElement) => Bounds | null;
	onTransformStart?: (elementIds: string[], handle: Handle) => void;
	onTransformUpdate?: (elementIds: string[], transformData: any) => void;
	onTransformEnd?: (elementIds: string[], transformData: any) => void;
	onElementsDelete?: (elementIds: string[]) => void;
}

export const useElementTransform = (options: UseElementTransformOptions = {}) => {
	const {
		transform,
		isTransforming,
		selectedElements,
		startTransform,
		updateTransform,
		endTransform,
		cancelTransform
	} = useSelectionStore();

	const {
		elements = [],
		getBounds,
		onTransformStart,
		onTransformUpdate,
		onTransformEnd,
		onElementsDelete
	} = options;

	const handleTransformStart = useCallback((handle: Handle, point: Point) => {
		if (selectedElements.length === 0 || !getBounds) return;

		// Calculate initial bounds for all selected elements
		const initialBounds: Record<string, any> = {};
		selectedElements.forEach(id => {
			const element = elements.find(el => el.id === id);
			if (element) {
				initialBounds[id] = {
					element: { ...element }, // Deep clone would be better
					bounds: getBounds(element)
				};
			}
		});

		startTransform(handle, point, initialBounds);

		// Update the selection bounding box in the transform state
		// This would normally be done with a separate action or state update

		if (onTransformStart) {
			onTransformStart(selectedElements, handle);
		}
	}, [selectedElements, elements, getBounds, startTransform, onTransformStart]);

	const handleTransformUpdate = useCallback((point: Point) => {
		if (!isTransforming || !transform.activeHandle || !getBounds) return;

		const { activeHandle, initialPoint, initialBounds } = transform;

		// Calculate transform for each selected element
		const transformData: Record<string, any> = {};

		selectedElements.forEach(id => {
			const initial = initialBounds[id];
			if (initial && initial.bounds) {
				const newBounds = transformBounds(
					initial.bounds,
					activeHandle,
					point,
					initialPoint
				);

				transformData[id] = {
					element: initial.element,
					initialBounds: initial.bounds,
					newBounds,
					handle: activeHandle
				};
			}
		});

		updateTransform(point);

		if (onTransformUpdate) {
			onTransformUpdate(selectedElements, transformData);
		}
	}, [
		isTransforming,
		transform,
		selectedElements,
		getBounds,
		updateTransform,
		onTransformUpdate
	]);

	const handleTransformEnd = useCallback(() => {
		if (!isTransforming || !transform.activeHandle) return;

		const transformData = {
			handle: transform.activeHandle,
			initialBounds: transform.initialBounds,
			finalPoint: transform.initialPoint // This would be the final point in a real implementation
		};

		endTransform();

		if (onTransformEnd) {
			onTransformEnd(selectedElements, transformData);
		}
	}, [isTransforming, transform, selectedElements, endTransform, onTransformEnd]);

	const handleTransformCancel = useCallback(() => {
		cancelTransform();
	}, [cancelTransform]);

	const handleDeleteSelected = useCallback(() => {
		if (selectedElements.length === 0) return;

		if (onElementsDelete) {
			onElementsDelete(selectedElements);
		}
	}, [selectedElements, onElementsDelete]);

	const getCursor = useCallback((handle?: Handle): string => {
		const activeHandle = handle || transform.activeHandle;
		if (activeHandle) {
			return getHandleCursor(activeHandle);
		}
		return 'default';
	}, [transform.activeHandle]);

	const getSelectionBounds = useCallback((): Bounds | null => {
		if (selectedElements.length === 0 || !getBounds) return null;
		return calculateSelectionBounds(elements, selectedElements, getBounds);
	}, [selectedElements, elements, getBounds]);

	const isElementSelected = useCallback((elementId: string): boolean => {
		return selectedElements.includes(elementId);
	}, [selectedElements]);

	const canTransform = useCallback((): boolean => {
		return selectedElements.length > 0 && !isTransforming;
	}, [selectedElements.length, isTransforming]);

	return {
		// State
		isTransforming,
		activeHandle: transform.activeHandle,
		selectedElements,

		// Transform actions
		handleTransformStart,
		handleTransformUpdate,
		handleTransformEnd,
		handleTransformCancel,

		// Element actions
		handleDeleteSelected,

		// Utilities
		getCursor,
		getSelectionBounds,
		isElementSelected,
		canTransform,

		// Computed values
		hasSelection: selectedElements.length > 0,
		isMultiSelection: selectedElements.length > 1
	};
}; 