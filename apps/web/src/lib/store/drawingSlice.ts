import { StateCreator } from 'zustand'
import type { Element } from '@/lib/types'
import type { CanvasStore, DrawingSlice } from './types'

export const createDrawingSlice: StateCreator<CanvasStore, [], [], DrawingSlice> = (set, get) => ({
	currentDrawing: null,

	startDrawing: (point) => set({ currentDrawing: [point] }),

	addDrawingPoint: (point) => set((state) => ({
		currentDrawing: state.currentDrawing ? [...state.currentDrawing, point] : [point]
	})),

	finishDrawing: () => {
		const state = get()
		if (!state.currentDrawing || state.currentDrawing.length < 2) {
			set({ currentDrawing: null })
			return null
		}

		const id = `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
		const element: Element = {
			id,
			type: 'path',
			data: {
				id,
				points: state.currentDrawing,
				color: state.user.color,
				strokeWidth: 5
			}
		}

		set((state) => ({
			elements: [...state.elements, element],
			currentDrawing: null
		}))

		return id
	},

	cancelDrawing: () => set({ currentDrawing: null })
}) 