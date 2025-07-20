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
}: CanvasOverlayProps) => {
	return (
		<>
			{/* Canvas Position Display */}
			<div className="absolute bottom-2 right-2 z-10 font-mono text-[10px] opacity-80 space-x-3">
				<span>X: {Math.round(actualPosition.x)}</span>
				<span>Y: {Math.round(actualPosition.y)}</span>
				<span>Zoom: {Math.round(canvasState.zoom * 100)}%</span>
			</div>
		</>
	);
}; 