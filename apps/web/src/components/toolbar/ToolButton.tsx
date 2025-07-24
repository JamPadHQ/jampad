import { memo, useCallback } from 'react';
import { Button } from '@jampad/ui';
import type { Tool } from '@/lib/types';

// Memoized tool button component
const ToolButton = memo(({
	icon: Icon,
	tool,
	currentTool,
	onToolSelect
}: {
	icon: React.ElementType;
	tool: Tool;
	currentTool: Tool;
	onToolSelect: (tool: Tool) => void;
}) => {
	const handleClick = useCallback(() => {
		onToolSelect(tool);
	}, [tool, onToolSelect]);

	return (
		<Button
			variant={tool === currentTool ? 'default' : 'ghost'}
			size='icon'
			onClick={handleClick}
		>
			<Icon />
		</Button>
	);
});

export default ToolButton; 