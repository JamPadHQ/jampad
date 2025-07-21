import { useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '@/lib/store';
import { StickyNote as StickyNoteType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StickyNoteProps {
	stickyNote: StickyNoteType;
	isSelected: boolean;
	canvasState: { zoom: number };
}

export const StickyNote = ({ stickyNote, isSelected, canvasState }: StickyNoteProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [text, setText] = useState(stickyNote.text);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const updateStickyNoteText = useCanvasStore((state) => state.updateStickyNoteText);

	// Auto-focus when selected and not editing
	useEffect(() => {
		if (isSelected && !isEditing) {
			setIsEditing(true);
		}
	}, [isSelected, isEditing]);

	// Focus textarea when editing starts
	useEffect(() => {
		if (isEditing && textareaRef.current) {
			textareaRef.current.focus();
			// Set cursor to end of text
			const length = textareaRef.current.value.length;
			textareaRef.current.setSelectionRange(length, length);
		}
	}, [isEditing]);

	// Update text in store when editing is done
	const handleBlur = () => {
		setIsEditing(false);
		updateStickyNoteText(stickyNote.id, text);
	};

	// Handle double click to start editing
	const handleDoubleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsEditing(true);
	};

	// Handle key down events
	const handleKeyDown = (e: React.KeyboardEvent) => {
		e.stopPropagation(); // Prevent canvas events from interfering

		if (e.key === 'Escape') {
			setText(stickyNote.text); // Reset to original text
			setIsEditing(false);
		} else if (e.key === 'Enter' && !e.shiftKey) {
			// Save on Enter (but not Shift+Enter)
			e.preventDefault();
			handleBlur();
		}
		// Allow all other keys including space, backspace, etc.
	};

	// Handle text change
	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		e.stopPropagation();
		setText(e.target.value);
	};

	// Handle mouse events to prevent canvas interference
	const handleMouseDown = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	const handleMouseUp = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	// Convert hex color to rgba with opacity for background
	const getBackgroundColor = (hexColor: string) => {
		// Convert hex to RGB
		const r = parseInt(hexColor.slice(1, 3), 16);
		const g = parseInt(hexColor.slice(3, 5), 16);
		const b = parseInt(hexColor.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, 0.15)`; // 15% opacity
	};

	const backgroundColor = getBackgroundColor(stickyNote.color);

	return (
		<g transform={`translate(${stickyNote.position.x}, ${stickyNote.position.y})`}>
			{/* Background rectangle */}
			<rect
				width={stickyNote.width}
				height={stickyNote.height}
				fill={backgroundColor}
				stroke={isSelected ? '#3b82f6' : stickyNote.color}
				strokeWidth={isSelected ? 2 : 1}
				rx={8}
				ry={8}
				style={{ cursor: 'pointer' }}
				onDoubleClick={handleDoubleClick}
			/>

			{/* Selection highlight */}
			{isSelected && (
				<rect
					width={stickyNote.width}
					height={stickyNote.height}
					fill="none"
					stroke="#3b82f6"
					strokeWidth={3 / canvasState.zoom}
					rx={8}
					ry={8}
					opacity={0.3}
				/>
			)}

			{/* Text content */}
			<foreignObject
				width={stickyNote.width - 16}
				height={stickyNote.height - 16}
				x={8}
				y={8}
			>
				<div
					className="w-full h-full"
					onMouseDown={handleMouseDown}
					onMouseUp={handleMouseUp}
				>
					{isEditing ? (
						<textarea
							ref={textareaRef}
							value={text}
							onChange={handleTextChange}
							onBlur={handleBlur}
							onKeyDown={handleKeyDown}
							onMouseDown={handleMouseDown}
							onMouseUp={handleMouseUp}
							className={cn(
								"w-full h-full resize-none bg-transparent border-none outline-none",
								"text-sm leading-relaxed font-medium",
								"placeholder:text-muted-foreground/50",
								"focus:outline-none focus:ring-0"
							)}
							placeholder="Type your note here..."
							style={{
								color: stickyNote.color,
								fontSize: `${14 / canvasState.zoom}px`,
								lineHeight: `${20 / canvasState.zoom}px`,
								fontFamily: 'inherit'
							}}
							spellCheck={false}
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
						/>
					) : (
						<div
							className="w-full h-full cursor-pointer select-none"
							onDoubleClick={handleDoubleClick}
							onMouseDown={handleMouseDown}
							onMouseUp={handleMouseUp}
							style={{
								color: stickyNote.color,
								fontSize: `${14 / canvasState.zoom}px`,
								lineHeight: `${20 / canvasState.zoom}px`,
								fontFamily: 'inherit'
							}}
						>
							{text || (
								<span className="text-muted-foreground/50">
									Double-click to add text...
								</span>
							)}
						</div>
					)}
				</div>
			</foreignObject>
		</g>
	);
}; 