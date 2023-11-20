// React
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Components
import TokenInstanceMigrationListTable from "@Components/TokenInstanceMigrationListTable"
// Wagmi
import { erc20ABI, prepareWriteContract, writeContract } from '@wagmi/core'
// Translation
import { useTranslation } from "react-i18next";
 // Toasts
 import toast from 'react-hot-toast'
 // Router
import { Link } from "react-router-dom";
// Consts & Enums
import { DEFAULT_ETHEREUM_EXPLORER_BASE_URI, DEFAULT_ETHEREUM_EXPLORER_TX_URI,
  DEFAULT_GNOSIS_EXPLORER_BASE_URI, DEFAULT_GNOSIS_EXPLORER_TX_URI,
  DURATION_LONG, DURATION_MEDIUM,
  USER_REJECT_TX_REGEXP
} from "@App/js/constants/ui/uiConsts";
import { ERC20_DECIMALS_DEFAULT, SHORT_DISPLAY_DECIMAL_COUNT } from "@App/js/constants/ui/misc";
import { ETHEREUM_CHAIN_ID, XDAI_CHAIN_ID } from "@App/js/constants/chainIds";
import { ETokenTransferState } from "@jsconsts/enums"; 
// Utils
import { shortenAddress } from "@App/js/utils/blockchainUtils";
// Icons
import { LinkIcon, XCircleIcon } from '@heroicons/react/24/solid'

// ------------------------------

