import { useRef, useState, useEffect, useCallback } from 'react';

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

	// Handle mouse down for panning
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		setIsDragging(true);
		setLastMousePos({ x: e.clientX, y: e.clientY });
	}, []);

	// Handle mouse move for panning
	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (!isDragging) return;

		const deltaX = e.clientX - lastMousePos.x;
		const deltaY = e.clientY - lastMousePos.y;

		setCanvasState(prev => ({
			...prev,
			x: prev.x + deltaX,
			y: prev.y + deltaY
		}));

		setLastMousePos({ x: e.clientX, y: e.clientY });
	}, [isDragging, lastMousePos]);

	// Handle mouse up
	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

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

	// Set up event listeners
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		container.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			container.removeEventListener('wheel', handleWheel);
		};
	}, [handleMouseMove, handleMouseUp, handleWheel]);

	// Calculate canvas transform
	const transform = `translate(${canvasState.x}px, ${canvasState.y}px) scale(${canvasState.zoom})`;

	// Calculate actual canvas position (inverse of transform)
	const actualX = -canvasState.x / canvasState.zoom;
	const actualY = -canvasState.y / canvasState.zoom;

	// Reset canvas to origin
	const resetCanvas = useCallback(() => {
		setCanvasState({ x: 0, y: 0, zoom: 1 });
	}, []);

	return (
		<div className="relative w-full h-screen overflow-hidden bg-gray-100">
			{/* Canvas Position Display */}
			<div className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 px-3 py-2 rounded shadow-md font-mono text-sm">
				<div>X: {Math.round(actualX)}</div>
				<div>Y: {Math.round(actualY)}</div>
				<div>Zoom: {Math.round(canvasState.zoom * 100)}%</div>
			</div>

			{/* Reset Button */}
			<button
				onClick={resetCanvas}
				className="absolute bottom-4 right-4 z-10 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 font-medium"
				title="Reset to origin (0,0) and 100% zoom"
			>
				Reset View
			</button>

			{/* Canvas Container */}
			<div
				ref={containerRef}
				className="w-full h-full cursor-grab active:cursor-grabbing"
				onMouseDown={handleMouseDown}
				style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
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
				</div>
			</div>
		</div>
	);
}

export default InfiniteCanvas;