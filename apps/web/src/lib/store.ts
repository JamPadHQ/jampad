import { create } from 'zustand'
import type { Element, Point, Settings, Tool } from '@/lib/types'
import generateRandomUsername from "generate-random-username"
import { getColorForNickname } from './colors'

const defaultNickname = generateRandomUsername({ separator: '-' })
const userColor = getColorForNickname(defaultNickname)

interface CanvasState {
	tool: Tool
	elements: Element[]
	selectedElements: string[]
	currentDrawing: Point[] | null
	settings: Settings
}

interface CanvasActions {
	setTool: (tool: Tool) => void
	addElement: (element: Element) => void
	removeElement: (id: string) => void
	updateElement: (id: string, element: Partial<Element>) => void
	selectElements: (ids: string[]) => void
	clearSelection: () => void
	startDrawing: (point: Point) => void
	addDrawingPoint: (point: Point) => void
	finishDrawing: () => string | null // returns id of created element
	cancelDrawing: () => void
	setSettings: (settings: Settings) => void
}

export const useCanvasStore = create<CanvasState & CanvasActions>()((set, get) => ({
	tool: 'move',
	elements: [],
	selectedElements: [],
	currentDrawing: null,
	settings: {
		user: {
			nickname: defaultNickname,
			color: userColor
		}
	},
	setSettings: (settings) => set({ settings }),
	setTool: (tool) => set({ tool }),

	addElement: (element) => set((state) => ({
		elements: [...state.elements, element]
	})),

	removeElement: (id) => set((state) => ({
		elements: state.elements.filter(el => el.id !== id),
		selectedElements: state.selectedElements.filter(selectedId => selectedId !== id)
	})),

	updateElement: (id, updates) => set((state) => ({
		elements: state.elements.map(el =>
			el.id === id ? { ...el, ...updates } : el
		)
	})),

	selectElements: (ids) => set({ selectedElements: ids }),

	clearSelection: () => set({ selectedElements: [] }),

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
				color: '#000000',
				strokeWidth: 2
			}
		}

		set((state) => ({
			elements: [...state.elements, element],
			currentDrawing: null
		}))

		return id
	},

	cancelDrawing: () => set({ currentDrawing: null })
}))