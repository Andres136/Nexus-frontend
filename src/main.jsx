import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './routes/Router'
import { BrowserRouter } from 'react-router-dom'
import { SystemProvider } from './context/SytemContext'
import { ToastContainer } from 'react-toastify'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
    <SystemProvider> 
         <Router />
          <ToastContainer />
    </SystemProvider>
 
    </BrowserRouter>  
  </StrictMode>,
)
