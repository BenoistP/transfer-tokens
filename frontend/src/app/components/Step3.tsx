// React
import { useCallback, useEffect, useState } from "react";
// Components
import TokenInstanceMigrationListTable from "@Components/TokenInstanceMigrationListTable"
import { erc20ABI, prepareWriteContract, writeContract } from '@wagmi/core'
// Consts & Enums
import { USER_REJECT_TX_REGEXP } from "@App/js/constants/ui/uiConsts";
// Icons
// import { FaceSmileIcon } from '@heroicons/react/24/solid'

// ------------------------------

const Step3 = ( {
  tokensInstances,
  setNextDisabled,
  setShowProgressBar,
  accountAddress,
  targetAddress,
  tokensInstancesListTablePropsHandlers,
  setmigrationState
  // transferTokens,
  // stopTransfers, setstopTransfers,
  // pauseTransfers, setpauseTransfers
  }: IStep3Props ) => {

  // ---
  const [tokensInstancesToMigrate, settokensInstancesToMigrate] = useState<TTokensInstances>(null)

  // Transfer controls
  const [pauseTransfers, setpauseTransfers] = useState(false)
  const [stopTransfers, setstopTransfers] = useState(false)
  // ---

  const callTransferToken = useCallback( async ( _tokenAddress:TAddressString, _destinationAddress: TAddressString, _amount: TTokenAmount ) : Promise<boolean|undefined> =>
    {
      try {
        // console.debug(`moveRealTokens._index.tsx: callTransferToken : _tokenAddress:${_tokenAddress} _destinationAddress:${_destinationAddress} _amount:${_amount}`)
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
        return true; // RETURN Success
      } catch (error) {

        try {
          // console.error(`moveRealTokens._index.tsx: callTransferToken error: ${error}`)
          if (error instanceof Error) {
            console.debug(`moveRealTokens._index.tsx: callTransferToken error: ${error.name} ${error.message}`)
              if (error.message.match(USER_REJECT_TX_REGEXP)) {
              return false; // RETURN User rejected
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

  const transferToken = useCallback( async( _tokenInstanceToTransfer:TTokenInstance, /* _from:TAddressEmptyNullUndef, */ _to:TAddressEmptyNullUndef, _migrationState: TmigrationState ) =>
    {

      try {
        setmigrationState( {..._migrationState} )

        if (_tokenInstanceToTransfer?.address && _tokenInstanceToTransfer?.transferAmount /* && _from */ && _to) {
          const transfer = await callTransferToken(_tokenInstanceToTransfer.address, _to, _tokenInstanceToTransfer.transferAmount)
          if (transfer) {
            // Success
            console.debug(`Steps3.tsx transferToken tokenInstanceToTransfer TRANSFER OK ${_tokenInstanceToTransfer.address} ${_tokenInstanceToTransfer.transferAmount} ${"_from"} ${_to} process`)
            _tokenInstanceToTransfer.tr_processed = true;
            _tokenInstanceToTransfer.selected = false;
            _migrationState.successItemsCount++;
          } else {
            // Skipped
            console.debug(`Steps3.tsx transferToken tokenInstanceToTransfer TRANSFER SKIPPED ${_tokenInstanceToTransfer.address} ${_tokenInstanceToTransfer.transferAmount} ${"_from"} ${_to} process`)
            _tokenInstanceToTransfer.tr_skipped = true;
            _migrationState.skippedItemsCount++;
          }
        } // if (_tokenInstanceToTransfer ...

      } catch (error) {
        console.error(`Steps3.tsx transferToken tokenInstanceToTransfer TRANSFER ERROR ${_tokenInstanceToTransfer.address} ${_tokenInstanceToTransfer.transferAmount} ${"_from"} ${_to} process error: ${error}`);
        _tokenInstanceToTransfer.tr_error = true;
          _migrationState.errorItemsCount++;
      }
      finally {
        try {
          setmigrationState( {..._migrationState} )
        } catch (error) {
          console.error(`Steps3.tsx transferToken tokenInstanceToTransfer TRANSFER ERROR STATE ${_tokenInstanceToTransfer.address} ${_tokenInstanceToTransfer.transferAmount} ${"_from"} ${_to} process error: ${error}`);
        }
      }
    } // transferToken
    ,
    [setmigrationState, callTransferToken]
  ) // transferToken

    // ---
/*
    const transferToken = useCallback( async( _tokenInstanceToTransfer:TTokenInstance, _from:TAddressEmptyNullUndef, _to:TAddressEmptyNullUndef, _migrationState: TmigrationState ) =>
    {

      try {
        const sleep = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms))
        const random0_99 = () => Math.floor(Math.random() * 100);

        const random = random0_99();
        setmigrationState( {..._migrationState} )
        await sleep(2_000)
        if (random < 50) {
          // Success
          console.debug(`Steps3.tsx transferToken tokenInstanceToTransfer TRANSFER OK ${_tokenInstanceToTransfer.address} ${_tokenInstanceToTransfer.transferAmount} ${_from} ${_to} process`)
          _tokenInstanceToTransfer.tr_processed = true;
          _tokenInstanceToTransfer.selected = false;
          _migrationState.successItemsCount++;
        } else if (random < 75) {
          // Error
          throw "Random transfer error"
        } else {
          // Skipped
          console.debug(`Steps3.tsx transferToken tokenInstanceToTransfer TRANSFER SKIPPED ${_tokenInstanceToTransfer.address} ${_tokenInstanceToTransfer.transferAmount} ${_from} ${_to} process`)
          _tokenInstanceToTransfer.tr_skipped = true;
          _migrationState.skippedItemsCount++;
        }

      } catch (error) {
        console.error(`Steps3.tsx transferToken tokenInstanceToTransfer TRANSFER ERROR ${_tokenInstanceToTransfer.address} ${_tokenInstanceToTransfer.transferAmount} ${_from} ${_to} process error: ${error}`);
        _tokenInstanceToTransfer.tr_error = true;
          _migrationState.errorItemsCount++;
      }
      finally {
        try {
          setmigrationState( {..._migrationState} )
        } catch (error) {
          console.error(`Steps3.tsx transferToken tokenInstanceToTransfer TRANSFER ERROR STATE ${_tokenInstanceToTransfer.address} ${_tokenInstanceToTransfer.transferAmount} ${_from} ${_to} process error: ${error}`);
        }
      }
    } // transferToken
    ,
    [setmigrationState]
  ) // transferToken
*/
  const transferTokens = useCallback( async( _tokensInstancesToTransfer:TTokensInstances, /* _from:TAddressEmptyNullUndef, */ _to:TAddressEmptyNullUndef ) =>
    {
      try {
        console.debug(`Steps3.tsx transferTokens _tokensInstancesToTransfer.length=${_tokensInstancesToTransfer?.length} _from=${"_from"} _to=${_to}`)
        if (_tokensInstancesToTransfer && _tokensInstancesToTransfer.length) {
          const migrationState = {totalItemsCount:_tokensInstancesToTransfer.length,
            errorItemsCount:0,skippedItemsCount:0,successItemsCount:0}
          for (let tokenInstanceIndex = 0; tokenInstanceIndex < _tokensInstancesToTransfer.length; tokenInstanceIndex++) {
            const tokenInstanceToTransfer = _tokensInstancesToTransfer[tokenInstanceIndex];
            try {
              await transferToken(tokenInstanceToTransfer, /* _from, */ _to, migrationState)
            } catch (error) {
              console.error(`Steps3.tsx transferTokenS tokenInstanceToTransfer TRANSFER ERROR ${tokenInstanceToTransfer.address} ${tokenInstanceToTransfer.transferAmount} ${"_from"} ${_to} process error: ${error}`);
            }
          } // for (let tokenInstanceIndex = 0 ...
        } // if (_tokensInstancesToTransfer && _tokensInstancesToTransfer.length)
      } catch (error) {
        console.error(`Steps3.tsx transferTokenS error: ${error}`);
      }
    },
    [/* setmigrationState, */ transferToken]
  ) // transferTokens

  // ---

  const handlePauseTransfers = () => {
    setpauseTransfers(!pauseTransfers)
  }

  const handleStopTransfers = () => {
    setstopTransfers(!stopTransfers)
  }

  // ---

  const getTokensToMigrate = useCallback( ():TTokensInstances =>
  {
    try {
      console.debug(`Steps3.tsx getTokensToMigrate`)
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

  useEffect( () =>
    {
      settokensInstancesToMigrate(null)
      setShowProgressBar(true)
      setNextDisabled(true)
    },
    [ setNextDisabled, setShowProgressBar]
  )

  // ---

  useEffect( () =>
    {
      try {
        // if (step == Steps.migration) {
          const tokensToMigrate = getTokensToMigrate()
          settokensInstancesToMigrate(tokensToMigrate)
          if (tokensToMigrate && tokensToMigrate.length) {
          const migrationState = {totalItemsCount:tokensToMigrate.length,
            errorItemsCount:0,skippedItemsCount:0,successItemsCount:0}
            setmigrationState( migrationState )
          }
        // } // if (step == Steps.migration)
      } catch (error) {
        console.error(`Steps3.tsx updateTokensToMigrate [getTokensToMigrate, step, settokensInstancesToMigrate, setmigrationState] error: ${error}`);  
      }
    },
    [getTokensToMigrate, settokensInstancesToMigrate, setmigrationState]
  ) // useEffect



//   useEffect( () =>
//   {
//     console.debug(`Steps3.tsx useEffect [transferTokens, tokensInstances, targetAddress]`)
//     transferTokens(tokensInstances, /* accountAddress, */ targetAddress)
//   },
//   [ tokensInstances, /* accountAddress, */ targetAddress]
// )

  // ---

  useEffect( () =>
    {
      console.debug(`Steps3.tsx useEffect [transferTokens, tokensInstancesToMigrate, targetAddress] tokensInstancesToMigrate.length=${tokensInstancesToMigrate?.length}`)
      if (tokensInstancesToMigrate && tokensInstancesToMigrate.length) {
        transferTokens(tokensInstancesToMigrate, /* accountAddress, */ targetAddress)
      }
    },
    [ tokensInstancesToMigrate, /* accountAddress, */ targetAddress, transferTokens]
  )


  // ------------------------------

  return (
    <>

<div className="">
  

      <div className="min-w-full ">
        <div className="flex justify-center mt-2 p-1 bg-base-300 rounded-lg">

          {/* <div className="join"> */}

            <input type="checkbox" className="toggle mt-1" checked={pauseTransfers} onChange={handlePauseTransfers}  /> 
            <label className={(pauseTransfers?"animate-pulse text-info font-semibold":"text-neutral font-bold")+" text-sm md:text-lg lg:text-lg ml-2 mr-2"}>
              {"Pause"}
            </label>

            <button className={"btn btn-xs sm:btn-sm pl-4 "+(stopTransfers?"btn-disabled":"btn-warning")} onClick={handleStopTransfers}>Stop</button>

          {/* </div> */}

        </div>
      </div>

      <div className="min-w-full bg-base-100 my-2"></div>

      <div className="w-full block p-2">
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
  </>
  );
}

// ------------------------------

export default Step3;