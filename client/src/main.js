import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Create a QueryClient instance
const queryClient = new QueryClient();
createRoot(document.getElementById('root')).render(_jsx(Provider, { store: store, children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(App, {}) }) }));
