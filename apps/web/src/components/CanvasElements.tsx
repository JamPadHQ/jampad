import { useCanvasStore } from '@/lib/store';
import { CanvasState } from '@/lib/types';

interface CanvasElementsProps {
	canvasState: CanvasState;
}

export const CanvasElements = ({ canvasState }: CanvasElementsProps) => {
	const elements = useCanvasStore((state) => state.elements);
	const selectedElements = useCanvasStore((state) => state.selectedElements);

	const renderElements = () => {
		return elements.map(element => {
			if (element.type === 'path') {
				const pathData = element.data;
				if (pathData.points.length < 2) return null;

				const pathString = pathData.points.reduce((acc, point, index) => {
					return index === 0
						? `M ${point.x} ${point.y}`
						: `${acc} L ${point.x} ${point.y}`;
				}, '');

				const isSelected = selectedElements.includes(element.id);

				return (
					<g key={element.id}>
						{/* Main path */}
						<path
							d={pathString}
							stroke={pathData.color}
							strokeWidth={pathData.strokeWidth}
							fill="none"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						{/* Selection highlight */}
						{isSelected && (
							<path
								d={pathString}
								stroke="#3b82f6"
								strokeWidth={pathData.strokeWidth + 4 / canvasState.zoom}
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								opacity={0.3}
							/>
						)}
					</g>
				);
			}
			return null;
		});
	};

	return <>{renderElements()}</>;
}; 