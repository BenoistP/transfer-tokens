import { useEffect, /* useCallback,  useState */ } from "react";

import AddressInput from "./AddressInput";
import TokenInstanceListTable from "./TokenInstanceListTable";

import { isValidAddress } from "~/utils/blockchainUtils";

// ------------------------------

const Step1 = ( {  
  accountAddress,
  setNextDisabled,
  tokensInstances,
  // settokensInstances,
  targetAddress,
  settargetAddress,
  // setShowProgressBar,
  // chainId,
  isError,
  tokensInstancesListTablePropsHandlers,
}: IStep1Props ) => {

  // console.debug(`Step1.tsx render`)

  // ---

  // setShowProgressBar(false)

  // ---

  useEffect( () =>
    {
      // console.debug(`Step1 useEffect [targetAddress]: targetAddress=${targetAddress}`)
      setNextDisabled(! isValidAddress(targetAddress) || targetAddress == accountAddress || isError)
    },
    [accountAddress, targetAddress, isError, setNextDisabled]
  )

  // ---

  return (
    <>
      <div className="w-full p-0 m-0">

      <div className="w-full flex bg-base-300 gap-2 overflow-x-hidden border border-neutral shadow-xl rounded-box bg-cover bg-top p-4 ">
          <div className="bg-neutral min-w-fit m-0 p-1 rounded-box border border-neutral ">
            <AddressInput sourceAddress={accountAddress} targetAddress={targetAddress} settargetAddress={settargetAddress} />
          </div>
          <div className="flex min-w-fit"></div>
        </div>

        <div className="w-full py-4 bg-base-100">
            <div className="min-w-fit m-0 p-1 rounded-box border border-neutral ">

              <TokenInstanceListTable
                tokensInstances={tokensInstances}
                accountAddress={accountAddress}
                // chainId={chainId}
                targetAddress={targetAddress}
                isError={isError}
                tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
              />

            </div>
        </div>

      </div>
    </>
  );
}

// ------------------------------

export default Step1;