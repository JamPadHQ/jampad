import { useState, useCallback, useEffect } from 'react';
import { Point, CanvasState } from '../types/index.js';
import { screenToCanvas } from '../utils/index.js';

export interface UseCanvasEventsProps {
	containerRef: React.RefObject<HTMLDivElement>;
	canvasState: CanvasState;
	isDragging: boolean;
	startDragging: (clientX: number, clientY: number) => void;
	updateDragging: (clientX: number, clientY: number) => void;
	stopDragging: () => void;
	handleZoom: (mouseX: number, mouseY: number, deltaY: number) => void;
}

export interface CanvasEventHandlers {
	onMouseDown?: (point: Point, event: React.MouseEvent) => void;
	onMouseMove?: (point: Point, event: MouseEvent) => void;
	onMouseUp?: (point: Point, event: MouseEvent) => void;
	onDoubleClick?: (point: Point, event: React.MouseEvent) => void;
	onKeyDown?: (event: KeyboardEvent) => void;
	onKeyUp?: (event: KeyboardEvent) => void;
}

export const useCanvasEvents = ({
	containerRef,
	canvasState,
	isDragging,
	startDragging,
	updateDragging,
	stopDragging,
	handleZoom,
}: UseCanvasEventsProps) => {
	const [isSpacePressed, setIsSpacePressed] = useState(false);
	const [eventHandlers, setEventHandlers] = useState<CanvasEventHandlers>({});

	// Memoize expensive computations
	const getCanvasPosition = useCallback((clientX: number, clientY: number): Point => {
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return { x: 0, y: 0 };
		return screenToCanvas(clientX, clientY, canvasState, rect);
	}, [containerRef, canvasState]);

	// Register event handlers from external packages
	const registerEventHandlers = useCallback((handlers: CanvasEventHandlers) => {
		setEventHandlers(prev => ({ ...prev, ...handlers }));
	}, []);

	// Memoize mouse down handler
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		const canvasPos = getCanvasPosition(e.clientX, e.clientY);

		// Call external handler first
		eventHandlers.onMouseDown?.(canvasPos, e);

		// Default behavior: start dragging if space is pressed or no external handler consumed the event
		if (isSpacePressed && !e.defaultPrevented) {
			startDragging(e.clientX, e.clientY);
		}
	}, [getCanvasPosition, eventHandlers.onMouseDown, isSpacePressed, startDragging]);

	// Memoize double click handler
	const handleDoubleClick = useCallback((e: React.MouseEvent) => {
		const canvasPos = getCanvasPosition(e.clientX, e.clientY);
		eventHandlers.onDoubleClick?.(canvasPos, e);
	}, [getCanvasPosition, eventHandlers.onDoubleClick]);

	// Memoize mouse move handler
	const handleMouseMove = useCallback((e: MouseEvent) => {
		const canvasPos = getCanvasPosition(e.clientX, e.clientY);

		// Call external handler first
		eventHandlers.onMouseMove?.(canvasPos, e);

		// Default behavior: handle dragging
		if (isDragging && (isSpacePressed || !e.defaultPrevented)) {
			updateDragging(e.clientX, e.clientY);
		}
	}, [getCanvasPosition, eventHandlers.onMouseMove, isDragging, isSpacePressed, updateDragging]);

	// Memoize mouse up handler
	const handleMouseUp = useCallback((e: MouseEvent) => {
		const canvasPos = getCanvasPosition(e.clientX, e.clientY);

		// Call external handler first
		eventHandlers.onMouseUp?.(canvasPos, e);

		// Default behavior: stop dragging
		stopDragging();
	}, [getCanvasPosition, eventHandlers.onMouseUp, stopDragging]);

	// Memoize wheel handler
	const handleWheel = useCallback((e: WheelEvent) => {
		e.preventDefault();

		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return;

		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		handleZoom(mouseX, mouseY, e.deltaY);
	}, [containerRef, handleZoom]);

	// Memoize keyboard handlers
	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		// Call external handler first
		eventHandlers.onKeyDown?.(e);

		// Default behavior: handle space key
		if (e.code === 'Space' && !isSpacePressed && !e.defaultPrevented) {
			e.preventDefault();
			setIsSpacePressed(true);
		}
	}, [eventHandlers.onKeyDown, isSpacePressed]);

	const handleKeyUp = useCallback((e: KeyboardEvent) => {
		// Call external handler first
		eventHandlers.onKeyUp?.(e);

		// Default behavior: handle space key
		if (e.code === 'Space' && !e.defaultPrevented) {
			e.preventDefault();
			setIsSpacePressed(false);
		}
	}, [eventHandlers.onKeyUp]);

	// Memoize cursor style computation
	const getCursor = useCallback((): string => {
		if (isDragging) return 'grabbing';
		if (isSpacePressed) return 'grab';
		return 'default';
	}, [isDragging, isSpacePressed]);

	// Set up event listeners with memoized handlers
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
		handleMouseDown,
		handleDoubleClick,
		getCursor,
		registerEventHandlers,
		getCanvasPosition
	};
}; 