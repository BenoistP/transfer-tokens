
import { MoveTokensAppProvider } from '@Providers/MoveTokensAppProvider/MoveTokensAppContext'

import { Navbar } from "./Navbar";

import { Footer } from "./Footer";
import { MainContent } from "./MainContent";
import { ContentBottomPadding } from "./ContentBottomPadding";

// ------------------------------

// const MoveTokensApp2 = ( /* {children}: any */ ) => {
const AppMoveTokens2 = ( /* { }: IAppMoveTokens2Props */ /* { Component, pageProps } */ ) => {

  // console.info(`AppMoveTokens2.tsx render`)
  // console.debug(`AppMoveTokens2.tsx: render: tokensLists=${tokensLists}}`);

  // --------

  return (
    <>
      {/* <Component {...pageProps} /> */}
      <MoveTokensAppProvider>
        <Navbar/>
        <MainContent />
        <ContentBottomPadding/>
        <Footer/>
      </MoveTokensAppProvider>
    </>
  );
}

// ------------------------------

export default AppMoveTokens2;