import { useCanvasStore } from '@/lib/store';
import { createRectangle, createCircle, createTriangle } from '@/lib/canvasUtils';

export const CurrentShape = () => {
	const currentShape = useCanvasStore((state) => state.currentShape);
	const user = useCanvasStore((state) => state.user);

	if (!currentShape) return null;

	const { start, end, type } = currentShape;

	switch (type) {
		case 'rectangle': {
			const { x, y, width, height } = createRectangle(start, end);
			return (
				<rect
					x={x}
					y={y}
					width={width}
					height={height}
					stroke={user.color}
					strokeWidth={5}
					fill="none"
				/>
			);
		}
		case 'circle': {
			const { cx, cy, r } = createCircle(start, end);
			return (
				<circle
					cx={cx}
					cy={cy}
					r={r}
					stroke={user.color}
					strokeWidth={5}
					fill="none"
				/>
			);
		}
		case 'triangle': {
			const points = createTriangle(start, end);
			return (
				<polygon
					points={points}
					stroke={user.color}
					strokeWidth={5}
					fill="none"
				/>
			);
		}
		default:
			return null;
	}
}; 