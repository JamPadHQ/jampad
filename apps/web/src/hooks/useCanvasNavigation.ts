import { useState, useCallback, useRef } from 'react';
import { CanvasState } from '../lib/types';
import { calculateZoomToPoint } from '../lib/canvasUtils';
import { CANVAS_CONSTANTS } from '../lib/constants';

export const useCanvasNavigation = () => {
	const [canvasState, setCanvasState] = useState<CanvasState>({ x: 0, y: 0, zoom: 1 });
	const [isDragging, setIsDragging] = useState(false);
	const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

	const startDragging = useCallback((clientX: number, clientY: number) => {
		setIsDragging(true);
		setLastMousePos({ x: clientX, y: clientY });
	}, []);

	const updateDragging = useCallback((clientX: number, clientY: number) => {
		if (!isDragging) return;

		const deltaX = clientX - lastMousePos.x;
		const deltaY = clientY - lastMousePos.y;

		setCanvasState(prev => ({
			...prev,
			x: prev.x + deltaX,
			y: prev.y + deltaY
		}));

		setLastMousePos({ x: clientX, y: clientY });
	}, [isDragging, lastMousePos]);

	const stopDragging = useCallback(() => {
		setIsDragging(false);
	}, []);

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
	}, [canvasState]);

	const resetCanvas = useCallback(() => {
		setCanvasState({ x: 0, y: 0, zoom: 1 });
	}, []);

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