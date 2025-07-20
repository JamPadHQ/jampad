import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { useCanvasStore } from '@/lib/store';

interface CanvasState {
	x: number;
	y: number;
	zoom: number;
}

function InfiniteCanvas() {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLDivElement>(null);
	const [canvasState, setCanvasState] = useState<CanvasState>({ x: 0, y: 0, zoom: 1 });
	const [isDragging, setIsDragging] = useState(false);
	const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
	const [isDrawing, setIsDrawing] = useState(false);
	const [isSelecting, setIsSelecting] = useState(false);
	const [selectionBox, setSelectionBox] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
	const [isSpacePressed, setIsSpacePressed] = useState(false);

	// Get store state and actions
	const tool = useCanvasStore((state) => state.tool);
	const elements = useCanvasStore((state) => state.elements);
	const currentDrawing = useCanvasStore((state) => state.currentDrawing);
	const selectedElements = useCanvasStore((state) => state.selectedElements);
	const startDrawing = useCanvasStore((state) => state.startDrawing);
	const addDrawingPoint = useCanvasStore((state) => state.addDrawingPoint);
	const finishDrawing = useCanvasStore((state) => state.finishDrawing);
	const selectElements = useCanvasStore((state) => state.selectElements);
	const clearSelection = useCanvasStore((state) => state.clearSelection);

	// Convert screen coordinates to canvas coordinates
	const screenToCanvas = useCallback((screenX: number, screenY: number) => {
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return { x: 0, y: 0 };

		const canvasX = (screenX - rect.left - canvasState.x) / canvasState.zoom;
		const canvasY = (screenY - rect.top - canvasState.y) / canvasState.zoom;

		return { x: canvasX, y: canvasY };
	}, [canvasState]);

	// Handle mouse down for different tools
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		console.log('Mouse down - Tool:', tool, 'Space pressed:', isSpacePressed);

		const screenPos = { x: e.clientX, y: e.clientY };
		const canvasPos = screenToCanvas(e.clientX, e.clientY);
		console.log('Canvas position:', canvasPos);

		setLastMousePos(screenPos);

		if (tool === 'move' || isSpacePressed) {
			// Hand tool or space key - pan the canvas
			console.log('Starting to drag (move tool)');
			setIsDragging(true);
		} else if (tool === 'draw') {
			// Pen tool - start drawing
			console.log('Starting to draw at:', canvasPos);
			setIsDrawing(true);
			startDrawing(canvasPos);
		} else if (tool === 'select') {
			// Pointer tool - start selection
			console.log('Starting selection at:', canvasPos);
			setIsSelecting(true);
			clearSelection(); // Clear any existing selection
			setSelectionBox({
				startX: canvasPos.x,
				startY: canvasPos.y,
				endX: canvasPos.x,
				endY: canvasPos.y
			});
		}
	}, [tool, isSpacePressed, screenToCanvas, startDrawing, clearSelection]);

	// Handle mouse move for different tools
	const handleMouseMove = useCallback((e: MouseEvent) => {
		const canvasPos = screenToCanvas(e.clientX, e.clientY);

		if (isDragging && (tool === 'move' || isSpacePressed)) {
			// Handle panning
			const deltaX = e.clientX - lastMousePos.x;
			const deltaY = e.clientY - lastMousePos.y;

			setCanvasState(prev => ({
				...prev,
				x: prev.x + deltaX,
				y: prev.y + deltaY
			}));

			setLastMousePos({ x: e.clientX, y: e.clientY });
		} else if (isDrawing && tool === 'draw') {
			// Handle drawing
			console.log('Drawing - adding point:', canvasPos);
			addDrawingPoint(canvasPos);
		} else if (isSelecting && tool === 'select') {
			// Handle selection box
			setSelectionBox(prev => ({
				...prev,
				endX: canvasPos.x,
				endY: canvasPos.y
			}));
		}
	}, [isDragging, isDrawing, isSelecting, lastMousePos, tool, isSpacePressed, screenToCanvas, addDrawingPoint]);

	// Handle mouse up
	const handleMouseUp = useCallback(() => {
		if (isDrawing) {
			finishDrawing();
		}

		if (isSelecting) {
			// Select elements within the selection box
			const { startX, startY, endX, endY } = selectionBox;
			const minX = Math.min(startX, endX);
			const maxX = Math.max(startX, endX);
			const minY = Math.min(startY, endY);
			const maxY = Math.max(startY, endY);

			// Find elements that intersect with the selection box
			const selectedIds: string[] = [];
			elements.forEach(element => {
				if (element.type === 'path') {
					const pathData = element.data;
					// Check if any point of the path is within the selection box
					const hasPointInSelection = pathData.points.some(point =>
						point.x >= minX && point.x <= maxX &&
						point.y >= minY && point.y <= maxY
					);
					if (hasPointInSelection) {
						selectedIds.push(element.id);
					}
				}
			});

			// Only update selection if we found elements, otherwise clear selection
			if (selectedIds.length > 0) {
				selectElements(selectedIds);
			} else {
				clearSelection();
			}
		}

		setIsDragging(false);
		setIsDrawing(false);
		setIsSelecting(false);
	}, [isDrawing, isSelecting, finishDrawing, clearSelection, selectionBox, elements, selectElements]);

	// Handle zoom with smooth scaling
	const handleWheel = useCallback((e: WheelEvent) => {
		e.preventDefault();

		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return;

		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		// Zooming
		const zoomIntensity = 0.1;
		const delta = e.deltaY * -0.01;
		const zoomFactor = 1 + (delta * zoomIntensity);
		const newZoom = Math.max(0.1, Math.min(5, canvasState.zoom * zoomFactor));

		// Zoom towards mouse position
		const zoomChange = newZoom - canvasState.zoom;
		const newX = canvasState.x - (mouseX - canvasState.x) * (zoomChange / canvasState.zoom);
		const newY = canvasState.y - (mouseY - canvasState.y) * (zoomChange / canvasState.zoom);

		setCanvasState({
			x: newX,
			y: newY,
			zoom: newZoom
		});
	}, [canvasState]);

	// Handle keyboard events for space key
	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		if (e.code === 'Space' && !isSpacePressed) {
			e.preventDefault();
			setIsSpacePressed(true);
		}
	}, [isSpacePressed]);

	const handleKeyUp = useCallback((e: KeyboardEvent) => {
		if (e.code === 'Space') {
			e.preventDefault();
			setIsSpacePressed(false);
		}
	}, []);

	// Set up event listeners
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);
		container.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
			container.removeEventListener('wheel', handleWheel);
		};
	}, [handleMouseMove, handleMouseUp, handleKeyDown, handleKeyUp, handleWheel]);

	// Calculate canvas transform
	const transform = `translate(${canvasState.x}px, ${canvasState.y}px) scale(${canvasState.zoom})`;

	// Calculate actual canvas position (inverse of transform)
	const actualX = -canvasState.x / canvasState.zoom;
	const actualY = -canvasState.y / canvasState.zoom;

	// Reset canvas to origin
	const resetCanvas = useCallback(() => {
		setCanvasState({ x: 0, y: 0, zoom: 1 });
	}, []);

	// Get cursor style based on tool and state
	const getCursor = () => {
		if (isDragging) return 'grabbing';
		if (isSpacePressed || tool === 'move') return 'grab';
		if (tool === 'draw') return 'crosshair';
		return 'default'; // select tool
	};

	// Render drawn path elements
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

	// Render current drawing (while drawing)
	const renderCurrentDrawing = () => {
		if (!currentDrawing || currentDrawing.length === 0) return null;

		// If only one point, show a dot
		if (currentDrawing.length === 1) {
			const point = currentDrawing[0];
			return (
				<circle
					cx={point.x}
					cy={point.y}
					r={2}
					fill="#000000"
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
				stroke="#000000"
				strokeWidth={2}
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				opacity={0.8}
			/>
		);
	};

	// Render selection box
	const renderSelectionBox = () => {
		if (!isSelecting) return null;

		const { startX, startY, endX, endY } = selectionBox;
		const width = Math.abs(endX - startX);
		const height = Math.abs(endY - startY);
		const x = Math.min(startX, endX);
		const y = Math.min(startY, endY);

		// Don't render tiny selection boxes
		if (width < 2 || height < 2) return null;

		return (
			<g>
				{/* Selection box fill */}
				<rect
					x={x}
					y={y}
					width={width}
					height={height}
					fill="rgba(59, 130, 246, 0.1)"
					stroke="none"
				/>
				{/* Selection box border */}
				<rect
					x={x}
					y={y}
					width={width}
					height={height}
					fill="none"
					stroke="#3b82f6"
					strokeWidth={1.5 / canvasState.zoom}
					strokeDasharray={`${6 / canvasState.zoom} ${4 / canvasState.zoom}`}
				/>
			</g>
		);
	};

	return (
		<div className="relative w-full h-screen overflow-hidden bg-gray-100">
			{/* Canvas Position Display */}
			<div className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 px-3 py-2 rounded shadow-md font-mono text-sm">
				<div>X: {Math.round(actualX)}</div>
				<div>Y: {Math.round(actualY)}</div>
				<div>Zoom: {Math.round(canvasState.zoom * 100)}%</div>
			</div>

			{/* Tool State Display */}
			<div className="absolute top-4 left-4 z-10 bg-white bg-opacity-90 px-3 py-2 rounded shadow-md font-mono text-sm">
				<div className="font-semibold">Tool: {tool}</div>
				<div>Elements: {elements.length}</div>
				<div>Selected: {selectedElements.length}</div>
				<div>Drawing: {isDrawing ? 'YES' : 'NO'}</div>
				<div>Selecting: {isSelecting ? 'YES' : 'NO'}</div>
				{currentDrawing && <div>Points: {currentDrawing.length}</div>}
			</div>

			{/* Reset Button */}
			<Button
				onClick={resetCanvas}
				variant={'outline'}
				className="absolute bottom-2 right-2 z-10"
				title="Reset to origin (0,0) and 100% zoom"
			>
				Reset View
			</Button>

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
					<div className="absolute inset-0">
						<svg
							width="100%"
							height="100%"
							className="absolute inset-0"
							style={{
								width: '4000px',
								height: '4000px',
								left: '-2000px',
								top: '-2000px'
							}}
						>
							<defs>
								<pattern
									id="dots"
									width="16"
									height="16"
									patternUnits="userSpaceOnUse"
								>
									<circle
										cx="8"
										cy="8"
										r="0.5"
										fill="#4b5563"
										opacity="0.7"
									/>
								</pattern>
							</defs>
							<rect width="100%" height="100%" fill="url(#dots)" />
						</svg>
					</div>

					{/* Origin Marker (0,0) */}
					<div
						className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg z-10"
						style={{
							left: '-8px',
							top: '-8px',
							transform: 'translate(0px, 0px)'
						}}
					>
						{/* Origin label */}
						<div className="absolute -bottom-6 -left-1 text-xs font-medium text-red-600 bg-white px-1 rounded">
							0,0
						</div>
					</div>

					{/* Axis Lines */}
					<div className="absolute bg-red-300 opacity-50" style={{ left: '0px', top: '-2000px', width: '1px', height: '4000px' }} />
					<div className="absolute bg-red-300 opacity-50" style={{ top: '0px', left: '-2000px', height: '1px', width: '4000px' }} />

					{/* Canvas Content - SVG for drawing and selection */}
					<svg
						className="absolute inset-0"
						viewBox="-2000 -2000 4000 4000"
						style={{
							width: '4000px',
							height: '4000px',
							left: '-2000px',
							top: '-2000px',
							pointerEvents: 'none'
						}}
					>
						{/* Test marker at origin for debugging */}
						<circle cx="0" cy="0" r="5" fill="red" opacity="0.5" />
						<text x="10" y="10" fill="red" fontSize="12">Origin (0,0)</text>

						{/* Rendered elements */}
						{renderElements()}

						{/* Current drawing (while drawing) */}
						{renderCurrentDrawing()}

						{/* Selection box */}
						{renderSelectionBox()}
					</svg>
				</div>
			</div>
		</div>
	);
}

export default InfiniteCanvas;