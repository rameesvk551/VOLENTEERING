import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

export default function AppWithProvider() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
