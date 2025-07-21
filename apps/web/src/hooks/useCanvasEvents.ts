import { useState, useCallback, useEffect } from 'react';
import { useCanvasStore } from '@/lib/store';
import { useYJS } from './useYJS';
import { Point, CanvasState, DrawPath, StickyNote } from '@/lib/types';
import { screenToCanvas } from '@/lib/canvasUtils';

// Type guard for sticky notes
const isStickyNote = (data: DrawPath | StickyNote): data is StickyNote => {
	return 'position' in data && 'text' in data;
};

interface UseCanvasEventsProps {
	containerRef: React.RefObject<HTMLDivElement>;
	canvasState: CanvasState;
	isDragging: boolean;
	startDragging: (clientX: number, clientY: number) => void;
	updateDragging: (clientX: number, clientY: number) => void;
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

	// Selective store subscriptions to prevent unnecessary re-renders
	const tool = useCanvasStore((state) => state.tool);
	const elements = useCanvasStore((state) => state.elements);
	const selectedElements = useCanvasStore((state) => state.selectedElements);
	const selectElements = useCanvasStore((state) => state.selectElements);
	const createStickyNote = useCanvasStore((state) => state.createStickyNote);
	const setTool = useCanvasStore((state) => state.setTool);

	// YJS for collaborative sticky note creation
	const { createStickyNoteInYJS } = useYJS('default-room');

	// Memoize expensive computations
	const getCanvasPosition = useCallback((clientX: number, clientY: number): Point => {
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return { x: 0, y: 0 };
		return screenToCanvas(clientX, clientY, canvasState, rect);
	}, [containerRef, canvasState]);

	// Memoize sticky note lookup to avoid recalculation
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

	// Memoize editing check
	const isEditingStickyNote = useCallback(() => {
		// Check if any textarea is focused
		const activeElement = document.activeElement;
		return activeElement && activeElement.tagName === 'TEXTAREA';
	}, []);

	// Memoize mouse down handler
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
			createStickyNoteInYJS(canvasPos);
			setTool('select');
		}
	}, [tool, isSpacePressed, getCanvasPosition, startDragging, onDrawStart, onSelectionStart, createStickyNote, createStickyNoteInYJS, setTool, getStickyNoteAtPoint, selectedElements, selectElements]);

	// Memoize mouse move handler
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

	// Memoize mouse up handler
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

	// Memoize cursor style computation
	const getCursor = useCallback((): string => {
		if (isDragging) return 'grabbing';
		if (isSpacePressed || tool === 'move') return 'grab';
		if (tool === 'draw') return 'crosshair';
		if (tool === 'sticky-note') return 'crosshair';
		return 'default'; // select tool
	}, [isDragging, isSpacePressed, tool]);

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
		isDrawing,
		isSelecting,
		handleMouseDown,
		getCursor
	};
}; 