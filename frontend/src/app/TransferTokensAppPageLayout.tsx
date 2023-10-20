// React
import { ReactNode } from 'react'

// import { Navbar } from './ui/Navbar'
// import { Footer } from './ui/Footer'
import { MoveTokensAppProvider } from './js/providers/MoveTokensAppProvider/MoveTokensAppContext'
import { ContentBottomPadding } from './ui/ContentBottomPadding'
// import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

// Components

// Context

// Cookies
// import { CookiesProvider } from "react-cookie";
// import { useCookies } from "react-cookie";

// type Props = {
//   children: string | JSX.Element | JSX.Element[] | (() => JSX.Element)
// }

type PageProps = {
  children: ReactNode
}


const TransferTokensAppPageLayout = ( { children, }: PageProps ) =>
{

  // --------
/* 
  const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
    <Text>
      By connecting your wallet, you agree to the{' '}
      <Link href="https://termsofservice.xyz">Terms of Service</Link> and
      acknowledge you have read and understand the protocol{' '}
      <Link href="https://disclaimer.xyz">Disclaimer</Link>
    </Text>
  );
 */
// ------------------------------


  return (

    <MoveTokensAppProvider>

      {/* <RainbowKitProvider
        avatar={getAvatarComponent()}
        coolMode
        chains={chains as Chain[]}
        theme={rainbowTheme()}
        appInfo={{
        appName: "publicKeys.PUBLIC_APP_NAME",
        disclaimer: Disclaimer,
        }}
      >
    <CookiesProvider> */}

          <div className="bg-blue-500" >

            {/* Navbar */}
            {/* <Navbar/> */}

            {/* Pages */}
            <div className=''>
              {children}
            </div>

            <ContentBottomPadding/>
            {/* Footer */}
            {/* <Footer/> */}

          </div>
        </MoveTokensAppProvider>
      // </RainbowKitProvider>
    // </CookiesProvider>
  )
} // App

export default TransferTokensAppPageLayout;