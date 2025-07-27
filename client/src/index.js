import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { performanceMonitor } from './utils/performance';

// Initialize performance monitoring
if (process.env.NODE_ENV === 'production') {
  performanceMonitor.initCoreWebVitals();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);