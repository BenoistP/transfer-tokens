// React
import { useEffect } from "react";
// Components
import AddressInput from "@Components/AddressInput";
// import TokenInstanceListTable from "@Components/TokenInstanceListTable";
import TokenInstanceListTableFiltered from "@Components/TokenInstanceListTableFiltered";
// Utils
import { isValidAddress } from "@jsutils/blockchainUtils";

// ------------------------------

const Step1 = ( {
  accountAddress,
  setNextDisabled,
  tokensInstances,
  targetAddress,
  settargetAddress,
  // setShowProgressBar,
  // chainId,
  isLoadingTokensInstances, isErrorTokensInstances,
  tokensInstancesListTablePropsHandlers }: IStep1Props ) =>
{

  // ---

  useEffect( () =>
    {
      setNextDisabled(! isValidAddress(targetAddress) || targetAddress == accountAddress || isLoadingTokensInstances || isErrorTokensInstances)
    },
    [accountAddress, targetAddress, isLoadingTokensInstances, isErrorTokensInstances, setNextDisabled]
  )

  // ---

  return (
    <>
      <div className="w-full p-0 m-0">

      <div className="w-full flex bg-base-300 gap-2 overflow-x-hidden border border-neutral rounded-box bg-cover bg-top py-2 px-4 ">
          <div className="bg-neutral min-w-fit m-0 p-1 rounded-box">
            <AddressInput sourceAddress={accountAddress} targetAddress={targetAddress} settargetAddress={settargetAddress} />
          </div>
          <div className="flex min-w-fit"></div>
        </div>

        <div className="w-full py-4 bg-base-100">
            <div className="min-w-fit m-0 p-1 rounded-box border border-neutral ">
              <TokenInstanceListTableFiltered
                tokensInstances={tokensInstances}
                accountAddress={accountAddress}
                // chainId={chainId}
                enableCheckboxes={true}
                targetAddress={targetAddress}
                isLoadingTokensInstances={isLoadingTokensInstances} isErrorTokensInstances={isErrorTokensInstances}
                tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
                enableEditable={false}
              />
            </div>
        </div>

      </div>
    </>
  );
}

// ------------------------------

export default Step1;