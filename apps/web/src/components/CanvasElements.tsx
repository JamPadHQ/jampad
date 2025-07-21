import { memo, useMemo } from 'react';
import { useCanvasStore } from '@/lib/store';
import { CanvasState, DrawPath, StickyNote } from '@/lib/types';
import { StickyNote as StickyNoteComponent } from './StickyNote';

interface CanvasElementsProps {
	canvasState: CanvasState;
}

// Type guards
const isDrawPath = (data: DrawPath | StickyNote): data is DrawPath => {
	return 'points' in data;
};

const isStickyNote = (data: DrawPath | StickyNote): data is StickyNote => {
	return 'position' in data && 'text' in data;
};

// Memoized path rendering component
const DrawPathElement = memo(({
	element,
	isSelected,
	canvasState
}: {
	element: any;
	isSelected: boolean;
	canvasState: CanvasState;
}) => {
	const pathData = element.data;
	if (pathData.points.length < 2) return null;

	const pathString = useMemo(() => {
		return pathData.points.reduce((acc: string, point: any, index: number) => {
			return index === 0
				? `M ${point.x} ${point.y}`
				: `${acc} L ${point.x} ${point.y}`;
		}, '');
	}, [pathData.points]);

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
});

export const CanvasElements = memo(({ canvasState }: CanvasElementsProps) => {
	// Selective store subscriptions to prevent unnecessary re-renders
	const elements = useCanvasStore((state) => state.elements);
	const selectedElements = useCanvasStore((state) => state.selectedElements);

	// Memoize the rendered elements to prevent recalculation
	const renderedElements = useMemo(() => {
		return elements.map(element => {
			if (element.type === 'path' && isDrawPath(element.data)) {
				const isSelected = selectedElements.includes(element.id);
				return (
					<DrawPathElement
						key={element.id}
						element={element}
						isSelected={isSelected}
						canvasState={canvasState}
					/>
				);
			} else if (element.type === 'sticky-note' && isStickyNote(element.data)) {
				const stickyNoteData = element.data;
				const isSelected = selectedElements.includes(element.id);

				return (
					<StickyNoteComponent
						key={element.id}
						stickyNote={stickyNoteData}
						isSelected={isSelected}
						canvasState={canvasState}
					/>
				);
			}
			return null;
		});
	}, [elements, selectedElements, canvasState]);

	return <>{renderedElements}</>;
}); 