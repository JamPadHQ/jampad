import { create } from 'zustand';
import { CanvasState, CanvasViewport } from '../types/index.js';

export interface CanvasStore {
	// Canvas positioning and zoom
	canvasState: CanvasState;
	setCanvasState: (state: CanvasState) => void;
	updateCanvasState: (updates: Partial<CanvasState>) => void;

	// Viewport
	viewport: CanvasViewport;
	setViewport: (viewport: CanvasViewport) => void;

	// Navigation state
	isDragging: boolean;
	setIsDragging: (isDragging: boolean) => void;

	lastMousePos: { x: number; y: number };
	setLastMousePos: (pos: { x: number; y: number }) => void;

	// Reset functions
	resetCanvas: () => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
	// Initial canvas state
	canvasState: { x: 0, y: 0, zoom: 1 },
	setCanvasState: (state) => set({ canvasState: state }),
	updateCanvasState: (updates) => set((state) => ({
		canvasState: { ...state.canvasState, ...updates }
	})),

	// Viewport
	viewport: { width: 0, height: 0 },
	setViewport: (viewport) => set({ viewport }),

	// Navigation state
	isDragging: false,
	setIsDragging: (isDragging) => set({ isDragging }),

	lastMousePos: { x: 0, y: 0 },
	setLastMousePos: (pos) => set({ lastMousePos: pos }),

	// Reset functions
	resetCanvas: () => set({ canvasState: { x: 0, y: 0, zoom: 1 } }),
})); 