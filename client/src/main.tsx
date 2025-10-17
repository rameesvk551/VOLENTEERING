import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a QueryClient instance
const queryClient = new QueryClient();


createRoot(document.getElementById('root')!).render(

    <Provider store={store}>
         <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
    
    </Provider>

)