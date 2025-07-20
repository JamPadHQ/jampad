import { HandIcon, MousePointer2Icon, PenIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCanvasStore } from '@/lib/store';
import type { Tool } from '@/lib/types';

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
	const currentTool = useCanvasStore((state) => state.tool);
	const setTool = useCanvasStore((state) => state.setTool);

	return (
		<div className='fixed bottom-2 left-0 right-0 flex justify-center items-center'>
			<div className='p-2 bg-white rounded-lg shadow-lg space-x-0.5'>
				{TOOLS.map(({ icon: Icon, tool }) => (
					<Button variant={tool === currentTool ? 'default' : 'ghost'} size='icon' onClick={() => setTool(tool)}>
						<Icon />
					</Button>
				))}
			</div>
		</div>
	);
}

export default Toolbar;