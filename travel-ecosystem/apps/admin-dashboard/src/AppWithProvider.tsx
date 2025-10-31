import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { store } from './store';
import App from './App';
import './index.css';

export default function AppWithProvider() {
  useEffect(() => {
    // Dynamically inject CSS for module federation
    const cssId = 'admin-dashboard-styles';
    if (!document.getElementById(cssId)) {
      // Find and load the CSS file from the dist folder
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      // The CSS file will be served from the admin dashboard preview server
      link.href = 'http://localhost:1003/assets/style-qqYpau_C.css';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
