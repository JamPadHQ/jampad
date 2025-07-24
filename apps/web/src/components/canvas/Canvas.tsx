import { useRef } from 'react';
import { useCanvasNavigation } from '@/hooks/useCanvasNavigation';
import { useCanvasEvents } from '@/hooks/useCanvasEvents';
import { useDrawing } from '@/hooks/useDrawing';
import { useSelection } from '@/hooks/useSelection';
import { useShapes } from '@/hooks/useShapes';
import { CanvasGrid, CanvasElements, CanvasOverlay } from './';
import { CurrentDrawing, CurrentShape } from '../drawing';
import { SelectionBox, SelectionHandles } from '../selection';
import { getCanvasTransform, getActualCanvasPosition } from '@/lib/canvasUtils';
import { CANVAS_CONSTANTS } from '@/lib/constants';
import { MemberCursors } from '../collaboration';

function Canvas() {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLDivElement>(null);

	// Navigation (pan/zoom)
	const {
		canvasState,
		isDragging,
		startDragging,
		updateDragging,
		stopDragging,
		handleZoom,
		resetCanvas
	} = useCanvasNavigation();

	// Drawing functionality with YJS
	const {
		handleDrawStart,
		handleDrawMove,
		handleDrawEnd
	} = useDrawing('default-room');

	// Selection functionality
	const {
		selectionBox,
		handleSelectionStart,
		handleSelectionMove,
		handleSelectionEnd
	} = useSelection();

	// Shape drawing functionality
	const {
		handleShapeStart,
		handleShapeMove,
		handleShapeEnd,
	} = useShapes('default-room');

	// Event handling
	const {
		isDrawing,
		isDrawingShape,
		isSelecting,
		isTransforming,
		handleMouseDown,
		handleDoubleClick,
		getCursor
	} = useCanvasEvents({
		containerRef: containerRef as React.RefObject<HTMLDivElement>,
		canvasState,
		isDragging,
		startDragging,
		updateDragging,
		stopDragging,
		handleZoom,
		onDrawStart: handleDrawStart,
		onDrawMove: handleDrawMove,
		onDrawEnd: handleDrawEnd,
		onSelectionStart: handleSelectionStart,
		onSelectionMove: handleSelectionMove,
		onSelectionEnd: handleSelectionEnd,
		onShapeStart: handleShapeStart,
		onShapeMove: handleShapeMove,
		onShapeEnd: handleShapeEnd,
	});

	// Calculate canvas transform and position
	const transform = getCanvasTransform(canvasState);
	const actualPosition = getActualCanvasPosition(canvasState);

	return (
		<div className="relative w-full h-screen overflow-hidden bg-background">
			{/* Canvas Overlay - Debug info and controls */}
			<CanvasOverlay
				canvasState={canvasState}
				actualPosition={actualPosition}
				onResetCanvas={resetCanvas}
				isDrawing={isDrawing}
				isDrawingShape={isDrawingShape}
				isSelecting={isSelecting}
				isTransforming={isTransforming}
			/>

			{/* Canvas Container */}
			<div
				ref={containerRef}
				className="w-full h-full"
				onMouseDown={handleMouseDown}
				onDoubleClick={handleDoubleClick}
				style={{ cursor: getCursor() }}
			>
				{/* Canvas Content */}
				<div
					ref={canvasRef}
					className="relative origin-top-left transition-transform duration-75 ease-out"
					style={{ transform }}
				>
					{/* Grid Pattern */}
					<CanvasGrid />

					{/* Main Canvas Content - SVG for drawing and selection */}
					<svg
						className="absolute inset-0"
						viewBox={`${CANVAS_CONSTANTS.CANVAS_OFFSET} ${CANVAS_CONSTANTS.CANVAS_OFFSET} ${CANVAS_CONSTANTS.CANVAS_SIZE} ${CANVAS_CONSTANTS.CANVAS_SIZE}`}
						style={{
							width: `${CANVAS_CONSTANTS.CANVAS_SIZE}px`,
							height: `${CANVAS_CONSTANTS.CANVAS_SIZE}px`,
							left: `${CANVAS_CONSTANTS.CANVAS_OFFSET}px`,
							top: `${CANVAS_CONSTANTS.CANVAS_OFFSET}px`,
							pointerEvents: 'none'
						}}
					>
						{/* Rendered elements */}
						<CanvasElements canvasState={canvasState} />

						{/* Current drawing (while drawing) */}
						<CurrentDrawing />

						{/* Current shape (while drawing) */}
						<CurrentShape />

						{/* Selection box */}
						<SelectionBox
							selectionBox={selectionBox}
							canvasState={canvasState}
							isSelecting={isSelecting}
						/>

						{/* Selection handles */}
						<SelectionHandles canvasState={canvasState} />
					</svg>

					<MemberCursors canvasState={canvasState} />
				</div>
			</div>
		</div>
	);
}

export default Canvas; 