import { StateCreator } from 'zustand';
import { Tool } from '../types/index.js';

export interface ToolSlice {
	tool: Tool;
	previousTool: Tool | null;
	
	setTool: (tool: Tool) => void;
	setPreviousTool: (tool: Tool) => void;
	revertToPreviousTool: () => void;
	
	// Tool state queries
	isDrawingTool: () => boolean;
	isShapeTool: () => boolean;
	isSelectTool: () => boolean;
}

export const createToolSlice: StateCreator<
	ToolSlice,
	[],
	[],
	ToolSlice
> = (set, get) => ({
	tool: 'move', // Default tool
	previousTool: null,

	setTool: (tool) => {
		const currentTool = get().tool;
		set({ 
			tool, 
			previousTool: currentTool !== tool ? currentTool : get().previousTool 
		});
	},

	setPreviousTool: (tool) => {
		set({ previousTool: tool });
	},

	revertToPreviousTool: () => {
		const { previousTool } = get();
		if (previousTool) {
			set({ tool: previousTool, previousTool: null });
		}
	},

	// Tool state queries
	isDrawingTool: () => {
		return get().tool === 'draw';
	},

	isShapeTool: () => {
		const tool = get().tool;
		return tool.startsWith('shape-');
	},

	isSelectTool: () => {
		return get().tool === 'select';
	}
}); 