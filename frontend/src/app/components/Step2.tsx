// React
import { useEffect } from "react";
// Components
import TokenInstanceListTableFiltered from "@UIElements/TokenInstanceListTableFiltered";

export default function Step2({
  setNextDisabled,
  setShowProgressBar,
  tokensInstances,
  accountAddress,
  targetAddress,
  isLoadingTokensInstances, isErrorTokensInstances, isUpdatingTokensInstances,
  tokensInstancesListTablePropsHandlers,
}: IStep2Props): JSX.Element {

  useEffect(() => {
    setShowProgressBar(false)

    const someSelected = tokensInstances?.some((tokensInstance) => {
      return tokensInstance.selected;
    });

    setNextDisabled(!someSelected || isErrorTokensInstances)

  },
    [tokensInstances, isErrorTokensInstances, setNextDisabled, setShowProgressBar]
  )

  return (
    <>
      <div className="w-full p-0 m-0">
        <TokenInstanceListTableFiltered
          tokensInstances={tokensInstances}
          accountAddress={accountAddress}
          enableCheckboxes={true}
          targetAddress={targetAddress}
          isLoadingTokensInstances={isLoadingTokensInstances} isErrorTokensInstances={isErrorTokensInstances} isUpdatingTokensInstances={isUpdatingTokensInstances}
          tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
          enableEditable={true}
        />
      </div>
    </>
  );
}