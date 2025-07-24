import { CANVAS_CONSTANTS } from '@/lib/constants';

export const CanvasGrid = () => {
	return (
		<div className="absolute inset-0">
			<svg
				width="100%"
				height="100%"
				className="absolute inset-0"
				style={{
					width: `${CANVAS_CONSTANTS.CANVAS_SIZE}px`,
					height: `${CANVAS_CONSTANTS.CANVAS_SIZE}px`,
					left: `${CANVAS_CONSTANTS.CANVAS_OFFSET}px`,
					top: `${CANVAS_CONSTANTS.CANVAS_OFFSET}px`
				}}
			>
				<defs>
					<pattern
						id="dots"
						width={CANVAS_CONSTANTS.GRID_SIZE}
						height={CANVAS_CONSTANTS.GRID_SIZE}
						patternUnits="userSpaceOnUse"
					>
						<circle
							cx={CANVAS_CONSTANTS.GRID_SIZE / 2}
							cy={CANVAS_CONSTANTS.GRID_SIZE / 2}
							r={CANVAS_CONSTANTS.DOT_SIZE}
							fill={CANVAS_CONSTANTS.COLORS.GRID_DOT}
							opacity={CANVAS_CONSTANTS.DOT_OPACITY}
						/>
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#dots)" />
			</svg>
		</div>
	);
}; 