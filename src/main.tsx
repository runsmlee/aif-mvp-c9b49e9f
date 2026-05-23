import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TopLevelErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Hide the static fallback once React mounts successfully
const fallback = document.getElementById('fallback-content');
if (fallback) {
  fallback.remove();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TopLevelErrorBoundary>
      <App />
    </TopLevelErrorBoundary>
  </React.StrictMode>,
);
