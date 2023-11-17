// React
import { ReactNode, useCallback, useState } from 'react'
// Components
import { Navbar } from '@Components/Navbar'
import { MoveTokensAppProvider } from '@Providers/MoveTokensAppProvider/MoveTokensAppContext'
// Context
import { ThemeProvider, useTheme } from "next-themes";
import { GlobalAppProvider, useGlobalAppContext } from "@Providers/GlobalAppProvider/GlobalAppContext";
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
// RainbowKit
import { RainbowKitProvider, connectorsForWallets,
  darkTheme, lightTheme, DisclaimerComponent, // midnightTheme,
} from '@rainbow-me/rainbowkit';
import {
  injectedWallet, rabbyWallet, frameWallet, safeWallet,
  rainbowWallet, ledgerWallet, walletConnectWallet,
  braveWallet, metaMaskWallet, coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';

type PageProps = {
  children: ReactNode
}

const TransferTokensAppPageLayout = ( { children, }: PageProps ) =>
{
  // ---
  const mainnetChains = [
    mainnet,
    // polygon, optimism, arbitrum,
    {...gnosis, iconUrl: import.meta.env.PUBLIC_GNOSIS_ICON_URL||DEFAULT_GNOSIS_ICON_URL}
  ];

  const testnetChains = [
    goerli, sepolia,
    {...gnosisChiado, iconUrl: import.meta.env.PUBLIC_GNOSIS_ICON_URL||DEFAULT_GNOSIS_ICON_URL},
  ];

  // ---

  const [{ config, chains }] = useState(() => {
    const testChainsEnabled = import.meta.env.PUBLIC_ENABLE_TESTNETS !== 'true' ? [] : testnetChains ;

    const testnetChainsProviders:any = [];
    testnetChains.forEach( () => {
      testnetChainsProviders.push(publicProvider());
    });
    const mainnetChainsProviders:any = [
     ];

    mainnetChains?.forEach( (/* chain */) => {
      if (import.meta.env.APIKEY_ALCHEMY||"") {
        mainnetChainsProviders.push(alchemyProvider({ apiKey: import.meta.env.APIKEY_ALCHEMY||"" }), // Gnosis
        );
      } else if (import.meta.env.APIKEY_INFURA||"") {
        mainnetChainsProviders.push(infuraProvider({ apiKey: import.meta.env.APIKEY_INFURA||"" }), // Ethereum
        );
      }
    });
    mainnetChainsProviders.push(publicProvider());

    const { chains, publicClient } = configureChains(
      [ ...mainnetChains,
        ...testChainsEnabled
      ],
      [
        ...mainnetChainsProviders, // Mainnets
        ...testnetChainsProviders, // Testnets
      ],
      {
        batch: { multicall: true },
        stallTimeout: 5_000,
        rank: false,
        retryCount: 3,
        pollingInterval: 10_000,
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
      <MoveTokensAppProvider>
        <ThemeProvider enableSystem={false} themes={THEMES_NAMES}>
          <div className="flex flex-col w-full h-screen pt-0 bg-base-100">
            { config && chains ?
                <WagmiConfig config={config}>
                  <GlobalAppProvider>
                      <RainbowOutletWrapper 
                        children={
                          <>
                            <Navbar/>
                            {children}
                          </>
                        }
                        chains={chains}
                      />
                  </GlobalAppProvider>
                </WagmiConfig>
              :
                null
            }
          </div>
          </ThemeProvider>
      </MoveTokensAppProvider>
  )
} // App

// ------------------------------

interface IRainbowOutletWrapper {
  chains: Chain[];
  children: ReactNode;
}

const RainbowOutletWrapper = ( { chains, children }:IRainbowOutletWrapper ) =>
{
  const { theme } = useTheme()
  const { globalAppDataHandlers: {getAvatarComponent} } = useGlobalAppContext()

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
    switch (theme) {
      case 'dark':
        return darkTheme();
      case 'light':
        return lightTheme();
      case 'realOrange':
        return darkTheme();
      default:
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

// ------------------------------

export default TransferTokensAppPageLayout;