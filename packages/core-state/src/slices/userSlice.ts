import { StateCreator } from 'zustand';
import { User } from '../types/index.js';

// Function to get the nickname from local storage or generate a new one
function getUniqueNickname(): string {
	if (typeof window === 'undefined') return 'User'; // SSR safety
	
	const storedNickname = localStorage.getItem('nickname');
	if (storedNickname) {
		return storedNickname;
	}
	
	// Simple username generation (avoiding external dependency)
	const adjectives = ['happy', 'clever', 'bright', 'swift', 'brave', 'kind', 'cool', 'smart'];
	const nouns = ['user', 'creator', 'builder', 'artist', 'designer', 'maker', 'coder', 'ninja'];
	const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
	const noun = nouns[Math.floor(Math.random() * nouns.length)];
	const number = Math.floor(Math.random() * 10000);
	
	const newNickname = `${adjective}-${noun}-${number}`;
	localStorage.setItem('nickname', newNickname);
	return newNickname;
}

// Generate a unique sessionId per tab
function getSessionId(): string {
	if (typeof window === 'undefined') return 'server-session'; // SSR safety
	
	return (
		window.crypto?.randomUUID?.() || 
		`${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
	);
}

export interface UserSlice {
	user: User;
	setUser: (user: User) => void;
	setNickname: (nickname: string) => Promise<void>;
	setUserColor: (color: string) => void;
	setCursor: (position: { x: number; y: number }) => void;
	fetchUserColor: (roomName: string) => Promise<void>;
}

export const createUserSlice: StateCreator<
	UserSlice,
	[],
	[],
	UserSlice
> = (set, get) => ({
	user: {
		nickname: getUniqueNickname(),
		color: '#FFFFFF', // Default color, will be updated from the server
		sessionId: getSessionId()
	},

	setUser: (user) => set({ user }),

	setNickname: async (nickname: string) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('nickname', nickname);
		}
		set((state) => ({ user: { ...state.user, nickname } }));
		await get().fetchUserColor('default-room');
	},

	setUserColor: (color: string) => {
		set((state) => ({ user: { ...state.user, color } }));
	},

	setCursor: (position: { x: number; y: number }) => {
		set((state) => ({ user: { ...state.user, cursor: position } }));
	},

	fetchUserColor: async (roomName: string) => {
		const nickname = get().user.nickname;
		const pastelColors = [
			'#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C',
			'#E6E6FA', '#D3D3D3', '#FFDAB9', '#90EE90', '#FFA07A',
			'#20B2AA', '#87CEFA', '#DDA0DD', '#98FB98', '#F0E68C'
		];

		try {
			const apiEndpoint = typeof window !== 'undefined' && window.location 
				? `${window.location.protocol}//${window.location.hostname}:3000`
				: 'http://localhost:3000';
				
			const response = await fetch(`${apiEndpoint}/color/${roomName}/${nickname}`);
			if (!response.ok) {
				throw new Error('Failed to fetch user color');
			}
			const { color } = await response.json();
			set((state) => ({ user: { ...state.user, color } }));
		} catch (error) {
			console.error('Failed to fetch user color:', error);
			const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
			set((state) => ({ user: { ...state.user, color: randomColor } }));
		}
	}
}); 