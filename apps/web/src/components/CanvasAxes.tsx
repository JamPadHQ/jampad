import { CANVAS_CONSTANTS } from '@/lib/constants';

export const CanvasAxes = () => {
	return (
		<>
			{/* Origin Marker (0,0) */}
			<div
				className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg z-10"
				style={{
					left: '-8px',
					top: '-8px',
					transform: 'translate(0px, 0px)'
				}}
			>
				{/* Origin label */}
				<div className="absolute -bottom-6 -left-1 text-xs font-medium text-red-600 bg-white px-1 rounded">
					0,0
				</div>
			</div>

			{/* Vertical Axis Line */}
			<div
				className="absolute opacity-50"
				style={{
					left: '0px',
					top: `${CANVAS_CONSTANTS.CANVAS_OFFSET}px`,
					width: '1px',
					height: `${CANVAS_CONSTANTS.CANVAS_SIZE}px`,
					backgroundColor: CANVAS_CONSTANTS.COLORS.AXIS
				}}
			/>

			{/* Horizontal Axis Line */}
			<div
				className="absolute opacity-50"
				style={{
					top: '0px',
					left: `${CANVAS_CONSTANTS.CANVAS_OFFSET}px`,
					height: '1px',
					width: `${CANVAS_CONSTANTS.CANVAS_SIZE}px`,
					backgroundColor: CANVAS_CONSTANTS.COLORS.AXIS
				}}
			/>
		</>
	);
}; 