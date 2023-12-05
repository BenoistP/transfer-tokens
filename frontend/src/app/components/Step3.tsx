// React
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Components
import TokenInstanceMigrationListTable from "@UIElements/TokenInstanceMigrationListTable"
// Transactions & ABIs
import { erc20ABI, prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core'
import { WaitForTransactionReceiptTimeoutError, TransactionNotFoundError } from 'viem';
// Translation
import { useTranslation } from "react-i18next";
// Toasts
import toast from 'react-hot-toast'
// Router
import { Link } from "react-router-dom";
// Consts & Enums
import {
  DEFAULT_ETHEREUM_EXPLORER_BASE_URI, DEFAULT_ETHEREUM_EXPLORER_TX_URI,
  DEFAULT_GNOSIS_EXPLORER_BASE_URI, DEFAULT_GNOSIS_EXPLORER_TX_URI,
  TOAST_DURATION_LONG, TOAST_DURATION_MEDIUM, DURATION_TX_TIMEOUT,
  USER_REJECT_TX_REGEXP, REFRESH_BALANCE_DELAY_AFTER_TRANSFER
} from "@App/js/constants/ui/uiConsts";
import { NULL_ADDRESS } from "@App/js/constants/addresses";
import { ERC20_DECIMALS_DEFAULT, SHORT_DISPLAY_DECIMAL_COUNT } from "@App/js/constants/ui/misc";
import { ETHEREUM_CHAIN_ID, GNOSIS_XDAI_CHAIN_ID } from "@App/js/constants/chainIds";
import { TOAST_OPACITY_ALPHA } from "@App/js/constants/ui/twDaisyUiStyles";
import { ETokenTransferState } from "@jsconsts/enums";
// Utils
import { shortenAddress } from "@App/js/utils/blockchainUtils";
// Icons
import { LinkIcon, XCircleIcon } from '@heroicons/react/24/solid'

export default function Step3({
  chainId,
  tokensInstances,
  setNextDisabled,
  setShowProgressBar,
  accountAddress,
  targetAddress,
  tokensInstancesListTablePropsHandlers,
  setmigrationState,
  updateTokenOnTransferProcessed,
  updateTokenInstanceTransferState}: IStep3Props): JSX.Element {

  const { t } = useTranslation()
  const [tokensInstancesToMigrate, settokensInstancesToMigrate] = useState<TTokensInstances>(null)

  // Transfers commands
  const [pauseTransfers, setpauseTransfers] = useState(false)
  const [stopTransfers, setstopTransfers] = useState(false)
  const paused = useRef(false)
  const stopped = useRef(false)
  // Transfer loop lock
  const currentlyProcessingRef = useRef(false)


  const initialMigrationState = useMemo(() => {
    return { totalItemsCount: 0, errorItemsCount: 0, skippedItemsCount: 0, successItemsCount: 0, paused: false, stopped: false }
  }, [])
  const migrationState = useRef(initialMigrationState)

  /**
   * Returns explorer uri
   */
  const explorerUri = useMemo((): string => {
    if (chainId == ETHEREUM_CHAIN_ID) {
      return (import.meta.env.PUBLIC_ETHEREUM_EXPLORER_BASE_URI || DEFAULT_ETHEREUM_EXPLORER_BASE_URI) + (import.meta.env.PUBLIC_ETHEREUM_EXPLORER_TX_URI || DEFAULT_ETHEREUM_EXPLORER_TX_URI)
    }
    if (chainId == GNOSIS_XDAI_CHAIN_ID) {
      const res = (import.meta.env.PUBLIC_GNOSIS_EXPLORER_BASE_URI || DEFAULT_GNOSIS_EXPLORER_BASE_URI) + (import.meta.env.PUBLIC_GNOSIS_EXPLORER_TX_URI || DEFAULT_GNOSIS_EXPLORER_TX_URI)
      return res
    }
    return ""
  },
    [chainId]
  )

  /**
   * Returns transaction uri
   * @param txHash
   * @returns string uri
   */
  const getTxUri = useCallback(
    (txHash: TTxHash) =>
      `${explorerUri}${txHash}`
    , [explorerUri]
  )

  /**
   * Returns readable amount strings
   * @param _amount
   * @param _decimals
   * @returns
   * @example
   * getAmountStrings(1000000000000000n, 18) // {long: "0.001", short: "0.001", shortDisplayIsZero: false}
   * getAmountStrings(1000000000000000n, 6) // {long: "1000.0", short: "1000", shortDisplayIsZero: false}
   * getAmountStrings(1000000000000000n, 0) // {long: "1000000000000000.0", short: "1000000000000000", shortDisplayIsZero: false}
   * getAmountStrings(1000000000000000n, 18) // {long: "0.001", short: "0.001", shortDisplayIsZero: false}
   * 
   */
  const getAmountStrings = useCallback((_amount: TTokenAmount, _decimals: TTokenDecimals): TTokensAmountStrings => {
    let tokensAmountStrings = { long: "0.0", short: "0", shortDisplayIsZero: false }
    try {
      if (_amount) {
        const decimals = BigInt((_decimals || ERC20_DECIMALS_DEFAULT))
        const amountValue = _amount.valueOf();
        const intValue = (amountValue / (10n ** decimals));
        const decimalValue = amountValue - intValue * (10n ** decimals);
        if (decimalValue > 0) {
          // exact decimals display eg. decimalValue = "1000000000000000n" (= 1e15n = 1e-3 = 0.001)
          const longDecimalDisplayPadded = decimalValue.toString().padStart(Number(decimals), "0"); // longDecimalDisplayPadded = "001000000000000000"
          const longDecimalDisplay = longDecimalDisplayPadded.replace(/0+$/, "") // remove ending zeros: longDecimalDisplay = "001"
          const zeroDecimalToFixed = Number("0." + longDecimalDisplay).toFixed(SHORT_DISPLAY_DECIMAL_COUNT)
          const shortDecimalDisplay = zeroDecimalToFixed.substring(2);
          const roundUpShortDisplay = (zeroDecimalToFixed.substring(0, 2) == "1.")
          const longBalanceString = intValue + "." + longDecimalDisplay;
          const shortAmountString = `${(roundUpShortDisplay ? intValue + 1n : intValue)}.${shortDecimalDisplay}`
          const shortAmountIsZero = (shortAmountString.match(/^0\.0*$/) != null)
          tokensAmountStrings = { long: longBalanceString, short: shortAmountString, shortDisplayIsZero: shortAmountIsZero }
        } else {
          tokensAmountStrings = { long: `${intValue}.0`, short: `${intValue}`, shortDisplayIsZero: false }
        }
      }
    } catch (error) {
      console.error(`getAmountShortString error: ${error}`);
      tokensAmountStrings = { long: "?", short: "?", shortDisplayIsZero: false }
    }
    return tokensAmountStrings; // RETURN
  },
    [] // No dependencies
  )

  /**
   * Pause transfers, update migrationState
   */
  const handlePauseTransfers = () => {
    paused.current = !paused.current
    migrationState.current = { ...migrationState.current, paused: true }
    setpauseTransfers(paused.current)
    setmigrationState(migrationState.current)
  }

  /**
   * Stop transfers, update migrationState
   */
  const handleStopTransfers = () => {
    stopped.current = !stopped.current
    migrationState.current = { ...migrationState.current, stopped: true }
    setstopTransfers(stopped.current)
    setmigrationState(migrationState.current)
  }

  /**
   * Returns a promise which resolves when transaction is confirmed
   * @param _txResult
   * @returns
   */
  const getWaitForTransactionPromise = (_txResult: TTxResult): Promise<TTxResult> => {
    return new Promise((resolve, reject) => {
      waitForTransaction({
        confirmations: 1,
        hash: _txResult.hash,
        timeout: DURATION_TX_TIMEOUT, // 0 = forever
      }).then((transactionData) => {
        _txResult.hash = transactionData.transactionHash;
        _txResult.success = true;
        resolve(_txResult)
      })
        .catch((error) => {
          if (error instanceof WaitForTransactionReceiptTimeoutError) {
            _txResult.timeout = true
          } else if (error instanceof TransactionNotFoundError) {
            _txResult.notFound = true
          } else {
            _txResult.error = true
          }
          _txResult.errorMessage = error.message
          reject(_txResult)
        })
    })
  }

  /**
   * Transfer skipped toast
   * @param _tokenInstanceToTransfer
   */
  const transferSkippedToast = useCallback(
    (displayedAmount: string, _tokenInstanceToTransfer: TTokenInstance) => {
      if (_tokenInstanceToTransfer) {
        toast.custom(
          (_toast) => (
            <div className={`block alert alert-info w-auto p-2 m-0 border border-black border-dotted`}
              style={{
                opacity: _toast.visible ? TOAST_OPACITY_ALPHA : 0,
                transition: "opacity 100ms ease-in-out",
              }}
            >
              <div className="grid grid-cols-8 gap-0 m-0 p-0">
                <div className="-p-0 m-0"><button onClick={() => toast.dismiss(_toast.id)}><XCircleIcon className={'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2'} /></button></div>
                <div className="p-0 pl-1 pt-1 m-0 col-span-7">{`${t("moveTokens.stepThree.transfer.skipped")}: ${displayedAmount} ${_tokenInstanceToTransfer.name}`}</div>
              </div>
            </div>
          ),
          { duration: TOAST_DURATION_MEDIUM }
        )
      }
    },
    [t]
  )

  /**
   * Transfer success toast
   * @param txResult
   * @param displayedAmount
   * @param _tokenInstanceToTransfer
   * @param _destinationAddress
   */
  const transferSuccessToast = useCallback(
    (txResult: TTxResult, displayedAmount: string, _tokenInstanceToTransfer: TTokenInstance, _destinationAddress: TAddressString) => {
      return (
        <div>
          <div className="font-medium">
            {`${t("moveTokens.stepThree.transfer.confirmed")} :`}
          </div>
          <div>
            {`${displayedAmount} ${_tokenInstanceToTransfer.name} ${t("moveTokens.stepThree.transfer.to")} ${shortenAddress(_destinationAddress)}`}
          </div>
          <div className="text-success-content">
            <Link className="flex justify-end underline" to={getTxUri(txResult.hash)} target="_blank" rel="noopener noreferrer" >
              {t("moveTokens.stepThree.transfer.txHash")}<LinkIcon className="pl-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 fill-current" />
            </Link>

          </div>
        </div>
      )
    }, [getTxUri, t]
  )

  /**
   * Transfer error toast
   * @param txResult
   * @param displayedAmount
   * @param _tokenInstanceToTransfer
   * @param _destinationAddress
   */
  const transferErrorToast = useCallback(
    (txResult: TTxResult, displayedAmount: string, _tokenInstanceToTransfer: TTokenInstance, _destinationAddress: TAddressString) => {
      return (
        <div>
          <div className="font-medium">
            {`${t("moveTokens.stepThree.transfer.rejected")} :`}
          </div>
          <div>
            {`${displayedAmount} ${_tokenInstanceToTransfer.name} ${t("moveTokens.stepThree.transfer.to")} ${shortenAddress(_destinationAddress)}`}
          </div>

          <div>
            {`${t("moveTokens.stepThree.transfer.errorReason")}: ${(txResult.errorMessage ? txResult.errorMessage : "moveTokens.stepThree.transfer.errorReasonUnknown")}`}
            {txResult.notFound && <div>{t("moveTokens.stepThree.transfer.gasTooLowSuggest")}</div>}

          </div>
          <div className="text-error-content">
            <Link className="flex justify-end underline" to={getTxUri(txResult.hash)} target="_blank" rel="noopener noreferrer" >
              {t("moveTokens.stepThree.transfer.txHash")}<LinkIcon className="pl-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 fill-current" />
            </Link>
          </div>
          {`${displayedAmount} ${_tokenInstanceToTransfer.name} ${t("moveTokens.stepThree.transfer.to")} ${shortenAddress(_destinationAddress)}`}
        </div>

      )
    }, [getTxUri, t]
  )

  /**
   * Transfer token web3 call
   * @param _tokenInstanceToTransfer
   * @param _destinationAddress
   * @param _amount
   * @returns TTxResult
   * shows toasts
   */
  const callTransferToken = useCallback(
    async (_tokenInstanceToTransfer: TTokenInstance, _destinationAddress: TAddressString, _amount: TTokenAmount): Promise<TTxResult> => {
      const txResult: TTxResult = { hash: NULL_ADDRESS, success: false, timeout: false, error: false, notFound: false, errorMessage: "", userSkipped: false }
      const amountStrings = getAmountStrings(_amount, _tokenInstanceToTransfer.decimals)
      const displayedAmount = (amountStrings.shortDisplayIsZero ? amountStrings.long : amountStrings.short)
      try {

        console.info(`transfer : ${displayedAmount} (${_amount}) ${_tokenInstanceToTransfer.name} (${_tokenInstanceToTransfer.address}) to ${_destinationAddress}`) // Log transfer in console
        // Transfer
        const { request: transferRequest } = await prepareWriteContract({
          address: _tokenInstanceToTransfer.address,
          abi: erc20ABI,
          functionName: 'transfer',
          args: [_destinationAddress, _amount],
        })
        const transferRequestResult = await writeContract(transferRequest)
        const { hash: transferTxHash } = transferRequestResult
        if (transferTxHash) {
          txResult.hash = transferTxHash
          await toast.promise(
            getWaitForTransactionPromise(txResult),
            {
              loading:
                <div>
                  <div className="font-medium">
                    {`${t("moveTokens.stepThree.transfer.awaitConfirm")} :`}
                  </div>
                  <div>
                    {`${displayedAmount} ${_tokenInstanceToTransfer.name} ${t("moveTokens.stepThree.transfer.to")} ${shortenAddress(_destinationAddress)}`}
                  </div>
                  <div className="italic text-info-content">
                    <Link className="flex justify-end underline" to={getTxUri(transferTxHash)} target="_blank" rel="noopener noreferrer" >
                      {t("moveTokens.stepThree.transfer.txHash")}<LinkIcon className="pl-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 fill-current" />
                    </Link>
                  </div>
                </div>,
              success: (txResult: TTxResult) =>
                transferSuccessToast(txResult, displayedAmount, _tokenInstanceToTransfer, _destinationAddress),
              error: (txResult: TTxResult) =>
                transferErrorToast(txResult, displayedAmount, _tokenInstanceToTransfer, _destinationAddress),
            },
            {
              success:
                { duration: TOAST_DURATION_LONG },
              error:
                { duration: TOAST_DURATION_LONG },
            }
          )
        }
      } catch (error) {
        if (error instanceof Error && error.message.match(USER_REJECT_TX_REGEXP)) {
          txResult.userSkipped = true
          transferSkippedToast(displayedAmount, _tokenInstanceToTransfer)
          console.info(`transfer skipped: ${displayedAmount} (${_amount}) ${_tokenInstanceToTransfer.name} (${_tokenInstanceToTransfer.address})`)
        } else {
          console.error(`transfer error: ${error} for: ${_tokenInstanceToTransfer.name} (${_tokenInstanceToTransfer.address}) to ${_destinationAddress}`)
        }
      }
      return txResult;
    },
    [getAmountStrings, t, getTxUri, transferSuccessToast, transferErrorToast, transferSkippedToast]
  )

  /**
   * Transfer token
   * @param _tokenInstanceToTransfer
   * @param _to
   * Calls callTransferToken and updates states, balances depending on txResult
   */

  const transferToken = useCallback(
    async (_tokenInstanceToTransfer: TTokenInstance, _to: TAddressString) => {
      try {
        if (_tokenInstanceToTransfer?.transferState.transferAmount && accountAddress) {
          const txResult = await callTransferToken(_tokenInstanceToTransfer, _to, _tokenInstanceToTransfer.transferState.transferAmount)
          const state = (txResult.success ? ETokenTransferState.processed : (txResult.userSkipped ? ETokenTransferState.skipped : ETokenTransferState.error))
          // Instant transfer state update
          updateTokenInstanceTransferState(_tokenInstanceToTransfer.address, state)
          // Update balances after transfer, do not wait for event which may not be received
          updateTokenOnTransferProcessed(_tokenInstanceToTransfer, accountAddress, _to, REFRESH_BALANCE_DELAY_AFTER_TRANSFER, state)
        }
      } catch (error) {
        console.error(`transferToken ${_tokenInstanceToTransfer.address} ${_tokenInstanceToTransfer.transferState.transferAmount} ${_to} process error: ${error}`);
      }
    },
    [callTransferToken, accountAddress, updateTokenInstanceTransferState, updateTokenOnTransferProcessed]
  )

  /**
   * Transfer tokens
   * called on each update of tokensInstancesToMigrate
   */
  const transferTokens = useCallback(
    async () => {
      try {
        if (tokensInstancesToMigrate && tokensInstancesToMigrate.length && targetAddress) {
          let tokenInstanceToTransferFound: TTokenInstance | undefined;
          // if any token is processing, skip search
          if (!currentlyProcessingRef.current) {
            // Search for next token to transfer
            for (let tokenInstanceIndex = 0; ((tokenInstanceIndex < tokensInstancesToMigrate.length)); tokenInstanceIndex++) {
              while (paused.current) {
                await new Promise(r => setTimeout(r, 250)); // wait 250ms before next check
                if (!paused.current || stopped.current) break;
              }
              if (stopped.current || currentlyProcessingRef.current) break;
              tokenInstanceToTransferFound = tokensInstancesToMigrate[tokenInstanceIndex];
              if (tokenInstanceToTransferFound.transferState.transferAmount && (tokenInstanceToTransferFound.transferState.transfer == ETokenTransferState.none) // amount > 0 and not yet processed
              ) break;
            }
            try {
              // If found token is unprocessed, transfer token
              if (tokenInstanceToTransferFound && tokenInstanceToTransferFound.transferState.transfer == ETokenTransferState.none) {
                currentlyProcessingRef.current = true // lock
                updateTokenInstanceTransferState(tokenInstanceToTransferFound.address, ETokenTransferState.processing)
                await transferToken(tokenInstanceToTransferFound, targetAddress)
              }
            } catch (error) {
              console.error(`transferTokenS tokenInstanceToTransfer TRANSFER ERROR token symbol: '${tokenInstanceToTransferFound?.symbol}' token address: '${tokenInstanceToTransferFound?.address}' targetAddress: '${targetAddress}' for '${tokenInstanceToTransferFound?.transferAmount}' amount process error: ${error}`);
            }
            finally {
              currentlyProcessingRef.current = false // unlock
            }
          }
        }
      } catch (error) {
        console.error(`transferTokenS error: ${error}`);
      }
    }, [tokensInstancesToMigrate, transferToken, targetAddress, updateTokenInstanceTransferState]
  )

  /**
   * Init
   */
  useEffect(() => {
    migrationState.current = initialMigrationState
    setstopTransfers(false)
    setpauseTransfers(false)
    settokensInstancesToMigrate(null)
    setShowProgressBar(true)
    setNextDisabled(true)
  },
    [setNextDisabled, setShowProgressBar, initialMigrationState]
  )

  /**
   * Returns tokens to display
   * Only "processing" one should show
   */
  const getTokensToMigrate = useCallback((): TTokensInstances => { return tokensInstances?.filter((tokenInstance: TTokenInstance) => tokenInstance.transferState.processing) }, [tokensInstances])

  /**
   * Update migration state
   */
  useEffect(() => {
    try {
      if (tokensInstancesToMigrate && tokensInstancesToMigrate.length) {
        // Search for current migration state figures
        let errorItemsCount = 0, skippedItemsCount = 0, successItemsCount = 0, unprocessed = 0, processing = 0;
        // Update migration/transfer state
        for (let tokenInstanceIndex = 0; tokenInstanceIndex < tokensInstancesToMigrate.length; tokenInstanceIndex++) {
          switch (tokensInstancesToMigrate[tokenInstanceIndex].transferState.transfer) {
            case ETokenTransferState.error:
              errorItemsCount++;
              break;
            case ETokenTransferState.processed:
              successItemsCount++;
              break;
            case ETokenTransferState.skipped:
              skippedItemsCount++;
              break;
            case ETokenTransferState.none:
              unprocessed++;
              break;
            case ETokenTransferState.processing:
              processing++;
              break;
          }
        }
        if (processing==0 && unprocessed==0) {
          setstopTransfers(true)
          setpauseTransfers(false)
          paused.current = false
          stopped.current = true
        }
        migrationState.current = { totalItemsCount: tokensInstancesToMigrate.length, errorItemsCount, skippedItemsCount, successItemsCount, paused: paused.current, stopped: stopped.current };
        setmigrationState(migrationState.current)
      }
    } catch (error) {
      console.error(`useEffect error: ${error}`);
    }

  },
    [setmigrationState, tokensInstancesToMigrate]
  )

  /**
   * Set tokensInstancesToMigrate
   */
  useEffect(() => {
    try {
      settokensInstancesToMigrate(getTokensToMigrate())
    } catch (error) {
      console.error(`useEffect error: ${error}`);
    }
  },
    [getTokensToMigrate, settokensInstancesToMigrate, setmigrationState]
  )

  /**
   * Tokens transfers call
   * triggered on each tokensInstancesToMigrate update
   */
  useEffect(() => {
    if (tokensInstancesToMigrate && tokensInstancesToMigrate.length) {
      transferTokens()
    }
  },
    [tokensInstancesToMigrate, targetAddress, transferTokens]
  )

  return (
    <div className="w-full p-0 m-0">

      <div className="min-w-full ">
        <div className="flex justify-center mt-2 p-1 bg-base-300 rounded-lg">
          <div className="join">
            <input type="checkbox" disabled={stopped.current} className="toggle toggle-info mt-1" checked={pauseTransfers} onChange={handlePauseTransfers} />
            <label className={((pauseTransfers && !stopped.current) ? "animate-pulse text-info font-bold" : "font-semibold") + " text-sm md:text-lg lg:text-lg ml-2 mr-2"}>
              {"Pause"}
            </label>
            <button className={"btn btn-xs sm:btn-sm pl-4 " + (stopTransfers ? "btn-disabled" : "btn-warning")} onClick={handleStopTransfers}>Stop</button>
          </div>
        </div>
      </div>

      <div className="min-w-full bg-base-100 my-2">
      </div>

      <div className="w-full block p-2">
        <div className="w-full p-0 m-0">
          <TokenInstanceMigrationListTable
            tokensInstances={tokensInstancesToMigrate}
            accountAddress={accountAddress}
            targetAddress={targetAddress}
            tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
          />
        </div>
      </div>

    </div>
  );
}