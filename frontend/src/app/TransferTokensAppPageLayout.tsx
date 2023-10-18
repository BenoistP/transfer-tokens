// React
import React, { ReactNode } from 'react'

// Components

// type Props = {
//   children: string | JSX.Element | JSX.Element[] | (() => JSX.Element)
// }

type PageProps = {
  children: ReactNode
}


const TransferTokensAppPageLayout = ( { children, }: PageProps ) =>
{
return (
  <div className="" >

    {/* Navbar */}

    {/* Pages */}
    <div className=''>
      {children}
    </div>

    {/* Footer */}

  </div>
  )
} // App

export default TransferTokensAppPageLayout;