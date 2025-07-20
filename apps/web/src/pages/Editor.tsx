import Toolbar from '@/components/Toolbar';
import InfiniteCanvas from '../components/InfiniteCanvas';

function Editor() {
	return (
		<div className="w-full h-screen">
			<InfiniteCanvas />
			<Toolbar />
		</div>
	);
}

export default Editor;