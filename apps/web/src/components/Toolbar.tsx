import { HandIcon, MicOffIcon, MonitorIcon, MousePointer2Icon, PenIcon, Settings2Icon, StickyNoteIcon, VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/lib/store';
import type { Tool } from '@/lib/types';
import { useState } from 'react';
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

function Toolbar() {
	const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
	const currentTool = useCanvasStore((state) => state.tool);
	const setTool = useCanvasStore((state) => state.setTool);

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
				{TOOLS.map(({ icon: Icon, tool }) => (
					<Button key={tool} variant={tool === currentTool ? 'default' : 'ghost'} size='icon' onClick={() => setTool(tool)}>
						<Icon />
					</Button>
				))}
				<div className='h-4 w-px bg-foreground/25 mx-2' />
				<Button variant='ghost' size='icon'>
					<MonitorIcon />
				</Button>
				<div className='h-4 w-px bg-foreground/25 mx-2' />
				<Button variant='ghost' size='icon' onClick={() => setSettingsDialogOpen(true)}>
					<Settings2Icon />
				</Button>
			</div>
			<SettingsDialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen} />
		</div>
	);
}

export default Toolbar;