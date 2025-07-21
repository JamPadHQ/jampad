import { StateCreator } from 'zustand'
import type { CanvasStore, UserSlice } from './types'
import generateRandomUsername from "generate-random-username"

// Generate a unique nickname per session/tab
function getUniqueNickname() {
	return generateRandomUsername({ separator: '-' }) + '-' + Math.floor(Math.random() * 10000)
}

// Pastel colors for user assignment
const pastelColors = [
	'#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C',
	'#E6E6FA', '#D3D3D3', '#FFDAB9', '#90EE90', '#FFA07A',
	'#20B2AA', '#87CEFA', '#DDA0DD', '#98FB98', '#F0E68C'
]

function getRandomColor(): string {
	return pastelColors[Math.floor(Math.random() * pastelColors.length)]
}

// Generate a unique sessionId per tab
function getSessionId() {
	return (window.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`)
}

export const createUserSlice: StateCreator<CanvasStore, [], [], UserSlice> = (set) => ({
	user: {
		nickname: getUniqueNickname(),
		color: getRandomColor(),
		sessionId: getSessionId()
	},
	setUser: (user) => set({ user })
}) 