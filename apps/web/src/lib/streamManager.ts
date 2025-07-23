type StreamListener = (stream: MediaStream) => void;

class StreamManager {
	private streams: Map<string, MediaStream> = new Map();
	private listeners: Map<string, StreamListener[]> = new Map();

	addStream(streamId: string, stream: MediaStream) {
		this.streams.set(streamId, stream);
		if (this.listeners.has(streamId)) {
			this.listeners.get(streamId)!.forEach(callback => callback(stream));
			this.listeners.delete(streamId);
		}
	}

	removeStream(streamId: string) {
		this.streams.delete(streamId);
	}

	getStream(streamId: string): MediaStream | undefined {
		return this.streams.get(streamId);
	}

	subscribe(streamId: string, callback: StreamListener): () => void {
		const existingStream = this.getStream(streamId);
		if (existingStream) {
			callback(existingStream);
			return () => { };
		}

		if (!this.listeners.has(streamId)) {
			this.listeners.set(streamId, []);
		}
		this.listeners.get(streamId)!.push(callback);

		return () => {
			const streamListeners = this.listeners.get(streamId);
			if (streamListeners) {
				const index = streamListeners.indexOf(callback);
				if (index > -1) {
					streamListeners.splice(index, 1);
				}
			}
		};
	}
}

export const streamManager = new StreamManager(); 