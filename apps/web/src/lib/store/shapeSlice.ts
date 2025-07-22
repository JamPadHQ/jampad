import { StateCreator } from 'zustand'
import type { Shape, Element } from '@/lib/types'
import type { CanvasStore, ShapeSlice } from './types'

export const createShapeSlice: StateCreator<CanvasStore, [], [], ShapeSlice> = (set, get) => ({
	currentShape: null,

	startShape: (point, tool) => {
		get().clearSelection();
		const shapeType = tool.split('-')[1];
		if (!shapeType) return;

		set({
			currentShape: {
				start: point,
				end: point,
				type: shapeType as any,
			}
		});
	},

	updateShape: (point) => {
		set((state) => ({
			currentShape: state.currentShape ? { ...state.currentShape, end: point } : null
		}));
	},

	finishShape: () => {
		const { currentShape, user } = get();
		if (!currentShape) {
			set({ currentShape: null });
			return null;
		}

		const id = `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const element: Element = {
			id,
			type: 'shape',
			data: {
				id,
				...currentShape,
				color: user.color,
				strokeWidth: 5,
			} as Shape,
		};

		set((state) => ({
			elements: [...state.elements, element],
			currentShape: null
		}));

		return id;
	},

	cancelShape: () => set({ currentShape: null }),
}); 