import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './routes/Router'
import { BrowserRouter } from 'react-router-dom'
import { SystemProvider } from './context/SytemContext'
import { ToastContainer } from 'react-toastify'
import { QueryClient,QueryClientProvider } from '@tanstack/react-query'
import { ProductProvider } from './context/ProductContext'
import { EncuestaProvider } from './context/EncuestaContext'
const queryClient = new QueryClient()
createRoot(document.getElementById('root')).render(
  <StrictMode>

    <QueryClientProvider client={queryClient}>

      <BrowserRouter>
    <SystemProvider>
      <ProductProvider>
        <EncuestaProvider>
           <Router />
            <ToastContainer />
        </EncuestaProvider>
      </ProductProvider>
    </SystemProvider>

    </BrowserRouter>
    </QueryClientProvider>

  </StrictMode>,
)
