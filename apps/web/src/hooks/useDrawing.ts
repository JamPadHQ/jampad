import { useCallback } from 'react';
import { useCanvasStore } from '@/lib/store';
import { useYJS } from './useYJS';
import { Point } from '@/lib/types';

export const useDrawing = (roomId: string = 'default-room') => {
	const startDrawing = useCanvasStore((state) => state.startDrawing);
	const addDrawingPoint = useCanvasStore((state) => state.addDrawingPoint);
	const finishDrawing = useCanvasStore((state) => state.finishDrawing);
	const currentDrawing = useCanvasStore((state) => state.currentDrawing);
	const { addElementToYJS } = useYJS(roomId);

	const handleDrawStart = useCallback((point: Point) => {
		startDrawing(point);
	}, [startDrawing]);

	const handleDrawMove = useCallback((point: Point) => {
		addDrawingPoint(point);
	}, [addDrawingPoint]);

	const handleDrawEnd = useCallback(() => {
		const elementId = finishDrawing();
		if (elementId) {
			// The element is already added to local state by finishDrawing
			// We need to get it from the store and add it to YJS
			const elements = useCanvasStore.getState().elements;
			const element = elements.find(el => el.id === elementId);
			if (element) {
				addElementToYJS(element);
			}
		}
	}, [finishDrawing, addElementToYJS]);

	return {
		currentDrawing,
		handleDrawStart,
		handleDrawMove,
		handleDrawEnd
	};
}; 