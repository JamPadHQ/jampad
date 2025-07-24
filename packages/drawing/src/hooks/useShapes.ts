import { useCallback } from 'react';
import { Point } from '@jampad/canvas';
import { useDrawingStore } from '../store/index.js';
import { Shape, ShapeType } from '../types/index.js';

export interface UseShapesOptions {
	userColor?: string;
	onShapeComplete?: (shape: Shape) => void;
}

export const useShapes = (options: UseShapesOptions = {}) => {
	const {
		currentShape,
		startShape,
		updateShape,
		finishShape,
		cancelShape,
		config
	} = useDrawingStore();

	const handleShapeStart = useCallback((point: Point, tool: string) => {
		if (tool.startsWith('shape-')) {
			startShape(point, tool);
		}
	}, [startShape]);

	const handleShapeMove = useCallback((point: Point) => {
		if (currentShape) {
			updateShape(point);
		}
	}, [currentShape, updateShape]);

	const handleShapeEnd = useCallback(() => {
		const userColor = options.userColor || config.defaultColor;
		const shape = finishShape(userColor);

		if (shape && options.onShapeComplete) {
			options.onShapeComplete(shape);
		}

		return shape;
	}, [finishShape, options.userColor, options.onShapeComplete, config.defaultColor]);

	const handleShapeCancel = useCallback(() => {
		cancelShape();
	}, [cancelShape]);

	// Helper to check if a specific shape type is being drawn
	const isDrawingShape = useCallback((shapeType?: ShapeType) => {
		if (!currentShape) return false;
		if (!shapeType) return true;
		return currentShape.type === shapeType;
	}, [currentShape]);

	return {
		// State
		currentShape,
		isDrawingAnyShape: currentShape !== null,

		// Actions
		handleShapeStart,
		handleShapeMove,
		handleShapeEnd,
		handleShapeCancel,

		// Utilities
		isDrawingShape,

		// Configuration
		strokeWidth: config.defaultStrokeWidth,
		color: options.userColor || config.defaultColor
	};
}; 