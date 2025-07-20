import Toolbar from '@/components/Toolbar';
import InfiniteCanvas from '@/components/Canvas';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useSocketHandler } from '@/hooks/useSocketHandler';
import { useCanvasStore } from '@/lib/store';

function Editor() {
	useSocketHandler();
	const isConnected = useCanvasStore((state) => state.isConnected);

	if (!isConnected) {
		return <LoadingSpinner />;
	}

	return (
		<div className="w-full h-screen">
			<InfiniteCanvas />
			<Toolbar />
		</div>
	);
}

export default Editor;
