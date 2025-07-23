import { StateCreator } from 'zustand';
import { CanvasStore, StreamsSlice } from './types';

export const createStreamsSlice: StateCreator<
	CanvasStore,
	[],
	[],
	StreamsSlice
> = (set) => ({
	streams: {},
	addStream: (streamId, stream) =>
		set((state) => ({
			streams: {
				...state.streams,
				[streamId]: stream,
			},
		})),
	removeStream: (streamId) =>
		set((state) => {
			const newStreams = { ...state.streams };
			delete newStreams[streamId];
			return { streams: newStreams };
		}),
}); 