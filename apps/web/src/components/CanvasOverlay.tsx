import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/lib/store';
import { CanvasState, Point } from '@/lib/types';

interface CanvasOverlayProps {
	canvasState: CanvasState;
	actualPosition: Point;
	onResetCanvas: () => void;
	isDrawing: boolean;
	isSelecting: boolean;
}

export const CanvasOverlay = ({
	canvasState,
	actualPosition,
	onResetCanvas,
	isDrawing,
	isSelecting
}: CanvasOverlayProps) => {
	const tool = useCanvasStore((state) => state.tool);
	const elements = useCanvasStore((state) => state.elements);
	const selectedElements = useCanvasStore((state) => state.selectedElements);
	const currentDrawing = useCanvasStore((state) => state.currentDrawing);

	return (
		<>
			{/* Canvas Position Display */}
			<div className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 px-3 py-2 rounded shadow-md font-mono text-sm">
				<div>X: {Math.round(actualPosition.x)}</div>
				<div>Y: {Math.round(actualPosition.y)}</div>
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
				onClick={onResetCanvas}
				variant="outline"
				className="absolute bottom-2 right-2 z-10"
				title="Reset to origin (0,0) and 100% zoom"
			>
				Reset View
			</Button>
		</>
	);
}; 