import { useEffect, useCallback, useState, RefObject } from 'react';
import { useCanvasStore } from '@/lib/store';
import { screenToCanvas } from '@/lib/canvasUtils';
import { CanvasState, Point } from '@/lib/types';

interface UseCanvasEventsProps {
	containerRef: RefObject<HTMLDivElement | null>;
	canvasState: CanvasState;
	isDragging: boolean;
	startDragging: (x: number, y: number) => void;
	updateDragging: (x: number, y: number) => void;
	stopDragging: () => void;
	handleZoom: (mouseX: number, mouseY: number, deltaY: number) => void;
	onDrawStart: (point: Point) => void;
	onDrawMove: (point: Point) => void;
	onDrawEnd: () => void;
	onSelectionStart: (point: Point) => void;
	onSelectionMove: (point: Point) => void;
	onSelectionEnd: () => void;
}

export const useCanvasEvents = ({
	containerRef,
	canvasState,
	isDragging,
	startDragging,
	updateDragging,
	stopDragging,
	handleZoom,
	onDrawStart,
	onDrawMove,
	onDrawEnd,
	onSelectionStart,
	onSelectionMove,
	onSelectionEnd
}: UseCanvasEventsProps) => {
	const [isSpacePressed, setIsSpacePressed] = useState(false);
	const [isDrawing, setIsDrawing] = useState(false);
	const [isSelecting, setIsSelecting] = useState(false);

	const tool = useCanvasStore((state) => state.tool);

	// Convert screen coordinates to canvas coordinates
	const getCanvasPosition = useCallback((clientX: number, clientY: number): Point => {
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return { x: 0, y: 0 };
		return screenToCanvas(clientX, clientY, canvasState, rect);
	}, [containerRef, canvasState]);

	// Handle mouse down events
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		const canvasPos = getCanvasPosition(e.clientX, e.clientY);

		if (tool === 'move' || isSpacePressed) {
			startDragging(e.clientX, e.clientY);
		} else if (tool === 'draw') {
			setIsDrawing(true);
			onDrawStart(canvasPos);
		} else if (tool === 'select') {
			setIsSelecting(true);
			onSelectionStart(canvasPos);
		}
	}, [tool, isSpacePressed, getCanvasPosition, startDragging, onDrawStart, onSelectionStart]);

	// Handle mouse move events
	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (isDragging && (tool === 'move' || isSpacePressed)) {
			updateDragging(e.clientX, e.clientY);
		} else if (isDrawing && tool === 'draw') {
			const canvasPos = getCanvasPosition(e.clientX, e.clientY);
			onDrawMove(canvasPos);
		} else if (isSelecting && tool === 'select') {
			const canvasPos = getCanvasPosition(e.clientX, e.clientY);
			onSelectionMove(canvasPos);
		}
	}, [isDragging, isDrawing, isSelecting, tool, isSpacePressed, updateDragging, getCanvasPosition, onDrawMove, onSelectionMove]);

	// Handle mouse up events
	const handleMouseUp = useCallback(() => {
		if (isDrawing) {
			onDrawEnd();
			setIsDrawing(false);
		}

		if (isSelecting) {
			onSelectionEnd();
			setIsSelecting(false);
		}

		stopDragging();
	}, [isDrawing, isSelecting, onDrawEnd, onSelectionEnd, stopDragging]);

	// Handle wheel events for zooming
	const handleWheel = useCallback((e: WheelEvent) => {
		e.preventDefault();

		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return;

		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		handleZoom(mouseX, mouseY, e.deltaY);
	}, [containerRef, handleZoom]);

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

	// Get cursor style based on current state
	const getCursor = useCallback((): string => {
		if (isDragging) return 'grabbing';
		if (isSpacePressed || tool === 'move') return 'grab';
		if (tool === 'draw') return 'crosshair';
		return 'default'; // select tool
	}, [isDragging, isSpacePressed, tool]);

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

	return {
		isSpacePressed,
		isDrawing,
		isSelecting,
		handleMouseDown,
		getCursor
	};
}; 