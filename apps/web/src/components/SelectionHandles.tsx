import React from 'react';
import { useCanvasStore } from '@/lib/store';
import { getElementBounds } from '@/lib/canvasUtils';
import { CanvasState } from '@/lib/types';

interface SelectionHandlesProps {
	canvasState: CanvasState;
}

export const SelectionHandles: React.FC<SelectionHandlesProps> = ({ canvasState }) => {
	const selectedElements = useCanvasStore((state) => state.selectedElements);
	const elements = useCanvasStore((state) => state.elements);

	if (selectedElements.length === 0) return null;

	const selectedObjects = selectedElements.map(id => elements.find(el => el.id === id)).filter(Boolean) as any[];

	if (selectedObjects.length === 0) return null;

	let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

	selectedObjects.forEach(obj => {
		const bounds = getElementBounds(obj);
		if (bounds) {
			minX = Math.min(minX, bounds.x);
			minY = Math.min(minY, bounds.y);
			maxX = Math.max(maxX, bounds.x + bounds.width);
			maxY = Math.max(maxY, bounds.y + bounds.height);
		}
	});

	if (minX === Infinity) return null;

	const boundingBox = {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY
	};

	const handleSize = 8 / canvasState.zoom;
	const handleOffset = handleSize / 2;

	const handles = [
		{ id: 'tl', x: boundingBox.x - handleOffset, y: boundingBox.y - handleOffset, cursor: 'nwse-resize' },
		{ id: 'tm', x: boundingBox.x + boundingBox.width / 2 - handleOffset, y: boundingBox.y - handleOffset, cursor: 'ns-resize' },
		{ id: 'tr', x: boundingBox.x + boundingBox.width - handleOffset, y: boundingBox.y - handleOffset, cursor: 'nesw-resize' },
		{ id: 'ml', x: boundingBox.x - handleOffset, y: boundingBox.y + boundingBox.height / 2 - handleOffset, cursor: 'ew-resize' },
		{ id: 'mr', x: boundingBox.x + boundingBox.width - handleOffset, y: boundingBox.y + boundingBox.height / 2 - handleOffset, cursor: 'ew-resize' },
		{ id: 'bl', x: boundingBox.x - handleOffset, y: boundingBox.y + boundingBox.height - handleOffset, cursor: 'nesw-resize' },
		{ id: 'bm', x: boundingBox.x + boundingBox.width / 2 - handleOffset, y: boundingBox.y + boundingBox.height - handleOffset, cursor: 'ns-resize' },
		{ id: 'br', x: boundingBox.x + boundingBox.width - handleOffset, y: boundingBox.y + boundingBox.height - handleOffset, cursor: 'nwse-resize' }
	];

	return (
		<g>
			<rect
				x={boundingBox.x}
				y={boundingBox.y}
				width={boundingBox.width}
				height={boundingBox.height}
				stroke="#3b82f6"
				strokeWidth={1 / canvasState.zoom}
				fill="none"
				pointerEvents="none"
			/>
			{handles.map(handle => (
				<rect
					key={handle.id}
					x={handle.x}
					y={handle.y}
					width={handleSize}
					height={handleSize}
					fill="#3b82f6"
					stroke="white"
					strokeWidth={1 / canvasState.zoom}
					style={{ cursor: handle.cursor }}
					pointerEvents="all"
					data-handle={handle.id}
				/>
			))}
		</g>
	);
}; 