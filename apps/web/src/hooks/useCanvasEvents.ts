import { useState, useCallback, useEffect } from 'react';
import { useCanvasStore } from '@/lib/store';
import { useYJS } from './useYJS';
import { useElementTransform } from './useElementTransform';
import { Point, CanvasState, StickyNote, Shape, ScreenShare, Element } from '@/lib/types';
import { screenToCanvas, getElementBounds } from '@/lib/canvasUtils';

// Type guard for sticky notes
const isStickyNote = (data: Element['data']): data is StickyNote => {
	return 'position' in data && 'text' in data;
};

// Type guard for shapes
const isShape = (data: Element['data']): data is Shape => {
	return 'start' in data && 'end' in data;
};

const isScreenShare = (data: Element['data']): data is ScreenShare => {
	return 'stream' in data && 'userId' in data;
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
	onShapeStart: (point: Point) => void;
	onShapeMove: (point: Point) => void;
	onShapeEnd: () => void;
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
	onSelectionEnd,
	onShapeStart,
	onShapeMove,
	onShapeEnd
}: UseCanvasEventsProps) => {
	const [isSpacePressed, setIsSpacePressed] = useState(false);
	const [isDrawing, setIsDrawing] = useState(false);
	const [isDrawingShape, setIsDrawingShape] = useState(false);
	const [isSelecting, setIsSelecting] = useState(false);
	const [isTransforming, setIsTransforming] = useState(false);

	// Selective store subscriptions to prevent unnecessary re-renders
	const tool = useCanvasStore((state) => state.tool);
	const elements = useCanvasStore((state) => state.elements);
	const selectedElements = useCanvasStore((state) => state.selectedElements);
	const selectElements = useCanvasStore((state) => state.selectElements);
	const createStickyNote = useCanvasStore((state) => state.createStickyNote);
	const setTool = useCanvasStore((state) => state.setTool);
	const editingStickyNoteId = useCanvasStore((state) => state.editingStickyNoteId);
	const setEditingStickyNoteId = useCanvasStore((state) => state.setEditingStickyNoteId);

	// YJS for collaborative sticky note creation
	const { createStickyNoteInYJS, updateCursor } = useYJS('default-room');

	// Element transform hook
	const { startTransform, handleTransform, endTransform, activeHandle, deleteSelectedElements } = useElementTransform();

	// Memoize expensive computations
	const getCanvasPosition = useCallback((clientX: number, clientY: number): Point => {
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return { x: 0, y: 0 };
		return screenToCanvas(clientX, clientY, canvasState, rect);
	}, [containerRef, canvasState]);

	// Listen for delete key press
	useEffect(() => {
		const handleDelete = (e: KeyboardEvent) => {
			if (e.key === 'Delete' || e.key === 'Backspace') {
				deleteSelectedElements();
			}
		};

		document.addEventListener('keydown', handleDelete);
		return () => document.removeEventListener('keydown', handleDelete);
	}, [deleteSelectedElements]);

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

	// Memoize shape lookup to avoid recalculation
	const getShapeAtPoint = useCallback((point: Point): string | null => {
		for (let i = elements.length - 1; i >= 0; i--) {
			const element = elements[i];
			if (element.type === 'shape' && isShape(element.data)) {
				const shape = element.data;
				// This is a simplified check. For more complex shapes, you'll need more advanced point-in-shape tests.
				const { start, end } = shape;
				if (point.x >= Math.min(start.x, end.x) &&
					point.x <= Math.max(start.x, end.x) &&
					point.y >= Math.min(start.y, end.y) &&
					point.y <= Math.max(start.y, end.y)) {
					return element.id;
				}
			}
		}
		return null;
	}, [elements]);

	const getScreenShareAtPoint = useCallback((point: Point): string | null => {
		for (let i = elements.length - 1; i >= 0; i--) {
			const element = elements[i];
			if (element.type === 'screenshare' && isScreenShare(element.data)) {
				const screenShare = element.data;
				if (point.x >= screenShare.position.x &&
					point.x <= screenShare.position.x + screenShare.width &&
					point.y >= screenShare.position.y &&
					point.y <= screenShare.position.y + screenShare.height) {
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

		// Check if clicking on a resize handle
		const handle = (e.target as HTMLElement).dataset.handle;
		if (handle && selectedElements.length > 0) {
			setIsTransforming(true);
			startTransform(handle as any, canvasPos);
			return;
		}

		if (tool === 'move' || isSpacePressed) {
			startDragging(e.clientX, e.clientY);
		} else if (tool === 'draw') {
			setIsDrawing(true);
			onDrawStart(canvasPos);
		} else if (tool.startsWith('shape-')) {
			setIsDrawingShape(true);
			onShapeStart(canvasPos);
		} else if (tool === 'select') {
			// Check if clicking on a selected element to move it
			const selectedElementClicked = selectedElements.some(id => {
				const element = elements.find(el => el.id === id);
				if (!element) return false;
				const bounds = getElementBounds(element);
				return bounds && canvasPos.x >= bounds.x && canvasPos.x <= bounds.x + bounds.width && canvasPos.y >= bounds.y && canvasPos.y <= bounds.y + bounds.height;
			});

			if (selectedElementClicked) {
				setIsTransforming(true);
				startTransform('move', canvasPos);
				return;
			}

			// Check if clicking on a shape
			const shapeId = getShapeAtPoint(canvasPos);
			if (shapeId) {
				if (e.shiftKey) {
					if (selectedElements.includes(shapeId)) {
						selectElements(selectedElements.filter((id) => id !== shapeId));
					} else {
						selectElements([...selectedElements, shapeId]);
					}
				} else {
					selectElements([shapeId]);
				}
				return;
			}

			// Check if clicking on a screen share
			const screenShareId = getScreenShareAtPoint(canvasPos);
			if (screenShareId) {
				if (e.shiftKey) {
					if (selectedElements.includes(screenShareId)) {
						selectElements(selectedElements.filter((id) => id !== screenShareId));
					} else {
						selectElements([...selectedElements, screenShareId]);
					}
				} else {
					selectElements([screenShareId]);
				}
				return;
			}

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
				// Clear editing state when clicking outside sticky notes
				if (editingStickyNoteId) {
					setEditingStickyNoteId(null);
				}
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
	}, [tool, isSpacePressed, getCanvasPosition, startDragging, onDrawStart, onShapeStart, onSelectionStart, createStickyNote, createStickyNoteInYJS, setTool, getShapeAtPoint, getStickyNoteAtPoint, getScreenShareAtPoint, selectedElements, selectElements, editingStickyNoteId, setEditingStickyNoteId, startTransform, elements]);

	// Memoize double click handler
	const handleDoubleClick = useCallback((e: React.MouseEvent) => {
		const canvasPos = getCanvasPosition(e.clientX, e.clientY);

		// Check if double-clicking on a sticky note
		const stickyNoteId = getStickyNoteAtPoint(canvasPos);
		if (stickyNoteId && tool === 'select') {
			// Start editing the sticky note
			setEditingStickyNoteId(stickyNoteId);
		}
	}, [tool, getCanvasPosition, getStickyNoteAtPoint, setEditingStickyNoteId]);

	// Memoize mouse move handler
	const handleMouseMove = useCallback((e: MouseEvent) => {
		const canvasPos = getCanvasPosition(e.clientX, e.clientY);
		updateCursor(canvasPos);

		if (isTransforming) {
			handleTransform(canvasPos);
			return;
		}

		if (isDragging && (tool === 'move' || isSpacePressed)) {
			updateDragging(e.clientX, e.clientY);
		} else if (isDrawing && tool === 'draw') {
			const canvasPos = getCanvasPosition(e.clientX, e.clientY);
			onDrawMove(canvasPos);
		} else if (isDrawingShape && tool.startsWith('shape-')) {
			const canvasPos = getCanvasPosition(e.clientX, e.clientY);
			onShapeMove(canvasPos);
		} else if (isSelecting && tool === 'select') {
			const canvasPos = getCanvasPosition(e.clientX, e.clientY);
			onSelectionMove(canvasPos);
		}
	}, [isDragging, isDrawing, isDrawingShape, isSelecting, isTransforming, tool, isSpacePressed, updateDragging, getCanvasPosition, onDrawMove, onShapeMove, onSelectionMove, handleTransform, updateCursor]);

	// Memoize mouse up handler
	const handleMouseUp = useCallback(() => {
		if (isTransforming) {
			endTransform();
			setIsTransforming(false);
		}

		if (isDrawing) {
			onDrawEnd();
			setIsDrawing(false);
		}

		if (isDrawingShape) {
			onShapeEnd();
			setIsDrawingShape(false);
		}

		if (isSelecting) {
			onSelectionEnd();
			setIsSelecting(false);
		}

		stopDragging();
	}, [isDrawing, isDrawingShape, isSelecting, isTransforming, onDrawEnd, onShapeEnd, onSelectionEnd, stopDragging, endTransform]);

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
		if (activeHandle) {
			if (activeHandle === 'move') return 'move';
			return `${activeHandle}-resize`;
		}
		if (isDragging) return 'grabbing';
		if (isSpacePressed || tool === 'move') return 'grab';
		if (tool === 'draw') return 'crosshair';
		if (tool.startsWith('shape-')) return 'crosshair';
		if (tool === 'sticky-note') return 'crosshair';
		return 'default'; // select tool
	}, [isDragging, isSpacePressed, tool, activeHandle]);

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
		isDrawingShape,
		isSelecting,
		isTransforming,
		handleMouseDown,
		handleDoubleClick,
		getCursor
	};
}; 