// React
import { useCallback } from 'react'

// Components
import TokenInstance from '@Components/TokenInstance'

export default function TokenInstanceListFiltered({
	tokensInstances,
	accountAddress,
	targetAddress,
	tokensInstancesListTablePropsHandlers,
	enableEditable,
}: ITokenListFilteredProps) {
	const filterTokenInstanceCB = useCallback(
		(token: TTokenInstance) => tokensInstancesListTablePropsHandlers.filterHandlers.filterTokenInstance(token),
		[tokensInstancesListTablePropsHandlers.filterHandlers],
	)

	const sortTokensInstancesCB = useCallback(
		(a: TTokenInstance, b: TTokenInstance) =>
			tokensInstancesListTablePropsHandlers.sortHandlers.sortTokensInstances(a, b),
		[tokensInstancesListTablePropsHandlers.sortHandlers],
	)

	return (
		<>
			{tokensInstances
				?.filter(filterTokenInstanceCB)
				.sort(sortTokensInstancesCB)
				.map((tokenInstance: TTokenInstance) => {
					return (
						<tr className="min-w-full even:bg-base-300 odd:bg-base-200 hover:bg-base-100" key={tokenInstance.selectID}>
							<TokenInstance
								tokenInstance={tokenInstance}
								accountAddress={accountAddress}
								updateCheckboxStatus={tokensInstancesListTablePropsHandlers.updateHandlers.updateCheckboxStatus}
								updateTransferAmount={tokensInstancesListTablePropsHandlers.updateHandlers.updateTransferAmount}
								updateTransferAmountLock={tokensInstancesListTablePropsHandlers.updateHandlers.updateTransferAmountLock}
								targetAddress={targetAddress}
								enableEditable={enableEditable}
								showTransferAmountReadOnly={false}
							/>
						</tr>
					)
				})}
		</>
	)
}
