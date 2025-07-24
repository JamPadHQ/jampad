import { StateCreator } from 'zustand';
import { Point } from '@jampad/canvas';
import { Element, StickyNote, ElementCreationData } from '../types/index.js';

export interface ElementsSlice {
	// Core element state
	elements: Element[];
	
	// Basic element operations
	addElement: (element: Element) => void;
	removeElement: (id: string) => void;
	updateElement: (id: string, updates: Partial<Element>) => void;
	setElements: (elements: Element[]) => void;
	getElementById: (id: string) => Element | undefined;
	getElementsByType: (type: Element['type']) => Element[];
	
	// Bulk operations
	addElements: (elements: Element[]) => void;
	removeElements: (ids: string[]) => void;
	clearElements: () => void;
	
	// Element creation helpers
	createElement: (data: ElementCreationData) => Element;
	createStickyNote: (position: Point, userColor: string) => Element;
	
	// Element queries
	hasElement: (id: string) => boolean;
	getElementCount: () => number;
	getElementsByIds: (ids: string[]) => Element[];
}

export const createElementsSlice: StateCreator<
	ElementsSlice,
	[],
	[],
	ElementsSlice
> = (set, get) => ({
	// Initial state
	elements: [],

	// Basic element operations
	addElement: (element) => {
		set((state) => ({
			elements: [...state.elements, element]
		}));
	},

	removeElement: (id) => {
		set((state) => ({
			elements: state.elements.filter(el => el.id !== id)
		}));
	},

	updateElement: (id, updates) => {
		set((state) => ({
			elements: state.elements.map(el =>
				el.id === id ? { ...el, ...updates } : el
			)
		}));
	},

	setElements: (elements) => {
		set({ elements });
	},

	getElementById: (id) => {
		const { elements } = get();
		return elements.find(el => el.id === id);
	},

	getElementsByType: (type) => {
		const { elements } = get();
		return elements.filter(el => el.type === type);
	},

	// Bulk operations
	addElements: (elements) => {
		set((state) => ({
			elements: [...state.elements, ...elements]
		}));
	},

	removeElements: (ids) => {
		set((state) => ({
			elements: state.elements.filter(el => !ids.includes(el.id))
		}));
	},

	clearElements: () => {
		set({ elements: [] });
	},

	// Element creation helpers
	createElement: (data) => {
		const id = `${data.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		return {
			id,
			type: data.type,
			data: { ...data.data, id }
		};
	},

	createStickyNote: (position, userColor) => {
		const id = `sticky_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const stickyNote: StickyNote = {
			id,
			position,
			text: '',
			color: userColor,
			width: 200,
			height: 150
		};

		const element: Element = {
			id,
			type: 'sticky-note',
			data: stickyNote
		};

		// Add to store and return the element
		get().addElement(element);
		return element;
	},

	// Element queries
	hasElement: (id) => {
		const { elements } = get();
		return elements.some(el => el.id === id);
	},

	getElementCount: () => {
		return get().elements.length;
	},

	getElementsByIds: (ids) => {
		const { elements } = get();
		return elements.filter(el => ids.includes(el.id));
	}
}); 