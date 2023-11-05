// React
import { useEffect } from "react";
// Components
import TokensListsSelect from "@Components/TokensListsSelect";
import TokenInstanceListTableFiltered from "@Components/TokenInstanceListTableFiltered";

// ------------------------------

const Step0 = (  {
    accountAddress,
    chainId,
    setNextDisabled,
    targetAddress,
    selectableTokensLists,
    setselectableTokensLists,
    tokensInstances,
    isLoadingTokensLists, isErrorTokensLists,
    isLoadingTokensInstances, isErrorTokensInstances,
    tokensInstancesListTablePropsHandlers
    } :IStep0Props ) =>
{

  // ---

  const someTokensListsSelected = selectableTokensLists?.some ( (tokensList) => tokensList.selected ) || false

    // ---

    useEffect( () =>
    {
      setNextDisabled(!someTokensListsSelected || isLoadingTokensLists || isErrorTokensLists)
    },
    [setNextDisabled, someTokensListsSelected, isLoadingTokensLists, isErrorTokensLists]
  )

// ------------------------------

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

          { someTokensListsSelected &&
          <div className="w-full py-4 bg-base-100">
            <div className="min-w-fit m-0 p-1 rounded-box border border-neutral ">
              <TokenInstanceListTableFiltered
                tokensInstances={tokensInstances}
                // settokensInstances={settokensInstances}
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
          }

      </div>
    </>
  );
}

// ------------------------------

export default Step0;