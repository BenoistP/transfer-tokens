// React
import React from 'react'
import ReactDOM from 'react-dom/client'
// Components
import AppRoot from '@App/AppRoot.tsx'
// Styles
import '@styles/global.css'
import '@styles/tailwind.css'
import '@rainbow-me/rainbowkit/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRoot/>
  </React.StrictMode>,
)
