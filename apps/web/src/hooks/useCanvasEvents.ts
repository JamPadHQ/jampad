import { useEffect, useCallback, useState, RefObject } from 'react';
import { useCanvasStore } from '@/lib/store';
import { screenToCanvas } from '@/lib/canvasUtils';
import { CanvasState, Point, DrawPath, StickyNote } from '@/lib/types';

// Type guards
const isStickyNote = (data: DrawPath | StickyNote): data is StickyNote => {
	return 'position' in data && 'text' in data;
};

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
	const elements = useCanvasStore((state) => state.elements);
	const selectedElements = useCanvasStore((state) => state.selectedElements);
	const selectElements = useCanvasStore((state) => state.selectElements);
	const createStickyNote = useCanvasStore((state) => state.createStickyNote);
	const setTool = useCanvasStore((state) => state.setTool);

	// Convert screen coordinates to canvas coordinates
	const getCanvasPosition = useCallback((clientX: number, clientY: number): Point => {
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return { x: 0, y: 0 };
		return screenToCanvas(clientX, clientY, canvasState, rect);
	}, [containerRef, canvasState]);

	// Check if a point is inside a sticky note
	const getStickyNoteAtPoint = useCallback((point: Point): string | null => {
		for (let i = elements.length - 1; i >= 0; i--) {
			const element = elements[i];
			if (element.type === 'sticky-note' && isStickyNote(element.data)) {
				const stickyNote = element.data;
				if (point.x >= stickyNote.position.x &&
					point.x <= stickyNote.position.x + stickyNote.width &&
					point.y >= stickyNote.position.y &&
					point.y <= stickyNote.position.y + stickyNote.height) {
					return element.id;
				}
			}
		}
		return null;
	}, [elements]);

	// Check if we're currently editing a sticky note
	const isEditingStickyNote = useCallback(() => {
		// Check if any textarea is focused
		const activeElement = document.activeElement;
		return activeElement && activeElement.tagName === 'TEXTAREA';
	}, []);

	// Handle mouse down events
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		const canvasPos = getCanvasPosition(e.clientX, e.clientY);

		if (tool === 'move' || isSpacePressed) {
			startDragging(e.clientX, e.clientY);
		} else if (tool === 'draw') {
			setIsDrawing(true);
			onDrawStart(canvasPos);
		} else if (tool === 'select') {
			// Check if clicking on a sticky note
			const stickyNoteId = getStickyNoteAtPoint(canvasPos);
			if (stickyNoteId) {
				// If clicking on a sticky note, select it
				if (e.shiftKey) {
					// Add to selection if shift is held
					if (selectedElements.includes(stickyNoteId)) {
						selectElements(selectedElements.filter(id => id !== stickyNoteId));
					} else {
						selectElements([...selectedElements, stickyNoteId]);
					}
				} else {
					// Replace selection
					selectElements([stickyNoteId]);
				}
			} else {
				// Start selection box
				setIsSelecting(true);
				onSelectionStart(canvasPos);
			}
		} else if (tool === 'sticky-note') {
			// Create sticky note on click and switch back to select mode
			createStickyNote(canvasPos);
			setTool('select');
		}
	}, [tool, isSpacePressed, getCanvasPosition, startDragging, onDrawStart, onSelectionStart, createStickyNote, setTool, getStickyNoteAtPoint, selectedElements, selectElements]);

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
		// Don't handle keyboard events if we're editing a sticky note
		if (isEditingStickyNote()) {
			return;
		}

		if (e.code === 'Space' && !isSpacePressed) {
			e.preventDefault();
			setIsSpacePressed(true);
		}
	}, [isSpacePressed, isEditingStickyNote]);

	const handleKeyUp = useCallback((e: KeyboardEvent) => {
		// Don't handle keyboard events if we're editing a sticky note
		if (isEditingStickyNote()) {
			return;
		}

		if (e.code === 'Space') {
			e.preventDefault();
			setIsSpacePressed(false);
		}
	}, [isEditingStickyNote]);

	// Get cursor style based on current state
	const getCursor = useCallback((): string => {
		if (isDragging) return 'grabbing';
		if (isSpacePressed || tool === 'move') return 'grab';
		if (tool === 'draw') return 'crosshair';
		if (tool === 'sticky-note') return 'crosshair';
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