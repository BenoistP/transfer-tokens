// React

// Components
import { TokenInstance } from "@Components/TokenInstance";

// ----------------------------

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
          const key = accountAddress+'-'+tokenInstance.address; // TODO: use selectID ?
          return (
            <tr className="min-w-full even:bg-base-300 odd:bg-base-200 hover:bg-base-100"
              key={key}
            >
              <TokenInstance
                tokenInstance={tokenInstance}
                accountAddress={accountAddress}
                targetAddress={targetAddress}
                enableEditable={false}
                updateCheckboxStatus={null}
                updateTransferAmount={null}
                updateTransferAmountLock={null}
                showTransferAmountReadOnly={false}
              />
            </tr>
          )
        })
      }
    </>
  )

}

export default TokenInstanceList;