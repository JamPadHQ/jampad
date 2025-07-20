import { useCanvasStore } from '@/lib/store';

export const CurrentDrawing = () => {
	const settings = useCanvasStore((state) => state.settings);
	const currentDrawing = useCanvasStore((state) => state.currentDrawing);

	if (!currentDrawing || currentDrawing.length === 0) return null;

	// If only one point, show a dot
	if (currentDrawing.length === 1) {
		const point = currentDrawing[0];
		return (
			<circle
				cx={point.x}
				cy={point.y}
				r={2}
				fill={settings.user.color}
				opacity={0.8}
			/>
		);
	}

	// If multiple points, show the path
	const pathString = currentDrawing.reduce((acc, point, index) => {
		return index === 0
			? `M ${point.x} ${point.y}`
			: `${acc} L ${point.x} ${point.y}`;
	}, '');

	return (
		<path
			d={pathString}
			stroke={settings.user.color}
			strokeWidth={5}
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round"
			opacity={0.8}
		/>
	);
}; 