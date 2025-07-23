// Pastel colors for user assignment
const pastelColors = [
	'#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C',
	'#E6E6FA', '#D3D3D3', '#FFDAB9', '#90EE90', '#FFA07A',
	'#20B2AA', '#87CEFA', '#DDA0DD', '#98FB98', '#F0E68C'
]

// In-memory store for user colors per room
// Map<roomName, Map<nickname, color>>
const roomColors = new Map<string, Map<string, string>>()

export class ColorService {
	static getUserColor(roomName: string, nickname: string): string {
		// Get or create the color map for the room
		const colorMap = roomColors.get(roomName) || new Map<string, string>()
		roomColors.set(roomName, colorMap)

		// Check if the user already has a color in this room
		if (colorMap.has(nickname)) {
			return colorMap.get(nickname)!
		}

		// Assign a new color
		const usedColors = new Set(colorMap.values())
		const availableColors = pastelColors.filter(c => !usedColors.has(c))
		const color = availableColors.length > 0
			? availableColors[Math.floor(Math.random() * availableColors.length)]
			: pastelColors[Math.floor(Math.random() * pastelColors.length)] // Fallback if all colors are used

		colorMap.set(nickname, color)
		return color
	}
} 