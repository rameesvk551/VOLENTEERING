import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container missing in Volunteering micro-frontend');
}

const root = ReactDOM.createRoot(container);
const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
