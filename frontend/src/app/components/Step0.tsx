import { useEffect } from "react";

import TokensListsSelect from "@Components/TokensListsSelect";
// import TokenInstanceListTable from "@Components/TokenInstanceListTable";
import TokenInstanceListTableFiltered from "@Components/TokenInstanceListTableFiltered";

// ------------------------------

const Step0 = (  {
    accountAddress,
    tokensLists,
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

  // console.debug(`Step0.tsx render`)
  const someTokensListsSelected = selectableTokensLists?.some ( (tokensList) => tokensList.selected ) || false

  // ---

  useEffect( () =>
    {
      // console.debug(`Step0.tsx useEffect`)
      // setpreviousDisabled(true)
      setNextDisabled(true)
    },
    [setNextDisabled]
  )

    // ---

    useEffect( () =>
    {
      // setpreviousDisabled(false)
      // setNextDisabled(!tokenChainDataArray || tokenChainDataArray.length <= 0)
      // const someTokensListsSelected = selectableTokensLists?.some ( (tokensList) => tokensList.selected )
      // console.log(`Step0.tsx useEffect: someSelected=${someSelected}`);
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
              tokensLists={tokensLists}
              chainId={chainId}
              selectableTokensLists={selectableTokensLists}
              setselectableTokensLists={setselectableTokensLists}
              isLoading={isLoadingTokensLists} isError={isErrorTokensLists}
            />
          </div>

          { someTokensListsSelected &&
          <div className="w-full py-4 bg-base-100">
            <div className="min-w-fit m-0 p-1 rounded-box border border-neutral ">
{/* 
              <TokenInstanceListTable
                tokensInstances={tokensInstances}
                accountAddress={accountAddress}
                // chainId={chainId}
                targetAddress={targetAddress}
                isLoading={isLoadingTokensInstances} isError={isErrorTokensInstances}
                tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
              />
 */}
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