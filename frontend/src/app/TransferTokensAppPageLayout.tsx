// React
import { ReactNode, useCallback, useState } from 'react'

// Components
import { Navbar } from '@Components/Navbar'
import { Footer } from '@Components/Footer'
import { MoveTokensAppProvider } from '@Providers/MoveTokensAppProvider/MoveTokensAppContext'
import { ContentBottomPadding } from '@Components/ContentBottomPadding'

// Context
import { ThemeProvider, useTheme } from "next-themes";
import { GlobalAppProvider, useGlobalAppContext } from "@Providers/GlobalAppProvider/GlobalAppContext";

// Cookies
// import { CookiesProvider } from "react-cookie";

// Wagmi
import { configureChains, createConfig, WagmiConfig, Chain  } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura'
import { alchemyProvider } from 'wagmi/providers/alchemy'

// Consts
import THEMES_NAMES from "@uiconsts/themes";
import { DEFAULT_GNOSIS_ICON_URL } from '@uiconsts/uiConsts';

import {
  // Mainnets
  mainnet, gnosis,
  // polygon, optimism, arbitrum,
  // Testnets
  goerli, sepolia, gnosisChiado
} from 'wagmi/chains';

import { RainbowKitProvider, connectorsForWallets,
  darkTheme, lightTheme, DisclaimerComponent, // midnightTheme,
} from '@rainbow-me/rainbowkit';
import {
  injectedWallet, rabbyWallet, frameWallet, safeWallet,
  rainbowWallet, ledgerWallet, walletConnectWallet,
  braveWallet, metaMaskWallet, coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';

// type Props = {
//   children: string | JSX.Element | JSX.Element[] | (() => JSX.Element)
// }

type PageProps = {
  children: ReactNode
}

// console.debug(`(root)(App) import.meta.env.PUBLIC_APPNAME:`, import.meta.env.PUBLIC_APPNAME)
// console.debug(`(root)(App) import.meta.env.PUBLIC_MULTICALL_MAX_BATCH_SIZE:`, import.meta.env.PUBLIC_MULTICALL_MAX_BATCH_SIZE)

// console.debug(`(root)(App) import.meta.env.APIKEY_ALCHEMY:`, import.meta.env.APIKEY_ALCHEMY)
// console.debug(`(root)(App) import.meta.env.APIKEY_INFURA:`, import.meta.env.APIKEY_INFURA)
// console.debug(`(root)(App) import.meta.env.APIKEY_WALLET_CONNECT:`, import.meta.env.APIKEY_WALLET_CONNECT)

const TransferTokensAppPageLayout = ( { children, }: PageProps ) =>
{
  // ---
  const mainnetChains = [
  mainnet,
  // polygon, optimism, arbitrum,
  {...gnosis, iconUrl: import.meta.env.PUBLIC_GNOSIS_ICON_URL||DEFAULT_GNOSIS_ICON_URL} ];

const testnetChains = [
  goerli, sepolia,
  {...gnosisChiado, iconUrl: import.meta.env.PUBLIC_GNOSIS_ICON_URL||DEFAULT_GNOSIS_ICON_URL}, ];

  // ---

  const [{ config, chains }] = useState(() => {
    // console.log('(root)(App) useState(() PUBLICENV.PUBLIC_ENABLE_TESTNETS:', PUBLICENV.PUBLIC_ENABLE_TESTNETS)
    const testChainsEnabled = import.meta.env.PUBLIC_ENABLE_TESTNETS !== 'true' ? [] : testnetChains ;

    // let testnetChainsProviders:any = [];
    // testnetChains.forEach(testnetChain => {
    //   testnetChainsProviders.push(publicProvider());
    // });
    const mainnetChainsProviders:any = [
      infuraProvider({ apiKey: import.meta.env.APIKEY_INFURA_APIKEY||"" }), // Ethereum
      alchemyProvider({ apiKey: import.meta.env.APIKEY_ALCHEMY_APIKEY||"" }), // Gnosis
      publicProvider(),
     ];
    // const testnetChainsProviders:any = [ publicProvider() ];

    // console.dir(mainnetChains)
    // console.dir(mainnetChainsProviders)

    const { chains, publicClient } = configureChains(
      [ ...mainnetChains,
        ...testChainsEnabled
      ],
      [
        ...mainnetChainsProviders, // Mainnets
        // ...testnetChainsProviders, // Testnets
      ],
      {
        batch: { multicall: true },
        stallTimeout: 5_000,
        rank: false,
        retryCount: 3,
        pollingInterval: 10_000,
        // stallTimeout: 60_000
      },
    )

    const connectors = connectorsForWallets([
      {
        groupName: 'Recommended',
        wallets: [
          injectedWallet({ chains }),
          rabbyWallet({ chains }),
          frameWallet({ chains }),
          safeWallet({ chains }),
          ledgerWallet({ projectId: import.meta.env.APIKEY_WALLET_CONNECT||"", chains }),
          walletConnectWallet({ projectId: import.meta.env.APIKEY_WALLET_CONNECT||"", chains }),
          rainbowWallet({ projectId: import.meta.env.APIKEY_WALLET_CONNECT, chains }),
          metaMaskWallet({ projectId: import.meta.env.APIKEY_WALLET_CONNECT||"", chains }),
          braveWallet({ chains }),
          coinbaseWallet({ appName: import.meta.env.PUBLIC_APPNAME||"", chains }),
        ],
      },
    ]);
    const config = createConfig({
      autoConnect: true,
      connectors,
      publicClient,
    });

    return {
      config,
      chains,
    };
  }); // useState

  // ------------------------------

  return (
    // <CookiesProvider>

      <MoveTokensAppProvider>

          <div className="flex flex-col w-full h-screen pt-0 bg-base-100">

            { config && chains ?
                <WagmiConfig config={config}>

                  <GlobalAppProvider>

                    <ThemeProvider enableSystem={false} themes={THEMES_NAMES}>

                      <RainbowOutletWrapper 
                        children={
                          <>
                            <Navbar/>
                            {children}
                          </>
                        }
                        chains={chains}
                      />

                      {/* {children} */}

                    </ThemeProvider>

                  </GlobalAppProvider>

                </WagmiConfig>
              :
                null
            }

            <ContentBottomPadding/>
            <Footer/>

          </div>
      </MoveTokensAppProvider>

    // </CookiesProvider>
  )
} // App


interface IRainbowOutletWrapper {
  chains: Chain[];
  children: ReactNode;
}

const RainbowOutletWrapper = ( { chains, children }:IRainbowOutletWrapper ) => {
// ---

const { theme/* , themes */ } = useTheme()
const { globalAppDataHandlers: {getAvatarComponent} } = useGlobalAppContext()

// console.debug(`(root)(App:RainbowOutletWrapper) render theme="${theme}"`)
// console.dir(themes)

  // --------

  const Disclaimer: DisclaimerComponent = ({ Text, Link }:any) => (
    <Text>
      By connecting your wallet, you agree to the{' '}
      <Link href="https://termsofservice.xyz">Terms of Service</Link> and
      acknowledge you have read and understand the protocol{' '}
      <Link href="https://disclaimer.xyz">Disclaimer</Link>
    </Text>
  );

  // --------

const rainbowTheme = useCallback( () => {
  // console.debug(`(root)(App:RainbowOutletWrapper) rainbowTheme: theme="${theme}"`)
  switch (theme) {
    case 'dark':
      return darkTheme();
      // return lightTheme();
    case 'light':
      return lightTheme();
    case 'realOrange':
      // return midnightTheme();
      return darkTheme();
      // return lightTheme();
    default:
      // return lightTheme();
      return darkTheme();
  }
}, [theme]);

return (
  <>

  <RainbowKitProvider
    avatar={getAvatarComponent()}
    coolMode
    chains={chains as Chain[]}
    theme={rainbowTheme()}
    appInfo={{
    appName: import.meta.env.PUBLIC_APPNAME,
    disclaimer: Disclaimer,
    }}
  >
    {children}
  </RainbowKitProvider>
  </>
  );
};


export default TransferTokensAppPageLayout;