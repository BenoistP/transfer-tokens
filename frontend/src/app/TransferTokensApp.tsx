// React
import { Suspense } from 'react';
// Components
import TransferTokensAppPageLayout from '@App/TransferTokensAppPageLayout';
import { MainContent } from '@Components/MainContent';
// Router
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
// Translation
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import '@App/i18nConfig';
// Styles
import '@styles/global.css'
import '@styles/tailwind.css'

export default function TransferTokensApp(): JSX.Element {

  return (
    <BrowserRouter>
      <I18nextProvider i18n={i18next} /* defaultNS={'translation'} */ >

        <TransferTokensAppPageLayout>

          <Routes>

            <Route path={"/transferTokens"}
              element={
                <Suspense fallback="loading">
                  <MainContent />
                </Suspense>
              }
            ></Route>

            {/* default redirect to home page */}
            <Route path="*" element={<Navigate to="/transferTokens" />} />

          </Routes>

        </TransferTokensAppPageLayout>

      </I18nextProvider>
    </BrowserRouter>
  )
}