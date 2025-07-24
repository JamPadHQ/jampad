import { useCoreStore } from '../store/index.js';
import { Element } from '../types/index.js';

// User hooks
export const useUser = () => useCoreStore((state) => state.user);
export const useUserActions = () => useCoreStore((state) => ({
	setUser: state.setUser,
	setNickname: state.setNickname,
	setUserColor: state.setUserColor,
	setCursor: state.setCursor,
	fetchUserColor: state.fetchUserColor
}));

// Tool hooks
export const useTool = () => useCoreStore((state) => state.tool);
export const useToolActions = () => useCoreStore((state) => ({
	setTool: state.setTool,
	setPreviousTool: state.setPreviousTool,
	revertToPreviousTool: state.revertToPreviousTool,
	isDrawingTool: state.isDrawingTool,
	isShapeTool: state.isShapeTool,
	isSelectTool: state.isSelectTool
}));

// Elements hooks
export const useElements = () => useCoreStore((state) => state.elements);
export const useElementsActions = () => useCoreStore((state) => ({
	addElement: state.addElement,
	removeElement: state.removeElement,
	updateElement: state.updateElement,
	setElements: state.setElements,
	addElements: state.addElements,
	removeElements: state.removeElements,
	clearElements: state.clearElements,
	createElement: state.createElement,
	createStickyNote: state.createStickyNote
}));

export const useElementsQueries = () => useCoreStore((state) => ({
	getElementById: state.getElementById,
	getElementsByType: state.getElementsByType,
	hasElement: state.hasElement,
	getElementCount: state.getElementCount,
	getElementsByIds: state.getElementsByIds
}));

// Computed selectors
export const useElementById = (id: string) =>
	useCoreStore((state) => state.getElementById(id));

export const useElementsByType = (type: Element['type']) =>
	useCoreStore((state) => state.getElementsByType(type));

export const useElementsByIds = (ids: string[]) =>
	useCoreStore((state) => state.getElementsByIds(ids));

export const useElementCount = () =>
	useCoreStore((state) => state.getElementCount());

// Combined hooks for convenience
export const useCore = () => ({
	// State
	user: useUser(),
	tool: useTool(),
	elements: useElements(),

	// Actions
	userActions: useUserActions(),
	toolActions: useToolActions(),
	elementsActions: useElementsActions(),
	elementsQueries: useElementsQueries()
}); 