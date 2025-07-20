import { useCallback } from 'react';
import { useCanvasStore } from '@/lib/store';
import { Point } from '@/lib/types';


export const useDrawing = () => {
	const startDrawing = useCanvasStore((state) => state.startDrawing);
	const addDrawingPoint = useCanvasStore((state) => state.addDrawingPoint);
	const finishDrawing = useCanvasStore((state) => state.finishDrawing);
	const currentDrawing = useCanvasStore((state) => state.currentDrawing);

	const handleDrawStart = useCallback((point: Point) => {
		startDrawing(point);
	}, [startDrawing]);

	const handleDrawMove = useCallback((point: Point) => {
		addDrawingPoint(point);
	}, [addDrawingPoint]);

	const handleDrawEnd = useCallback(() => {
		finishDrawing();
	}, [finishDrawing]);

	return {
		currentDrawing,
		handleDrawStart,
		handleDrawMove,
		handleDrawEnd
	};
}; 