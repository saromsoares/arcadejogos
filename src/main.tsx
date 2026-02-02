import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/**
 * Entry Point - Portais do Improviso
 * 
 * Nota sobre StrictMode:
 * - Em desenvolvimento, StrictMode causa double-render
 * - O PhaserGame.tsx possui guards para evitar dupla inicialização
 * - Em produção, isso não é um problema
 */

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element not found. Make sure there is a <div id="root"></div> in your HTML.'
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
