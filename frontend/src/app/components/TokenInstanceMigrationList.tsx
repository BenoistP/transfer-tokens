// React

// Components
import TokenInstance from "@Components/TokenInstance";

export default function TokenInstanceMigrationList(
  { tokensInstances, accountAddress, targetAddress, sortTokensInstances, }: ITokenListProps): JSX.Element {

  return (
    <>
      {
        tokensInstances?.sort(sortTokensInstances).map((tokenInstance: TTokenInstance) => {
          return (
            <tr className="min-w-full even:bg-base-300 odd:bg-base-200 hover:bg-base-100"
              key={tokenInstance.selectID}
            >
              <TokenInstance
                tokenInstance={tokenInstance}
                accountAddress={accountAddress}
                targetAddress={targetAddress}
                enableEditable={false}
                updateCheckboxStatus={null}
                updateTransferAmount={null}
                updateTransferAmountLock={null}
                showTransferAmountReadOnly={true}
              />
            </tr>
          )
        })
      }
    </>
  )
}