// React
import { useEffect } from 'react';

// Components
import TransferTokensApp from '@App/TransferTokensApp'
import { DEFAULT_APP_TITLE } from '@uiconsts/misc';

// ----------------------------------------------------------------------

const AppRoot = ( /* { } */ ) =>
{

  useEffect(() => {
    document.title = import.meta.env.PUBLIC_APPNAME || DEFAULT_APP_TITLE;
  }, []);

  // ---

  return (
    <>
        <TransferTokensApp/>
    </>
)

} // App

export default AppRoot;