import { Toolbar } from '@/components/toolbar';
import { Canvas as InfiniteCanvas } from '@/components/canvas';
import { useYJS } from '@/hooks/useYJS';

function Editor() {
	// Initialize YJS with a default room
	useYJS('default-room');

	return (
		<div className="w-full h-screen">
			<InfiniteCanvas />
			<Toolbar />
		</div>
	);
}

export default Editor;
