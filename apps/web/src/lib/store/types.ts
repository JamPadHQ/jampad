import type { User, Tool, Element, Point, Member } from '@/lib/types'

// Types for each slice
export interface UserSlice {
	user: User
	setUser: (user: User) => void
	setNickname: (nickname: string) => Promise<void>
	fetchUserColor: (roomName: string) => Promise<void>
}

export interface ToolSlice {
	tool: Tool
	setTool: (tool: Tool) => void
}

export interface ElementsSlice {
	elements: Element[]
	selectedElements: string[]
	editingStickyNoteId: string | null
	addElement: (element: Element) => void
	removeElement: (id: string) => void
	updateElement: (id: string, element: Partial<Element>) => void
	setElements: (elements: Element[]) => void
	selectElements: (ids: string[]) => void
	clearSelection: () => void
	createStickyNote: (position: Point) => string
	updateStickyNoteText: (id: string, text: string) => void
	setEditingStickyNoteId: (id: string | null) => void
}

export interface DrawingSlice {
	currentDrawing: Point[] | null
	startDrawing: (point: Point) => void
	addDrawingPoint: (point: Point) => void
	finishDrawing: () => string | null
	cancelDrawing: () => void
}

export interface ShapeSlice {
	currentShape: { start: Point; end: Point; type: string } | null;
	startShape: (point: Point, tool: Tool) => void;
	updateShape: (point: Point) => void;
	finishShape: () => string | null;
	cancelShape: () => void;
}

export interface MembersSlice {
	members: Member[]
	isConnected: boolean
	addMember: (member: Member) => void
	removeMember: (nickname: string) => void
	updateMembers: (members: Member[]) => void
	setConnected: (connected: boolean) => void
}

export interface StreamsSlice {
	streams: { [key: string]: MediaStream };
	addStream: (streamId: string, stream: MediaStream) => void;
	removeStream: (streamId: string) => void;
}

// Combined store type
export type CanvasStore = UserSlice & ToolSlice & ElementsSlice & DrawingSlice & MembersSlice & ShapeSlice & StreamsSlice; 