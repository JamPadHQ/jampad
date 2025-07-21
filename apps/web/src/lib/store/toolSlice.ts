import { StateCreator } from 'zustand'
import type { CanvasStore, ToolSlice } from './types'

export const createToolSlice: StateCreator<CanvasStore, [], [], ToolSlice> = (set) => ({
	tool: 'move',
	setTool: (tool) => set({ tool })
}) 