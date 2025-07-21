import type { Element, Member, Point, Tool } from '@/lib/types'

// Types for each slice
export interface UserSlice {
	user: Member
	setUser: (user: Member) => void
}

export interface ToolSlice {
	tool: Tool
	setTool: (tool: Tool) => void
}

export interface ElementsSlice {
	elements: Element[]
	selectedElements: string[]
	addElement: (element: Element) => void
	removeElement: (id: string) => void
	updateElement: (id: string, element: Partial<Element>) => void
	selectElements: (ids: string[]) => void
	clearSelection: () => void
	createStickyNote: (position: Point) => string
	updateStickyNoteText: (id: string, text: string) => void
}

export interface DrawingSlice {
	currentDrawing: Point[] | null
	startDrawing: (point: Point) => void
	addDrawingPoint: (point: Point) => void
	finishDrawing: () => string | null
	cancelDrawing: () => void
}

export interface MembersSlice {
	members: Member[]
	isConnected: boolean
	addMember: (member: Member) => void
	removeMember: (nickname: string) => void
	updateMembers: (members: Member[]) => void
	setConnected: (connected: boolean) => void
}

// Combined store type
export type CanvasStore = UserSlice & ToolSlice & ElementsSlice & DrawingSlice & MembersSlice 