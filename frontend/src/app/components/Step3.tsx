// React
import { useCallback, useEffect, useMemo, useRef, /* useMemo, */ useState } from "react";
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
  DURATION_LONG, DURATION_MEDIUM, DURATION_SHORT,
  USER_REJECT_TX_REGEXP
} from "@App/js/constants/ui/uiConsts";
import { ETHEREUM_CHAIN_ID, XDAI_CHAIN_ID } from "@App/js/constants/chainIds";
// Utils
import { shortenAddress } from "@App/js/utils/blockchainUtils";
// Icons
import { LinkIcon, XCircleIcon } from '@heroicons/react/24/solid'

// ------------------------------

const Step3 = ( {
  chainId,
  tokensInstances,
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
  const tokenIdx = useRef(0)

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

  const getTxUri = useCallback( (txHash:string) => {
    return `${explorerUri}${txHash}`
  }, [explorerUri])

  
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

  const callTransferToken = useCallback( async ( _tokenAddress:TAddressString, _destinationAddress: TAddressString, _amount: TTokenAmount ) : Promise<string|undefined> =>
    {
      try {
        const { request:transferRequest } = await prepareWriteContract({
          address: _tokenAddress,
          abi: erc20ABI,
          functionName: 'transfer',
          args: [_destinationAddress, _amount],
        })
        const transferRequestResult = await writeContract(transferRequest)
        console.dir(transferRequestResult);
        const { hash,  } = transferRequestResult
        console.debug(`moveRealTokens._index.tsx: callTransferToken : hash:${hash}`)
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
          console.error(`moveRealTokens._index.tsx: callTransferToken error: ${anotherError}`)
          // reThrow initial error
          throw error;
        }
      }
    },
    [] // No dependencies
  )

  // ---

  const transferToken = useCallback( async( _tokenInstanceToTransfer:TTokenInstance, _to:TAddressEmptyNullUndef ) =>
    {
      try {

        if (_tokenInstanceToTransfer?.address && _tokenInstanceToTransfer?.transferAmount && _to) {
          const transfer = await callTransferToken(_tokenInstanceToTransfer.address, _to, _tokenInstanceToTransfer.transferAmount)
          if (transfer) {
            // Success
            // non-empty hash is returned
            _tokenInstanceToTransfer.tr_processed = true;
            _tokenInstanceToTransfer.tr_skipped = false;
            _tokenInstanceToTransfer.tr_error = false;
            _tokenInstanceToTransfer.selected = false;
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
                    <div className="p-0 pl-1 pt-1 m-0 col-span-7">{`${t("moveTokens.stepThree.transferResult.success")}: ${_tokenInstanceToTransfer.name} ${t("moveTokens.stepThree.transferResult.successTo")} ${shortenAddress(_to)}`}</div>
                    <div className="col-span-8">
                      <Link className="flex justify-end underline" to={getTxUri("0xcf20ae6748859abe26f52909cfc52cbe167db16a64b49e29ca7a2d68ed767315")} target="_blank" rel="noopener noreferrer" >
                      {t("moveTokens.stepThree.transferResult.txHash")}<LinkIcon className="pl-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 fill-current" />
                      </Link>
                    </div>
                  </div>
          
                </div>
              ),
              { duration: DURATION_MEDIUM }
            ) // toast.custom
          } else {
            // Skipped
            _tokenInstanceToTransfer.tr_skipped = true;
            _tokenInstanceToTransfer.tr_processed = false;
            _tokenInstanceToTransfer.tr_error = false;
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
              { duration: DURATION_SHORT }
            ) // toast.custom
          } // if (transfer) ... ELSE ...
        } // if (_tokenInstanceToTransfer ...

      } catch (error) {
        _tokenInstanceToTransfer.tr_error = true;
        _tokenInstanceToTransfer.tr_processed = false;
        _tokenInstanceToTransfer.tr_skipped = false;
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

      }
      finally {
        try {
          if (_tokenInstanceToTransfer.tr_processed) {
            migrationState.current.successItemsCount++;
          } else if (_tokenInstanceToTransfer.tr_skipped) {
            migrationState.current.skippedItemsCount++;
          } else if (_tokenInstanceToTransfer.tr_error) {
            migrationState.current.errorItemsCount++;
          }
          setmigrationState( {...migrationState.current} )
        } catch (error) {
          console.error(`Steps3.tsx transferToken tokenInstanceToTransfer TRANSFER ERROR STATE ${_tokenInstanceToTransfer.address} ${_tokenInstanceToTransfer.transferAmount} ${_to} process error: ${error}`);
        }
      }
    } // transferToken
    ,
    [callTransferToken, t, getTxUri, setmigrationState]
  ) // transferToken

    // ---

  const transferTokens = useCallback( async( _tokensInstancesToTransfer:TTokensInstances, /* _from:TAddressEmptyNullUndef, */ _to:TAddressEmptyNullUndef ) =>
    {
      try {
        if (_tokensInstancesToTransfer && _tokensInstancesToTransfer.length) {
            migrationState.current = {totalItemsCount:_tokensInstancesToTransfer.length,
              errorItemsCount:0,skippedItemsCount:0,successItemsCount:0, paused: false, stopped: false};
            setmigrationState( migrationState.current )
          for (let tokenInstanceIndex = 0; ((tokenInstanceIndex < _tokensInstancesToTransfer.length)/* &&!stopTransfers */); tokenInstanceIndex++) {
            while (paused.current) {
              await new Promise(r => setTimeout(r, 250));
              if (!paused.current || stopped.current) break;
            }
            if (stopped.current) break;
            const tokenInstanceToTransfer = _tokensInstancesToTransfer[tokenInstanceIndex];
            try {
              await transferToken(tokenInstanceToTransfer, _to )
              tokenIdx.current = tokenInstanceIndex;
            } catch (error) {
              console.error(`Steps3.tsx transferTokenS tokenInstanceToTransfer TRANSFER ERROR token symbol: '${tokenInstanceToTransfer.symbol}' token address: '${tokenInstanceToTransfer.address}' to: '${_to}' for '${tokenInstanceToTransfer.transferAmount}' amount process error: ${error}`);
            }
          } // for (let tokenInstanceIndex = 0 ...
          setstopTransfers(true)
          paused.current = false
          stopped.current = true
          setmigrationState( {...migrationState.current, paused: false, stopped: true} )
        } // if (_tokensInstancesToTransfer && _tokensInstancesToTransfer.length)
      } catch (error) {
        console.error(`Steps3.tsx transferTokenS error: ${error}`);
      }
    },
    [setmigrationState, transferToken]
  ) // transferTokens

  // ---

  const getTokensToMigrate = useCallback( ():TTokensInstances =>
  {
    try {
      const selectedTokensInstances = tokensInstances?.filter( (tokenInstance:TTokenInstance) => {
        return tokenInstance.selected && tokenInstance.transferAmount > 0n
      })
      selectedTokensInstances?.forEach( (tokenInstance:TTokenInstance) => {
        tokenInstance.tr_processed = false;
        tokenInstance.tr_skipped = false;
        tokenInstance.tr_error = false;
      })
      return selectedTokensInstances;
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
        transferTokens(tokensInstancesToMigrate, targetAddress)
      }
    },
    [tokensInstancesToMigrate, targetAddress, transferTokens]
  )

  // ------------------------------

  return (
    <div className="">

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

{/* 
        <div className="bg-neutral w-full rounded-box border border-base-300-content p-2">
          <p className="text-sm sm:text-base md:text-lg overflow-hidden text-center text-accent p-2 pb-0  animate-pulse">
            {"COMING"}
          </p>&nbsp;
          <div className="flex text-neutral-content justify-center p-0">
            <FaceSmileIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12  animate-pulse " />
          </div>
          <p className="text-sm sm:text-base md:text-lg overflow-hidden text-center text-warning font-extrabold p-2  animate-pulse">
            {"SOON"}
          </p>
        </div>
*/}