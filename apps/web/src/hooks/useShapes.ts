import { useCallback } from 'react';
import { useCanvasStore } from '@/lib/store';
import { useYJS } from './useYJS';
import { Point } from '@/lib/types';

export const useShapes = (roomId: string = 'default-room') => {
	const { addElementToYJS } = useYJS(roomId);

	// Get state and actions from the store
	const {
		tool,
		currentShape,
		startShape,
		updateShape,
		finishShape
	} = useCanvasStore();

	const handleShapeStart = useCallback((point: Point) => {
		if (tool.startsWith('shape-')) {
			startShape(point, tool);
		}
	}, [tool, startShape]);

	const handleShapeMove = useCallback((point: Point) => {
		if (currentShape) {
			updateShape(point);
		}
	}, [currentShape, updateShape]);

	const handleShapeEnd = useCallback(() => {
		const elementId = finishShape();
		if (elementId) {
			const elements = useCanvasStore.getState().elements;
			const element = elements.find(el => el.id === elementId);
			if (element) {
				addElementToYJS(element);
			}
		}
	}, [finishShape, addElementToYJS]);

	return {
		handleShapeStart,
		handleShapeMove,
		handleShapeEnd,
		currentShape
	};
}; 