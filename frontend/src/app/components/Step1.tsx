// React
import { useEffect } from "react";
// Components
import AddressInput from "@App/components/UIElements/AddressInput";
import TokenInstanceListTableFiltered from "@UIElements/TokenInstanceListTableFiltered";
// Utils
import { isValidAddress } from "@jsutils/blockchainUtils";

export default function Step1({
  accountAddress,
  chainId,
  setNextDisabled,
  tokensInstances,
  targetAddress,
  settargetAddress,
  isLoadingTokensInstances, isErrorTokensInstances, isUpdatingTokensInstances,
  tokensInstancesListTablePropsHandlers }: IStep1Props): JSX.Element {

  useEffect(() => {
    setNextDisabled(!isValidAddress(targetAddress) || targetAddress == accountAddress || isLoadingTokensInstances || isErrorTokensInstances)
  },
    [accountAddress, targetAddress, isLoadingTokensInstances, isErrorTokensInstances, setNextDisabled]
  )

  return (
    <>
      <div className="w-full p-0 m-0">

        <div className="w-full flex bg-base-300 gap-2 overflow-x-hidden rounded-box bg-cover bg-top py-2 px-4 ">
          <div className="bg-neutral min-w-fit m-0 p-1 rounded-box">
            <AddressInput sourceAddress={accountAddress} targetAddress={targetAddress} settargetAddress={settargetAddress} chainId={chainId}/>
          </div>
          <div className="flex min-w-fit"></div>
        </div>

        <div className="w-full py-4 bg-base-100">
          <div className="min-w-fit m-0 p-1 rounded-box border border-base-300 ">
            <TokenInstanceListTableFiltered
              tokensInstances={tokensInstances}
              accountAddress={accountAddress}
              enableCheckboxes={true}
              targetAddress={targetAddress}
              isLoadingTokensInstances={isLoadingTokensInstances} isErrorTokensInstances={isErrorTokensInstances} isUpdatingTokensInstances={isUpdatingTokensInstances}
              tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
              enableEditable={false}
            />
          </div>
        </div>

      </div>
    </>
  );
}