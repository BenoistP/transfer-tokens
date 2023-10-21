// React

// Components
// ...
import TransferTokensAppPageLayout from './TransferTokensAppPageLayout';
// import TestPage from './TestPage';
import { MainContent } from './ui/MainContent';


import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

// Translation
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import './i18n';

// Styles
import './styles/global.css'
import './styles/tailwind.css'
import { Suspense } from 'react';


const TransferTokensApp = ( /* {  } */ ) =>
{
return (
  <BrowserRouter>
    <I18nextProvider i18n={i18next} /* defaultNS={'translation'} */ >

        {/* <h1 className='text-info text-4xl'>TransferTokensApp</h1> */}

        <TransferTokensAppPageLayout>

          <Routes>

            <Route path={"/"}
                element={
                  <Suspense fallback="loading">

                    {/* <TestPage/> */}
                    <MainContent />

                  </Suspense>
                }
            ></Route>

            {/* default redirect to home page */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>

        </TransferTokensAppPageLayout>

      </I18nextProvider>
  </BrowserRouter>

)

} // App

export default TransferTokensApp;