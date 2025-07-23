import { useCallback, useEffect, useRef, useState } from 'react';
import { useCanvasStore } from '@/lib/store';
import { useYJS } from './useYJS';
import Peer, { MediaConnection } from 'peerjs';
import { toast } from 'sonner';
import { Element, ScreenShare } from '@/lib/types';
import { streamManager } from '@/lib/streamManager';

export const useScreenShare = (roomId: string = 'default-room') => {
	const peer = useRef<Peer | null>(null);
	const localStream = useRef<MediaStream | null>(null);
	const [isScreenSharing, setIsScreenSharing] = useState(false);
	const { user } = useCanvasStore();
	const { provider, addElementToYJS, removeElementFromYJS } = useYJS(roomId);
	const peers = useRef<Record<string, MediaConnection>>({});

	const stopScreenShare = useCallback(() => {
		if (localStream.current) {
			const streamId = localStream.current.id;
			streamManager.removeStream(streamId);
			localStream.current.getTracks().forEach((track) => track.stop());
			localStream.current = null;
			setIsScreenSharing(false);
			Object.values(peers.current).forEach((peer) => peer.close());
			peers.current = {};
			const screenShareId = `screenshare_${user.sessionId}`;
			removeElementFromYJS(screenShareId);
			toast.success('Screen sharing stopped.');
		}
	}, [user.sessionId, removeElementFromYJS]);

	const handleStream = useCallback(
		(stream: MediaStream, peerId?: string) => {
			const streamId = stream.id;
			streamManager.addStream(streamId, stream);

			if (!peerId) {
				const screenShareId = `screenshare_${user.sessionId}`;
				const newElement: Element = {
					id: screenShareId,
					type: 'screenshare',
					data: {
						id: screenShareId,
						streamId,
						userId: user.sessionId,
						position: { x: 200, y: 200 },
						width: 640,
						height: 480
					} as ScreenShare
				};
				addElementToYJS(newElement);
			}
		},
		[user.sessionId, addElementToYJS]
	);

	const startScreenShare = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getDisplayMedia({
				video: true,
				audio: true
			});
			localStream.current = stream;
			handleStream(stream);
			setIsScreenSharing(true);
			toast.success('Screen sharing started!');

			// Handle user stopping stream via browser UI
			stream.getVideoTracks()[0].onended = () => {
				stopScreenShare();
			};
		} catch (error) {
			toast.error('Failed to start screen sharing.');
			console.error('Error starting screen share:', error);
		}
	}, [handleStream, stopScreenShare]);

	useEffect(() => {
		if (!provider || peer.current) return;

		const newPeer = new Peer(user.sessionId);
		peer.current = newPeer;

		newPeer.on('open', (id) => {
			provider.awareness.setLocalStateField('peer', { ready: true });
		});

		newPeer.on('error', (err) => {
			console.error('PeerJS error:', err);
			toast.error(`PeerJS error: ${err.type}`);
			provider.awareness.setLocalStateField('peer', { ready: false });
		});

		newPeer.on('disconnected', () => {
			toast.info('PeerJS disconnected. Reconnecting...');
			provider.awareness.setLocalStateField('peer', { ready: false });
		});

		newPeer.on('call', (call) => {
			call.answer(localStream.current || new MediaStream());
			call.on('stream', (remoteStream) => {
				handleStream(remoteStream, call.peer);
			});
			peers.current[call.peer] = call;

			call.on('close', () => {
				delete peers.current[call.peer];
			});
		});

		return () => {
			provider.awareness.setLocalStateField('peer', { ready: false });
			newPeer.destroy();
		};
	}, [provider, user.sessionId, handleStream]);

	useEffect(() => {
		if (!provider) return;
		const awareness = provider.awareness;

		const handleAwarenessChange = () => {
			if (!isScreenSharing || !localStream.current) return;

			const states = Array.from(awareness.getStates().values());
			states.forEach((state) => {
				const remoteUser = state.user;
				const remotePeerState = state.peer;

				if (remoteUser && remoteUser.sessionId !== user.sessionId && remotePeerState?.ready && !peers.current[remoteUser.sessionId]) {
					const call = peer.current?.call(remoteUser.sessionId, localStream.current!);
					if (call) {
						call.on('stream', (remoteStream) => {
							// Stream is handled by the 'call' event on the remote side
						});
						peers.current[remoteUser.sessionId] = call;
						call.on('close', () => {
							delete peers.current[remoteUser.sessionId];
						});
					}
				}
			});
		};

		awareness.on('change', handleAwarenessChange);
		handleAwarenessChange(); // Initial check

		return () => {
			awareness.off('change', handleAwarenessChange);
		};
	}, [isScreenSharing, provider, user.sessionId]);

	return { isScreenSharing, startScreenShare, stopScreenShare };
}; 