import { useEffect, } from "react";

import TokenInstanceListTableFiltered from "./TokenInstanceListTableFiltered";

// ------------------------------

const Step2 = ( {
  setNextDisabled,
  tokensInstances,
  // settokensInstances,
  // setShowProgressBar, setProgressBarPercentage,
  accountAddress,
  // chainId,
  targetAddress, isError,
  tokensInstancesListTablePropsHandlers,
}: IStep2Props ) => {

  // console.debug(`Step2.tsx render`)
 
  // ---

  useEffect( () => {
    // setShowProgressBar(true)
    // setProgressBarPercentage(50)

    const someSelected = tokensInstances?.some( (tokensInstance) => {
      if (accountAddress && typeof accountAddress === "string" && tokensInstance.userData && tokensInstance.userData[accountAddress as any]) {
        const selected = tokensInstance.userData[accountAddress as any]?.selected;
        return selected;
      }
      return false;
    });

    setNextDisabled(!someSelected || isError)

  }, [tokensInstances, accountAddress, isError, setNextDisabled] )

  // ---

  return (
    <>
      {/* <div className="w-full bg-base-300 items-center justify-center gap-2 overflow-x-scroll border border-neutral shadow-xl rounded-box bg-cover bg-top p-4 "> */}
      <div className="w-full p-0 m-0">

          <TokenInstanceListTableFiltered
            tokensInstances={tokensInstances}
            // settokensInstances={settokensInstances}
            accountAddress={accountAddress}
            // chainId={chainId}
            enableCheckboxes={true}
            targetAddress={targetAddress}
            isError={isError}
            tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
          />

      </div>
    </>
  );
}

// ------------------------------

export default Step2;