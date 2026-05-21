import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TopLevelErrorBoundary } from './components/ErrorBoundary';
import { RoutingProvider } from './context/RoutingContext';
import './index.css';

// Hide the static fallback once React mounts successfully
const fallback = document.getElementById('fallback-content');
if (fallback) {
  fallback.remove();
}

const loadingText = document.getElementById('loading-text');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TopLevelErrorBoundary>
      <RoutingProvider>
        <App />
      </RoutingProvider>
    </TopLevelErrorBoundary>
  </React.StrictMode>,
);
