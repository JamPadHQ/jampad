import { Routes, Route } from 'react-router-dom';
import Editor from './pages/Editor';

function App() {
	return (
		<Routes>
			<Route path="/" index element={<Editor />} />
		</Routes>
	);
}

export default App;