import { StateCreator } from 'zustand'
import type { CanvasStore, UserSlice } from './types'
import generateRandomUsername from "generate-random-username"

const defaultNickname = generateRandomUsername({ separator: '-' })

export const createUserSlice: StateCreator<CanvasStore, [], [], UserSlice> = (set) => ({
	user: {
		nickname: defaultNickname,
		color: '#FFB6C1' // Default color, will be updated by server
	},
	setUser: (user) => set({ user })
}) 