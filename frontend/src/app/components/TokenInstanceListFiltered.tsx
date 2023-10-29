// React
import { useCallback } from "react";

// Components
import { TokenInstance } from "@Components/TokenInstance";

// ----------------------------

const TokenInstanceListFiltered = ( {
  tokensInstances,
  // chainId,
  accountAddress,
  targetAddress,
  tokensInstancesListTablePropsHandlers,
 }: ITokenListFilteredProps ) => {

  // console.debug(`TokenInstanceListFiltered.tsx render accountAddress: ${accountAddress}`);

  // ---

  const filterTokenInstanceCB = useCallback( (token:TTokenInstance) =>
  {
    return tokensInstancesListTablePropsHandlers.filterHandlers.filterTokenInstance(token)
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [ accountAddress,
    tokensInstancesListTablePropsHandlers.filterStates.name, tokensInstancesListTablePropsHandlers.filterStates.balanceGt0, tokensInstancesListTablePropsHandlers.filterStates.balance, tokensInstancesListTablePropsHandlers.filterStates.address,
    tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenDisplayId, tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenName, tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenBalance,
  ]
  );
  // ---

  const sortTokensInstancesCB = useCallback( (a:TTokenInstance, b:TTokenInstance) =>
  {
    return tokensInstancesListTablePropsHandlers.sortHandlers.sortTokensInstances(a,b)
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [ accountAddress,
    tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenDisplayId, tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenName, tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenBalance,
    tokensInstancesListTablePropsHandlers.filterStates.name, tokensInstancesListTablePropsHandlers.filterStates.balanceGt0, tokensInstancesListTablePropsHandlers.filterStates.balance, tokensInstancesListTablePropsHandlers.filterStates.address,
  ]
);

  // ----------------------------

  return (
    <>
      {
        tokensInstances?.filter(filterTokenInstanceCB).sort(sortTokensInstancesCB).map( (tokenInstance:TTokenInstance) => {
          const key = accountAddress+'-'+tokenInstance.address;
          // console.debug(`TokenInstanceListFiltered.tsx render realTokenInstance key:${key}`);
          return (
            <tr className="min-w-full even:bg-base-300 odd:bg-base-200 hover:bg-base-100"
              key={key}
            >
              <TokenInstance
                tokenInstance={tokenInstance}
                accountAddress={accountAddress}
                changeCheckboxStatus={tokensInstancesListTablePropsHandlers.selectHandlers.changeCheckboxStatus}
                targetAddress={targetAddress}
                enableEditable={true}
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