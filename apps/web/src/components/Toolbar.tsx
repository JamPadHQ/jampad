import { HandIcon, MicOffIcon, MonitorIcon, MousePointer2Icon, PenIcon, Settings2Icon, StickyNoteIcon, VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/lib/store';
import type { Tool } from '@/lib/types';
import { useState, memo, useCallback, useMemo } from 'react';
import SettingsDialog from './SettingsDialog';

const TOOLS: { icon: React.ElementType, tool: Tool }[] = [
	{
		icon: HandIcon,
		tool: 'move'
	},
	{
		icon: MousePointer2Icon,
		tool: 'select'
	},
	{
		icon: PenIcon,
		tool: 'draw'
	},
	{
		icon: StickyNoteIcon,
		tool: 'sticky-note'
	}
]

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

function Toolbar() {
	const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

	// Selective store subscriptions to prevent unnecessary re-renders
	const currentTool = useCanvasStore((state) => state.tool);
	const setTool = useCanvasStore((state) => state.setTool);

	const handleToolSelect = useCallback((tool: Tool) => {
		setTool(tool);
	}, [setTool]);

	const handleSettingsClick = useCallback(() => {
		setSettingsDialogOpen(true);
	}, []);

	const handleSettingsOpenChange = useCallback((open: boolean) => {
		setSettingsDialogOpen(open);
	}, []);

	// Memoize the tools array to prevent recreation on every render
	const toolButtons = useMemo(() => {
		return TOOLS.map(({ icon, tool }) => (
			<ToolButton
				key={tool}
				icon={icon}
				tool={tool}
				currentTool={currentTool}
				onToolSelect={handleToolSelect}
			/>
		));
	}, [currentTool, handleToolSelect]);

	return (
		<div className='fixed bottom-3 left-0 right-0 flex justify-center items-center'>
			<div className='p-2 bg-secondary rounded-lg shadow-lg space-x-0.5 flex items-center'>
				<Button variant='ghost' size='icon'>
					<MicOffIcon />
				</Button>
				<Button variant='ghost' size='icon' disabled>
					<VideoIcon />
				</Button>
				<div className='h-4 w-px bg-foreground/25 mx-2' />
				{toolButtons}
				<div className='h-4 w-px bg-foreground/25 mx-2' />
				<Button variant='ghost' size='icon'>
					<MonitorIcon />
				</Button>
				<div className='h-4 w-px bg-foreground/25 mx-2' />
				<Button variant='ghost' size='icon' onClick={handleSettingsClick}>
					<Settings2Icon />
				</Button>
			</div>
			<SettingsDialog open={settingsDialogOpen} onOpenChange={handleSettingsOpenChange} />
		</div>
	);
}

export default Toolbar;