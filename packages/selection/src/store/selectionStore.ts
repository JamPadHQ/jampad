import { create } from 'zustand';
import { Point } from '@jampad/canvas';
import { SelectionBox, Bounds, Handle, TransformState, SelectionConfig } from '../types/index.js';

export interface SelectionStore {
	// Selection state
	selectionBox: SelectionBox;
	selectedElements: string[];
	isSelecting: boolean;

	// Transform state
	transform: TransformState;
	isTransforming: boolean;

	// Configuration
	config: SelectionConfig;

	// Selection actions
	startSelection: (point: Point) => void;
	updateSelection: (point: Point) => void;
	endSelection: () => void;
	cancelSelection: () => void;

	// Element selection actions
	selectElements: (elementIds: string[]) => void;
	addToSelection: (elementIds: string[]) => void;
	removeFromSelection: (elementIds: string[]) => void;
	clearSelection: () => void;
	toggleElementSelection: (elementId: string, isMultiSelect: boolean) => void;

	// Transform actions
	startTransform: (handle: Handle, point: Point, initialBounds?: Record<string, any>) => void;
	updateTransform: (point: Point) => void;
	endTransform: () => void;
	cancelTransform: () => void;

	// Configuration
	updateConfig: (config: Partial<SelectionConfig>) => void;
}

const defaultConfig: SelectionConfig = {
	multiSelectKey: 'shift',
	minSelectionSize: 2,
	strokeWidth: 1.5,
	dashArray: 6,
	dashSpacing: 4,
	selectionColor: '#3b82f6'
};

export const useSelectionStore = create<SelectionStore>((set, get) => ({
	// Initial state
	selectionBox: { startX: 0, startY: 0, endX: 0, endY: 0 },
	selectedElements: [],
	isSelecting: false,

	transform: {
		activeHandle: null,
		initialBounds: {},
		initialPoint: { x: 0, y: 0 },
		selectionBoundingBox: null
	},
	isTransforming: false,

	config: defaultConfig,

	// Selection actions
	startSelection: (point) => {
		set({
			isSelecting: true,
			selectionBox: {
				startX: point.x,
				startY: point.y,
				endX: point.x,
				endY: point.y
			}
		});
	},

	updateSelection: (point) => {
		set((state) => ({
			selectionBox: {
				...state.selectionBox,
				endX: point.x,
				endY: point.y
			}
		}));
	},

	endSelection: () => {
		set({ isSelecting: false });
	},

	cancelSelection: () => {
		set({
			isSelecting: false,
			selectionBox: { startX: 0, startY: 0, endX: 0, endY: 0 }
		});
	},

	// Element selection actions
	selectElements: (elementIds) => {
		set({ selectedElements: elementIds });
	},

	addToSelection: (elementIds) => {
		set((state) => ({
			selectedElements: [...new Set([...state.selectedElements, ...elementIds])]
		}));
	},

	removeFromSelection: (elementIds) => {
		set((state) => ({
			selectedElements: state.selectedElements.filter(id => !elementIds.includes(id))
		}));
	},

	clearSelection: () => {
		set({ selectedElements: [] });
	},

	toggleElementSelection: (elementId, isMultiSelect) => {
		set((state) => {
			if (isMultiSelect) {
				if (state.selectedElements.includes(elementId)) {
					return {
						selectedElements: state.selectedElements.filter(id => id !== elementId)
					};
				} else {
					return {
						selectedElements: [...state.selectedElements, elementId]
					};
				}
			} else {
				return { selectedElements: [elementId] };
			}
		});
	},

	// Transform actions
	startTransform: (handle, point, initialBounds = {}) => {
		set({
			isTransforming: true,
			transform: {
				activeHandle: handle,
				initialPoint: point,
				initialBounds,
				selectionBoundingBox: null // Will be calculated by the hook
			}
		});
	},

	updateTransform: (point) => {
		set((state) => ({
			transform: {
				...state.transform,
				// Transform calculations will be handled by the hook
			}
		}));
	},

	endTransform: () => {
		set({
			isTransforming: false,
			transform: {
				activeHandle: null,
				initialBounds: {},
				initialPoint: { x: 0, y: 0 },
				selectionBoundingBox: null
			}
		});
	},

	cancelTransform: () => {
		set({
			isTransforming: false,
			transform: {
				activeHandle: null,
				initialBounds: {},
				initialPoint: { x: 0, y: 0 },
				selectionBoundingBox: null
			}
		});
	},

	// Configuration
	updateConfig: (config) => {
		set((state) => ({
			config: { ...state.config, ...config }
		}));
	}
})); 