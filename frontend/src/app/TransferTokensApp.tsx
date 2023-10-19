// React

// Components
// ...
import TransferTokensAppPageLayout from './TransferTokensAppPageLayout';
import TestPage from './TestPage';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Translation
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import './i18n';

// Styles
import './styles/global.css'
import './styles/tailwind.css'
import { Suspense } from 'react';
// import '@styles/global.css'
// import '@css/global.css'



const TransferTokensApp = ( /* {  } */ ) =>
{
return (
  <BrowserRouter>
    <I18nextProvider i18n={i18next}>

      <h1>TransferTokensApp</h1>

      <TransferTokensAppPageLayout>

        <Routes>

          <Route
            path={"/"}
              element={
                      <Suspense fallback="loading">
                        <TestPage/>
                      </Suspense>
                  }
          ></Route>

        </Routes>

      </TransferTokensAppPageLayout>
    </I18nextProvider>
  </BrowserRouter>

)

} // App

export default TransferTokensApp;