const Step3 = ( {
  chainId,
  tokensInstances,
  settokensInstances,
  setNextDisabled,
  setShowProgressBar,
  accountAddress,
  targetAddress,
  tokensInstancesListTablePropsHandlers,
  setmigrationState
  }: IStep3Props ) => {

  // ---

  const { t } = useTranslation()
  const [tokensInstancesToMigrate, settokensInstancesToMigrate] = useState<TTokensInstances>(null)

  const [pauseTransfers, setpauseTransfers] = useState(false)
  const [stopTransfers, setstopTransfers] = useState(false)
  const paused = useRef(false)
  const stopped = useRef(false)
  // const tokenIdx = useRef(0)


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
      if (chainId == XDAI_CHAIN_ID) {
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

  const getAmountShortString = useCallback( (_amount: TTokenAmount, _decimals: TTokenDecimals):string =>
    {
      try {
        if (_amount) {
          const decimals = BigInt((_decimals||ERC20_DECIMALS_DEFAULT))
          const amountValue = _amount.valueOf();
          const intValue = ( amountValue / (10n**decimals) );
          const decimalValue = amountValue - intValue * (10n**decimals);
          if (decimalValue > 0) {
            // exact decimals display
            const longDecimalDisplayPadded = decimalValue.toString().padStart( Number(decimals) , "0");
            const zeroDecimalToFixed = Number("0."+longDecimalDisplayPadded).toFixed(SHORT_DISPLAY_DECIMAL_COUNT)
            const shortDecimalDisplay = zeroDecimalToFixed.substring(2);
            const roundUpShortDisplay = (zeroDecimalToFixed.substring(0,2) =="1.")
            const shortAmountString = `${(roundUpShortDisplay?intValue+1n:intValue)}.${shortDecimalDisplay}`
            return shortAmountString
          } else {
            return `${intValue}.0`
          }
        }
        return "0.0"
      } catch (error) {
        console.error(`Steps3.tsx getAmountShortString error: ${error}`);
        return "?"
      }
    },
    [] // No dependencies
  )

  // ---

  const handlePauseTransfers = () => {
    setpauseTransfers(!pauseTransfers)
    paused.current = !paused.current

    migrationState.current = {...migrationState.current, paused: true}
    setmigrationState( migrationState.current )
  }

  // ---

  const handleStopTransfers = () => {
    setstopTransfers(!stopTransfers)
    stopped.current = !stopped.current
      migrationState.current = {...migrationState.current, stopped: true}
      setmigrationState( migrationState.current )
  }

  // ---

  const showToast = useCallback( async ( _tokenInstanceToTransfer:TTokenInstance, _transferTxHash:TTxHash, _to:TAddressEmptyNullUndef ) : Promise<void> =>
    {
      try {
        if (_tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.error) {
          //
          toast.custom(
            (_toast) => (
              <div className={`block alert alert-error w-auto p-2 m-0`}
                style={{
                  opacity: _toast.visible ? 0.85 : 0,
                  transition: "opacity 100ms ease-in-out",
                  border: '1px solid black',
                }}
              >
                <div className="grid grid-cols-8 gap-0 m-0 p-0">
                  <div className="-p-0 m-0"><button onClick={() => toast.dismiss(_toast.id)}><XCircleIcon className={'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2'} /></button></div>
                  <div className="p-0 pl-1 pt-1 m-0 col-span-7">{`${t("moveTokens.stepThree.transferResult.error")}: ${_tokenInstanceToTransfer.name}`}</div>
                </div>
        
              </div>
            ),
            { duration: DURATION_LONG }
          ) // toast.custom

        } else if (_tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.processed) {
          // 
          toast.custom(
            (_toast) => (
              <div className={`block alert alert-success w-auto p-2 m-0`}
                style={{
                  opacity: _toast.visible ? 0.85 : 0,
                  transition: "opacity 100ms ease-in-out",
                  border: '1px solid black',
                }}
              >
                <div className="grid grid-cols-8 gap-0 m-0 p-0">
                  <div className="-p-0 m-0"><button onClick={() => toast.dismiss(_toast.id)}><XCircleIcon className={'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2'} /></button></div>
                  <div className="p-0 pl-1 pt-1 m-0 col-span-7">
                    {`${t("moveTokens.stepThree.transferResult.success")}: ${getAmountShortString(_tokenInstanceToTransfer.transferAmount, _tokenInstanceToTransfer.decimals)} ${_tokenInstanceToTransfer.name} ${t("moveTokens.stepThree.transferResult.successTo")} ${shortenAddress(_to)}`}
                  </div>
                  <div className="col-span-8">
                    <Link className="flex justify-end underline" to={getTxUri(_transferTxHash)} target="_blank" rel="noopener noreferrer" >
                    {t("moveTokens.stepThree.transferResult.txHash")}<LinkIcon className="pl-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 fill-current" />
                    </Link>
                  </div>
                </div>
              </div>
            ),
            { duration: DURATION_LONG }
          ) // toast.custom
        } else if (_tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.skipped) {
          // 
          toast.custom(
            (_toast) => (
              <div className={`block alert alert-info w-auto p-2 m-0`}
                style={{
                  opacity: _toast.visible ? 0.85 : 0,
                  transition: "opacity 100ms ease-in-out",
                  border: '1px solid black',
                }}
              >
                <div className="grid grid-cols-8 gap-0 m-0 p-0">
                  <div className="-p-0 m-0"><button onClick={() => toast.dismiss(_toast.id)}><XCircleIcon className={'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2'} /></button></div>
                  <div className="p-0 pl-1 pt-1 m-0 col-span-7">{`${t("moveTokens.stepThree.transferResult.skipped")}: ${_tokenInstanceToTransfer.name}`}</div>
                </div>
        
              </div>
            ),
            { duration: DURATION_MEDIUM }
          ) // toast.custom
        } else {
          console.debug(`Step3.tsx: showToast wrong state ${_tokenInstanceToTransfer.transferState.transfer} for token ${_tokenInstanceToTransfer.address}`)
        }
      } catch (error) {
          console.error(`Step3.tsx: showToast error: ${error}`)
      }
    },
    [getTxUri, t, getAmountShortString] 
  )

  // ---

  const callTransferToken = useCallback( async ( _tokenAddress:TAddressString, _destinationAddress: TAddressString, _amount: TTokenAmount ) : Promise<TTxHash> =>
    {
      try {
        const { request:transferRequest } = await prepareWriteContract({
          address: _tokenAddress,
          abi: erc20ABI,
          functionName: 'transfer',
          args: [_destinationAddress, _amount],
        })
        const transferRequestResult = await writeContract(transferRequest)
        const { hash,  } = transferRequestResult
        // console.dir(transferRequestResult);
        // console.debug(`Step3.tsx: callTransferToken : hash:${hash}`)
        return hash; // RETURN (Success)

      } catch (error) {
        try {
          if (error instanceof Error) {
              if (error.message.match(USER_REJECT_TX_REGEXP)) {
              return "" ; // RETURN (User rejected)
            } else {
              // reThrow
              throw error;
            }
          }
        } catch (anotherError) {
          console.error(`Step3.tsx: callTransferToken error: ${anotherError}`)
          // reThrow initial error
          throw error;
        }
      }
    },
    [] // No dependencies
  ) // callTransferToken

  // ---

  const updateProcessedTokenInstance = useCallback( (_updatedTokenInstance: TTokenInstance) =>
    {
// console.debug(`Steps3.tsx updateProcessedTokenInstance _updatedTokenInstance=`);
// console.dir(_updatedTokenInstance);
      try {
        if (tokensInstances && tokensInstances.length && _updatedTokenInstance) {
          // Just mutate the array, replacing _updatedTokenInstance and update some values depending on connectedAddress balance
          const newTokensInstances = tokensInstances.map( (tokenInstance:TTokenInstance) => {
            if (tokenInstance.address == _updatedTokenInstance.address) {
              // if (_updatedTokenInstance.tr_processed) {
              //   _updatedTokenInstance.selected = false; // UNselect
              //   _updatedTokenInstance.transferAmount = 0n; // Reset transfer amount
              //   _updatedTokenInstance.transferAmountLock = false; // Reset transfer amount lock
              // }
              // if (_updatedTokenInstance.tr_skipped) {
              //   _updatedTokenInstance.selected = false; // UNselect
              // }
              let {selected, transferAmount , transferAmountLock} = tokenInstance
              const {transferState} = tokenInstance
              if (_updatedTokenInstance.transferState.transfer == ETokenTransferState.processed) {
                selected = false; // UNselect
                transferAmount = 0n; // Reset transfer amount
                transferAmountLock = false; // Reset transfer amount lock
              }
              if (_updatedTokenInstance.transferState.transfer == ETokenTransferState.skipped) {
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
  // ---

  const transferToken = useCallback( async( _tokenInstanceToTransfer:TTokenInstance, _to:TAddressEmptyNullUndef ) =>
    {
      let transferTxHash:TTxHash;
      try {

        if (_tokenInstanceToTransfer?.address && _tokenInstanceToTransfer?.transferAmount && _to) {
          transferTxHash = await callTransferToken(_tokenInstanceToTransfer.address, _to, _tokenInstanceToTransfer.transferAmount)
          if (transferTxHash) {
            // Success
            // non-empty hash is returned
            // _tokenInstanceToTransfer.tr_processed = true;
            // _tokenInstanceToTransfer.tr_skipped = false;
            // _tokenInstanceToTransfer.tr_error = false;
            // // _tokenInstanceToTransfer.selected = false;
            _tokenInstanceToTransfer.transferState.transfer = ETokenTransferState.processed;
            // toast.custom(
            //   (_toast) => (
            //     <div className={`block alert alert-success w-auto p-2 m-0`}
            //       style={{
            //         opacity: _toast.visible ? 0.85 : 0,
            //         transition: "opacity 100ms ease-in-out",
            //         border: '1px solid black',
            //       }}
            //     >
            //       <div className="grid grid-cols-8 gap-0 m-0 p-0">
            //         <div className="-p-0 m-0"><button onClick={() => toast.dismiss(_toast.id)}><XCircleIcon className={'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2'} /></button></div>
            //         <div className="p-0 pl-1 pt-1 m-0 col-span-7">{`${t("moveTokens.stepThree.transferResult.success")}: ${getAmountShortString(_tokenInstanceToTransfer.transferAmount, _tokenInstanceToTransfer.decimals)} ${_tokenInstanceToTransfer.name} ${t("moveTokens.stepThree.transferResult.successTo")} ${shortenAddress(_to)}`}</div>
            //         <div className="col-span-8">
            //           <Link className="flex justify-end underline" to={getTxUri(transfer)} target="_blank" rel="noopener noreferrer" >
            //           {t("moveTokens.stepThree.transferResult.txHash")}<LinkIcon className="pl-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 fill-current" />
            //           </Link>
            //         </div>
            //       </div>
            //     </div>
            //   ),
            //   { duration: DURATION_LONG }
            // ) // toast.custom
          } else {
            // Skipped
            // _tokenInstanceToTransfer.tr_skipped = true;
            // _tokenInstanceToTransfer.tr_processed = false;
            // _tokenInstanceToTransfer.tr_error = false;
            _tokenInstanceToTransfer.transferState.transfer = ETokenTransferState.skipped;
            // toast.custom(
            //   (_toast) => (
            //     <div className={`block alert alert-info w-auto p-2 m-0`}
            //       style={{
            //         opacity: _toast.visible ? 0.85 : 0,
            //         transition: "opacity 100ms ease-in-out",
            //         border: '1px solid black',
            //       }}
            //     >
            //       <div className="grid grid-cols-8 gap-0 m-0 p-0">
            //         <div className="-p-0 m-0"><button onClick={() => toast.dismiss(_toast.id)}><XCircleIcon className={'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2'} /></button></div>
            //         <div className="p-0 pl-1 pt-1 m-0 col-span-7">{`${t("moveTokens.stepThree.transferResult.skipped")}: ${_tokenInstanceToTransfer.name}`}</div>
            //       </div>
          
            //     </div>
            //   ),
            //   { duration: DURATION_MEDIUM }
            // ) // toast.custom
          } // if (transfer) ... ELSE ...
        } // if (_tokenInstanceToTransfer ...

      } catch (error) {
        // _tokenInstanceToTransfer.tr_error = true;
        // _tokenInstanceToTransfer.tr_processed = false;
        // _tokenInstanceToTransfer.tr_skipped = false;
        _tokenInstanceToTransfer.transferState.transfer = ETokenTransferState.error;
        // toast.custom(
        //   (_toast) => (
        //     <div className={`block alert alert-error w-auto p-2 m-0`}
        //       style={{
        //         opacity: _toast.visible ? 0.85 : 0,
        //         transition: "opacity 100ms ease-in-out",
        //         border: '1px solid black',
        //       }}
        //     >
        //       <div className="grid grid-cols-8 gap-0 m-0 p-0">
        //         <div className="-p-0 m-0"><button onClick={() => toast.dismiss(_toast.id)}><XCircleIcon className={'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2'} /></button></div>
        //         <div className="p-0 pl-1 pt-1 m-0 col-span-7">{`${t("moveTokens.stepThree.transferResult.error")}: ${_tokenInstanceToTransfer.name}`}</div>
        //       </div>
      
        //     </div>
        //   ),
        //   { duration: DURATION_LONG }
        // ) // toast.custom

      }
      finally {
        try {
          // if (_tokenInstanceToTransfer.tr_processed) {
          //   migrationState.current.successItemsCount++;
          // } else if (_tokenInstanceToTransfer.tr_skipped) {
          //   migrationState.current.skippedItemsCount++;
          // } else if (_tokenInstanceToTransfer.tr_error) {
          //   migrationState.current.errorItemsCount++;
          // }

          updateProcessedTokenInstance(_tokenInstanceToTransfer)

          if (_tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.processed) {
            migrationState.current.successItemsCount++;
          } else if (_tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.skipped) {
            migrationState.current.skippedItemsCount++;
          } else if (_tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.error) {
            migrationState.current.errorItemsCount++;
          }
          // updateProcessedTokenInstance(_tokenInstanceToTransfer)

          setmigrationState( {...migrationState.current} )

          showToast(_tokenInstanceToTransfer, transferTxHash, _to)

        } catch (error) {
          console.error(`Steps3.tsx transferToken tokenInstanceToTransfer TRANSFER ERROR STATE ${_tokenInstanceToTransfer.address} ${_tokenInstanceToTransfer.transferAmount} ${_to} process error: ${error}`);
        }
      }
    } // transferToken
    ,
    [callTransferToken, /* t, getAmountShortString, getTxUri, */ updateProcessedTokenInstance, setmigrationState, showToast]
  ) // transferToken

    // ---

//   const transferTokens = useCallback( async( _tokensInstancesToTransfer:TTokensInstances, /* _from:TAddressEmptyNullUndef, */ _to:TAddressEmptyNullUndef ) =>
//     {
//       try {
//         if (_tokensInstancesToTransfer && _tokensInstancesToTransfer.length) {
//           migrationState.current = {totalItemsCount:_tokensInstancesToTransfer.length,
//             errorItemsCount:0,skippedItemsCount:0,successItemsCount:0, paused: false, stopped: false};
//           setmigrationState( migrationState.current )
//           for (let tokenInstanceIndex = 0; ((tokenInstanceIndex < _tokensInstancesToTransfer.length)/* &&!stopTransfers */); tokenInstanceIndex++) {
//             while (paused.current) {
//               await new Promise(r => setTimeout(r, 250));
//               if (!paused.current || stopped.current) break;
//             }
//             if (stopped.current) break;
//             const tokenInstanceToTransfer = _tokensInstancesToTransfer[tokenInstanceIndex];


// // TODO: remove this debug code ->
// // console.debug(`Steps3.tsx transferTokenS tokenInstanceToTransfer:`);
// // console.dir(tokenInstanceToTransfer);
// // if (!tokenInstanceToTransfer.transferAmount) {
// //   console.debug(`Steps3.tsx transferTokenS tokenInstanceToTransfer NO AMOUNT `);
// //   console.dir(tokenInstanceToTransfer);
// // }
// // if (tokenInstanceToTransfer.tr_processed) {
// //   console.debug(`Steps3.tsx transferTokenS tokenInstanceToTransfer ALREADY PROCESSED `);
// //   console.dir(tokenInstanceToTransfer);
// // }
// // TODO: remove this debug code <-

//             // Check if tokenInstanceToTransfer has already been processed
//             // It could have been updated by a transfer event
//             // if ( !(tokenInstanceToTransfer.tr_processed || tokenInstanceToTransfer.tr_error || tokenInstanceToTransfer.tr_skipped)
//             //   && tokenInstanceToTransfer.transferAmount) continue;

//               // if (tokenInstanceToTransfer.processing
//               //     && tokenInstanceToTransfer.selected && tokenInstanceToTransfer.transferAmount
//               //     && !(tokenInstanceToTransfer.tr_processed || tokenInstanceToTransfer.tr_error || tokenInstanceToTransfer.tr_skipped)
//               //   ) {
//               //   console.debug(`Steps3.tsx transferTokenS TRANSFER tokenInstanceToTransfer:`);
//               //   console.dir(tokenInstanceToTransfer);
//               // } else {
//               //   console.debug(`Steps3.tsx transferTokenS SKIP TRANSFER tokenInstanceToTransfer:`);
//               //   console.dir(tokenInstanceToTransfer);
//               //   continue;
//               // }
//             if (tokenInstanceToTransfer.transferState.processing // processing
//                 && tokenInstanceToTransfer.selected && tokenInstanceToTransfer.transferAmount // selected and with transfer amount (> 0)
//                 && (tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.none) // not yet processed
//               ) {
//               console.debug(`Steps3.tsx transferTokenS TRANSFER tokenInstanceToTransfer:`);
//               console.dir(tokenInstanceToTransfer);
//             } else {
//               console.debug(`Steps3.tsx transferTokenS SKIP TRANSFER tokenInstanceToTransfer:`);
//               console.dir(tokenInstanceToTransfer);
//               continue;
//             }

//             try {
//               await transferToken(tokenInstanceToTransfer, _to )
//               tokenIdx.current = tokenInstanceIndex;
//             } catch (error) {
//               console.error(`Steps3.tsx transferTokenS tokenInstanceToTransfer TRANSFER ERROR token symbol: '${tokenInstanceToTransfer.symbol}' token address: '${tokenInstanceToTransfer.address}' to: '${_to}' for '${tokenInstanceToTransfer.transferAmount}' amount process error: ${error}`);
//             }
//           } // for (let tokenInstanceIndex = 0 ...
//           setstopTransfers(true)
//           paused.current = false
//           stopped.current = true
//           setmigrationState( {...migrationState.current, paused: false, stopped: true} )
//         } // if (_tokensInstancesToTransfer && _tokensInstancesToTransfer.length)
//       } catch (error) {
//         console.error(`Steps3.tsx transferTokenS error: ${error}`);
//       }
//     },
//     [setmigrationState, transferToken]
//   ) // transferTokens

const transferTokens = useCallback( async( /* _tokensInstancesToTransfer:TTokensInstances, _to:TAddressEmptyNullUndef */ ) =>
  {
    try {
      if (tokensInstancesToMigrate && tokensInstancesToMigrate.length) {

        let tokenInstanceIndex = 0 ;
        let errorItemsCount = 0, skippedItemsCount = 0, successItemsCount = 0 ; // , paused = false, stopped = false;
        let currentlyProcessing = false ;
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
          } else if (tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.processing) {
            currentlyProcessing = true;
          }
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
        if (!currentlyProcessing) {



          // Search for next token to transfer
          tokenInstanceIndex = 0;
          tokenInstanceToTransfer = undefined; //  = undefined
          for (; ((tokenInstanceIndex < tokensInstancesToMigrate.length)/* &&!stopTransfers */); tokenInstanceIndex++) {
            while (paused.current) {
              await new Promise(r => setTimeout(r, 250));
              if (!paused.current || stopped.current) break;
            }
            if (stopped.current) break;
            // const tokenInstanceToTransfer = tokensInstancesToMigrate[tokenInstanceIndex];
            tokenInstanceToTransfer = tokensInstancesToMigrate[tokenInstanceIndex];

            // if (tokenInstanceToTransfer.transferState.processing // processing
            //     && tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.processing
            //   ) break;

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

            // try {
            //   tokenIdx.current = tokenInstanceIndex;
            //   await transferToken(tokenInstanceToTransfer, targetAddress )
            // } catch (error) {
            //   console.error(`Steps3.tsx transferTokenS tokenInstanceToTransfer TRANSFER ERROR token symbol: '${tokenInstanceToTransfer.symbol}' token address: '${tokenInstanceToTransfer.address}' targetAddress: '${targetAddress}' for '${tokenInstanceToTransfer.transferAmount}' amount process error: ${error}`);
            // }

          } // for (let tokenInstanceIndex = 0 ...
          try {
            // tokenIdx.current = tokenInstanceIndex;
            if (tokenInstanceToTransfer && tokenInstanceToTransfer.transferState.transfer == ETokenTransferState.none)  {
              // update token state
              tokenInstanceToTransfer.transferState.transfer = ETokenTransferState.processing
              updateProcessedTokenInstance(tokenInstanceToTransfer)
              await transferToken(tokenInstanceToTransfer, targetAddress )
            }
          } catch (error) {
            console.error(`Steps3.tsx transferTokenS tokenInstanceToTransfer TRANSFER ERROR token symbol: '${tokenInstanceToTransfer?.symbol}' token address: '${tokenInstanceToTransfer?.address}' targetAddress: '${targetAddress}' for '${tokenInstanceToTransfer?.transferAmount}' amount process error: ${error}`);
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
  [tokensInstancesToMigrate, setmigrationState, transferToken, targetAddress, updateProcessedTokenInstance]
  ) // transferTokens


  // ---

  /**
   * Returns tokens to display on Step 3
   * Only "processing" should appear
   */
  const getTokensToMigrate = useCallback( ():TTokensInstances =>
  {
    try {
      const processingTokensInstances = tokensInstances?.filter( (tokenInstance:TTokenInstance) => {
        return (
          tokenInstance.transferState.processing // == true
          )
      })
      // const processingTokensInstances = tokensInstances?.filter( (tokenInstance:TTokenInstance) => {
      //   return (
      //     /* tokenInstance.selected ||  */ tokenInstance.processing // && tokenInstance.transferAmount > 0n
      //     //|| (tokenInstance.tr_processed || tokenInstance.tr_skipped || tokenInstance.tr_error)
      //     )
      // })
      // selectedTokensInstances?.forEach( (tokenInstance:TTokenInstance) => {
      //   tokenInstance.tr_processed = false;
      //   tokenInstance.tr_skipped = false;
      //   tokenInstance.tr_error = false;
      // })
      console.debug(`Steps3.tsx getTokensToMigrate processingTokensInstances:`);
      console.dir(processingTokensInstances);
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
        transferTokens(/* tokensInstancesToMigrate, targetAddress */)
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