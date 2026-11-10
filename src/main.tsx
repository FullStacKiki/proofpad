import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { applyTheme } from './lib/themes';
import { loadPref } from './lib/recents';

applyTheme(loadPref('theme', 'system'));

createRoot(document.getElementById('root')!).render(<App />);
