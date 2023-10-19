
// import { useState } from 'react';
// import dynamic from 'next/dynamic'

import { useAccount, useNetwork } from 'wagmi'

export default function DebugWagmi( ) {

  const { address, status, /* , isConnectedisConnecting, isDisconnected */ } = useAccount()
  const { chain } = useNetwork()

  // const [session, setSession] = useState();


  return (
    <div>
      address:{address}
      status:{status}
      {/* chain:{JSON.stringify(chain)} */}
      chain id:{chain? (chain.id ? chain.id : 'no chain id') : 'no chain'}
    </div>

  );
}
