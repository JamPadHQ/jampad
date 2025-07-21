import { create } from 'zustand'
import type { Element, Member, Point, Tool, StickyNote } from '@/lib/types'
import generateRandomUsername from "generate-random-username"

const defaultNickname = generateRandomUsername({ separator: '-' })

interface CanvasState {
	user: Member
	tool: Tool
	elements: Element[]
	selectedElements: string[]
	currentDrawing: Point[] | null
	members: Member[]
	isConnected: boolean
}

interface CanvasActions {
	setUser: (user: Member) => void
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
	createStickyNote: (position: Point) => string // returns id of created sticky note
	updateStickyNoteText: (id: string, text: string) => void
	addMember: (member: Member) => void
	removeMember: (nickname: string) => void
	setConnected: (connected: boolean) => void
	updateMembers: (members: Member[]) => void
}

export const useCanvasStore = create<CanvasState & CanvasActions>()((set, get) => ({
	user: {
		nickname: defaultNickname,
		color: '#FFB6C1' // Default color, will be updated by server
	},
	tool: 'move',
	elements: [],
	selectedElements: [],
	currentDrawing: null,
	isConnected: false,
	members: [],

	setUser: (user) => set({ user }),

	addMember: (member) => set((state) => ({
		members: [...state.members, member]
	})),

	removeMember: (nickname) => set((state) => ({
		members: state.members.filter(member => member.nickname !== nickname)
	})),

	updateMembers: (members) => set({ members }),

	setConnected: (connected) => set({ isConnected: connected }),

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

	cancelDrawing: () => set({ currentDrawing: null }),

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
}))