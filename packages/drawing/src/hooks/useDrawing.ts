import { useCallback } from 'react';
import { Point } from '@jampad/canvas';
import { useDrawingStore } from '../store/index.js';
import { DrawPath } from '../types/index.js';

export interface UseDrawingOptions {
	userColor?: string;
	onDrawingComplete?: (drawPath: DrawPath) => void;
}

export const useDrawing = (options: UseDrawingOptions = {}) => {
	const {
		currentDrawing,
		startDrawing,
		addDrawingPoint,
		finishDrawing,
		cancelDrawing,
		config
	} = useDrawingStore();

	const handleDrawStart = useCallback((point: Point) => {
		startDrawing(point);
	}, [startDrawing]);

	const handleDrawMove = useCallback((point: Point) => {
		if (currentDrawing) {
			addDrawingPoint(point);
		}
	}, [currentDrawing, addDrawingPoint]);

	const handleDrawEnd = useCallback(() => {
		const userColor = options.userColor || config.defaultColor;
		const drawPath = finishDrawing(userColor);

		if (drawPath && options.onDrawingComplete) {
			options.onDrawingComplete(drawPath);
		}

		return drawPath;
	}, [finishDrawing, options.userColor, options.onDrawingComplete, config.defaultColor]);

	const handleDrawCancel = useCallback(() => {
		cancelDrawing();
	}, [cancelDrawing]);

	return {
		// State
		currentDrawing,
		isDrawing: currentDrawing !== null,

		// Actions
		handleDrawStart,
		handleDrawMove,
		handleDrawEnd,
		handleDrawCancel,

		// Configuration
		strokeWidth: config.defaultStrokeWidth,
		color: options.userColor || config.defaultColor
	};
}; 