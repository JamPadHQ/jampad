import { create } from 'zustand'

type Tool = 'select' | 'move' | 'draw'

interface CanvasState {
	tool: Tool
}

interface CanvasActions {
	setTool: (tool: Tool) => void
}

export const useCanvasStore = create<CanvasState & CanvasActions>()((set) => ({
	tool: 'select',
	setTool: (tool) => set({ tool }),
}))