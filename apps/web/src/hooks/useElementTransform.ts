import { useState, useCallback } from 'react';
import { useCanvasStore } from '@/lib/store';
import { useYJS } from './useYJS';
import { Point, Element, DrawPath, StickyNote, Shape } from '@/lib/types';
import { getElementBounds } from '@/lib/canvasUtils';

type Handle = 'tl' | 'tm' | 'tr' | 'ml' | 'mr' | 'bl' | 'bm' | 'br' | 'move';

export const useElementTransform = () => {
	const [activeHandle, setActiveHandle] = useState<Handle | null>(null);
	const [initialBounds, setInitialBounds] = useState<{ [id: string]: Element }>({});
	const [initialPoint, setInitialPoint] = useState<Point>({ x: 0, y: 0 });
	const [selectionBoundingBox, setSelectionBoundingBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);

	const { elements, selectedElements, updateElement } = useCanvasStore();
	const { updateElementInYJS } = useYJS();

	const startTransform = useCallback((handle: Handle, point: Point) => {
		setActiveHandle(handle);
		setInitialPoint(point);
		const initial: { [id: string]: Element } = {};
		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

		selectedElements.forEach(id => {
			const element = elements.find(el => el.id === id);
			if (element) {
				initial[id] = JSON.parse(JSON.stringify(element)); // Deep copy

				const bounds = getElementBounds(element);
				if (bounds) {
					minX = Math.min(minX, bounds.x);
					minY = Math.min(minY, bounds.y);
					maxX = Math.max(maxX, bounds.x + bounds.width);
					maxY = Math.max(maxY, bounds.y + bounds.height);
				}
			}
		});

		if (minX !== Infinity) {
			setSelectionBoundingBox({ x: minX, y: minY, width: maxX - minX, height: maxY - minY });
		}

		setInitialBounds(initial);
	}, [elements, selectedElements]);

	const handleTransform = useCallback((point: Point) => {
		if (!activeHandle || !selectionBoundingBox) return;

		const dx = point.x - initialPoint.x;
		const dy = point.y - initialPoint.y;

		const isMultiSelect = Object.keys(initialBounds).length > 1;

		if (isMultiSelect && activeHandle !== 'move') {
			// Group scaling logic
			const initialBox = selectionBoundingBox;
			let scaleX = 1, scaleY = 1;
			let pivot = { x: 0, y: 0 };

			if (activeHandle.includes('r')) {
				scaleX = (initialBox.width + dx) / initialBox.width;
				pivot.x = initialBox.x;
			} else if (activeHandle.includes('l')) {
				scaleX = (initialBox.width - dx) / initialBox.width;
				pivot.x = initialBox.x + initialBox.width;
			}

			if (activeHandle.includes('b')) {
				scaleY = (initialBox.height + dy) / initialBox.height;
				pivot.y = initialBox.y;
			} else if (activeHandle.includes('t')) {
				scaleY = (initialBox.height - dy) / initialBox.height;
				pivot.y = initialBox.y + initialBox.height;
			}

			if (activeHandle === 'tm' || activeHandle === 'bm') scaleX = 1;
			if (activeHandle === 'ml' || activeHandle === 'mr') scaleY = 1;

			Object.keys(initialBounds).forEach(id => {
				const initialElement = initialBounds[id];
				let newElementData = { ...initialElement.data };

				if (initialElement.type === 'path') {
					(newElementData as DrawPath).points = (initialElement.data as DrawPath).points.map(p => ({
						x: pivot.x + (p.x - pivot.x) * scaleX,
						y: pivot.y + (p.y - pivot.y) * scaleY,
					}));
				} else if (initialElement.type === 'sticky-note') {
					const data = initialElement.data as StickyNote;
					(newElementData as StickyNote).position = {
						x: pivot.x + (data.position.x - pivot.x) * scaleX,
						y: pivot.y + (data.position.y - pivot.y) * scaleY,
					};
					(newElementData as StickyNote).width = data.width * scaleX;
					(newElementData as StickyNote).height = data.height * scaleY;
				} else if (initialElement.type === 'shape') {
					const data = initialElement.data as Shape;
					(newElementData as Shape).start = {
						x: pivot.x + (data.start.x - pivot.x) * scaleX,
						y: pivot.y + (data.start.y - pivot.y) * scaleY,
					};
					(newElementData as Shape).end = {
						x: pivot.x + (data.end.x - pivot.x) * scaleX,
						y: pivot.y + (data.end.y - pivot.y) * scaleY,
					};
				}
				updateElement(id, { data: newElementData });
			});
			return;
		}

		// Individual element transform logic
		Object.keys(initialBounds).forEach(id => {
			const initialElement = initialBounds[id];
			let newElementData = { ...initialElement.data };

			if (activeHandle === 'move') {
				if (initialElement.type === 'path') {
					(newElementData as DrawPath).points = (initialElement.data as DrawPath).points.map((p: Point) => ({ x: p.x + dx, y: p.y + dy }));
				} else if (initialElement.type === 'sticky-note') {
					(newElementData as StickyNote).position = { x: (initialElement.data as StickyNote).position.x + dx, y: (initialElement.data as StickyNote).position.y + dy };
				} else if (initialElement.type === 'shape') {
					(newElementData as Shape).start = { x: (initialElement.data as Shape).start.x + dx, y: (initialElement.data as Shape).start.y + dy };
					(newElementData as Shape).end = { x: (initialElement.data as Shape).end.x + dx, y: (initialElement.data as Shape).end.y + dy };
				}
			} else {
				// Resize logic
				const bounds = getElementBounds(initialElement);
				if (!bounds) return;

				let { x, y, width, height } = bounds;

				if (initialElement.type === 'sticky-note') {
					let newX = x, newY = y, newWidth = width, newHeight = height;
					if (activeHandle.includes('l')) { newWidth -= dx; newX += dx; }
					if (activeHandle.includes('r')) { newWidth += dx; }
					if (activeHandle.includes('t')) { newHeight -= dy; newY += dy; }
					if (activeHandle.includes('b')) { newHeight += dy; }
					(newElementData as StickyNote).position = { x: newX, y: newY };
					(newElementData as StickyNote).width = newWidth > 0 ? newWidth : 1;
					(newElementData as StickyNote).height = newHeight > 0 ? newHeight : 1;
				} else if (initialElement.type === 'shape') {
					let newStart = { ...(initialElement.data as Shape).start };
					let newEnd = { ...(initialElement.data as Shape).end };

					if (activeHandle.includes('l')) newStart.x += dx;
					if (activeHandle.includes('r')) newEnd.x += dx;
					if (activeHandle.includes('t')) newStart.y += dy;
					if (activeHandle.includes('b')) newEnd.y += dy;

					(newElementData as Shape).start = newStart;
					(newElementData as Shape).end = newEnd;
				}
			}
			updateElement(id, { data: newElementData });
		});

	}, [activeHandle, initialBounds, initialPoint, updateElement, selectionBoundingBox]);

	const endTransform = useCallback(() => {
		Object.keys(initialBounds).forEach(id => {
			const element = elements.find(el => el.id === id);
			if (element) {
				updateElementInYJS(id, { data: element.data });
			}
		});
		setActiveHandle(null);
		setInitialBounds({});
		setSelectionBoundingBox(null);
	}, [initialBounds, elements, updateElementInYJS]);

	return {
		startTransform,
		handleTransform,
		endTransform,
		activeHandle
	};
}; 