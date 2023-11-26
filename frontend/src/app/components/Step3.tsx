// React
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Components
import TokenInstanceMigrationListTable from "@Components/TokenInstanceMigrationListTable"
// Transactions & ABIs
import { erc20ABI, prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core'
import {  WaitForTransactionReceiptTimeoutError, TransactionNotFoundError,
          TransactionExecutionError } from 'viem';
// Translation
import { useTranslation } from "react-i18next";
 // Toasts
 import toast from 'react-hot-toast'
 // Router
import { Link } from "react-router-dom";
// Consts & Enums
import { DEFAULT_ETHEREUM_EXPLORER_BASE_URI, DEFAULT_ETHEREUM_EXPLORER_TX_URI,
  DEFAULT_GNOSIS_EXPLORER_BASE_URI, DEFAULT_GNOSIS_EXPLORER_TX_URI,
  DURATION_LONG, DURATION_MEDIUM, DURATION_TX_TIMEOUT,
  USER_REJECT_TX_REGEXP
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

// ------------------------------

const Step3 = ( {
  chainId,
  tokensInstances,
  // settokensInstances,
  setNextDisabled,
  setShowProgressBar,
  accountAddress,
  targetAddress,
  tokensInstancesListTablePropsHandlers,
  setmigrationState,
  updateTokenOnTransferProcessed,
  updateTokenInstanceTransferState
  }: IStep3Props ) => {

  // ---

  const { t } = useTranslation()
  const [tokensInstancesToMigrate, settokensInstancesToMigrate] = useState<TTokensInstances>(null)

  // Transfers commands
  const [pauseTransfers, setpauseTransfers] = useState(false)
  const [stopTransfers, setstopTransfers] = useState(false)
  const paused = useRef(false)
  const stopped = useRef(false)
  // Transfer loop lock
  const currentlyProcessing = useRef(false)


  const initialMigrationState = useMemo( () => {
    return {totalItemsCount:0,errorItemsCount:0,skippedItemsCount:0,successItemsCount:0, paused: false, stopped: false}
  }, [])
  const migrationState = useRef(initialMigrationState)

  // ---

  const explorerUri = useMemo( ():string =>
    {
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

  // ---

  const getTxUri = useCallback( (txHash:TTxHash) => {
    return `${explorerUri}${txHash}`
  }, [explorerUri])

  // ---

  type TTokensAmountStrings = {
    long: string,
    short: string,
    shortDisplayIsZero: boolean // true if short does not contain sufficient decimals to display any value
  }

  // ---

  const getAmountStrings = useCallback( (_amount: TTokenAmount, _decimals: TTokenDecimals):TTokensAmountStrings =>
    {
      let tokensAmountStrings = {long: "0.0", short: "0", shortDisplayIsZero: false}
      try {
        if (_amount) {
          const decimals = BigInt((_decimals||ERC20_DECIMALS_DEFAULT))
          const amountValue = _amount.valueOf();
          const intValue = ( amountValue / (10n**decimals) );
          const decimalValue = amountValue - intValue * (10n**decimals);
          if (decimalValue > 0) {
            // exact decimals display
            // eg. decimalValue = "1000000000000000n" (= 1e15n = 1e-3 = 0.001)
            const longDecimalDisplayPadded = decimalValue.toString().padStart( Number(decimals) , "0"); // longDecimalDisplayPadded = "001000000000000000"
            const longDecimalDisplay = longDecimalDisplayPadded.replace(/0+$/,"") // remove ending zeros: longDecimalDisplay = "001"
            // const zeroDecimalToFixed = Number("0."+longDecimalDisplayPadded).toFixed(SHORT_DISPLAY_DECIMAL_COUNT)
            const zeroDecimalToFixed = Number("0."+longDecimalDisplay).toFixed(SHORT_DISPLAY_DECIMAL_COUNT)
            const shortDecimalDisplay = zeroDecimalToFixed.substring(2);
            const roundUpShortDisplay = (zeroDecimalToFixed.substring(0,2) =="1.")
            const longBalanceString = intValue+"."+longDecimalDisplay;
            const shortAmountString = `${(roundUpShortDisplay?intValue+1n:intValue)}.${shortDecimalDisplay}`
            const shortAmountIsZero = (shortAmountString.match(/^0\.0*$/) != null)
            tokensAmountStrings = {long: longBalanceString, short: shortAmountString, shortDisplayIsZero: shortAmountIsZero }
            // return shortAmountString
          } else {
            tokensAmountStrings = {long: `${intValue}.0`, short: `${intValue}`, shortDisplayIsZero: false }
          }
        }
      } catch (error) {
        console.error(`Steps3.tsx getAmountShortString error: ${error}`);
        tokensAmountStrings = {long: "?", short: "?", shortDisplayIsZero: false }
      }
      return tokensAmountStrings; // RETURN
    },
    [] // No dependencies
  )

  // ---

  const handlePauseTransfers = () => {
    paused.current = !paused.current
    migrationState.current = {...migrationState.current, paused: true}
    // setpauseTransfers(!pauseTransfers)
    setpauseTransfers(paused.current)
    setmigrationState( migrationState.current )
  }

  // ---

  const handleStopTransfers = () => {
    stopped.current = !stopped.current
    migrationState.current = {...migrationState.current, stopped: true}
    // setstopTransfers(!stopTransfers)
    setstopTransfers(stopped.current)
    setmigrationState( migrationState.current )
  }

  // ---

  const showToastTransferSkipped = useCallback( (_tokenInstanceToTransfer:TTokenInstance) =>
    {
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
                <div className="p-0 pl-1 pt-1 m-0 col-span-7">{`${t("moveTokens.stepThree.transfer.skipped")}: ${_tokenInstanceToTransfer.name}`}</div>
              </div>
            </div>
          ),
          { duration: DURATION_MEDIUM }
        ) // toast.custom
      }
    },
    [t]
  ) // showToastTransferSkipped

  // ---
/*
  const updateProcessedTokenInstance = useCallback( (_updatedTokenInstance: TTokenInstance) =>
    {
// console.debug(`Steps3.tsx updateProcessedTokenInstance _updatedTokenInstance=`);
// console.dir(_updatedTokenInstance);
      try {
        if (tokensInstances && tokensInstances.length && _updatedTokenInstance) {
          // Just mutate the array, replacing _updatedTokenInstance and update some values depending on connectedAddress balance
          const newTokensInstances = tokensInstances.map( (tokenInstance:TTokenInstance) => {
            if (tokenInstance.address == _updatedTokenInstance.address) {
              let {selected, transferAmount , transferAmountLock} = tokenInstance
              const {transferState} = tokenInstance
              if (_updatedTokenInstance.transferState.transfer == ETokenTransferState.processed) {
                console.debug(`Steps3.tsx updateProcessedTokenInstance _updatedTokenInstance.transferState.transfer == ETokenTransferState.PROCESSED`);
                selected = false; // UNselect
                transferAmount = 0n; // Reset transfer amount
                transferAmountLock = false; // Reset transfer amount lock
              }
              if (_updatedTokenInstance.transferState.transfer == ETokenTransferState.skipped) {
                console.debug(`Steps3.tsx updateProcessedTokenInstance _updatedTokenInstance.transferState.transfer == ETokenTransferState.SKIPPED`);
                selected = false; // UNselect
              }
              const newtokenInstance = {
                ...tokenInstance,
                selected,
                transferAmount, transferAmountLock,
                transferState
              }
// TODO: debug to remove -> ------------------------
              console.debug(`Steps3.tsx updateProcessedTokenInstance (map) _updatedTokenInstance=`);
              console.dir(_updatedTokenInstance);
              console.debug(`Steps3.tsx updateProcessedTokenInstance (map) tokenInstance=`);
              console.dir(tokenInstance);
              console.debug(`Steps3.tsx updateProcessedTokenInstance (map) newtokenInstance=`);
              console.dir(newtokenInstance);
// TODO: debug to remove <- ------------------------
              return newtokenInstance
            }
            return tokenInstance
          })
          settokensInstances(newTokensInstances)
        } // if (tokensInstances && tokensInstances.length && _updatedTokenInstance)
      } catch (error) {
        console.error(`Step3.tsx updateProcessedTokenInstance error: ${error}`);
      }
    },
    [tokensInstances, settokensInstances]
  )
*/
  // ---



  // type TToastTransferSuccess = {
  //   tokenInstanceToTransfer:TTokenInstance,
  //   transferTxHash: TTxHash,
  //   destinationAddress: TAddressString,
  // }

  // ---

  // const ToastSuccess = ( {tokenInstanceToTransfer, transferTxHash, destinationAddress}:TToastTransferSuccess) => {
  //   return (
  //   <div>
  //     <div className="font-medium">
  //       {`${t("moveTokens.stepThree.transfer.confirmed")} :`}
  //     </div>
  //     <div>
  //       {`${getAmountShortString(tokenInstanceToTransfer.transferAmount, tokenInstanceToTransfer.decimals)} ${tokenInstanceToTransfer.name} ${t("moveTokens.stepThree.transfer.to")} ${shortenAddress(destinationAddress)}`}
  //     </div>
  //     <div className="text-success-content">
  //       <Link className="flex justify-end underline" to={getTxUri(transferTxHash)} target="_blank" rel="noopener noreferrer" >
  //         {t("moveTokens.stepThree.transfer.txHash")}<LinkIcon className="pl-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 fill-current" />
  //       </Link>

  //     </div>
  //   </div>
  //   )
  // }

  // ---

  const getWaitForTransactionPromise = (_transferTxHash: TTxHash, _txResult: TTxResult):Promise<TTxResult> => {
    return new Promise( (resolve, reject) =>
    {
      waitForTransaction({
        confirmations: 1,
        hash: _transferTxHash,
        timeout: DURATION_TX_TIMEOUT, // 0 = forever
      }
      ).then( (transactionData) => {
        // TODO: debug to remove -> ------------------------
        // console.debug(`Step3.tsx: callTransferToken : waitForTransactionData.THEN (SUCCESS) (hash:${_transferTxHash}) transaction=`)
        console.dir(transactionData)
        // TODO: debug to remove <- ------------------------
        _txResult.hash = transactionData.transactionHash;
        _txResult.success = true;
        resolve(_txResult)
      }).catch( (error) => {
        if (error instanceof WaitForTransactionReceiptTimeoutError) {
          // console.debug(`Step3.tsx: callTransferToken : WaitForTransactionReceiptTimeoutError TIMEOUT`)
          _txResult.timeout = true
        }
        if (error instanceof TransactionNotFoundError) {
          // Not enough gas ?
          // TODO: debug to remove -> ------------------------
          // console.debug(`Step3.tsx: callTransferToken : TransactionNotFoundError NOT FOUND`)
          // TODO: debug to remove <- ------------------------
          // TODO : add error message
          _txResult.notFound = true
          _txResult.errorMessage = error.message
          reject(_txResult)
        }
        if (error instanceof TransactionExecutionError) {
          // Reverted ?
          // TODO: debug to remove -> ------------------------
          // console.debug(`Step3.tsx: callTransferToken : TransactionExecutionError NOT FOUND`)
          // TODO: debug to remove <- ------------------------
          // TODO : add error message
          _txResult.error = true
          _txResult.errorMessage = error.message
          reject(_txResult)
        }
        else  {
          // TODO: debug to remove -> ------------------------
          // console.debug(`Step3.tsx: callTransferToken : error:${error}`)
          // console.dir(error)
          // TODO: debug to remove <- ------------------------
          _txResult.errorMessage = error.message
          reject(_txResult)
        }
      })
    }) // Promise
  } // getWaitForTransactionPromise
  // ---

  const callTransferToken = useCallback( async ( /* _tokenAddress:TAddressString, */_tokenInstanceToTransfer:TTokenInstance, _destinationAddress: TAddressString, _amount: TTokenAmount ) : Promise<TTxResult> =>
    {
      const txResult:TTxResult = {hash: NULL_ADDRESS, success: false, timeout: false, error: false, notFound: false, errorMessage: "", userSkipped: false} 
      try {
        if (_tokenInstanceToTransfer && _destinationAddress) {
          // Transfer
          const { request:transferRequest } = await prepareWriteContract({
            address: _tokenInstanceToTransfer.address,
            abi: erc20ABI,
            functionName: 'transfer',
            args: [_destinationAddress, _amount],
          })
          // TODO: debug to remove -> ------------------------
          console.debug(`Steps3.tsx callTransferToken await writeContract(transferRequest)`);
          console.dir(transferRequest);
          // TODO: debug to remove <- ------------------------
          const transferRequestResult = await writeContract(transferRequest)
          const { hash:transferTxHash } = transferRequestResult
          const amountStrings = getAmountStrings(_amount, _tokenInstanceToTransfer.decimals)
          const displayedAmount = (amountStrings.shortDisplayIsZero ? amountStrings.long : amountStrings.short)
          // // TODO: debug to remove -> ------------------------
          console.debug(`Step3.tsx: callTransferToken : transferTxHash:${transferTxHash}`)
          // // TODO: debug to remove <- ------------------------
          if (transferTxHash) {
            txResult.hash = transferTxHash
            await toast.promise(
              getWaitForTransactionPromise(transferTxHash, txResult),
              { // toasts
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
                success: (txResult:TTxResult) =>
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
                  </div>,
                error:  (txResult:TTxResult) =>
                  <div>
                    <div className="font-medium">
                      {`${t("moveTokens.stepThree.transfer.rejected")} :`}
                    </div>
                    <div>
                      {`${displayedAmount} ${_tokenInstanceToTransfer.name} ${t("moveTokens.stepThree.transfer.to")} ${shortenAddress(_destinationAddress)}`}
                    </div>
                    <div>
                      {`${t("moveTokens.stepThree.transfer.errorReason")}: ${(txResult.errorMessage?txResult.errorMessage:"moveTokens.stepThree.transfer.errorReasonUnknown")}`}
                      {txResult.notFound && <div>{t("moveTokens.stepThree.transfer.gasTooLowSuggest")}</div>}

                    </div>
                    <div className="text-error-content">
                      <Link className="flex justify-end underline" to={getTxUri(txResult.hash)} target="_blank" rel="noopener noreferrer" >
                        {t("moveTokens.stepThree.transfer.txHash")}<LinkIcon className="pl-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 fill-current" />
                      </Link>

                    </div>
                  </div>
              },
              { success:
                  {duration: DURATION_LONG},
                error:
                  {duration: DURATION_LONG},
              }
          ) // toast.promise
          } // if (transferTxHash)
        } // if (_tokenInstanceToTransfer && _destinationAddress)

      } catch (error) {
        console.error(`Step3.tsx: callTransferToken error: ${error}`)
        console.dir(error)
        if (error instanceof Error) {
          if (error.message.match(USER_REJECT_TX_REGEXP)) {
            txResult.userSkipped = true
            showToastTransferSkipped(_tokenInstanceToTransfer)
          } else {
            console.debug(`Step3.tsx: callTransferToken : error:`)
            console.dir(error)
            // reThrow
          }
        }

      }
      return txResult; // RETURN
    },
    [/* getAmountShortString */ getAmountStrings, getTxUri, t, showToastTransferSkipped] // No dependencies
  ) // callTransferToken

  // ---

  const transferToken = useCallback( async( _tokenInstanceToTransfer:TTokenInstance, _to:TAddressString/* TAddressEmptyNullUndef */ ) =>
    {
      // let transferTxHash:TTxHash;
      try {
        if (_tokenInstanceToTransfer?.address && _tokenInstanceToTransfer?.transferAmount && _to && accountAddress) {
          const txResult  = await callTransferToken( _tokenInstanceToTransfer, _to, _tokenInstanceToTransfer.transferAmount)
          let state = ETokenTransferState.none
          if (txResult.success) {
            // processed = Success
            // _tokenInstanceToTransfer.transferState.transfer = ETokenTransferState.processed;
            state = ETokenTransferState.processed;
            migrationState.current.successItemsCount++;
            // Instant update after transfer, do not wait for event which may not be received
            
          } else if (txResult.userSkipped) {
            // skipped = User skipped
            // _tokenInstanceToTransfer.transferState.transfer = ETokenTransferState.skipped;
            state = ETokenTransferState.skipped;
            migrationState.current.skippedItemsCount++;
          } else {
            // timeout or notFound or error
            // _tokenInstanceToTransfer.transferState.transfer = ETokenTransferState.error;
            state = ETokenTransferState.error;
            migrationState.current.errorItemsCount++;
          }

          // updateProcessedTokenInstance(_tokenInstanceToTransfer)
          updateTokenOnTransferProcessed(_tokenInstanceToTransfer, accountAddress, _to, state)
          setmigrationState( {...migrationState.current} )
          // if (txResult.userSkipped) {
          //   // User skipped
          //   showToastTransferSkipped(_tokenInstanceToTransfer)
          // }
          // currentlyProcessing.current = false

        } // if (_tokenInstanceToTransfer?.address && ...
      } catch (error) {
        _tokenInstanceToTransfer.transferState.transfer = ETokenTransferState.error;
        console.error(`Steps3.tsx transferToken ${_tokenInstanceToTransfer.address} ${_tokenInstanceToTransfer.transferAmount} ${_to} process error: ${error}`);
      }
    } // transferToken
    ,
    [callTransferToken, /* t, getAmountShortString, getTxUri, */ /* updateProcessedTokenInstance, */ setmigrationState/* , showTransferToast */, accountAddress, updateTokenOnTransferProcessed]
  ) // transferToken

  // ---

const transferTokens = useCallback( async() =>
  {
    try {
      if (tokensInstancesToMigrate && tokensInstancesToMigrate.length && targetAddress) {

        let tokenInstanceIndex = 0 ;
        let errorItemsCount = 0, skippedItemsCount = 0, successItemsCount = 0 ; // , paused = false, stopped = false;
        // let currentlyProcessing = false ;
        let tokenInstanceToTransfer:TTokenInstance|undefined; //  = undefined

        // Search for current migration state figures
        // Update migration/transfer state
        for (; ((tokenInstanceIndex < tokensInstancesToMigrate.length)/* &&!stopTransfers */); tokenInstanceIndex++) {
          tokenInstanceToTransfer = tokensInstancesToMigrate[tokenInstanceIndex];
          if (tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.error) {
            errorItemsCount++;
          } else if (tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.processed) {
            successItemsCount++;
          } else if (tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.skipped) {
            skippedItemsCount++;
          }
          // else if (tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.processing) {
          //   currentlyProcessing = true;
          // }
        } // for
        migrationState.current = {
          totalItemsCount: tokensInstancesToMigrate.length,
          errorItemsCount,
          skippedItemsCount,
          successItemsCount,
          paused: paused.current, stopped: stopped.current
        };
        setmigrationState( migrationState.current )

        // if any token is processing, skip search and do nothing (exit)
        if (!currentlyProcessing.current) {
          // Search for next token to transfer
          tokenInstanceIndex = 0;
          tokenInstanceToTransfer = undefined; //  = undefined
          for (; ((tokenInstanceIndex < tokensInstancesToMigrate.length)/* &&!stopTransfers */); tokenInstanceIndex++) {
            while (paused.current) {
              await new Promise(r => setTimeout(r, 250));
              if (!paused.current || stopped.current) break;
            }
            if (stopped.current || currentlyProcessing.current) break;
            // const tokenInstanceToTransfer = tokensInstancesToMigrate[tokenInstanceIndex];
            tokenInstanceToTransfer = tokensInstancesToMigrate[tokenInstanceIndex];

            if (tokenInstanceToTransfer.transferState.processing // processing
                && tokenInstanceToTransfer.selected && tokenInstanceToTransfer.transferAmount // selected and with transfer amount (> 0)
                && (tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.none) // not yet processed
              ) {
              console.debug(`Steps3.tsx transferTokenS TRANSFER tokenInstanceToTransfer:`);
              console.dir(tokenInstanceToTransfer);
              break;
            } else {
              console.debug(`Steps3.tsx transferTokenS SKIP TRANSFER tokenInstanceToTransfer:`);
              console.dir(tokenInstanceToTransfer);
              continue;
            }
          } // for (let tokenInstanceIndex = 0 ...
          try {
            // tokenIdx.current = tokenInstanceIndex;
            if (tokenInstanceToTransfer && tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.none)  {
              currentlyProcessing.current = true // lock
              // update token state
              tokenInstanceToTransfer.transferState.transfer = ETokenTransferState.processing
              // updateProcessedTokenInstance(tokenInstanceToTransfer)
              // updateTokenOnTransferProcessed(tokenInstanceToTransfer, "0x", "0x", true, ETokenTransferState.processing)
              updateTokenInstanceTransferState(tokenInstanceToTransfer.address, ETokenTransferState.processing)
              await transferToken( tokenInstanceToTransfer, targetAddress )
              currentlyProcessing.current = false // unlock
            }
          } catch (error) {
            console.error(`Steps3.tsx transferTokenS tokenInstanceToTransfer TRANSFER ERROR token symbol: '${tokenInstanceToTransfer?.symbol}' token address: '${tokenInstanceToTransfer?.address}' targetAddress: '${targetAddress}' for '${tokenInstanceToTransfer?.transferAmount}' amount process error: ${error}`);
            currentlyProcessing.current = false // unlock
          }

          if (tokenInstanceIndex >= tokensInstancesToMigrate.length-1) {
            setstopTransfers(true)
            paused.current = false
            stopped.current = true
            setmigrationState( {...migrationState.current, paused: false, stopped: true} )
          }
        } // IF (!currentlyProcessing))

      } // IF (_tokensInstancesToTransfer && _tokensInstancesToTransfer.length)
    } catch (error) {
      console.error(`Steps3.tsx transferTokenS error: ${error}`);
    }
  },
  [tokensInstancesToMigrate, setmigrationState, transferToken, targetAddress, /* updateProcessedTokenInstance */ /* updateTokenOnTransferProcessed */updateTokenInstanceTransferState]
  ) // transferTokens


  // ---

  /**
   * Returns tokens to display on Step 3
   * Only "processing" one should appear
   */
  const getTokensToMigrate = useCallback( ():TTokensInstances =>
  {
    try {
      const processingTokensInstances = tokensInstances?.filter( (tokenInstance:TTokenInstance) => {
        return (
          tokenInstance.transferState.processing // == true
          )
      })
      // TODO: debug to remove -> ------------------------
      console.debug(`Steps3.tsx getTokensToMigrate processingTokensInstances:`);
      console.dir(processingTokensInstances);
      // TODO: debug to remove  ------------------------ <-
      return processingTokensInstances;
      } catch (error) {
        console.error(`Steps3.tsx getTokensToMigrate error: ${error}`);
      }
    },
    [tokensInstances]
  ) // getTokensToMigrate


  // ---

  /**
   * Init
   */
  useEffect( () =>
    {
      migrationState.current = initialMigrationState
      setstopTransfers(false)
      setpauseTransfers(false)
      settokensInstancesToMigrate(null)
      setShowProgressBar(true)
      setNextDisabled(true)
    },
    [setNextDisabled, setShowProgressBar, initialMigrationState]
  )

  // ---

  /**
   * Set tokensInstancesToMigrate
   */
  useEffect( () =>
    {
      try {
        const tokensToMigrate = getTokensToMigrate()
        if (tokensToMigrate && tokensToMigrate.length) {
          settokensInstancesToMigrate(tokensToMigrate)
        }
      } catch (error) {
        console.error(`Steps3.tsx updateTokensToMigrate [getTokensToMigrate, step, settokensInstancesToMigrate, setmigrationState] error: ${error}`);  
      }
    },
    [getTokensToMigrate, settokensInstancesToMigrate, setmigrationState]
  ) // useEffect

  // ---

  /**
   * Call tokens transfers
   */
  useEffect( () =>
    {
      if (tokensInstancesToMigrate && tokensInstancesToMigrate.length) {

        // Will be called on each tokensInstancesToMigrate update
        transferTokens()
      }
    },
    [tokensInstancesToMigrate, targetAddress, transferTokens]
  )

  // ------------------------------

  return (
    <div className="w-full p-0 m-0">

      <div className="min-w-full ">
        <div className="flex justify-center mt-2 p-1 bg-base-300 rounded-lg">
          <div className="join">
            <input type="checkbox" disabled={stopped.current} className="toggle toggle-info mt-1" checked={pauseTransfers} onChange={handlePauseTransfers}  /> 
            <label className={((pauseTransfers&&!stopped.current)?"animate-pulse text-info font-bold":"font-semibold")+" text-sm md:text-lg lg:text-lg ml-2 mr-2"}>
              {"Pause"}
            </label>
            <button className={"btn btn-xs sm:btn-sm pl-4 "+(stopTransfers?"btn-disabled":"btn-warning")} onClick={handleStopTransfers}>Stop</button>
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

// ------------------------------

export default Step3;