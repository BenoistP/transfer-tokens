import React from 'react'
import ReactDOM from 'react-dom/client'

// import App from './App.tsx'
import AppRoot from '~/AppRoot.tsx'


import '@styles/global.css'
import '@styles/tailwind.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
{/*     <App /> */}
    <AppRoot/>
  </React.StrictMode>,
)
