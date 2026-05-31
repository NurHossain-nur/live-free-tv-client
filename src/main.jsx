import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SocketProvider } from './context/SocketContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Provides the global Socket.io connection to all child components */}
    <SocketProvider>
      <App />
    </SocketProvider>
  </StrictMode>,
)
