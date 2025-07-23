import { StateCreator } from 'zustand'
import type { CanvasStore, UserSlice } from './types'
import generateRandomUsername from "generate-random-username"

// Function to get the nickname from local storage or generate a new one
function getUniqueNickname() {
	const storedNickname = localStorage.getItem('nickname');
	if (storedNickname) {
		return storedNickname;
	}
	const newNickname = generateRandomUsername({ separator: '-' }) + '-' + Math.floor(Math.random() * 10000);
	localStorage.setItem('nickname', newNickname);
	return newNickname;
}

// Generate a unique sessionId per tab
function getSessionId() {
	return (window.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
}

export const createUserSlice: StateCreator<CanvasStore, [], [], UserSlice> = (set, get) => ({
	user: {
		nickname: getUniqueNickname(),
		color: '#FFFFFF', // Default color, will be updated from the server
		sessionId: getSessionId()
	},
	setUser: (user) => set({ user }),
	setNickname: async (nickname: string) => {
		localStorage.setItem('nickname', nickname);
		set((state) => ({ user: { ...state.user, nickname } }));
		await get().fetchUserColor('default-room');
	},
	fetchUserColor: async (roomName: string) => {
		const nickname = get().user.nickname;
		const pastelColors = [
			'#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C',
			'#E6E6FA', '#D3D3D3', '#FFDAB9', '#90EE90', '#FFA07A',
			'#20B2AA', '#87CEFA', '#DDA0DD', '#98FB98', '#F0E68C'
		]

		try {
			const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_ENDPOINT}/color/${roomName}/${nickname}`);
			if (!response.ok) {
				throw new Error('Failed to fetch user color');
			}
			const { color } = await response.json();
			set((state) => ({ user: { ...state.user, color } }));
		} catch (error) {
			console.error(error);
			const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
			set((state) => ({ user: { ...state.user, color: randomColor } }));
		}
	}
}) 