import { TokenInstance } from "./TokenInstance";

// import { ErrorBoundary } from "react-error-boundary";

const TokenInstanceList = ( {
  tokensInstances,
  // chainId,
  accountAddress,
  targetAddress,
  sortTokensInstances,
 }: ITokenListProps ) => {

  // ---

  // console.debug(`TokenInstanceList.tsx render accountAddress: ${accountAddress}`);

  // ----------------------------

  return (
    <>
      {
        tokensInstances?.sort(sortTokensInstances).map( (tokenInstance:TTokenInstance/* , index:number */) => {
          const key = accountAddress+'-'+tokenInstance.address;
          // console.debug(`TokenInstanceList.tsx render realTokenInstance key:${key}`);
          return (
            <tr className="min-w-full even:bg-base-300 odd:bg-base-200 hover:bg-base-100"
              key={key}
            >
              <TokenInstance
                tokenInstance={tokenInstance}
                accountAddress={accountAddress}
                changeCheckboxStatus={null}
                // index={index+1}
                targetAddress={targetAddress}
                editable={false}
              />
            </tr>
          )
        })
      }
    </>
  )

}

export default TokenInstanceList;