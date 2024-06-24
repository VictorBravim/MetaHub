import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './tailwind.css'; // Certifique-se de que este caminho está correto

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
