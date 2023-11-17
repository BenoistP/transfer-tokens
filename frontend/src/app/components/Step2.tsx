// React
import { useEffect } from "react";
// Components
import TokenInstanceListTableFiltered from "@Components/TokenInstanceListTableFiltered";

// ------------------------------

const Step2 = ( {
  setNextDisabled,
  setShowProgressBar,
  tokensInstances,
  accountAddress,
  targetAddress,
  isLoadingTokensInstances, isErrorTokensInstances,
  tokensInstancesListTablePropsHandlers,
}: IStep2Props ) => {

  // ---

  useEffect( () =>
    {
      setShowProgressBar(false)

      const someSelected = tokensInstances?.some( (tokensInstance) => {
          return tokensInstance.selected;
      });

      setNextDisabled(!someSelected || isErrorTokensInstances)

    },
    [tokensInstances, isErrorTokensInstances, setNextDisabled, setShowProgressBar]
  )

  // ---

  return (
    <>
      <div className="w-full p-0 m-0">
          <TokenInstanceListTableFiltered
            tokensInstances={tokensInstances}
            accountAddress={accountAddress}
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