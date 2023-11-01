import { useEffect } from "react";

import TokensListsSelect from "@Components/TokensListsSelect";
import TokenInstanceListTable from "@Components/TokenInstanceListTable";

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
    isLoading, isError,
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
      setNextDisabled(!someTokensListsSelected || isError)
    },
    [ setNextDisabled, someTokensListsSelected, isError
      // selectableTokensLists,
    ]
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
            />
          </div>

          { someTokensListsSelected &&
          <div className="w-full py-4 bg-base-100">
            <div className="min-w-fit m-0 p-1 rounded-box border border-neutral ">

              <TokenInstanceListTable
                tokensInstances={tokensInstances}
                accountAddress={accountAddress}
                // chainId={chainId}
                targetAddress={targetAddress}
                isLoading={isLoading} isError={isError}
                tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
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