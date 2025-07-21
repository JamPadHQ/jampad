// Pastel colors for user assignment
const pastelColors = [
	'#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD', '#F0E68C',
	'#E6E6FA', '#D3D3D3', '#FFDAB9', '#90EE90', '#FFA07A',
	'#20B2AA', '#87CEFA', '#DDA0DD', '#98FB98', '#F0E68C'
]

let colorIndex = 0

export class ColorService {
	static getNextColor(): string {
		const color = pastelColors[colorIndex % pastelColors.length]
		colorIndex++
		return color
	}

	static resetColorIndex(): void {
		colorIndex = 0
	}
} 