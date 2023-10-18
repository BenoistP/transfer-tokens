// import { ErrorBoundary } from "react-error-boundary";

import { useCallback } from "react";

import { TokenInstance } from "./TokenInstance";

const TokenInstanceListFiltered = ( {
  tokensInstances,
  // chainId,
  accountAddress,
  // changeCheckboxStatus,
  targetAddress,
  tokensInstancesListTablePropsHandlers,
 }: ITokenListFilteredProps ) => {

  // console.debug(`TokenInstanceListFiltered.tsx render accountAddress: ${accountAddress}`);

  // ---

  const filterTokenInstanceCB = useCallback( (token:TTokenInstance) =>
  {
    return tokensInstancesListTablePropsHandlers.filterHandlers.filterTokenInstance(token)
  },
  [ accountAddress,
    tokensInstancesListTablePropsHandlers.filterStates.name, tokensInstancesListTablePropsHandlers.filterStates.balanceGt0, tokensInstancesListTablePropsHandlers.filterStates.balance, tokensInstancesListTablePropsHandlers.filterStates.address,
    // tokenInstanceFilterParams.name, tokenInstanceFilterParams.balanceGt0, tokenInstanceFilterParams.balance, tokenInstanceFilterParams.address,
    tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenDisplayId, tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenName, tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenBalance,
    // sortOrderParams.displayId, sortOrderParams.tokenName, sortOrderParams.tokenBalance,
  ]
  );
  // ---

  const sortTokensInstancesCB = useCallback( (a:TTokenInstance, b:TTokenInstance) =>
  {
    return tokensInstancesListTablePropsHandlers.sortHandlers.sortTokensInstances(a,b)
  },
  [ accountAddress,
    tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenDisplayId, tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenName, tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenBalance,
    // sortOrderParams.displayId, sortOrderParams.tokenName, sortOrderParams.tokenBalance,
    tokensInstancesListTablePropsHandlers.filterStates.name, tokensInstancesListTablePropsHandlers.filterStates.balanceGt0, tokensInstancesListTablePropsHandlers.filterStates.balance, tokensInstancesListTablePropsHandlers.filterStates.address,
    // tokenInstanceFilterParams.name, tokenInstanceFilterParams.balanceGt0, tokenInstanceFilterParams.balance, tokenInstanceFilterParams.address,
  ]
);

  // ----------------------------

  return (
    <>
      {
        tokensInstances?.filter(filterTokenInstanceCB).sort(sortTokensInstancesCB).map( (tokenInstance:TTokenInstance/* , index:number */) => {
          const key = accountAddress+'-'+tokenInstance.address;
          // console.debug(`TokenInstanceListFiltered.tsx render realTokenInstance key:${key}`);
          return (
            <tr className="min-w-full even:bg-base-300 odd:bg-base-200 hover:bg-base-100"
              key={key}
            >
              <TokenInstance
                tokenInstance={tokenInstance}
                accountAddress={accountAddress}
                // changeCheckboxStatus={changeCheckboxStatus}
                changeCheckboxStatus={tokensInstancesListTablePropsHandlers.selectHandlers.changeCheckboxStatus}
                targetAddress={targetAddress}
                editable={true}
              />
            </tr>
          )
        })
      }
    </>
  )

}

// ----------------------------

export default TokenInstanceListFiltered;