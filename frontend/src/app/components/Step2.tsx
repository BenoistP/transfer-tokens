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
  isLoadingTokensInstances, isErrorTokensInstances,
  tokensInstancesListTablePropsHandlers,
}: IStep2Props ) => {

  // ---

  useEffect( () =>
    {
      // setShowProgressBar(true)
      // setProgressBarPercentage(50)

      const someSelected = tokensInstances?.some( (tokensInstance) => {
          return tokensInstance.selected;
      });

      setNextDisabled(!someSelected || isErrorTokensInstances)

    },
    [tokensInstances, isErrorTokensInstances, setNextDisabled]
  )

  // ---

  return (
    <>
      <div className="w-full p-0 m-0">
          <TokenInstanceListTableFiltered
            tokensInstances={tokensInstances}
            accountAddress={accountAddress}
            // chainId={chainId}
            enableCheckboxes={true}
            targetAddress={targetAddress}
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