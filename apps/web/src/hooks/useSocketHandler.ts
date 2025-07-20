import { io, Socket } from 'socket.io-client';
import { useEffect, useRef } from 'react';
import { useCanvasStore } from '@/lib/store';

export const useSocketHandler = () => {
	const socket = useRef<Socket | null>(null);
	const hasJoined = useRef(false);
	const {
		user,
		addMember,
		removeMember,
		setConnected,
		updateMembers,
		setUser
	} = useCanvasStore();

	useEffect(() => {
		// Connect to socket server
		socket.current = io(import.meta.env.VITE_PUBLIC_API_ENDPOINT);

		// Connection events
		socket.current.on('connect', () => {
			setConnected(true);

			// Join with current user nickname only once
			if (!hasJoined.current) {
				socket.current?.emit('user:join', user.nickname);
				hasJoined.current = true;
			}
		});

		socket.current.on('disconnect', () => {
			setConnected(false);
			hasJoined.current = false;
		});

		// User events
		socket.current.on('users:list', (users: Array<{ nickname: string; color: string }>) => {
			updateMembers(users);

			// Update current user with server-assigned color
			const currentUser = users.find(u => u.nickname === user.nickname);
			if (currentUser) {
				setUser({ ...user, color: currentUser.color });
			}
		});

		socket.current.on('user:joined', (newUser: { nickname: string; color: string }) => {
			console.log('User joined:', newUser);
			addMember(newUser);
		});

		socket.current.on('user:left', (nickname: string) => {
			console.log('User left:', nickname);
			removeMember(nickname);
		});

		// Cleanup on unmount
		return () => {
			if (socket.current) {
				socket.current.disconnect();
			}
			hasJoined.current = false;
		};
	}, []); // Remove all dependencies to prevent infinite re-renders
};