import { create } from 'zustand';
import { Point } from '@jampad/canvas';
import { DrawPath, Shape, CurrentShape, DrawingConfig } from '../types/index.js';
import { generateDrawingId } from '../utils/index.js';

export interface DrawingStore {
	// Current drawing state
	currentDrawing: Point[] | null;

	// Current shape state
	currentShape: CurrentShape | null;

	// Drawing configuration
	config: DrawingConfig;

	// Drawing actions
	startDrawing: (point: Point) => void;
	addDrawingPoint: (point: Point) => void;
	finishDrawing: (userColor: string) => DrawPath | null;
	cancelDrawing: () => void;

	// Shape actions
	startShape: (point: Point, shapeType: string) => void;
	updateShape: (point: Point) => void;
	finishShape: (userColor: string) => Shape | null;
	cancelShape: () => void;

	// Configuration
	updateConfig: (config: Partial<DrawingConfig>) => void;
	setStrokeWidth: (width: number) => void;
	setDefaultColor: (color: string) => void;
}

export const useDrawingStore = create<DrawingStore>((set, get) => ({
	// Initial state
	currentDrawing: null,
	currentShape: null,
	config: {
		defaultStrokeWidth: 5,
		defaultColor: '#000000'
	},

	// Drawing actions
	startDrawing: (point) => set({ currentDrawing: [point] }),

	addDrawingPoint: (point) => set((state) => ({
		currentDrawing: state.currentDrawing ? [...state.currentDrawing, point] : [point]
	})),

	finishDrawing: (userColor) => {
		const state = get();
		if (!state.currentDrawing || state.currentDrawing.length < 2) {
			set({ currentDrawing: null });
			return null;
		}

		const drawPath: DrawPath = {
			id: generateDrawingId('path'),
			points: state.currentDrawing,
			color: userColor || state.config.defaultColor,
			strokeWidth: state.config.defaultStrokeWidth
		};

		set({ currentDrawing: null });
		return drawPath;
	},

	cancelDrawing: () => set({ currentDrawing: null }),

	// Shape actions
	startShape: (point, shapeType) => {
		const type = shapeType.split('-')[1]; // Extract type from tool like 'shape-rectangle'
		if (!type || !['rectangle', 'circle', 'triangle'].includes(type)) return;

		set({
			currentShape: {
				start: point,
				end: point,
				type: type as any
			}
		});
	},

	updateShape: (point) => set((state) => ({
		currentShape: state.currentShape ? { ...state.currentShape, end: point } : null
	})),

	finishShape: (userColor) => {
		const state = get();
		if (!state.currentShape) {
			set({ currentShape: null });
			return null;
		}

		const shape: Shape = {
			id: generateDrawingId('shape'),
			type: state.currentShape.type,
			start: state.currentShape.start,
			end: state.currentShape.end,
			color: userColor || state.config.defaultColor,
			strokeWidth: state.config.defaultStrokeWidth
		};

		set({ currentShape: null });
		return shape;
	},

	cancelShape: () => set({ currentShape: null }),

	// Configuration
	updateConfig: (config) => set((state) => ({
		config: { ...state.config, ...config }
	})),

	setStrokeWidth: (width) => set((state) => ({
		config: { ...state.config, defaultStrokeWidth: width }
	})),

	setDefaultColor: (color) => set((state) => ({
		config: { ...state.config, defaultColor: color }
	}))
})); 