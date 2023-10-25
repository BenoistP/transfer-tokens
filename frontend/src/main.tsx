import React from 'react'
import ReactDOM from 'react-dom/client'

import AppRoot from '@App/AppRoot.tsx'


import '@styles/global.css'
import '@styles/tailwind.css'
import '@rainbow-me/rainbowkit/styles.css';
import 'node_modules/flag-icons/css/flag-icons.min.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRoot/>
  </React.StrictMode>,
)
