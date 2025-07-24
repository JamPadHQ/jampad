import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { Toaster } from "@jampad/ui"
import { ThemeProvider } from '@/components/ThemeProvider';
import App from './App';

import './styles.css';

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

root.render(
	<StrictMode>
		<BrowserRouter>
			<ThemeProvider defaultTheme='dark'>
				<Toaster />
				<App />
			</ThemeProvider>
		</BrowserRouter>
	</StrictMode>
);