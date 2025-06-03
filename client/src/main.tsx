// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import App from './App.tsx';
import { ThemeProvider } from './components/common/ThemeContext.tsx'; // 🔥 importa tu provider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider> {/* 💡 envolvé tu app con el ThemeProvider */}
      <App />
    </ThemeProvider>
  </StrictMode>
);
