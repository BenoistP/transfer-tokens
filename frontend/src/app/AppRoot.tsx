// React
import { useEffect } from 'react';
// Components
import TransferTokensApp from '@App/TransferTokensApp'
import { DEFAULT_APP_TITLE } from '@uiconsts/misc';
// Cookies
import { withCookies } from "react-cookie";

const AppRootWithoutCookies = (): JSX.Element => {
  useEffect(() => { document.title = import.meta.env.PUBLIC_APPNAME || DEFAULT_APP_TITLE; }, []);
  return (<TransferTokensApp />)
}

const AppRoot = withCookies(AppRootWithoutCookies);
export default AppRoot;