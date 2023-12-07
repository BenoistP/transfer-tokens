// React
import { useEffect, useCallback, useState } from 'react'
// Components
import TokenInstanceEditableAmount from '@UIElements/TokenInstanceEditableAmount'
// Consts & Enums
import { ERC20_DECIMALS_DEFAULT, SHORT_DISPLAY_DECIMAL_COUNT } from '@uiconsts/misc'
import { ETokenTransferState } from '@jsconsts/enums'
// Translation
import { useTranslation } from 'react-i18next'
// Styles
import { clsTextNormal, clsTextLight, clsIconMedium } from "@uiconsts/twDaisyUiStyles";
// Icons
import {
	NoSymbolIcon,
	MinusSmallIcon,
	CheckCircleIcon,
	ExclamationCircleIcon,
	StopCircleIcon,
	ArrowLeftOnRectangleIcon as ArrowReceive,
	ArrowRightOnRectangleIcon as ArrowSend,
	Cog8ToothIcon as CogToothProcessing,
} from '@heroicons/react/24/solid'

export default function TokenInstance({
	tokenInstance,
	accountAddress,
	targetAddress,
	updateCheckboxStatus,
	updateTransferAmount,
	updateTransferAmountLock,
	enableEditable,
	showTransferAmountReadOnly,
}: ITokenProps): JSX.Element {

	const { t } = useTranslation()

	const accountADDRESS = accountAddress ? accountAddress.toUpperCase() : ''
	const targetADDRESS = targetAddress.toUpperCase()

	const [name, setname] = useState<string>('')
	const [symbol, setsymbol] = useState<string>('')

	const [decimals, setdecimals] = useState<bigint>(BigInt(tokenInstance.decimals || ERC20_DECIMALS_DEFAULT)) as [
		bigint,
		(balance: bigint) => void,
	]

	const [fromIsRoundedDisplayAmount, setfromIsRoundedDisplayAmount] = useState<boolean>(false)
	const [fromShortBalanceString, setfromShortBalanceString] = useState('') as [string, (balance: string) => void]
	const [fromLongBalanceString, setfromLongBalanceString] = useState('') as [string, (balance: string) => void]

	const [isRoundedTargetDisplayAmount, setisRoundedTargetDisplayAmount] = useState<boolean>(false)
	const [shortTargetBalanceString, setshortTargetBalanceString] = useState('') as [string, (balance: string) => void]
	const [longTargetBalanceString, setlongTargetBalanceString] = useState('') as [string, (balance: string) => void]

	const [isSelected, setIsSelected] = useState<boolean>(false)
	const [isCheckboxDisabled, setisCheckboxDisabled] = useState<boolean>(true)

	const canTransferFrom = tokenInstance.userData[accountADDRESS as any]?.canTransfer
	const canTransferTo = tokenInstance.userData[targetADDRESS as any]?.canTransfer

	const balanceFrom = tokenInstance.userData[accountADDRESS as any]?.balance || 0n
	const balanceTo = tokenInstance.userData[targetADDRESS as any]?.balance || 0n

	const LONG_BALANCE_STRING_DECIMALS = '.' + '0'.repeat(Number(decimals))
	const LONG_BALANCE_STRING_ZERO = '0' + LONG_BALANCE_STRING_DECIMALS
	const DECIMALS_MULTIPLIER = 10n ** decimals

	// Styles
	const clsTextPaddingLeft = 'pl-2 '
	const clsText = clsTextPaddingLeft + (balanceFrom && balanceFrom.valueOf() > 0n ? clsTextNormal : clsTextLight)
	const clsTooltipLeft = 'tooltip tooltip-left ' + clsTextNormal

	/**
	 * Balances display computations
	 */
	const updateBalance = useCallback(
		(_balance: bigint,
			_setLongBalanceString: (balance: string) => void,
			_setShortBalanceString: (balance: string) => void,
			_setIsRoundedDisplayAmount: React.Dispatch<React.SetStateAction<boolean>>) => {
			try {
				if (_balance) {
					const balanceValue = _balance.valueOf()
					const intValue = balanceValue / DECIMALS_MULTIPLIER
					const decimalValue = balanceValue - intValue * DECIMALS_MULTIPLIER
					if (decimalValue > 0) {
						// exact decimals display
						const longDecimalDisplayPadded = decimalValue.toString().padStart(Number(decimals), '0')
						const zeroDecimalToFixed = Number('0.' + longDecimalDisplayPadded).toFixed(SHORT_DISPLAY_DECIMAL_COUNT)
						const shortDecimalDisplay = zeroDecimalToFixed.substring(2)
						const roundUpShortDisplay = zeroDecimalToFixed.substring(0, 2) == '1.'
						const longBalanceString = intValue + '.' + longDecimalDisplayPadded
						const shortBalanceString = `${roundUpShortDisplay ? intValue + 1n : intValue}.${shortDecimalDisplay}`
						_setLongBalanceString(longBalanceString)
						_setShortBalanceString(shortBalanceString)
						if (
							roundUpShortDisplay ||
							!longBalanceString.startsWith(shortBalanceString) ||
							!longBalanceString.substring(shortBalanceString.length).match(/^0+$/)
						) {
							_setIsRoundedDisplayAmount(true)
						}
					} else {
						_setLongBalanceString(intValue.toString() + LONG_BALANCE_STRING_DECIMALS)
						_setShortBalanceString(intValue.toString())
					}
				} else if (_balance == 0n) {
					_setLongBalanceString(LONG_BALANCE_STRING_ZERO)
					_setShortBalanceString('0')
				}
			} catch (error) {
				console.error(`TokenInstance.tsx updateBalance error=${error}`)
			}
		},
		[LONG_BALANCE_STRING_DECIMALS, LONG_BALANCE_STRING_ZERO, DECIMALS_MULTIPLIER, decimals],
	)

	/**
	 * Update checkbox status on transfer ability change
	 */
	const unSelect = useCallback(() => {
		balanceFrom &&
			tokenInstance.selected &&
			canTransferTo &&
			updateCheckboxStatus &&
			updateCheckboxStatus(tokenInstance.selectID, { checked: false })
	}, [canTransferTo, balanceFrom, updateCheckboxStatus, tokenInstance.selectID, tokenInstance.selected])

	/**
	 * Update checkbox status on transfer amount change
	 */
	const handleCheckboxClick = useCallback(() => {
		balanceFrom &&
			canTransferTo &&
			updateCheckboxStatus &&
			updateCheckboxStatus(tokenInstance.selectID)
	}, [tokenInstance.selectID, canTransferTo, balanceFrom, updateCheckboxStatus])

	/**
	 * Name update
	 */
	useEffect(() => {
		if (tokenInstance.name) setname(tokenInstance.name)
	}, [tokenInstance.name])

	/**
	 * Symbol update
	 */
	useEffect(() => {
		if (tokenInstance.symbol) setsymbol(tokenInstance.symbol)
	}, [tokenInstance.symbol])

	/**
	 * Decimals update
	 */
	useEffect(() => {
		setdecimals(BigInt(tokenInstance.decimals || ERC20_DECIMALS_DEFAULT))
	}, [tokenInstance.decimals])

	/**
	 * trigger connected address balance computations for display
	 */
	useEffect(() => {
		updateBalance(balanceFrom, setfromLongBalanceString, setfromShortBalanceString, setfromIsRoundedDisplayAmount)
	}, [balanceFrom, setfromLongBalanceString, updateBalance])

	/**
	 * trigger target balance computations for display
	 */
	useEffect(() => {
		updateBalance(balanceTo, setlongTargetBalanceString, setshortTargetBalanceString, setisRoundedTargetDisplayAmount)
	}, [balanceTo, updateBalance])

	/**
	 * isSelected
	 */
	useEffect(() => {
		if (accountADDRESS && tokenInstance.selected) {
			setIsSelected(true)
		} else {
			setIsSelected(false)
		}
	}, [tokenInstance.selected, accountADDRESS])

	/**
	 * isCheckboxDisabled
	 */
	useEffect(() => {
		if (
			tokenInstance.selectable &&
			canTransferFrom &&
			canTransferTo &&
			balanceFrom?.valueOf() > 0n &&
			tokenInstance.transferAmount?.valueOf() > 0n
		) {
			setisCheckboxDisabled(false)
		} else {
			setisCheckboxDisabled(true)
		}
	},
		[canTransferFrom, canTransferTo, tokenInstance.selectable, tokenInstance.transferAmount, balanceFrom]
	)

	return (
		<>
			<td className={clsTextPaddingLeft + 'w-8 text-center font-thin'}>{tokenInstance.displayId}</td>
			<td className={clsText + ' text-ellipsis min-w-full '}>{name ? name : symbol ? symbol : <Loading />}</td>
			<td className={clsText + ' text-right pr-2'}>
				{fromLongBalanceString ? (
					<div className="tooltip tooltip-info" data-tip={fromLongBalanceString}>
						<p className={fromIsRoundedDisplayAmount ? 'italic font-medium' : ''}>{fromShortBalanceString}</p>
					</div>
				) : (
					<Loading />
				)}
			</td>
			{enableEditable ? (
				<td className="">
					{canTransferTo && canTransferFrom && updateCheckboxStatus ? (
						<input
							type="checkbox"
							className="checkbox checkbox-xs sm:checkbox-md md:checkbox-md mt-1 "
							checked={isSelected}
							onChange={() => handleCheckboxClick()}
							disabled={isCheckboxDisabled}
						/>
					) : (
						<input
							type="checkbox"
							className="checkbox checkbox-xs sm:checkbox-md md:checkbox-md mt-1 "
							checked={isSelected}
							disabled={true}
						/>
					)}
				</td>
			) : null}
			{enableEditable ? (
				<td className="p-1 ">
					{canTransferTo ? (
						<TokenInstanceEditableAmount
							selectable={tokenInstance.selectable}
							readonly={false}
							balance={balanceFrom && balanceFrom.valueOf() ? balanceFrom.valueOf() : 0n}
							amount={tokenInstance.transferAmount && tokenInstance.transferAmount.valueOf() ? tokenInstance.transferAmount.valueOf() : 0n}
							amountLock={tokenInstance.lockTransferAmount}
							selectID={tokenInstance.selectID}
							updateTransferAmount={updateTransferAmount}
							updateTransferAmountLock={updateTransferAmountLock}
							decimals={Number(decimals)}
							unSelect={unSelect}
						/>
					) : (
						<div className="flex justify-center text-neutral">
							<MinusSmallIcon className={clsIconMedium + ' fill-current'} />
						</div>
					)}
				</td>
			) : showTransferAmountReadOnly ? (
				<td className="p-1 ">
					<TokenInstanceEditableAmount
						selectable={false}
						readonly={true}
						balance={balanceFrom && balanceFrom.valueOf() ? balanceFrom.valueOf() : 0n}
						amount={tokenInstance.transferState.transferAmount && tokenInstance.transferState.transferAmount.valueOf() ? tokenInstance.transferState.transferAmount.valueOf() : 0n}
						amountLock={tokenInstance.lockTransferAmount}
						selectID={tokenInstance.selectID}
						updateTransferAmount={updateTransferAmount}
						updateTransferAmountLock={updateTransferAmountLock}
						decimals={Number(decimals)}
						unSelect={unSelect}
					/>
				</td>
			) : null}
			<td className="min-h-full">
				<div className="flex ml-1 justify-start">
					{(tokenInstance.symbol || tokenInstance.address) && (
						<div
							className={clsTooltipLeft + 'tooltip-info text-base-content tracking-tight'}
							data-tip={tokenInstance.symbol + '\n' + tokenInstance.address}>
							<span className="badge badge-ghost badge-sm bg-neutral text-neutral-content border border-neutral-content">
								{t('moveTokens.stepAny.token.details')}
							</span>
						</div>
					)}
					{canTransferFrom ? (
						<div
							className={clsTooltipLeft + 'pl-1 text-info tooltip-info'}
							data-tip={t(
								canTransferFrom
									? 'moveTokens.stepAny.token.canTransferFrom'
									: 'moveTokens.stepAny.token.noTransferFrom',
							)}>
							<ArrowSend className={clsIconMedium + ' fill-current'} />
						</div>
					) : (
						<div
							className={clsTooltipLeft + 'pl-1 text-warning tooltip-warning'}
							data-tip={t(
								canTransferFrom
									? 'moveTokens.stepAny.token.canTransferFrom'
									: 'moveTokens.stepAny.token.noTransferFrom',
							)}>
							<NoSymbolIcon className={clsIconMedium + ' fill-current'} />
						</div>
					)}
					{!targetADDRESS ? null : canTransferTo ? (
						<div
							className={clsTooltipLeft + 'pl-1 text-info tooltip-info'}
							data-tip={t('moveTokens.stepAny.token.canTransferTo')}>
							<ArrowReceive className={clsIconMedium + ' fill-current scale-x-[-1]'} />
						</div>
					) : (
						<div
							className={clsTooltipLeft + 'pl-1 text-warning tooltip-warning'}
							data-tip={t('moveTokens.stepAny.token.noTransferTo')}>
							<NoSymbolIcon className={clsIconMedium + ' fill-current'} />
						</div>
					)}
					{(tokenInstance.transferState.transfer == ETokenTransferState.processed ||
						tokenInstance.transferState.transfer == ETokenTransferState.previous_processed) && (
							<div
								className={clsTooltipLeft + 'pl-1 text-info tooltip-success'}
								data-tip={t('moveTokens.stepAny.token.transfer.success')}>
								<CheckCircleIcon
									className={
										clsIconMedium + ' fill-success' + (tokenInstance.transferState.transfer > 10 ? ' opacity-50' : '')
									}
								/>
							</div>
						)}
					{tokenInstance.transferState.transfer == ETokenTransferState.skipped && (
						<div className={clsTooltipLeft + 'pl-1  '} data-tip={t('moveTokens.stepAny.token.transfer.skipped')}>
							<StopCircleIcon
								className={clsIconMedium + (tokenInstance.transferState.transfer > 10 ? ' opacity-50' : '')}
							/>
						</div>
					)}
					{tokenInstance.transferState.transfer == ETokenTransferState.error && (
						<div
							className={clsTooltipLeft + 'pl-1 text-info tooltip-error'}
							data-tip={t('moveTokens.stepAny.token.transfer.error')}>
							<ExclamationCircleIcon
								className={
									clsIconMedium + ' fill-error' + (tokenInstance.transferState.transfer > 10 ? ' opacity-50' : '')
								}
							/>
						</div>
					)}
					{tokenInstance.transferState.transfer == ETokenTransferState.processing && (
						<div
							className={clsTooltipLeft + 'pl-1 text-info tooltip-info'}
							data-tip={t('moveTokens.stepAny.token.transfer.processing')}>
							<CogToothProcessing
								className={
									clsIconMedium +
									' animate-spin fill-info' +
									(tokenInstance.transferState.transfer > 10 ? ' opacity-50' : '')
								}
							/>
						</div>
					)}
				</div>
			</td>
			{targetADDRESS && (
				<td className="text-right pr-2 text-base-content">
					<div className="tooltip tooltip-left tooltip-info opacity-80" data-tip={longTargetBalanceString}>
						<p className={isRoundedTargetDisplayAmount ? 'italic font-medium' : ''}>{shortTargetBalanceString}</p>
					</div>
				</td>
			)}
		</>
	)
}

const Loading = () => {
	return (
		<>
			<span className="inline-flex items-center gap-px">
				<span className="animate-blink mx-px h-0.5 w-0.5 sm:h-1 sm:w-1 md:h-1.5 md:w-1.5 rounded-full bg-neutral"></span>
				<span className="animate-blink animation-delay-200 mx-px h-0.5 w-0.5 sm:h-1 sm:w-1 md:h-1.5 md:w-1.5 rounded-full bg-neutral"></span>
				<span className="animate-blink animation-delay-[400ms] mx-px h-0.5 w-0.5 sm:h-1 sm:w-1 md:h-1.5 md:w-1.5 rounded-full bg-neutral"></span>
			</span>
		</>
	)
}