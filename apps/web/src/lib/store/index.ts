import { create } from 'zustand'
import type { CanvasStore } from './types'
import { createUserSlice } from './userSlice'
import { createToolSlice } from './toolSlice'
import { createElementsSlice } from './elementsSlice'
import { createDrawingSlice } from './drawingSlice'
import { createMembersSlice } from './membersSlice'
import { createShapeSlice } from './shapeSlice'

// Combined store with optimized performance
export const useCanvasStore = create<CanvasStore>()((...a) => ({
	...createUserSlice(...a),
	...createToolSlice(...a),
	...createElementsSlice(...a),
	...createDrawingSlice(...a),
	...createMembersSlice(...a),
	...createShapeSlice(...a),
}))

// Re-export types for convenience
export type { CanvasStore, UserSlice, ToolSlice, ElementsSlice, DrawingSlice, MembersSlice } from './types' 