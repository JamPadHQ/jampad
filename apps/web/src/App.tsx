import { Routes, Route } from 'react-router-dom';
import Editor from './pages/Editor';

function App() {
	return (
		<Routes>
			<Route path="/room/:roomId" element={<Editor />} />
		</Routes>
	);
}

export default App;