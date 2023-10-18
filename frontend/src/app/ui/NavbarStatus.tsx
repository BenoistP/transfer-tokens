import { useEffect, useState} from "react";

// Context
import { useGlobalAppContext } from "@Providers/GlobalAppProvider/GlobalAppContext";

// Translation
// import { useTranslation } from 'react-i18next';

import { useAccount , useNetwork, useBlockNumber, useEnsAvatar,/* useBalance */ 
useBalance} from 'wagmi'

// import { fetchBlockNumber } from 'wagmi/actions'
// import { fetchBalance } from '@wagmi/core'

import { watchBlockNumber, watchAccount } from '@wagmi/core'


export const Status = () => {

  // const { t } = useTranslation();
  // const { address:connectedAddress } = useAccount()
  // const { data:blockNumberData, isError:isErrorBlockNumber, isLoading:isLoadingBlockNumber } = useBlockNumber()
  // const { data:balanceData, isError:isErrorBalance, isLoading:isLoadingBalance } = useBalance()
  // const { chain } = useNetwork()
  // const { globalAppData:{ address:globalAddress }, globalAppDataHandlers: { getAddress, setAddress, getAvatarComponent, } } = useGlobalAppContext()

  // const [blockNumber, setBlockNumber] = useState<string|null>(null)
  // const [account, setAccount] = useState<string|null>(null)
  
// const blockNumber = await fetchBlockNumber();
// console.log('blockNumber', blockNumber);


  // console.debug(`Status.tsx render connectedAddress=${connectedAddress} blockNumberData=${blockNumberData} balanceData=${balanceData} chain=${chain}`)
  // const [avatarComponent, setavatarComponent] = useState<any>(undefined)
/* 
  useEffect(() => {
    if (connectedAddress!=getAddress()) {
      setAddress(connectedAddress);
    }
  }, [connectedAddress])

  useEffect(() => {
    setavatarComponent(getAvatarComponent());
  }, [globalAddress])

*/
  // --- 
/*
  useEffect(() => {
    const blockInterval = setInterval( async() => {
      // console.debug(`Status.tsx useEffect blockNumberData=${blockNumberData} balanceData=${balanceData}`)
      const blockNumber = await fetchBlockNumber();
      console.log('blockNumber', blockNumber);
      setBlockNumber(blockNumber.toString());

    }, 5_000);
    return () => clearInterval(blockInterval);
  }
  , [])
*/

  // ------------------------------

  // const blockNumberUpdate = (blockNumber:string) => {
  //   // console.log('blockNumber', blockNumber);
  //   setBlockNumber(blockNumber);
  // }

  // const accountUpdate = (account:string) => {
  //   console.log('account', account);
  //   setAccount(account);
  // }


    // const unwatchBlockNumber = watchBlockNumber(
    //   {// chainId: 1,
    //     listen: true
    //   },
    //   (blockNumber) => blockNumberUpdate(blockNumber.toString()),
    // )

    // const unwatchAccount = watchAccount(
    //   (account) => accountUpdate(account),
    // )

    // useEffect( () => {
    //   return () => {
    //     unwatchBlockNumber()
    //     unwatchAccount()
    //   }
    // }, [])

  // ------------------------------


  return (
    <div className="w-16">
        <label tabIndex={0} className="">
            {/* {isLoadingBalance?"Loading...":isErrorBalance?"Error":balanceData?.formatted}
            {isLoadingBlockNumber?"Loading...":isErrorBlockNumber?"Error":blockNumberData?.toString()} */}
            {/* {blockNumber} */}
        </label>

 {/*        <div className="dropdown bg-base-200">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                {avatarComponent}
              </div>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-2 z-[1] p-2 shadow-lg rounded w-36 bg-base-300 ">
              <li className="flex  ">
                <div className="bg-base-300 text-accent-content opacity-100">
                    1
                </div>
              </li>
              <li className="flex  ">
                <div className="bg-base-300 text-accent-content opacity-100">
                    2
                </div>
              </li>
          </ul>
        </div>
 */}
      </div>
  );

};