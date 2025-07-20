import { HandIcon, MousePointer2Icon, PenIcon, Settings2Icon } from 'lucide-react';
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
	}
]

function Toolbar() {
	const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
	const currentTool = useCanvasStore((state) => state.tool);
	const setTool = useCanvasStore((state) => state.setTool);

	return (
		<div className='fixed bottom-2 left-0 right-0 flex justify-center items-center'>
			<div className='p-2 bg-white rounded-lg shadow-lg space-x-0.5 flex items-center'>
				<Button variant='ghost' size='icon' onClick={() => setSettingsDialogOpen(true)}>
					<Settings2Icon />
				</Button>
				<div className='h-4 w-px bg-foreground/25 mx-2' />
				{TOOLS.map(({ icon: Icon, tool }) => (
					<Button key={tool} variant={tool === currentTool ? 'default' : 'ghost'} size='icon' onClick={() => setTool(tool)}>
						<Icon />
					</Button>
				))}
			</div>
			<SettingsDialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen} />
		</div>
	);
}

export default Toolbar;