import { StateCreator } from 'zustand'
import type { Element, Point, StickyNote } from '@/lib/types'
import type { CanvasStore, ElementsSlice } from './types'

export const createElementsSlice: StateCreator<CanvasStore, [], [], ElementsSlice> = (set, get) => ({
	elements: [],
	selectedElements: [],
	editingStickyNoteId: null,

	addElement: (element) => set((state) => ({
		elements: [...state.elements, element]
	})),

	removeElement: (id) => set((state) => ({
		elements: state.elements.filter(el => el.id !== id),
		selectedElements: state.selectedElements.filter(selectedId => selectedId !== id),
		editingStickyNoteId: state.editingStickyNoteId === id ? null : state.editingStickyNoteId
	})),

	updateElement: (id, updates) => set((state) => ({
		elements: state.elements.map(el =>
			el.id === id ? { ...el, ...updates } : el
		)
	})),

	setElements: (elements) => set({ elements }),

	selectElements: (ids) => set({ selectedElements: ids }),

	clearSelection: () => set({ selectedElements: [] }),

	setEditingStickyNoteId: (id) => set({ editingStickyNoteId: id }),

	createStickyNote: (position: Point) => {
		const state = get()
		const id = `sticky_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
		const stickyNote: StickyNote = {
			id,
			position,
			text: '',
			color: state.user.color,
			width: 200,
			height: 150
		}

		const element: Element = {
			id,
			type: 'sticky-note',
			data: stickyNote
		}

		set((state) => ({
			elements: [...state.elements, element],
			selectedElements: [id] // Select the newly created sticky note
		}))

		return id
	},

	updateStickyNoteText: (id: string, text: string) => {
		set((state) => ({
			elements: state.elements.map(el => {
				if (el.id === id && el.type === 'sticky-note') {
					return {
						...el,
						data: {
							...el.data,
							text
						}
					}
				}
				return el
			})
		}))
	}
}) 