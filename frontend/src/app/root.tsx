import { useCallback, useState } from 'react';
import {
  Meta,
  Links,
  Outlet,
  Scripts,
  LiveReload,
  ScrollRestoration,
  useLoaderData,
  V2_MetaFunction,
  // Await,
  isRouteErrorResponse, useRouteError,
} from '@remix-run/react';

import { json, LoaderArgs, LoaderFunction,
  LinksFunction  // MetaFunction,
} from '@remix-run/node';

import { configureChains, createConfig, WagmiConfig, Chain  } from 'wagmi';

import { publicProvider } from 'wagmi/providers/public';
import { infuraProvider } from 'wagmi/providers/infura'
import { alchemyProvider } from 'wagmi/providers/alchemy'

import {
  mainnet,
  gnosis,
  // polygon, optimism, arbitrum,
  // zora,
  // Testnets
  goerli, sepolia,
  gnosisChiado
} from 'wagmi/chains';

import { RainbowKitProvider, connectorsForWallets,
  darkTheme, lightTheme, DisclaimerComponent, // midnightTheme,
} from '@rainbow-me/rainbowkit';

import {
  injectedWallet, rabbyWallet, frameWallet, safeWallet,
  rainbowWallet, ledgerWallet, walletConnectWallet,
  braveWallet, metaMaskWallet, coinbaseWallet,
} from '@rainbow-me/rainbowkit/wallets';

// Env
import { getPublicKeys } from './environment'
import { getPrivateKeys } from './environment.server'

// Translation
import { useChangeLanguage } from "remix-i18next";
import { useTranslation } from "react-i18next";
import i18next from "~/i18next.server";

// Styles
import globalStylesUrl from './styles/global.css';
import rainbowStylesUrl from '@rainbow-me/rainbowkit/styles.css';
import stylesheet from "./styles/tailwind.css";
import flag_icon_stylesheet from 'node_modules/flag-icons/css/flag-icons.min.css'

// Tailwind
// import resolveConfig from 'tailwindcss/resolveConfig'
// import tailwindConfig from '~/../tailwind.config'

import { PublicEnv } from './ui/public-env'

// Cookies
import { CookiesProvider } from "react-cookie";
import { useCookies } from "react-cookie";

// Context
import { GlobalAppProvider, useGlobalAppContext } from "@Providers/GlobalAppProvider/GlobalAppContext";
import { ThemeProvider, useTheme } from "next-themes";

import { COOKIE_LANGUAGE, DEFAULTAPPTITLE } from "~/utils/constants/misc";
import THEMES_NAMES from "./js/ui/themes/themes";

// ------------------------------

export const 
mainnetChains = [
  mainnet,
  // polygon, optimism, arbitrum,
  {...gnosis, iconUrl: 'https://gnosisscan.io/images/svg/brands/main.svg'} ];

export const testnetChains = [
  goerli, sepolia,
  {...gnosisChiado, iconUrl: 'https://gnosisscan.io/images/svg/brands/main.svg'}, ];


export const meta: V2_MetaFunction = ({ data }) => {
  let title = DEFAULTAPPTITLE;
  try {
    title = data.PUBLICENV.publicKeys.PUBLIC_APPNAME;
  } catch (error) {
    console.error(`(root)(meta) error: ${error}`)
  }
  return [
    {charset: 'utf-8'},
    {title},
    {viewport: 'width=device-width,initial-scale=1'},
    // { title: "Very cool app | Remix" },
    // {
    //   property: "og:title",
    //   content: "Very cool app",
    // },
    // {
    //   name: "description",
    //   content: "This app is the best",
    // },
  ];
};

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: globalStylesUrl },
  { rel: 'stylesheet', href: rainbowStylesUrl },
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: flag_icon_stylesheet },
];

// See: https://remix.run/docs/en/v1/guides/envvars#browser-environment-variables
export const loader: LoaderFunction = async( { request }: LoaderArgs ) => {

  const loaderData: RootLoaderData = {
    PUBLICENV: {
      ...getPublicKeys()
    },
    PRIVATEENV: {
      ...getPrivateKeys()
    },
    locale: [
      await i18next.getLocale(request)
    ]
  };

  return json( loaderData );
}; // loader

// ------------------------------

export let handle = {
  // In the handle export, we can add a i18n key with namespaces our route
  // will need to load. This key can be a single string or an array of strings.
  // TIP: In most cases, you should set this to your defaultNS from your i18n config
  // or if you did not set one, set it to the i18next default namespace "translation"
  i18n: "common",
};

// ------------------------------

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error:</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

// ------------------------------

