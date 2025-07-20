import { useRef } from 'react';
import { useCanvasNavigation } from '@/hooks/useCanvasNavigation';
import { useCanvasEvents } from '@/hooks/useCanvasEvents';
import { useDrawing } from '@/hooks/useDrawing';
import { useSelection } from '@/hooks/useSelection';
import { CanvasGrid } from '@/components/CanvasGrid';
import { CanvasAxes } from '@/components/CanvasAxes';
import { CanvasElements } from '@/components/CanvasElements';
import { CurrentDrawing } from '@/components/CurrentDrawing';
import { SelectionBox } from '@/components/SelectionBox';
import { CanvasOverlay } from '@/components/CanvasOverlay';
import { getCanvasTransform, getActualCanvasPosition } from '@/lib/canvasUtils';
import { CANVAS_CONSTANTS } from '@/lib/constants';

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

	// Drawing functionality
	const {
		handleDrawStart,
		handleDrawMove,
		handleDrawEnd
	} = useDrawing();

	// Selection functionality
	const {
		selectionBox,
		handleSelectionStart,
		handleSelectionMove,
		handleSelectionEnd
	} = useSelection();

	// Event handling
	const {
		isDrawing,
		isSelecting,
		handleMouseDown,
		getCursor
	} = useCanvasEvents({
		containerRef,
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
		onSelectionEnd: handleSelectionEnd
	});

	// Calculate canvas transform and position
	const transform = getCanvasTransform(canvasState);
	const actualPosition = getActualCanvasPosition(canvasState);

	return (
		<div className="relative w-full h-screen overflow-hidden bg-gray-100">
			{/* Canvas Overlay - Debug info and controls */}
			<CanvasOverlay
				canvasState={canvasState}
				actualPosition={actualPosition}
				onResetCanvas={resetCanvas}
				isDrawing={isDrawing}
				isSelecting={isSelecting}
			/>

			{/* Canvas Container */}
			<div
				ref={containerRef}
				className="w-full h-full"
				onMouseDown={handleMouseDown}
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

					{/* Origin and Axes */}
					<CanvasAxes />

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
						{/* Test marker at origin for debugging */}
						<circle cx="0" cy="0" r="5" fill="red" opacity="0.5" />
						<text x="10" y="10" fill="red" fontSize="12">Origin (0,0)</text>

						{/* Rendered elements */}
						<CanvasElements canvasState={canvasState} />

						{/* Current drawing (while drawing) */}
						<CurrentDrawing />

						{/* Selection box */}
						<SelectionBox
							selectionBox={selectionBox}
							canvasState={canvasState}
							isSelecting={isSelecting}
						/>
					</svg>
				</div>
			</div>
		</div>
	);
}

export default Canvas; 