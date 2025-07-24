export const CANVAS_CONSTANTS = {
	// Zoom settings
	MIN_ZOOM: 0.1,
	MAX_ZOOM: 5,
	ZOOM_INTENSITY: 0.1,

	// Canvas dimensions
	CANVAS_SIZE: 4000,
	CANVAS_OFFSET: -2000,

	// Grid settings
	GRID_SIZE: 16,
	DOT_SIZE: 0.5,
	DOT_OPACITY: 0.7,

	// Selection
	MIN_SELECTION_SIZE: 2,
	SELECTION_STROKE_WIDTH: 1.5,
	SELECTION_DASH_ARRAY: 6,
	SELECTION_DASH_SPACING: 4,

	// Colors
	COLORS: {
		AXIS: '#fca5a5', // red-300
		ORIGIN: '#ef4444', // red-500
		SELECTION: '#3b82f6', // blue-500
		GRID_DOT: '#4b5563', // gray-600
	}
} as const; 