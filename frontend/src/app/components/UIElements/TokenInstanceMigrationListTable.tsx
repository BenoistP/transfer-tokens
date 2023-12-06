// React
import { useMemo } from 'react'
// Components
import TokenInstanceMigrationList from '@UIElements/TokenInstanceMigrationList'
import SortIcon from '@UIElements/SortIcon'
// Utils
import { shortenAddress } from '@App/js/utils/blockchainUtils'
// Icons
import { ExclamationCircleIcon } from '@heroicons/react/24/solid'
// Translation
import { useTranslation } from 'react-i18next'
// Styles
import { clsIconStatusSize, clsTextNormal, clsTextSemibold } from '@uiconsts/twDaisyUiStyles'

export default function TokenInstanceMigrationListTable({
	tokensInstances,
	accountAddress,
	targetAddress,
	tokensInstancesListTablePropsHandlers,
}: ITokenInstancesMigrationListTableProps): JSX.Element {
	const { t } = useTranslation()

	const TokenInstanceMigrationListMemo = useMemo(
		() => (
			<TokenInstanceMigrationList
				tokensInstances={tokensInstances}
				accountAddress={accountAddress}
				targetAddress={targetAddress}
				sortTokensInstances={tokensInstancesListTablePropsHandlers.sortHandlers.sortTokensInstances}
			/>
		),
		[
			tokensInstances,
			accountAddress,
			targetAddress,
			tokensInstancesListTablePropsHandlers.sortHandlers.sortTokensInstances,
		],
	)

	return (
		<div className="w-full p-1">
			<div className="min-w-full rounded-lg my-1 transition-all" id="currenttop">
				{tokensInstances?.length ? (
					<table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content">
						<thead className="min-w-full text-neutral-content text-left">
							<tr className={"bg-neutral "+clsTextSemibold}>
								<th className="p-2 font-medium justify-center flex-none">
									<div className="flex">
										<SortIcon
											sortOrder={tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenDisplayId}
											changeSortFnCb={tokensInstancesListTablePropsHandlers.sortHandlers.sortByTokenDisplayId}
										/>
										{t('moveTokens.stepAny.tokensTable.results.titles.tokenId')}
									</div>
								</th>
								<th className="p-2 font-medium w-96 flex">
									<div className="flex justify-left">
										<SortIcon
											sortOrder={tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenName}
											changeSortFnCb={tokensInstancesListTablePropsHandlers.sortHandlers.sortByTokenName}
										/>
										{t('moveTokens.stepAny.tokensTable.results.titles.tokenName')}
									</div>
								</th>
								<th className="p-2 font-medium flex-none">
									<div className="flex justify-end grow-0">
										<SortIcon
											sortOrder={tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenBalance}
											changeSortFnCb={tokensInstancesListTablePropsHandlers.sortHandlers.sortByTokenBalance}
										/>
										{t('moveTokens.stepAny.tokensTable.results.titles.sourceTokenBalance')}
									</div>
								</th>
								<th className="p-2 font-medium flex-none">
									{t('moveTokens.stepAny.tokensTable.results.titles.tokenAmount')}
								</th>
								<th className="p-2 font-medium flex-none">
									{t('moveTokens.stepAny.tokensTable.results.titles.tokenInfo')}
								</th>
								{targetAddress && (
									<th className="p-2 font-medium whitespace-nowrap text-ellipsis flex-none">
										<div
											className={'tooltip tooltip-bottom pl-1 text-neutral-content tooltip-info'}
											data-tip={targetAddress}>
											{t('moveTokens.stepAny.tokensTable.results.titles.targetTokenBalance') +
												' ' +
												shortenAddress(targetAddress)}
										</div>
									</th>
								)}
							</tr>
						</thead>
						<tbody className={"min-w-full mt-2 "+clsTextNormal}>{TokenInstanceMigrationListMemo}</tbody>
					</table>
				) : (
					<div className="flex justify-center font-semibold pt-2 text-md sm:text-base md:text-xl text-warning pb-2">
						<div className="pt-0">
							<ExclamationCircleIcon className={clsIconStatusSize} />
						</div>
						<div className="pt-0 pr-3">{t('moveTokens.stepThree.tokensMigrationListTable.noTokens')}</div>
					</div>
				)}
			</div>
		</div>
	)
}