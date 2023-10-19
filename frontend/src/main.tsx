import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

import '@styles/global.css'
import '@styles/tailwind.css'
// import '@css/global.css'
// import '@css/tailwind.css'
// import '/src/app/styles/global.css'
// import '/src/app/styles/tailwind.css'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
