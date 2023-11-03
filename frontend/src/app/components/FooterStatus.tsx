import { useEffect, useState} from "react";

// Context
// import { useGlobalAppContext } from "@Providers/GlobalAppProvider/GlobalAppContext";

// import { fetchBlockNumber } from 'wagmi/actions'
// import { useAccount , useNetwork, useBlockNumber, useEnsAvatar, useBalance} from 'wagmi'
import { watchBlockNumber/* , watchAccount, fetchBalance */ } from '@wagmi/core'


export const FooterStatus = () => {

  // const { t } = useTranslation();
  // const { address:connectedAddress } = useAccount()
  // const { data:blockNumberData, isError:isErrorBlockNumber, isLoading:isLoadingBlockNumber } = useBlockNumber()
  // const { data:balanceData, isError:isErrorBalance, isLoading:isLoadingBalance } = useBalance()
  // const { chain } = useNetwork()
  // const { globalAppData:{ address:globalAddress }, globalAppDataHandlers: { getAddress, setAddress, getAvatarComponent, } } = useGlobalAppContext()

  const blockNumberInitValue = "..."
  const [blockNumber, setBlockNumber] = useState<string>(blockNumberInitValue)
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


  // const accountUpdate = (account:string) => {
  //   console.log('account', account);
  //   setAccount(account);
  // }



  useEffect( () =>
  {

    const blockNumberUpdate = (blockNumber:string) => {
      try {
      // console.log('blockNumber', blockNumber);
      setBlockNumber(blockNumber);
      } catch (error) {
        console.error('blockNumberUpdate error', error);
        unwatchBlockNumber()
        setBlockNumber("Error")
      }
    }

    const unwatchBlockNumber = watchBlockNumber(
      {// chainId: 1,
        listen: true
      },
      (blockNumber) => blockNumberUpdate(blockNumber.toString()),
    )
  

    return () => {
      unwatchBlockNumber()
    }
  }, [/* unwatchBlockNumber */])
    

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
    <div className="">
        <div className="w-16 text-xs text-content">
            {/* {isLoadingBalance?"Loading...":isErrorBalance?"Error":balanceData?.formatted}
            {isLoadingBlockNumber?"Loading...":isErrorBlockNumber?"Error":blockNumberData?.toString()} */}
          {blockNumber}
        </div>

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