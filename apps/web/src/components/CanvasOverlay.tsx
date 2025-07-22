import { CanvasState, Point } from '@/lib/types';
import MembersList from './MembersList';
import { Button } from './ui/button';
import { MoonIcon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface CanvasOverlayProps {
	canvasState: CanvasState;
	actualPosition: Point;
	onResetCanvas: () => void;
	isDrawing: boolean;
	isDrawingShape: boolean;
	isSelecting: boolean;
}

export const CanvasOverlay = ({
	canvasState,
	actualPosition,
	isDrawing,
	isDrawingShape,
	isSelecting,
}: CanvasOverlayProps) => {
	const { theme, setTheme } = useTheme();
	return (
		<>
			{/* Canvas Position Display */}
			<div className="absolute bottom-2 right-2 z-10 font-mono text-[10px] opacity-80 space-x-3">
				<span>X: {Math.round(actualPosition.x)}</span>
				<span>Y: {Math.round(actualPosition.y)}</span>
				<span>Zoom: {Math.round(canvasState.zoom * 100)}%</span>
				<span>Drawing: {isDrawing ? 'Yes' : 'No'}</span>
				<span>Drawing Shape: {isDrawingShape ? 'Yes' : 'No'}</span>
				<span>Selecting: {isSelecting ? 'Yes' : 'No'}</span>
			</div>

			<div className="absolute top-3 right-3 z-10 space-x-2">
				<MembersList />
				<Button variant='outline' size='icon' onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
					<MoonIcon className='w-4 h-4' />
					<span className='sr-only'>Toggle theme</span>
				</Button>
			</div>
		</>
	);
}; 