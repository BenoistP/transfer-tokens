// React
import { useEffect } from 'react';

// Components
import TransferTokensApp from '@App/TransferTokensApp'
import { DEFAULT_APP_TITLE } from '@uiconsts/misc';
// Cookies
import { CookiesProvider } from "react-cookie";
// ----------------------------------------------------------------------

const AppRoot = ( /* { } */ ) =>
{

  useEffect(() => {
    document.title = import.meta.env.PUBLIC_APPNAME || DEFAULT_APP_TITLE;
  }, []);

  // ---

  return (
    <CookiesProvider>
        <TransferTokensApp/>
    </CookiesProvider>
)

} // App

export default AppRoot;