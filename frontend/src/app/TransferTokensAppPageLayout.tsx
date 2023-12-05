// React
import { ReactNode, useCallback, useState } from 'react'
// Components
import Navbar from '@Navbar/Navbar'
import { MoveTokensAppProvider } from '@Providers/MoveTokensAppProvider/MoveTokensAppContext'
// Context
import { ThemeProvider, useTheme } from "next-themes";
import { GlobalAppProvider, useGlobalAppContext } from "@Providers/GlobalAppProvider/GlobalAppContext";
// Wagmi
import { configureChains, createConfig, WagmiConfig, Chain } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura'
import { alchemyProvider } from 'wagmi/providers/alchemy'
// Translation
import { useTranslation } from 'react-i18next'
// Consts
import THEMES_NAMES from "@uiconsts/themes";
import { DEFAULT_GNOSIS_ICON_URL } from '@uiconsts/uiConsts';
import {
  mainnet, gnosis,
  goerli, sepolia, gnosisChiado
} from 'wagmi/chains';
// RainbowKit
import {
  RainbowKitProvider, connectorsForWallets,
  darkTheme, lightTheme, DisclaimerComponent
} from '@rainbow-me/rainbowkit';
import {
  injectedWallet, rabbyWallet, frameWallet, safeWallet,
  rainbowWallet, ledgerWallet, walletConnectWallet,
  braveWallet, metaMaskWallet, coinbaseWallet
} from '@rainbow-me/rainbowkit/wallets';

export default function TransferTokensAppPageLayout({ children }: PageProps) {

  const { t } = useTranslation()

  const mainnetChains = [
    { ...gnosis, iconUrl: import.meta.env.PUBLIC_GNOSIS_ICON_URL || DEFAULT_GNOSIS_ICON_URL },
    mainnet
  ];
  const testnetChains = [
    goerli, sepolia,
    { ...gnosisChiado, iconUrl: import.meta.env.PUBLIC_GNOSIS_ICON_URL || DEFAULT_GNOSIS_ICON_URL },
  ];

  const [{ config, chains }] = useState(() => {
    const testChainsEnabled = import.meta.env.PUBLIC_ENABLE_TESTNETS !== 'true' ? [] : testnetChains;

    const testnetChainsProviders: any = [];
    testnetChains.forEach(() => { testnetChainsProviders.push(publicProvider()); });
    const mainnetChainsProviders: any = [];

    mainnetChains?.forEach(() => {
      if (import.meta.env.APIKEY_ALCHEMY || "") {
        mainnetChainsProviders.push(alchemyProvider({ apiKey: import.meta.env.APIKEY_ALCHEMY || "" }));
      } else if (import.meta.env.APIKEY_INFURA || "") {
        mainnetChainsProviders.push(infuraProvider({ apiKey: import.meta.env.APIKEY_INFURA || "" }));
      }
    });
    mainnetChainsProviders.push(publicProvider());

    const { chains, publicClient } = configureChains(
      [...mainnetChains, ...testChainsEnabled],
      [...mainnetChainsProviders, ...testnetChainsProviders],
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
          ledgerWallet({ projectId: import.meta.env.APIKEY_WALLET_CONNECT || "", chains }),
          walletConnectWallet({ projectId: import.meta.env.APIKEY_WALLET_CONNECT || "", chains }),
          rainbowWallet({ projectId: import.meta.env.APIKEY_WALLET_CONNECT, chains }),
          metaMaskWallet({ projectId: import.meta.env.APIKEY_WALLET_CONNECT || "", chains }),
          braveWallet({ chains }),
          coinbaseWallet({ appName: import.meta.env.PUBLIC_APPNAME || "", chains }),
        ],
      },
    ]);
    const config = createConfig({
      autoConnect: true,
      connectors,
      publicClient,
    });

    return { config, chains };
  }); // useState

  return (
    <MoveTokensAppProvider>
      <ThemeProvider enableSystem={false} themes={THEMES_NAMES}>
        <div className="flex flex-col w-full h-screen pt-0 bg-base-100">
          {config && chains ?
            <WagmiConfig config={config}>
              <GlobalAppProvider>
                <RainbowOutletWrapper
                  children={
                    <>
                      <Navbar />
                      {children}
                    </>
                  }
                  chains={chains}
                  t={t}
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
}

interface IRainbowOutletWrapper {
  chains: Chain[];
  children: ReactNode;
  t: any;
}

const RainbowOutletWrapper = ({ chains, children, t }: IRainbowOutletWrapper) => {
  const { theme } = useTheme()
  const { globalAppDataHandlers: { getAvatarComponent } } = useGlobalAppContext()
  const repositoryUrl = import.meta.env.PUBLIC_REPOSITORY;

  const Disclaimer: DisclaimerComponent = ({ Text, Link }: any) => (
    <Text>
      <p className='font-bold'>{t("moveTokens.disclaimer.title")}</p>
      <p className=''>{t("moveTokens.disclaimer.text")}</p>
      <Link href={repositoryUrl} target="_blank" rel="noopener noreferrer">GitHub repository</Link>
    </Text>
  );

  const rainbowTheme = useCallback(() => {
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
  );
};