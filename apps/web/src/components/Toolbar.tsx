import { HandIcon, MousePointer2Icon, PenIcon } from 'lucide-react';
import { Button } from './ui/button';
import { useCanvasStore } from '@/lib/store';

function Toolbar() {
	const tool = useCanvasStore((state) => state.tool);
	const setTool = useCanvasStore((state) => state.setTool);

	return (
		<div className='fixed bottom-2 left-0 right-0 flex justify-center items-center'>
			<div className='p-2 bg-white rounded-lg shadow-lg space-x-0.5'>
				<Button variant={tool === 'move' ? 'default' : 'ghost'} size='icon' onClick={() => setTool('move')}>
					<HandIcon />
				</Button>
				<Button variant={tool === 'select' ? 'default' : 'ghost'} size='icon' onClick={() => setTool('select')}>
					<MousePointer2Icon />
				</Button>
				<Button variant={tool === 'draw' ? 'default' : 'ghost'} size='icon' onClick={() => setTool('draw')}>
					<PenIcon />
				</Button>
			</div>
		</div>
	);
}

export default Toolbar;