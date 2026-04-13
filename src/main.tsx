import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { RoutingProvider } from './context/RoutingContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RoutingProvider>
      <App />
    </RoutingProvider>
  </React.StrictMode>,
);
