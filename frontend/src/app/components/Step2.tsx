// React
import { useEffect } from "react";

// Components
import TokenInstanceListTableFiltered from "@Components/TokenInstanceListTableFiltered";

// ------------------------------

const Step2 = ( {
  setNextDisabled,
  tokensInstances,
  accountAddress,
  // chainId,
  targetAddress,
  // isError,
  isLoadingTokensInstances, isErrorTokensInstances,
  tokensInstancesListTablePropsHandlers,
}: IStep2Props ) => {

  // console.debug(`Step2.tsx render`)
 
  // ---

  useEffect( () =>
    {
      // setShowProgressBar(true)
      // setProgressBarPercentage(50)

      const someSelected = tokensInstances?.some( (tokensInstance) => {
        // if (accountAddress && typeof accountAddress === "string" && tokensInstance.userData && tokensInstance.userData[accountAddress as any]) {
          // const selected = tokensInstance.userData[accountAddress as any]?.selected;
          return tokensInstance.selected;
        // }
        return false;
      });

      setNextDisabled(!someSelected || /* isError */isErrorTokensInstances)

    },
    [tokensInstances, /* accountAddress, */ /* isError */isErrorTokensInstances, setNextDisabled]
  )

  // ---

  return (
    <>
      <div className="w-full p-0 m-0">
          <TokenInstanceListTableFiltered
            tokensInstances={tokensInstances}
            // settokensInstances={settokensInstances}
            accountAddress={accountAddress}
            // chainId={chainId}
            enableCheckboxes={true}
            targetAddress={targetAddress}
            // isError={isError}
            isLoadingTokensInstances={isLoadingTokensInstances} isErrorTokensInstances={isErrorTokensInstances}
            tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
            enableEditable={true}
          />
      </div>
    </>
  );
}

// ------------------------------

export default Step2;