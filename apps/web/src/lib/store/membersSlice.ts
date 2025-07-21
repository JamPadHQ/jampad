import { StateCreator } from 'zustand'
import type { CanvasStore, MembersSlice } from './types'

export const createMembersSlice: StateCreator<CanvasStore, [], [], MembersSlice> = (set) => ({
	members: [],
	isConnected: false,

	addMember: (member) => set((state) => ({
		members: [...state.members, member]
	})),

	removeMember: (nickname) => set((state) => ({
		members: state.members.filter(member => member.nickname !== nickname)
	})),

	updateMembers: (members) => set({ members }),

	setConnected: (connected) => set({ isConnected: connected })
}) 