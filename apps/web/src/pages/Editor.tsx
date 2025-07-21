import Toolbar from '@/components/Toolbar';
import InfiniteCanvas from '@/components/Canvas';
import { useSocketHandler } from '@/hooks/useSocketHandler';

function Editor() {
	useSocketHandler();

	return (
		<div className="w-full h-screen">
			<InfiniteCanvas />
			<Toolbar />
		</div>
	);
}

export default Editor;
