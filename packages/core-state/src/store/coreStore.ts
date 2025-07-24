import { create } from 'zustand';
import { UserSlice, createUserSlice } from '../slices/userSlice.js';
import { ElementsSlice, createElementsSlice } from '../slices/elementsSlice.js';
import { ToolSlice, createToolSlice } from '../slices/toolSlice.js';

// Combined core state type
export type CoreState = UserSlice & ElementsSlice & ToolSlice;

// Core store that combines all slices
export const useCoreStore = create<CoreState>()((...a) => ({
	...createUserSlice(...a),
	...createElementsSlice(...a),
	...createToolSlice(...a),
}));