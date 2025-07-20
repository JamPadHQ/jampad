const pastelColors = [
	'#FFB6C1',
	'#87CEEB',
	'#98FB98',
	'#DDA0DD',
	'#F0E68C',
	'#E6E6FA',
	'#D3D3D3',
	'#FFDAB9',
	'#90EE90',
]

/**
 * Get a color for a nickname
 */
export function getColorForNickname(nickname: string) {
	const hash = nickname.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const index = hash % pastelColors.length;
	return pastelColors[index];
}