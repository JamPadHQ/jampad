import { SelectionBox as SelectionBoxType, CanvasState } from '@/lib/types';
import { getNormalizedSelectionBox } from '@/lib/canvasUtils';
import { CANVAS_CONSTANTS } from '@/lib/constants';

interface SelectionBoxProps {
	selectionBox: SelectionBoxType;
	canvasState: CanvasState;
	isSelecting: boolean;
}

export const SelectionBox = ({ selectionBox, canvasState, isSelecting }: SelectionBoxProps) => {
	if (!isSelecting) return null;

	const { minX, maxX, minY, maxY } = getNormalizedSelectionBox(selectionBox);
	const width = maxX - minX;
	const height = maxY - minY;

	// Don't render tiny selection boxes
	if (width < CANVAS_CONSTANTS.MIN_SELECTION_SIZE || height < CANVAS_CONSTANTS.MIN_SELECTION_SIZE) {
		return null;
	}

	return (
		<g>
			{/* Selection box fill */}
			<rect
				x={minX}
				y={minY}
				width={width}
				height={height}
				fill="rgba(59, 130, 246, 0.1)"
				stroke="none"
			/>
			{/* Selection box border */}
			<rect
				x={minX}
				y={minY}
				width={width}
				height={height}
				fill="none"
				stroke={CANVAS_CONSTANTS.COLORS.SELECTION}
				strokeWidth={CANVAS_CONSTANTS.SELECTION_STROKE_WIDTH / canvasState.zoom}
				strokeDasharray={`${CANVAS_CONSTANTS.SELECTION_DASH_ARRAY / canvasState.zoom} ${CANVAS_CONSTANTS.SELECTION_DASH_SPACING / canvasState.zoom}`}
			/>
		</g>
	);
}; 