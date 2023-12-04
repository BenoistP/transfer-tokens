// React
import { useEffect } from "react";
// Components
import TokensListsSelect from "@UIElements/TokensListsSelect";
import TokenInstanceListTableFiltered from "@UIElements/TokenInstanceListTableFiltered";

export default function Step0({
  accountAddress,
  chainId,
  setNextDisabled,
  targetAddress,
  selectableTokensLists,
  setselectableTokensLists,
  tokensInstances,
  isLoadingTokensLists, isErrorTokensLists,
  isLoadingTokensInstances, isErrorTokensInstances, isUpdatingTokensInstances,
  tokensInstancesListTablePropsHandlers
}: IStep0Props): JSX.Element {

  const someTokensListsSelected = selectableTokensLists?.some((tokensList) => tokensList.selected) || false

  useEffect(() => {
    setNextDisabled(!someTokensListsSelected || isLoadingTokensLists || isErrorTokensLists || isLoadingTokensInstances)
  },
    [setNextDisabled, someTokensListsSelected, isLoadingTokensLists, isErrorTokensLists, isLoadingTokensInstances]
  )

  return (
    <>
      <div className="w-full p-0 m-0">

        <div className="w-full flex">
          <TokensListsSelect
            chainId={chainId}
            selectableTokensLists={selectableTokensLists}
            setselectableTokensLists={setselectableTokensLists}
            isLoading={isLoadingTokensLists} isError={isErrorTokensLists}
          />
        </div>

        {someTokensListsSelected &&
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
        }

      </div>
    </>
  );
}