export default function App() {
  // const { ENV } = useLoaderData<LoaderData>();
  const { PUBLICENV, PRIVATEENV, locale } = useLoaderData<typeof loader>()
  let { i18n } = useTranslation();
  const [cookies/* , setCookie, removeCookie */] = useCookies();

  
  // const LANGUAGEDEFAULTVALUE = "fr"
  const LANGUAGEDEFAULTVALUE = "en"

  const languageInitValue = () => cookies[COOKIE_LANGUAGE] ? cookies[COOKIE_LANGUAGE] : (locale?locale:LANGUAGEDEFAULTVALUE) ;

  const [language, setlanguage] = useState<string>(languageInitValue());

  // console.debug(`(root)(App) render, languageInitValue=${languageInitValue()}, locale=${locale}, i18n.language=${i18n.language} ` )
/* 


  const getLanguage = useCallback(() => {

    
  }, [locale]); */

  // const twFullConfig = useMemo( () =>
  //   {
  //     return resolveConfig(tailwindConfig) as any // workaround: add "as any" Taiwind config is not yet properly typed
  //   },
  //   [ /* NO DEPS */ ]
  // ) // twFullConfig

  // const colors = twFullConfig.theme?.colors as {[key:string]:string};

  // This hook will change the i18n instance language to the current locale
  // detected by the loader, this way, when we do something to change the
  // language, this locale will change and i18next will load the correct
  // translation files
  useChangeLanguage(language);

// console.debug(`(root)(App) PUBLICENV.publicKeys.TOKENS_LIST_1=${PUBLICENV.publicKeys.TOKENS_LIST_1} PUBLICENV.publicKeys.TOKENS_LIST_100=${PUBLICENV.publicKeys.TOKENS_LIST_100}` )


  // Remix modules cannot have side effects so the initialization of `wagmi`
  // client happens during render, but the result is cached via `useState`
  // and a lazy initialization function.
  // See: https://remix.run/docs/en/v1/guides/constraints#no-module-side-effects

  const [{ config, chains }] = useState(() => {
    // console.log('(root)(App) useState(() PUBLICENV.PUBLIC_ENABLE_TESTNETS:', PUBLICENV.PUBLIC_ENABLE_TESTNETS)
    const testChainsEnabled = PUBLICENV.publicKeys.PUBLIC_ENABLE_TESTNETS !== 'true' ? [] : testnetChains ;

    // let testnetChainsProviders:any = [];
    // testnetChains.forEach(testnetChain => {
    //   testnetChainsProviders.push(publicProvider());
    // });
    const mainnetChainsProviders:any = [
      infuraProvider({ apiKey: PRIVATEENV.privateKeys.INFURA_APIKEY }), // Ethereum
      alchemyProvider({ apiKey: PRIVATEENV.privateKeys.ALCHEMY_APIKEY }), // Gnosis
     ];
    const testnetChainsProviders:any = [ publicProvider() ];

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
        rank: true,
        retryCount: 3,
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
          ledgerWallet({ projectId: PRIVATEENV.privateKeys.WALLET_CONNECT_APIKEY, chains }),
          walletConnectWallet({ projectId: PRIVATEENV.privateKeys.WALLET_CONNECT_APIKEY, chains }),
          rainbowWallet({ projectId: PRIVATEENV.privateKeys.WALLET_CONNECT_APIKEY, chains }),
          metaMaskWallet({ projectId: PRIVATEENV.privateKeys.WALLET_CONNECT_APIKEY, chains }),
          braveWallet({ chains }),
          coinbaseWallet({ appName: PUBLICENV.publicKeys.PUBLIC_APPNAME, chains }),
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

  // --------

  // console.info(`(root)(App) render`)
  // console.debug(`(root)(App) render: twFullConfig.theme.colors['someColor'].DEFAULT=`)
  // console.dir(twFullConfig.theme.colors['someColor'].DEFAULT)
  
  // --------

  return (
      <html lang={language/* locale */} dir={i18n.dir()}>
        <head>
          <Meta />
          <Links />
        </head>
        <body>
          <PublicEnv {...PUBLICENV.publicKeys} />
          <Links />
          <div className="w-full bg-neutral" >

              {config && chains ? (
                <WagmiConfig config={config}>


                  <ThemeProvider enableSystem={false} themes={THEMES_NAMES}>
                    <GlobalAppProvider>

                      <RainbowOutletWrapper 
                        chains={chains}
                      />

                    </GlobalAppProvider>
                  </ThemeProvider>

                </WagmiConfig>
              ) : null}

          </div>

          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
  );
} // App


interface IRainbowOutletWrapper {
  chains: Chain[];
}

const RainbowOutletWrapper = ( { chains }:IRainbowOutletWrapper ) => {
// ---

const { theme/* , themes */ } = useTheme()
const { globalAppDataHandlers: {getAvatarComponent} } = useGlobalAppContext()

// console.debug(`(root)(App:RainbowOutletWrapper) render theme="${theme}"`)
// console.dir(themes)

  // --------

  const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
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
    appName: "publicKeys.PUBLIC_APP_NAME",
    disclaimer: Disclaimer,
    }}
    >
    <CookiesProvider>
        <Outlet />
    </CookiesProvider>
  </RainbowKitProvider>
  </>
  );
};