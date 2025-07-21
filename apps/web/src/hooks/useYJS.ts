import { useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useCanvasStore } from '@/lib/store';
import { toast } from 'sonner';
import { Element, Point, StickyNote } from '@/lib/types';

export const useYJS = (roomId: string = 'default-room') => {
	const doc = useRef<Y.Doc | null>(null);
	const provider = useRef<WebsocketProvider | null>(null);
	const elementsMap = useRef<Y.Map<Element> | null>(null);
	const awarenessListenerCleanup = useRef<(() => void) | null>(null);
	const isConnecting = useRef(false);

	const {
		user,
		setConnected,
		updateMembers,
		setUser,
		addElement,
		removeElement,
		updateElement,
		setElements
	} = useCanvasStore();

	const connect = useCallback(() => {
		if (doc.current || isConnecting.current) return;
		isConnecting.current = true;

		// Create YJS document
		doc.current = new Y.Doc();

		// Create shared data structures
		elementsMap.current = doc.current.getMap('elements');

		// Connect to WebSocket server
		const wsUrl = import.meta.env.VITE_PUBLIC_API_ENDPOINT?.replace('http', 'ws') || 'ws://localhost:3000';
		provider.current = new WebsocketProvider(
			`${wsUrl}/yjs`,
			roomId,
			doc.current
		);

		toast.loading('Connecting to server...', { id: 'yjs-connection' });

		// Set local awareness state for this user
		provider.current.awareness.setLocalStateField('user', {
			nickname: user.nickname,
			color: user.color,
			sessionId: user.sessionId
		});

		// Listen for awareness (presence) changes
		const onAwarenessChange = () => {
			if (!provider.current) return;
			const states = Array.from(provider.current.awareness.getStates().values());
			// Filter unique members by sessionId
			const seen = new Set();
			const members = states
				.map((state: any) => state.user)
				.filter((user: any) => {
					if (!user || !user.sessionId) return false;
					if (seen.has(user.sessionId)) return false;
					seen.add(user.sessionId);
					return true;
				});
			updateMembers(members);
		};
		provider.current.awareness.on('change', onAwarenessChange);
		awarenessListenerCleanup.current = () => {
			provider.current?.awareness.off('change', onAwarenessChange);
		};

		// Initial update (after provider.current is set)
		onAwarenessChange();

		// Connection events
		provider.current.on('status', ({ status }: { status: string }) => {
			if (status === 'connected') {
				setConnected(true);
				toast.success('Connected to server', { id: 'yjs-connection' });
				isConnecting.current = false;
			} else if (status === 'disconnected') {
				setConnected(false);
				toast.loading('Reconnecting to server...', { id: 'yjs-connection', dismissible: false });
				isConnecting.current = false;
			}
		});

		// Listen for elements changes
		if (elementsMap.current) {
			elementsMap.current.observe((event: Y.YMapEvent<Element>) => {
				const elements = Array.from(elementsMap.current!.values());
				setElements(elements);
			});
		}

		// Initialize with current elements if any
		const initialElements = useCanvasStore.getState().elements;
		if (initialElements.length > 0 && elementsMap.current) {
			initialElements.forEach(element => {
				elementsMap.current!.set(element.id, element);
			});
		}

	}, [roomId, updateMembers, setConnected, setElements]);

	const disconnect = useCallback(() => {
		isConnecting.current = false;
		if (awarenessListenerCleanup.current) {
			awarenessListenerCleanup.current();
			awarenessListenerCleanup.current = null;
		}
		if (provider.current) {
			provider.current.awareness.setLocalState(null); // Remove self from presence
			provider.current.destroy();
			provider.current = null;
		}
		if (doc.current) {
			doc.current.destroy();
			doc.current = null;
		}
		elementsMap.current = null;
		setConnected(false);
	}, [setConnected]);

	useEffect(() => {
		connect();

		// Clean up on tab close/reload
		const handleUnload = () => {
			disconnect();
		};
		window.addEventListener('beforeunload', handleUnload);

		return () => {
			window.removeEventListener('beforeunload', handleUnload);
			disconnect();
		};
	}, [connect, disconnect]);

	const addElementToYJS = useCallback((element: Element) => {
		if (elementsMap.current) {
			elementsMap.current.set(element.id, element);
		}
	}, []);

	const removeElementFromYJS = useCallback((id: string) => {
		if (elementsMap.current) {
			elementsMap.current.delete(id);
		}
	}, []);

	const updateElementInYJS = useCallback((id: string, updates: Partial<Element>) => {
		if (elementsMap.current) {
			const element = elementsMap.current.get(id);
			if (element) {
				elementsMap.current.set(id, { ...element, ...updates });
			}
		}
	}, []);

	const createStickyNoteInYJS = useCallback((position: Point) => {
		const id = `sticky_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const stickyNote: StickyNote = {
			id,
			position,
			text: '',
			color: user.color,
			width: 200,
			height: 150
		};

		const element: Element = {
			id,
			type: 'sticky-note',
			data: stickyNote
		};

		addElementToYJS(element);
		return id;
	}, [user.color, addElementToYJS]);

	const updateStickyNoteTextInYJS = useCallback((id: string, text: string) => {
		if (elementsMap.current) {
			const element = elementsMap.current.get(id);
			if (element && element.type === 'sticky-note') {
				elementsMap.current.set(id, {
					...element,
					data: {
						...element.data,
						text
					}
				});
			}
		}
	}, []);

	return {
		doc: doc.current,
		provider: provider.current,
		addElementToYJS,
		removeElementFromYJS,
		updateElementInYJS,
		createStickyNoteInYJS,
		updateStickyNoteTextInYJS,
		connect,
		disconnect
	};
}; 