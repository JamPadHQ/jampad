import { useCallback } from 'react';
import { useCanvasStore } from '../store/index.js';
import { calculateZoomToPoint } from '../utils/index.js';
import { CANVAS_CONSTANTS } from '../utils/index.js';

export const useCanvasNavigation = () => {
	const {
		canvasState,
		setCanvasState,
		isDragging,
		setIsDragging,
		lastMousePos,
		setLastMousePos,
		resetCanvas
	} = useCanvasStore();

	const startDragging = useCallback((clientX: number, clientY: number) => {
		setIsDragging(true);
		setLastMousePos({ x: clientX, y: clientY });
	}, [setIsDragging, setLastMousePos]);

	const updateDragging = useCallback((clientX: number, clientY: number) => {
		if (!isDragging) return;

		const deltaX = clientX - lastMousePos.x;
		const deltaY = clientY - lastMousePos.y;

		setCanvasState({
			...canvasState,
			x: canvasState.x + deltaX,
			y: canvasState.y + deltaY
		});

		setLastMousePos({ x: clientX, y: clientY });
	}, [isDragging, lastMousePos, canvasState, setCanvasState, setLastMousePos]);

	const stopDragging = useCallback(() => {
		setIsDragging(false);
	}, [setIsDragging]);

	const handleZoom = useCallback((
		mouseX: number,
		mouseY: number,
		deltaY: number
	) => {
		const delta = deltaY * -0.01;
		const zoomFactor = 1 + (delta * CANVAS_CONSTANTS.ZOOM_INTENSITY);

		const newState = calculateZoomToPoint(
			mouseX,
			mouseY,
			zoomFactor,
			canvasState,
			CANVAS_CONSTANTS.MIN_ZOOM,
			CANVAS_CONSTANTS.MAX_ZOOM
		);

		setCanvasState(newState);
	}, [canvasState, setCanvasState]);

	return {
		canvasState,
		isDragging,
		startDragging,
		updateDragging,
		stopDragging,
		handleZoom,
		resetCanvas
	};
}; 