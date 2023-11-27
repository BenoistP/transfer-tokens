// React
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Components
import StepError from "@Components/StepError";
import Step0 from "@Components/Step0";
import Step1 from "@Components/Step1";
import Step2 from "@Components/Step2";
import Step3 from "@Components/Step3";
import MainContentContainer from "@Components/MainContentContainer";
// Context Hooks
import { useMoveTokensAppContext } from '@Providers/MoveTokensAppProvider/MoveTokensAppContext'
// Utils
import { getChainTokensList } from "@jsutils/tokensListsUtils";
// Contracts calls
import { GetContractResult, getContract, multicall } from '@wagmi/core'
// Connected account
import { useAccount } from 'wagmi'
// ABIs
import { erc20ABI } from '@wagmi/core'
import CoinBridgeToken from "@abis/CoinBridgeToken.json";
// Consts & Enums
import { PUBLIC_MULTICALL_MAX_BATCH_SIZE_DEFAULT, WATCH_MAX_WARNING_COUNT } from "@uiconsts/misc";
import { EStepsLoadTokensData, EChainTokensListLoadState,
  ESteps, ETokenTransferState } from "@jsconsts/enums"; 
import { DURATION_LONG,
  FETCHDATA_MULTICALL_MAX_RETRY, FETCHDATA_MULTICALL_SUCCESSSTATUS } from "@App/js/constants/ui/uiConsts";
import { TOAST_OPACITY_ALPHA } from "@App/js/constants/ui/twDaisyUiStyles";
// Events
import { usePublicClient } from 'wagmi'
import { Log } from "viem";
 // Toasts
 import toast from 'react-hot-toast'
 // Icons
import { XCircleIcon } from '@heroicons/react/24/solid'
// Translation
import { useTranslation } from "react-i18next";

export default function StepsContainer (
  { tokensLists, chainId, setpreviousDisabled, setNextDisabled,
    isLoadingTokensLists, isErrorTokensLists, setShowProgressBar, setmigrationState, setshowActivity,
  } :IStepsContainerProps )  {

  const {t} = useTranslation()
  const {address: connectedAddress} = useAccount()
  const { moveTokensAppData: { step = -1 }, moveTokensAppDataHandlers: { resetToInitialStep } } = useMoveTokensAppContext()

  const [selectableTokensLists, setselectableTokensLists] = useState<TSelectableTokensLists>(null)

  const [selectedChainsTokensList, setselectedChainsTokensList] = useState<TChainsTokensListArrayNullUndef>(null)
  const [tokensInstances, settokensInstances] = useState<TTokensInstances>(null)
  // Array of tokensInstances indexed by address in UPPER CASE (used for events)
  const [tokensInstanceIndex, settokensInstanceIndex] = useState<TTokenInstanceIndex>({})

  const [targetAddress, settargetAddress] = useState<TAddressEmpty>("")

  const [isLoadingTokensInstances, setisLoadingTokensInstances] = useState<boolean>(false)
  const [isErrorTokensInstances, setisErrorTokensInstances] = useState(false)
  const [isUpdatingTokensInstances, setisUpdatingTokensInstances] = useState(false)

  // Sorting
  const [sortOrderTokenDisplayId, setsortOrderTokenDisplayId] = useState<TsortOrder>(0) // 0: unsorted, 1: lowest first , 2 highest first
  const [sortOrderTokenName, setsortOrderTokenName] = useState<TsortOrder>(0) // 0: unsorted, 1: lowest first , 2 highest first
  const [sortOrderTokenBalance, setsortOrderTokenBalance] = useState<TsortOrder>(0) // 0: unsorted, 1: lowest first , 2 highest first

  // Filtering
  const [nameFilter, setFilterName] = useState<string>("")
  const [balanceGt0Filter, setFilterBalanceGt0] = useState<boolean>(true) // set checked by default (display only balance > 0)
  const [balanceFilter, setFilterBalance] = useState<string>("")
  const [addressFilter, setFilterAddress] = useState<string>("")

  // Selection
  const [selectAll, setselectAll] = useState<boolean>(false);
  const [selectAllVisible, setselectAllVisible] = useState<boolean>(false);
  const [invertAll, setinvertAll] = useState(false)
  const [invertAllVisible, setinvertAllVisible] = useState(false)

  // Events
  const unwatch = useRef(function () { })
  const previousStep = useRef(step)

  // Multicall / Fetch issues
  const fetchDataIssuesWarnShown = useRef(false)
  // Only report watch errors a few times
  const watchWarningReportCount = useRef(0)

  // ------------------------------

  // Wagmi public client
  const publicClient = usePublicClient( {chainId: chainId} )

  /**
   * Display warning message toast
   */
  const showWarningToast = useCallback(
    async ( _message:string ) : Promise<void> =>
    {
      try {
          toast.custom(
            (_toast) => (
              <div className={`block alert alert-warning w-auto p-2 m-0`}
                style={{
                  opacity: _toast.visible ? TOAST_OPACITY_ALPHA : 0,
                  transition: "opacity 100ms ease-in-out",
                  border: '1px solid black',
                }}
              >
                <div className="grid grid-cols-8 gap-0 m-0 p-0">
                  <div className="-p-0 m-0"><button onClick={() => toast.dismiss(_toast.id)}><XCircleIcon className={'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2'} /></button></div>
                  <div className="p-0 pl-1 pt-1 m-0 col-span-7">{`${t(_message)}`}</div>
                </div>
              </div>
            ),
            { duration: DURATION_LONG }
          )
      } catch (error) {
          console.error(`showWarningToast error: ${error}`)
      }
    },
    [t]
  )

  /**
   * Display watch error (toast+console)
   */
  const reportWatchError = useCallback(
    (error:Error) =>
    {
      watchWarningReportCount.current++
      console.warn(`reportWatchError error: ${error.name}`)
      // Only report a few times
      if (watchWarningReportCount.current < WATCH_MAX_WARNING_COUNT) {
        showWarningToast("moveTokens.warnings.watchTransfers")
      }
    },
    [showWarningToast]
  )

  /**
   * load token instance balance for address
   * @param _tokenInstance
   * @param _address must be checksummed
   */
  const getTokenOnChainData_addressBalance = useCallback(
    async(_tokenInstance:TTokenInstance, _address:TAddressEmptyNullUndef):Promise<bigint|undefined> =>
    {
      try {
        if (_tokenInstance?.contract) {
          const balance = await (_tokenInstance.contract as GetContractResult).read.balanceOf([_address])
          if (typeof balance == "bigint") {
            return balance as bigint
          }
        }
      } catch (error) {
        console.error(`getTokenOnChainData_addressBalance error: ${error}`);
      }
      return undefined
    },
    []
  ) // getTokenOnChainData_addressBalance

  /**
   * Update tokenInstance with balances and transfer state
   * @param _tokenInstanceAddress
   * @param _updateFromAddress
   * @param _fromAddress
   * @param _fromAddressBalanceUpdate
   * @param _updateToAddress
   * @param _toAddress
   * @param _targetAddressBalanceUpdate
   * @param _processedState optionnal ETokenTransferState when called from transfer
   */
  const updateTokenInstanceBalancesAndTransferState = useCallback(
    ( _tokenInstanceAddress: TAddressString, _updateFromAddress: boolean, _fromAddress: TAddressString, _fromAddressBalanceUpdate: TTokenAmount,
      _updateToAddress: boolean, _toAddress: TAddressString, _targetAddressBalanceUpdate: TTokenAmount, _processedState?: ETokenTransferState) =>
    {
      try {
        if (tokensInstances && tokensInstances.length && _tokenInstanceAddress && (_updateFromAddress||_updateToAddress||_processedState)) {
          const newTokensInstances = tokensInstances.map( (tokenInstance:TTokenInstance) => {
            if (tokenInstance.address == _tokenInstanceAddress) {
              const fromADDRESS = _fromAddress?.toUpperCase()
              const toADDRESS = _toAddress?.toUpperCase()
              let {transferAmount, transferAmountLock, selected, selectable, userData} = tokenInstance;
              const {transferState} = tokenInstance;
              // Update balances
              if (_updateFromAddress||_updateToAddress) {
                userData = {...userData,
                  [fromADDRESS as any]: ( _updateFromAddress?{...userData[fromADDRESS as any], balance: _fromAddressBalanceUpdate }: {...userData[fromADDRESS as any]} ),
                  [toADDRESS as any]: ( _updateToAddress?{...userData[toADDRESS as any], balance: _fromAddressBalanceUpdate }: {...userData[toADDRESS as any]} ) };
                const connectedADDRESS = connectedAddress?.toUpperCase()
                // If connected address has NO BALANCE : set as unselectable/unselected, remove transfer amount and lock
                if (  (connectedADDRESS == fromADDRESS && _updateFromAddress && !_fromAddressBalanceUpdate)
                    || (connectedADDRESS == toADDRESS && _updateToAddress && !_targetAddressBalanceUpdate)) {
                  selectable = false; selected = false; transferAmount = 0n; transferAmountLock = false;
                }
              }
              // Update processed state, reset selected, transfer amount and lock depending on processed state
              if (_processedState) {
                transferState.transfer = _processedState;
                if (_processedState == ETokenTransferState.processed) {
                  selected = false; transferAmount = 0n; transferAmountLock = false;
                } else if (_processedState == ETokenTransferState.skipped) selected = false;
              }
              return {...tokenInstance, userData, transferAmount, transferAmountLock, selected, selectable,  transferState}
            }
            return tokenInstance
          })
          settokensInstances(newTokensInstances)
        }
      } catch (error) {
        console.error(`updateTokenInstanceBalancesAndTransferState error: ${error}`);
      }
    },
    [tokensInstances, connectedAddress]
  )

  /**
   * Update tokenInstance with transfer state
   * @param _tokenInstanceAddress
   * @param _updateFromAddress
   * @param _fromAddress
   * @param _fromAddressBalanceUpdate
   * @param _updateToAddress
   * @param _toAddress
   * @param _targetAddressBalanceUpdate
   * @param _processedState optionnal ETokenTransferState when called from transfer
   */
  const updateTokenInstanceTransferState = useCallback(
    ( _tokenInstanceAddress: TAddressString, _processedState: ETokenTransferState) =>
    {
      try {
        if (tokensInstances && tokensInstances.length && _processedState) {
          const newTokensInstances = tokensInstances.map( (tokenInstance:TTokenInstance) => {
            if (tokenInstance.address == _tokenInstanceAddress) {
              const {transferState} = tokenInstance;
              let {transferAmount, transferAmountLock, selected} = tokenInstance;
              // Update processed state, reset selected, transfer amount and lock depending on processed state
              transferState.transfer = _processedState;
              if (_processedState == ETokenTransferState.processed) {
                selected = false; transferAmount = 0n; transferAmountLock = false;
              } else if (_processedState == ETokenTransferState.skipped) {
                selected = false; // UNselect
              }
              return {...tokenInstance, transferAmount, transferAmountLock, selected, transferState}
            }
            return tokenInstance
          })
          settokensInstances(newTokensInstances)
        }
      } catch (error) {
        console.error(`updateTokenInstanceTransferState error: ${error}`);
      }
    },
    [tokensInstances]
  )

  /**
  * Update tokenInstance on transfer
  * check if From and/or To address has data and if balances have been updated
  * @param _tokenInstance
  * @param _fromAddress
  * @param _toAddress
  * @param _processedState optionnal ETokenTransferState when called from transfer
  * @param _delay optionnal delay in ms before updating balances and state
  */
  const updateTokenOnTransferProcessed = useCallback(
    async(  _tokenInstance: TTokenInstance,
            _fromAddress: TAddressNullUndef, _toAddress: TAddressNullUndef,
            _delay?:number, _processedState?: ETokenTransferState ) =>
    {
      try {
        if (_fromAddress && _toAddress) {
          if (_delay) { await new Promise(r => setTimeout(r, _delay)); } // Delay balance & state update
          const fromADDRESS =  _fromAddress.toUpperCase() as TAddressString;
          const toADDRESS = _toAddress.toUpperCase() as TAddressString;
          let updateFromAddress = false, updateToAddress = false, fromAddressBalanceUpdate = 0n, toAddressBalanceUpdate = 0n;
          // Check if any userdata corresponding to (From, To) balances have been updated
          if (_tokenInstance.userData[fromADDRESS as any]) {
            const fromAddressBalance = await getTokenOnChainData_addressBalance(_tokenInstance, _fromAddress);
            if (fromAddressBalance != undefined) {
              fromAddressBalanceUpdate = fromAddressBalance; updateFromAddress = true;
            }
          }
          if (_tokenInstance.userData[toADDRESS as any]) {
            const targetAddressBalance = await getTokenOnChainData_addressBalance(_tokenInstance, _toAddress);
            if (targetAddressBalance != undefined) {
              toAddressBalanceUpdate = targetAddressBalance; updateToAddress = true;
            }
          }
          if (updateFromAddress||updateToAddress||_processedState) {
            updateTokenInstanceBalancesAndTransferState(_tokenInstance.address, updateFromAddress, _fromAddress, fromAddressBalanceUpdate, updateToAddress, _toAddress, toAddressBalanceUpdate, _processedState)
          }
        }
      } catch (error) {
        console.error(`updateTokenOnTransferProcessed error: ${error}`);
      }
    },
    [getTokenOnChainData_addressBalance, updateTokenInstanceBalancesAndTransferState]
  )

  /**
   * Just a log displaying transfer events in console
   * @param _tokenInstance
   * @param _from
   * @param _to
   * @param _value
   */
  const showTransfer = useCallback(
    (_tokenInstance: TTokenInstance, _from: TAddressString, _to: TAddressString, _value: any) =>
    {
      try {
        if (_tokenInstance && _from && _to && _value) {
          const decimals = BigInt(_tokenInstance.decimals)
          const intValue = ( _value / (10n**decimals) );
          const decimalValue = _value - intValue * (10n**decimals);
          let longBalanceString = "0";
          if (decimalValue > 0) {
            // exact decimals display
            const longDecimalDisplayPadded = decimalValue.toString().padStart( Number(decimals) , "0");
            longBalanceString = intValue+"."+longDecimalDisplayPadded;
          } else {
            longBalanceString = intValue.toString()+"."+"0".repeat(Number(decimals))
          }
          console.info(`transfer of "${_tokenInstance.name}" (${_tokenInstance.address}) from:${_from} to:${_to} for: ${longBalanceString}`)
        }
      } catch (error) {
        console.error(`showTransfer error: ${error}`);
      }
    },
    [] // no dependencies
  ) // showTransfer

  // ---

  const processTransferEvent = useCallback( async(logs:Log[]) =>
    {
      try {
        if (logs && logs.length) {
          logs.forEach( async(log:any) => {
            const logADDRESS = log.address.toUpperCase()
            // Find token instance in indexed "array"
            const tokenInstance = tokensInstanceIndex[logADDRESS]
            if (tokenInstance) {
              if (log.args) {
                const from = log.args["from"], to = log.args["to"], value = log.args["value"];
                showTransfer(tokenInstance, from, to, value)
                if (tokenInstance.userData && from && to && value) {
                    updateTokenOnTransferProcessed(tokenInstance, from, to)
                } // if (from && to && value)
              } // if (log.args)
            } // if (tokenInstance)
          }) // logs.forEach
        } // if (logs && logs.length)
      } catch (error) {
        console.error(`processTransferEvent logs: ${logs} error: ${error}`);
      }
    },
    [tokensInstanceIndex, updateTokenOnTransferProcessed, showTransfer]
  ); // processTransferEvent

  // ---

  // Filter

  const updateNameFilter = useCallback(
    (e: React.FormEvent<HTMLInputElement>): void =>
      {
        try {
          setFilterName(e.currentTarget.value);
        } catch (error) {
          console.error(`updateNameFilter e.currentTarget.value: ${e.currentTarget.value} error: ${error}`);
        }
      },
      []
  ); // updateNameFilter

  // ---

  const updateBalanceFilter = useCallback(
    (e: React.FormEvent<HTMLInputElement>): void =>
      {
        try {
          setFilterBalance(e.currentTarget.value);
        } catch (error) {
          console.error(`updateBalanceFilter e.currentTarget.value: ${e.currentTarget.value} error: ${error}`);
        }
      },
      []
  ); // updateBalanceFilter

  // ---

  const switchBalanceGt0Filter = useCallback(
    (): void =>
      {
        try {
          setFilterBalanceGt0(!balanceGt0Filter);
        } catch (error) {
          console.error(`switchBalanceGt0Filter error: ${error}`);
        }
      },
      [balanceGt0Filter]
  ); // switchBalanceGt0Filter

  // ---

  const updateAddressFilter = useCallback(
    (e: React.FormEvent<HTMLInputElement>): void =>
      {
        try {
          setFilterAddress(e.currentTarget.value);
        } catch (error) {
          console.error(`updateAddressFilter e.currentTarget.value: ${e.currentTarget.value} error: ${error}`);
        }
      },
      []
  ); // updateAddressFilter

  // ---

  const clearAllFilters = useCallback(
    (): void =>
      {
        try {
          setFilterAddress("");
          setFilterBalance("");
          setFilterName("");
          setFilterBalanceGt0(false);
        } catch (error) {
          console.error(`clearAllFilters ${error}`);
        }
      },
      []
  ); // clearAllFilters

  const tokenInstanceFilterParamsUpdaters = {
    updateNameFilter, switchBalanceGt0Filter, updateBalanceFilter, updateAddressFilter, clearAllFilters
  }

  // ---

  const tokenInstanceFilterParams = useMemo(() => {
    return {
      name: nameFilter, balanceGt0: balanceGt0Filter, balance: balanceFilter, address: addressFilter
    }
  }, [nameFilter, balanceGt0Filter, balanceFilter, addressFilter]);

  // ---

  const filterTokenInstance = useCallback( (token:TTokenInstance) =>
    {
      const filterTokenInstanceWithFilterProps = (filter: ITokenInstanceListFilterStates, token:TTokenInstance) =>
      {
        try {
          const nameFilter = filter.name && token.name ? token.name.toLowerCase().includes(filter.name.toLowerCase()) : true ;
          if (!nameFilter) return false ; // RETURN

          const connectedADDRESS = connectedAddress?.toUpperCase();
          const balanceGt0Filter = filter.balanceGt0 ? (token.userData[connectedADDRESS as any]?.balance || 0) > 0 : true ;
          if (!balanceGt0Filter) return false ; // RETURN

          if (filter.balance) {
            const balanceSplit = filter.balance.split('.')
            const intPart:string = balanceSplit[0]
            const intValueBI = BigInt(intPart)
            const floatPart:string = balanceSplit[1]
            const leadingZeros:number = floatPart?.match(/^0+/)?.[0].length || 0
            const floatValue = floatPart ? BigInt(floatPart) : 0n
            const filterValueInt =  BigInt(Math.pow(10, token.decimals)) * intValueBI
            const filterValueFloat = BigInt(Math.pow(10, token.decimals-(leadingZeros+floatValue.toString().length))) * floatValue
            const filterValue = filterValueInt + filterValueFloat
            const balanceFilter = filter.balance && token.decimals ? (token.userData[connectedADDRESS as any]?.balance || 0) >= filterValue : true ;
            if (!balanceFilter) return false ; // RETURN
          }
          const addressFilter = filter.address && token.address ? token.address.toLowerCase().includes(filter.address.toLowerCase()) : true ;
          return addressFilter; // RETURN
        } catch (error) {
          console.error(`filterTokenInstanceWithFilterProps error: ${error}`);
          return true; // error : skip and RETURN TRUE
        }
      }

      try {
        return filterTokenInstanceWithFilterProps(tokenInstanceFilterParams, token)
      } catch (error) {
        console.error(`filterTokenInstance error: ${error}`);
        return true; // error : skip and RETURN TRUE
      }
    },
    [connectedAddress, tokenInstanceFilterParams]
  ) // filterTokenInstance

  // ------------------------------

  // Sort

  const sortByTokenDisplayId = useCallback( () => {
    if (sortOrderTokenDisplayId === 0) {
      setsortOrderTokenDisplayId(1)
    } else if (sortOrderTokenDisplayId === 1) {
      setsortOrderTokenDisplayId(2)
    } else {
      setsortOrderTokenDisplayId(0)
    }
  }, [sortOrderTokenDisplayId] );

  // ---

  const sortByTokenName = useCallback( () => {
    if (sortOrderTokenName === 0) {
      setsortOrderTokenName(1)
    } else if (sortOrderTokenName === 1) {
      setsortOrderTokenName(2)
    } else {
      setsortOrderTokenName(0)
    }
  }, [sortOrderTokenName] );

  // ---

  const sortByTokenBalance = useCallback( () => {
    if (sortOrderTokenBalance === 0) {
      setsortOrderTokenBalance(1)
    } else if (sortOrderTokenBalance === 1) {
      setsortOrderTokenBalance(2)
    } else {
      setsortOrderTokenBalance(0)
    }
  }, [sortOrderTokenBalance] );

  // ---

  const sortOrderParams = { displayId: sortOrderTokenDisplayId, tokenName: sortOrderTokenName, tokenBalance: sortOrderTokenBalance } as ISortOrderParams

  /**
   * @param a tokenInstance
   * @param b tokenInstance
   * @returns sort order : 0: equal, 1: a<b, 2: a>b
   */
  const sortTokensInstances = (a:TTokenInstance, b:TTokenInstance) =>
  {
    try {
      if (sortOrderParams.displayId === 0) {
        if (sortOrderParams.tokenName === 0) {
          if (sortOrderParams.tokenBalance === 0) {
            return 0
          }
          const connectedADDRESS = connectedAddress?.toUpperCase();
          const aBalance = a.userData?.[connectedADDRESS as any].balance || 0n;
          const bBalance = b.userData?.[connectedADDRESS as any].balance || 0n;
          if (sortOrderParams.tokenBalance === 1) {
            const compAMinusB = aBalance - bBalance
            return Number(compAMinusB)
          } else {
            const compBMinusA = bBalance - aBalance
            return Number(compBMinusA)
          }
        }
        else if (sortOrderParams.tokenName === 1) {
          if (a.name) {
            return a.name?.localeCompare(b.name??"")
          }
          return -1
        }
        else {
          if (b.name) {
            return b.name?.localeCompare(a.name??"")
          }
          return -1
        }
      } else if (sortOrderParams.displayId === 1) {
        return a.displayId - b.displayId
      } else {
        return b.displayId - a.displayId
      }
    } catch (error) {
      console.error(`sortTokensInstances error: ${error} connectedAddress=${connectedAddress}`);
      return 0
    }
  } // sortTokensInstances

  // ------------------------------

  // Selection

  /**
   * Update "check all" checkbox status
   * @param tokensInstances
   */
  const updateCheckAll = useCallback(
    (tokensInstances:TTokensInstances) =>
    {
      try {
        if (tokensInstances && connectedAddress) {
          const isAllChecked = tokensInstances.every( (tokensInstance) => {
              if (tokensInstance.selectable && tokensInstance.transferAmount) {
                return tokensInstance.selected;
              }
              return true; // not selectable OR no amount : RETURN TRUE
            }
          );
          setselectAll(isAllChecked);
        } else {
          setselectAll(false);
        }
      } catch (error) {
        console.error(`updateCheckAll error: ${error}`);
      }
    },
    [connectedAddress]
  );

  /**
   * Update "check all visible" checkbox status
   * @param tokensInstances
   */
  const updateCheckAllVisible = useCallback(  (tokensInstances:TTokensInstances) =>
    {
      try {
        if (tokensInstances && connectedAddress) {
          const isAllChecked = tokensInstances.every( (tokensInstance) => {
              if (tokensInstance.selectable && tokensInstance.transferAmount&&filterTokenInstance(tokensInstance)) {
                  return tokensInstance.selected;
              }
              return true; // not selectable OR no amount OR not visible : RETURN TRUE
            }
          );
          setselectAllVisible(isAllChecked);
        } else {
          setselectAllVisible(false);
        }
      } catch (error) {
        console.error(`updateCheckAll error: ${error}`);
      }
    },
    [connectedAddress, filterTokenInstance]
  );

  // ---

  /**
   * Sets all tokensInstances as selected depending on filter
   */
  const handleCheckSelectAll = useCallback(
    (filter:boolean=false) =>
      {
        try {
          if (tokensInstances) {
            const connectedADDRESS = (connectedAddress?connectedAddress.toUpperCase():"");
            const targetADDRESS = targetAddress.toUpperCase();
            const newCheckAll = (filter?!selectAll:!selectAllVisible);
            const tokensInstancesCheckAll = tokensInstances.map((tokensInstance) => {
              // TODO: simplify with selectable ?
              if (  tokensInstance.selectable && targetADDRESS && tokensInstance.userData &&
                    tokensInstance.userData[targetADDRESS as any].canTransfer &&
                    tokensInstance.userData[connectedADDRESS as any].canTransfer &&
                    (tokensInstance.userData[connectedADDRESS as any].balance||0n) > 0n &&
                    tokensInstance.transferAmount > 0n
                  )
              {
                if (filter) {
                  if (filterTokenInstance(tokensInstance)) {
                    tokensInstance.selected = newCheckAll;
                  }
                } else {
                  tokensInstance.selected = newCheckAll;
                }
              }
              return {...tokensInstance}
            });
            settokensInstances(tokensInstancesCheckAll);
            if (filter) {
              setselectAllVisible(newCheckAll);
              updateCheckAll(tokensInstancesCheckAll);
            } else {
              setselectAll(newCheckAll);
              updateCheckAllVisible(tokensInstancesCheckAll);
            }
          }
        } catch (error) {
          console.error(`handleCheckSelectAll error: ${error}`);
        }
      },
      [tokensInstances, connectedAddress, targetAddress, selectAll,
      filterTokenInstance, updateCheckAll, selectAllVisible, updateCheckAllVisible]
  );

  /**
   * Inverts all tokensInstances selection depending on filter
   */
  const handleInvertAllChecks = useCallback(
    (filter:boolean=false) =>
      {
        try {
            if (tokensInstances) {
              const connectedADDRESS = (connectedAddress?connectedAddress.toUpperCase():"");
              const targetADDRESS = targetAddress.toUpperCase();
              const tokensInstancesInvertCheck = tokensInstances.map((tokensInstance) => {
                if (tokensInstance.selectable) {
                  if (tokensInstance.userData && targetADDRESS && tokensInstance.userData[connectedADDRESS as any]
                    && tokensInstance.userData[connectedADDRESS as any].canTransfer
                    && tokensInstance.userData[targetADDRESS as any].canTransfer
                    && tokensInstance.transferAmount>0
                    ) {
                    if (filter) {
                      if (filterTokenInstance(tokensInstance)) {
                        tokensInstance.selected = ! tokensInstance.selected;
                      }
                    } else {
                      tokensInstance.selected = ! tokensInstance.selected;
                    }
                  }
                }
                return {...tokensInstance}
              });
              settokensInstances(tokensInstancesInvertCheck);
              if (filter) {
                setinvertAllVisible(!invertAllVisible);
              } else {
                setinvertAll(!invertAll);
              }
              updateCheckAll(tokensInstancesInvertCheck);
              updateCheckAllVisible(tokensInstancesInvertCheck);
          }
        } catch (error) {
          console.error(`handleInvertAllChecks error: ${error}`);
        }
      },
      [tokensInstances, invertAll, connectedAddress, targetAddress,
      filterTokenInstance, updateCheckAll, updateCheckAllVisible, invertAllVisible]
  );

  /**
   * Called when a checkbox is clicked
   * @param id tokenInstance.selectID
   * @param value checkbox value
   */
  const updateCheckboxStatus:IUpdateCheckboxStatus = (id: string, value: TChecked | undefined) =>
    {
      try {
        const connectedADDRESS = (connectedAddress?connectedAddress.toUpperCase():"");
        const tokensInstancesUpdated = tokensInstances?.map((tokenInstance) => {
          if (tokenInstance.selectID === id) {
            if (connectedADDRESS && tokenInstance.userData && tokenInstance.userData[connectedADDRESS as any]) {
              if (value) {
                tokenInstance.selected = value.checked;
              } else {
                tokenInstance.selected = !tokenInstance.selected;
              }
            }
          }
          return {...tokenInstance}
        })
        settokensInstances(tokensInstancesUpdated);
        updateCheckAll(tokensInstancesUpdated);
        updateCheckAllVisible(tokensInstancesUpdated);
      } catch (error) {
        console.error(`updateCheckboxStatus error: ${error}`);
      }
    }

  /**
   * Called on transfer amount change
   * @param id tokenInstance.selectID
   * @param amount amount to transfer
   */
  const updateTransferAmount:IUpdateTransferAmount = /* useCallback( */
    (id: string, amount: TTokenAmount) =>
      {
        try {
          const tokensInstancesUpdated = tokensInstances?.map((tokenInstance) => {
            if (tokenInstance.selectID === id) {
              tokenInstance.transferAmount = amount;
            }
            return {...tokenInstance}
          })
          settokensInstances(tokensInstancesUpdated);
          updateCheckAll(tokensInstancesUpdated);
          updateCheckAllVisible(tokensInstancesUpdated);
        } catch (error) {
          console.error(`updateTransferAmount error: ${error}`);
        }
      }

  /**
   * Called on transfer amount lock change
   * @param id tokenInstance.selectID
   * @param value lock value
   */
  const updateTransferAmountLock:ITransferAmountLock = (id: string, value: boolean) =>
    {
      try {
        const connectedADDRESS = (connectedAddress?connectedAddress.toUpperCase():"");
        const tokensInstancesUpdated = tokensInstances?.map((tokenInstance) => {
          if (tokenInstance.selectID === id) {
            if (connectedADDRESS && tokenInstance.userData && tokenInstance.userData[connectedADDRESS as any]) {
              tokenInstance.transferAmountLock = value;
            } // if (connectedAddress && ...
          }
          return {...tokenInstance}
        })
        settokensInstances(tokensInstancesUpdated);
      } catch (error) {
        console.error(`updateTransferAmountLock error: ${error}`);
      }
    }

  /**
   * Handlers for tokensInstancesListTableProps
   */
  const tokensInstancesListTablePropsHandlers:ITokensInstancesListTableStatesHandlers = {
    sortStates: {
      sortOrderTokenDisplayId, sortOrderTokenName, sortOrderTokenBalance
    },
    sortHandlers: {
      sortByTokenDisplayId, sortByTokenName, sortByTokenBalance, sortTokensInstances
    },
    selectStates: {
      selectAll, selectAllVisible
    },
    updateHandlers: {
      handleCheckSelectAll, handleInvertAllChecks, updateCheckboxStatus, updateTransferAmount, updateTransferAmountLock,
    },
    filterStates: {
      name: nameFilter, balanceGt0: balanceGt0Filter, balance: balanceFilter, address: addressFilter,
    },
    filterHandlers: {
      filterTokenInstance, tokenInstanceFilterParamsUpdaters,
    }
  }

  /**
   * returns selected tokens lists
   */
  const getSelectedTokenLists = useCallback( (selectableTokensLists:TSelectableTokensLists):TSelectableTokensLists =>
    {
      try {
        const selectedTokensLists = selectableTokensLists?.filter( (selectableTokensList:TSelectableTokensList) => {
          return selectableTokensList.selected && selectableTokensList.chainId == chainId
        })
        return selectedTokensLists;
      } catch (error) {
        console.error(`getSelectedTokenLists error: ${error}`);
        return null;
      }
    },
    [chainId]
  )

  // ------------------------------

  // Tokens Data init & loading

  const initTokenInstance = useCallback( (_token:TTokenChainData, _displayId:TDisplayId ): TTokenInstance|TNullUndef =>
    {
      if (_token?.address) {
        const connectedADDRESS = (connectedAddress?connectedAddress.toUpperCase():"");
        const tokenInstanceUserDataArray:TTokenInstanceUserData[] = new Array<TTokenInstanceUserData>()
        if (connectedADDRESS) {
          tokenInstanceUserDataArray[connectedADDRESS as any] = {
            balance: null,
            canTransfer: true, // warn: COULD BE FALSE for non transferable tokens, should be defaulted to false then checked with a multicall
          }
        }
        const _tokenInstance = {
          chainId, type: (_token.extraData && _token.extraData.type ? _token.extraData.type : "ERC20" as TTokenType),
          address: _token.address, contract: null, decimals: 18, name: "", symbol: "", displayed: true, displayId: _displayId, selectID: chainId+"-"+_token.address,
          selectable: false, selected: false, transferAmount: 0n, transferAmountLock: false, transferState: { processing: false, transfer: ETokenTransferState.none},
          userData: tokenInstanceUserDataArray,
        }
        return _tokenInstance
      }
    },
    [chainId, connectedAddress]
  )

  // ------------------------------

  const setStateLoadingTokensInstances = useCallback( (isLoading:boolean) =>
    {
      setisLoadingTokensInstances(isLoading)
    }, []
  )

  // ---

  const setStateUpdatingTokensInstances = useCallback( (isUpdating:boolean) =>
    {
      setisUpdatingTokensInstances(isUpdating)
    }, []
  )

  // ---

  const setStateErrorLoadingTokensInstances = useCallback( (isError:boolean) =>
    {
      setisErrorTokensInstances(isError)
    }, []
  )

  // ---

  const setStateIsFetchingData = useCallback( (isWorking:boolean) =>
    {
      setshowActivity(isWorking)
    }, [setshowActivity]
  )

  // ------------------------------

  /**
   * @param defaultBatchSize 
   * @returns max batch size: number of call in one multicall
   */
  const getMaxBatchSize = ( defaultBatchSize: number ) =>
  {
   let MAXBATCHSIZE = defaultBatchSize;
   try {
     const val = import.meta.env.PUBLIC_MULTICALL_MAX_BATCH_SIZE
     if (val) {
       MAXBATCHSIZE = Number.isSafeInteger(Number.parseFloat(val))
         ? Number.parseInt(val, 10)
         : defaultBatchSize;
       }
       return MAXBATCHSIZE
     } catch (error) {
     console.error(`getMaxBatchSize error: ${error}`);
     return MAXBATCHSIZE
   }
  };

  /**
   * Memoized max batch size
   */
  const MAXBATCHSIZE:number = useMemo(
    () => getMaxBatchSize(PUBLIC_MULTICALL_MAX_BATCH_SIZE_DEFAULT),
    []
  ); // MAXBATCHSIZE


  /**
   * Contracts instanciation
   */
  const loadTokensContracts = useCallback( async(tokensInstances:TTokensInstances):Promise<TTokensInstances> =>
    {
      try {
        const contractCoinBridgeTokenABI = JSON.parse(CoinBridgeToken.ABI)
        tokensInstances?.forEach( (tokenInstance:TTokenInstance) => {
          const abi = tokenInstance.type == "COINBRIDGE" as TTokenType ? contractCoinBridgeTokenABI : erc20ABI;
          if (tokenInstance?.address) {
            tokenInstance.contract = getContract({address: tokenInstance.address, abi})
          }
        })
        return tokensInstances
      }
      catch (error) {
        console.error(`loadTokensContracts error: ${error}`);
      }
    },
    []
  );

  // ---

  const getOnChainData = useCallback( async(multicallInput : any[], _maxbatchSize:number=MAXBATCHSIZE ) :  Promise<any[]>  =>
  {
    let multicallAllBatchesResult : any[] = [];
    try {
       for (let i = 0; i < Math.ceil(multicallInput.length / _maxbatchSize); i++) {
         const batch = multicallInput.slice(i * _maxbatchSize, (i + 1) * _maxbatchSize);
         const multicallBatchResult = await multicall({
           contracts: batch, // allowFailure: true, // silently fail, error logged in results array
         })
         multicallAllBatchesResult = multicallAllBatchesResult.concat(multicallBatchResult);
       }
     }
     catch (error) {
       console.error(`getOnChainData error: ${error}`);
     }
     return multicallAllBatchesResult;
    }
    ,
    [MAXBATCHSIZE]
  ); // getOnChainData

  /**
   * Fetch on chain data
   */
  const fetchOnChainData = useCallback( async(multicallInput : any[] ) :  Promise<any[]>  =>
    {
      let multicallResults : any[] = []; // Final result sent back
      const multicallFetchResults : any[][] = []; // Temporary result
      try {
        let retryFetchCount = 0, multicallHasErrors = false, maxBatchSize = MAXBATCHSIZE;
        do {
          if (retryFetchCount > 1) {
            await new Promise(resolve => setTimeout(resolve, retryFetchCount * 1_000)); // Wait <retryFetchCount> seconds before retry
            maxBatchSize = Math.floor(maxBatchSize/2); // try smaller batch size
          }
          multicallFetchResults[retryFetchCount] = await getOnChainData(multicallInput, maxBatchSize)
          // Search for error(s)
          multicallHasErrors = multicallFetchResults[retryFetchCount].some( (multicallResult) => (multicallResult && multicallResult.status != FETCHDATA_MULTICALL_SUCCESSSTATUS) )
          if (!multicallHasErrors) {
            multicallResults = multicallFetchResults[retryFetchCount] // No error: set result as current multicall fetch results
          }
          else {
            // Error(s) found
            // Build multicallResults
            if (!multicallResults.length) {
              multicallResults = multicallFetchResults[retryFetchCount]
            } else {
              // Merge with previous results
              for (let iMulticallResults = 0; iMulticallResults < multicallResults.length; iMulticallResults++) {
                if (multicallResults[iMulticallResults].status != FETCHDATA_MULTICALL_SUCCESSSTATUS) {
                  multicallResults[iMulticallResults] = multicallFetchResults[retryFetchCount][iMulticallResults] // error in previous result : replace by current fetch result
                }
              }
            }
            if (retryFetchCount>=2 && !fetchDataIssuesWarnShown.current) {
              fetchDataIssuesWarnShown.current = true;
              showWarningToast("moveTokens.warnings.fetchData")
            }
            retryFetchCount++;
            // Search again for error(s) after merge
            multicallHasErrors = multicallResults.some( (multicallResult) => {
              return (multicallResult && multicallResult.status != FETCHDATA_MULTICALL_SUCCESSSTATUS)
            })

// TODO: DEBUG to remove <---------------------------------------
// console.debug(`fetchOnChainData: retryFetchCount=${retryFetchCount} multicallHasErrors=${multicallHasErrors} multicallResults=`)
// console.dir(multicallResults)
// if (multicallHasErrors) {
//   const errorsCount = multicallResults.reduce( (accumulator, multicallResult) => 
//     // return accumulator + (!multicallResult?0:(multicallResult.status != FETCHDATA_MULTICALL_SUCCESSSTATUS?1:0)),
//     accumulator + (!multicallResult?1:(multicallResult.status != FETCHDATA_MULTICALL_SUCCESSSTATUS?1:0)),
//     0, // initial value
//   )
// console.debug(`fetchOnChainData: retryFetchCount=${retryFetchCount} multicallHasErrors=${multicallHasErrors} errorsCount=${errorsCount}`)
// }
// TODO: DEBUG to remove <---------------------------------------

          }
        } while ((retryFetchCount < FETCHDATA_MULTICALL_MAX_RETRY) && multicallHasErrors)

        if (multicallHasErrors) {
          throw `Multicall error happened ${FETCHDATA_MULTICALL_MAX_RETRY} times, skipping`
        }
        return multicallResults;
      }
      catch (error) {
        console.error(`fetchOnChainData error: ${error}`);
      }
      return multicallResults;
    },
    [getOnChainData, MAXBATCHSIZE, showWarningToast]
  );

  // ---

  /**
   * Fetches token onchain data
   * accepts multicallInput as array of: {abi, address, functionName, args} or {result: value}
   * 
   * @param multicallInput
   * @returns multicall results
   */
  const fetchOnChainDataWrapper = useCallback( async(multicallInput : any[] ) : Promise<any[]> =>
    {
      let multicallRes : any[] = [];
      try {
        const multicallInputCall = [] as any[] // contains real multicall inputs
        const inputRes = [] as any[] // contains inputs (data already available)

        for (let i = 0; i < multicallInput.length; i++) {
          const element = multicallInput[i];
          if ( typeof(element) != "object" || !element.abi || !element.address || !element.functionName) {
            inputRes.push(element);
          }
          else {
            multicallInputCall.push(element);
            inputRes.push(null);
          }
        }
        let multicallFetchRes = [] as any[] // contains multicall results
        if (multicallInputCall.length>0) {
          multicallFetchRes = await fetchOnChainData(multicallInputCall);
        }
        if (inputRes.length>0) {
          // Merge multicall results with inputs
          let j = 0;
          for (let i = 0; i < inputRes.length; i++) {
            const element = inputRes[i];
            if (element) {
              multicallRes.push({result: element.value});
            } else {
              multicallRes.push(multicallFetchRes[j]);
              j++;
            }
          }
        } else {
          multicallRes = multicallFetchRes;
        }
        return multicallRes;
      } catch (error) {
        console.error(`fetchOnChainDataWrapper error: ${error}`);
        return multicallRes;
      }
    },
    [fetchOnChainData]
  )

  // ---

  /**
   * Fetches token onchain data for:
   * - tokens balances of one address
   * requires tokensInstances to be initialized with tokenInstance.contract
   */
  const loadTokensOnChainData_addressBalances = useCallback(
    async(_tokensInstances: TTokensInstances, _resultOnly:boolean, _address:TAddressEmptyNullUndef): Promise<TTokensInstances> =>
    {
      try {
        if (_tokensInstances && _tokensInstances.length) {
          const multicallArray = _tokensInstances.map( async (token) => {
            if (token?.contract) {
              return {...token.contract, functionName: 'balanceOf', args: [_address]}
            }
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall

          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map( async (tokenInstance, index) => {
              const userBalance = onchainData[index]?.result; // Token User balance
              if (_resultOnly) {
                return { balance: userBalance };
              }
              const tokenInstanceUserDataArray:TTokenInstanceUserData[] = tokenInstance.userData;
              if (_address) {
                tokenInstanceUserDataArray[_address as any] = ({
                  ...tokenInstanceUserDataArray[_address as any],
                  balance: userBalance,
                })
              }
              return {...tokenInstance, userData: tokenInstanceUserDataArray}
            });
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          }
        }
      } catch (error) {
        console.error(`loadTokensOnChainData_addressBalances error: ${error}`);
      }
    }
    ,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ); // loadTokensOnChainData_addressBalances callback

  // ---

  /**
   * Fetches token onchain data for:
   * - tokens transferability from one address to another
   * requires tokensInstances to be initialized with tokenInstance.contract
   */
  const loadTokensOnChainData_TransferAbility = useCallback(
    async(  _tokensInstances: TTokensInstances, _resultOnly:boolean,
            _source:TAddressEmptyNullUndef, _target:TAddressEmptyNullUndef): Promise<TTokensInstances> =>
    {
      try {
        if (_tokensInstances && _tokensInstances.length) {
          const secondaryAddress = (_target?_target:_source)
          // console.debug(`loadTokensOnChainData_TransferAbility: GET TOKENS TRANSFER FROM:${(_source?_source.substring(0,6)+"..."+_source.substring(_source.length-5,_source.length):"null/undef")} TO:${(secondaryAddress?secondaryAddress.substring(0,6)+"..."+secondaryAddress.substring(secondaryAddress.length-5,secondaryAddress.length):"null/undef")}`)
          const multicallArray = _tokensInstances.map( async (token) => {
            if (token?.contract) {
              if (token?.type == "COINBRIDGE" as TTokenType) {
                const amount = token.userData && token.userData[secondaryAddress as any]?.balance || 1 // set minimal amount for checking transferability. Ideally should be called after acount balance is retrieved
                // QUERY: From address, To address , Amount uint256 ;  RESPONSE: bool, uint256, uint256
                return {
                  ...token.contract,
                  functionName: 'canTransfer',
                  args: [_source, secondaryAddress, amount], // if no target: self transfer test
                }
              }
              // Anything else than COINBRIDGE
              // don't call contract, just provide return value assuming (transferability is) true
              return {
                  value: [true],
                }
            } // if (token?.contract)
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall

          // console.debug(`loadTokensOnChainData_TransferAbility: onchainData=`)
          // console.dir(onchainData)

          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map( async (tokenInstance, index) => {
              const canTransfer = (onchainData[index] && onchainData[index]?.result && onchainData[index]?.result[0] ? true : false) ; // can transfer from to // result: bool, uint256, uint256
              if (_resultOnly) {
                return { canTransfer };
              }
              let tokenInstanceUserDataArray:TTokenInstanceUserData[] = tokenInstance.userData;
              if (!tokenInstanceUserDataArray) tokenInstanceUserDataArray = new Array<TTokenInstanceUserData>();
              tokenInstanceUserDataArray[secondaryAddress as any] = ({...tokenInstance.userData[secondaryAddress as any], canTransfer })
              return {
                ...tokenInstance,
                userData: tokenInstanceUserDataArray,
              } //as TTokenInstance;
            }); // _tokensInstances.map
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          } // if (onchainData?.length > 0
        } // if (_tokensInstances && _tokensInstances.length)
      } catch (error) {
        console.error(`loadTokensOnChainData_TransferAbility error: ${error}`);
      }
    } // loadTokensOnChainData_TransferAbility
    ,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ); // loadTokensOnChainData_TransferAbility callback

  // ---

    /**
   * Fetches token onchain data for:
   * - tokens decimals
   * requires tokensInstances to be initialized with tokenInstance.contract
   */
  const loadTokensOnChainData_decimals = useCallback(
    async(_tokensInstances: TTokensInstances, _resultOnly:boolean): Promise<TTokensInstances> =>
    {
      try {
        // console.debug(`loadTokensOnChainData_sourceBalances: GET TOKENS DECIMALS`)
        if (_tokensInstances && _tokensInstances.length) {
          const multicallArray = _tokensInstances.map( async (token) => {
            if (token?.contract) {
              return {
                ...token.contract,
                functionName: 'decimals',
              }
            } // if (token?.contract)
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall

          // console.debug(`loadTokensOnChainData_decimals: onchainData=`)
          // console.dir(onchainData)

          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map( async (tokenInstance, index) => {
              if (_resultOnly) {
                return {
                  decimals: onchainData[index]?.result, // Token decimals
                };
              }
              return {
                ...tokenInstance,
                decimals: onchainData[index]?.result, // Token decimals
                
              } as TTokenInstance;

            }); // _tokensInstances.map
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          } // if (onchainData?.length > 0
        } // if (_tokensInstances && _tokensInstances.length)
      } catch (error) {
        console.error(`loadTokensOnChainData_decimals error: ${error}`);
      }
    } // loadTokensOnChainData_decimals
    ,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ); // loadTokensOnChainData_decimals callback

  // ---

  /**
   * Fetches token onchain data for:
   * - tokens names
   * requires tokensInstances to be initialized with tokenInstance.contract
   */
  const loadTokensOnChainData_names = useCallback(
    async(_tokensInstances: TTokensInstances, _resultOnly:boolean): Promise<TTokensInstances> =>
    {
      try {
        // console.debug(`loadTokensOnChainData_names: GET TOKENS NAMES`)
        if (_tokensInstances && _tokensInstances.length) {
          const multicallArray = _tokensInstances.map( async (token) => {
            if (token?.contract) {
              return {
                ...token.contract,
                functionName: 'name',
              }
            }
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall

          // console.debug(`loadTokensOnChainData_names: onchainData=`)
          // console.dir(onchainData)

          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map( async (tokenInstance, index) => {
              if (_resultOnly) {
                return {
                  name: onchainData[index]?.result, // Token name
                };
              }
              return {
                ...tokenInstance,
                name: onchainData[index]?.result, // Token name
                
              } // as TTokenInstance;
            }); // _tokensInstances.map
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          } // if (onchainData?.length > 0
        } // if (_tokensInstances && _tokensInstances.length)
      } catch (error) {
        console.error(`loadTokensOnChainData_names error: ${error}`);
      }
    } // loadTokensOnChainData_names
    ,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ); // loadTokensOnChainData_names callback

  // ---

  /**
   * Fetches token onchain data for:
   * - tokens symbols
   * requires tokensInstances to be initialized with tokenInstance.contract
   */
  const loadTokensOnChainData_symbols = useCallback(
    async(_tokensInstances: TTokensInstances, _resultOnly:boolean): Promise<TTokensInstances> =>
    {
      try {
        // console.debug(`loadTokensOnChainData_symbols: GET TOKENS SYMBOLS`)
        if (_tokensInstances && _tokensInstances.length) {
          const multicallArray = _tokensInstances.map( async (token) => {
            if (token?.contract) {
              return {
                ...token.contract,
                functionName: 'symbol',
              }
            }
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall

          // console.debug(`loadTokensOnChainData_symbols: onchainData=`)
          // console.dir(onchainData)

          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map( async (tokenInstance, index) => {
              if (_resultOnly) {
                return {
                  symbol: onchainData[index]?.result, // Token symbol
                };
              }
              return {
                ...tokenInstance,
                symbol: onchainData[index]?.result, // Token symbol
                
              } // as TTokenInstance;
            }); // _tokensInstances.map
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          } // if (onchainData?.length > 0
        } // if (_tokensInstances && _tokensInstances.length)
      } catch (error) {
        console.error(`loadTokensOnChainData_symbols error: ${error}`);
      }
    } // loadTokensOnChainData_symbols
    ,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ); // loadTokensOnChainData_symbols callback

 // ---

  /**
   * Groups onchain data fetches
   * as well as contract instances initialization
   */
  const loadTokensOnChainData = useCallback( async(
    _tokensInstances: TTokensInstances, step:number,
    _from:TAddressEmptyNullUndef, _to:TAddressEmptyNullUndef, _resultOnly:boolean
    ): Promise<TTokensInstances> =>
    {
      try {
        if (_tokensInstances && _tokensInstances.length) {
          switch (step) {
            // Step contracts: get tokens contracts
            case EStepsLoadTokensData.contracts:
              return await loadTokensContracts(_tokensInstances)
            // Step sourceBalances: get tokens source user balances
            case EStepsLoadTokensData.sourceBalances:
              return loadTokensOnChainData_addressBalances(_tokensInstances, _resultOnly, _from);
            // Step sourceTransferAbility: get canTransfer token from source address
            case EStepsLoadTokensData.sourceTransferAbility:
              return loadTokensOnChainData_TransferAbility(_tokensInstances, _resultOnly, _from, _from);
            // Step decimals: get token decimals
            case EStepsLoadTokensData.decimals:
              return loadTokensOnChainData_decimals(_tokensInstances, _resultOnly);
            // Step names: get token name
            case EStepsLoadTokensData.names:
              return loadTokensOnChainData_names(_tokensInstances, _resultOnly);
            // Step symbols: get token symbol
            case EStepsLoadTokensData.symbols:
              return loadTokensOnChainData_symbols(_tokensInstances, _resultOnly);
            // Step targetBalances: get tokens target user balances
            case EStepsLoadTokensData.targetBalances:
              return loadTokensOnChainData_addressBalances(_tokensInstances, _resultOnly, _to);
            // Step targetTransferAbility: get canTransfer token from source address to target  address
            case EStepsLoadTokensData.targetTransferAbility:
              return loadTokensOnChainData_TransferAbility(_tokensInstances, _resultOnly, /* _from */_to, _to);
            // Step ??: Watch transfers : TODO
            default:
              console.warn(`loadTokensOnChainData error: step=${step} not found`)
              return _tokensInstances;
          } // switch (step)
        } // if (tokens?.length > 0)
      }
      catch (error) {
        console.error(`loadTokensOnChainData error: ${error}`);
      }
    },
    [ loadTokensContracts, loadTokensOnChainData_addressBalances, loadTokensOnChainData_TransferAbility,
      loadTokensOnChainData_decimals, loadTokensOnChainData_names, loadTokensOnChainData_symbols ]
  ); // loadTokensOnChainData

  // ---

  const resetToInitialStepCB = useCallback( () =>
    {
      resetToInitialStep()
    },
    [resetToInitialStep]
  ) // resetToInitialStep

  // ---

  const getTokensInstanceIndex = useCallback( (tokensInstances:TTokensInstances):TTokenInstanceIndex =>
    {
      const tokenInstanceIndex: TTokenInstanceIndex = {};
      try {
        if (tokensInstances) {
          tokensInstances.forEach( (tokenInstance:TTokenInstance) => {
            tokenInstanceIndex[tokenInstance.address.toUpperCase()] = tokenInstance;
          })
        }
      } catch (error) {
        console.error(`getTokensInstanceIndex error: ${error}`);
      }
      // console.debug(`getTokensInstanceIndex tokenInstanceIndex =`)
      // console.dir(tokenInstanceIndex)
      return tokenInstanceIndex;
    },
    []
  )

  // ---

  const initSelectableTokensLists = useCallback( async() =>
    {

      try {
        const filteredSelectableTokensLists: TSelectableTokensLists = []
        tokensLists?.forEach( (tokensList: TTokensList) => {
          const chainTokensList = getChainTokensList(tokensList, chainId)
          const currentChainTokensCount = (chainTokensList?chainTokensList.tokensCount:0)
          const selectable = (currentChainTokensCount > 0) && (tokensList.status == "ok")
          const selectableTokensList = {
            tokensList,
            chainId,
            selected: false,
            selectable,
            currentChainTokensCount
          }
          filteredSelectableTokensLists.push(selectableTokensList)
        })
        setselectableTokensLists(filteredSelectableTokensLists)
      } catch (error) {
        console.error(`TokensListsSelect.tsx: initSelectableTokensLists: error=${error}`);
      }

    },
    [chainId, setselectableTokensLists, tokensLists]
  );

  // ----------------------------------------------


  // ========================================================
  // USE EFFECTS
  // ========================================================

  /**
   * Reset to initial step when chainId or connectedAddress changes
   */
  useEffect( () =>
    {
      try {
        resetToInitialStepCB()
        settokensInstances(null)
        settokensInstanceIndex({})
      } catch (error) {
        console.error(`useEffect [chainId, connectedAddress, resetToInitialStepCB] error: ${error}`);  
      }
    },
    [chainId, connectedAddress, resetToInitialStepCB]
  ) // useEffect

  // ---

  useEffect( () =>
    {
      try {
        initSelectableTokensLists()
      } catch (error) {
        console.error(`useEffect [INIT SELECTABLE TOKENSLISTS] error: ${error}`);
      }
    },
    [initSelectableTokensLists]
  )

  // ---

  /**
   * Update tokens migration state on step change
   */
  useEffect(
    () =>
    {
      try {
        if (step == ESteps.tokensToMigrate && previousStep.current == ESteps.migration) {
          const updatedTokensInstances = tokensInstances?.map( (tokenInstance:TTokenInstance) => {
            if (tokenInstance.transferState.processing) {
              // processing ?
                return {...tokenInstance, transferState: { ...tokenInstance.transferState, processing: false} } // processing: reset processing state
            }
            return tokenInstance;
          })
          settokensInstances(updatedTokensInstances)
        } else if (step == ESteps.migration && previousStep.current == ESteps.tokensToMigrate) {
          // Update all selected tokens instances
          const updatedTokensInstances = tokensInstances?.map( (tokenInstance:TTokenInstance) => {
            /**
             * @param transferState 
             * @returns transferState
             */
            const updatePreviousTransferState = (transferState:ETokenTransferState) => {
              switch (transferState) {
                case ETokenTransferState.processed:
                  return ETokenTransferState.previous_processed;
                case ETokenTransferState.error:
                  return ETokenTransferState.previous_error;
                case ETokenTransferState.skipped:
                  return ETokenTransferState.previous_skipped;
                default:
                  return transferState;
              }
            }
            if (tokenInstance.selected) return {...tokenInstance, transferState: { processing: true, transfer: ETokenTransferState.none } } // Selected, mark as processing (= "to process") and reinit transfer state
            return {...tokenInstance,  transferState: { processing: tokenInstance.transferState.processing, transfer: updatePreviousTransferState(tokenInstance.transferState.transfer) } } // Not selected: reinit transfer state
          })
          settokensInstances(updatedTokensInstances)
        }
        previousStep.current = step;
      } catch (error) {
        console.error(`useEffect error: ${error}`);  
      }
    },
    [step, tokensInstances]
  ) // useEffect

  /**
   * Handle tokensInstances loading
   * TODO: refactor to break into smaller functions
   */
  useEffect( () =>
    {

      const loadTargetData = async( _tokensInstances:TTokensInstances, _targetAddress:TAddressEmpty) : Promise<TTokenInstance[]> =>
      {
        let tokensInstancesData:TTokenInstance[] = []
        try {
          if (_tokensInstances && _targetAddress) {
            const targetADDRESS = _targetAddress.toUpperCase();
            // Load target balances
            // tokens target user balances
            const targetTokensBalancesPromises = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.targetBalances, null, _targetAddress, true);
            // tokens transfer ability
            const targetCanTransferTokensPromises = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.targetTransferAbility, null,_targetAddress, true);
            // Wait for all promises to resolve
            const loadTokensOnChainDataPromises = await Promise.all([targetTokensBalancesPromises, targetCanTransferTokensPromises]);
            const [targetTokensBalances, targetCanTransferTokens] = await Promise.all([targetTokensBalancesPromises, targetCanTransferTokensPromises]);

            // Check for errors: empty results arrays
            if (targetTokensBalances && targetTokensBalances.length && targetCanTransferTokens && targetCanTransferTokens.length) {
              // Check for errors: undefined results in arrays
              const targetTokensBalancesErrors = targetTokensBalances?.some( (targetTokenBalance:any) => { targetTokenBalance == undefined})
              const targetCanTransferTokensToErrors = targetTokensBalances?.some( (targetCanTransferTokenTo:any) => { targetCanTransferTokenTo == undefined})
              // console.dir(targetTokensBalancesErrors)
              // console.dir(targetCanTransferTokensToErrors)
              if (targetTokensBalancesErrors || targetCanTransferTokensToErrors) {
                setStateErrorLoadingTokensInstances(true)
                return _tokensInstances;
              }
              // Merge loadTokensOnChainDataPromises results
              tokensInstancesData = _tokensInstances?.map( (_tokenInstance:TTokenInstance, index:number) => {
                if (loadTokensOnChainDataPromises && loadTokensOnChainDataPromises[0] && loadTokensOnChainDataPromises[1] ) {
                  _tokenInstance.userData[targetADDRESS as any] = {
                    ..._tokenInstance.userData[targetADDRESS as any],
                    ...targetTokensBalances[index], // target balances
                    ...targetCanTransferTokens[index], // can transfer
                  }
                } // if (loadTokensOnChainDataPromises && loadTokensOnChainDataPromises[0] && loadTokensOnChainDataPromises[1] )
                return _tokenInstance;
              })
            } // IF (targetTokensBalances && ...
            else {
              setStateErrorLoadingTokensInstances(true)
              return _tokensInstances;
            } // if (targetTokensBalances && ... ELSE
          } // if (_tokensInstances && _targetAddress)
        } catch (error) {
          console.error(`loadTargetData error: ${error}`);
        }
        return tokensInstancesData;
      } // loadTargetData

      /**
       * 
       * @param chainTokensList
       * on chain data loading must be done in order
       * @returns Promise<TTokensInstances>
       */
      const getUpdatedChainTokensListTokensInstances = async( chainTokensList:TChainsTokensListNullUndef, _targetAddress: TAddressEmpty ) : Promise<TTokensInstances> =>
      {
        const start:number = Date.now()
        try {
          // console.debug(`getUpdatedChainTokensListTokensInstances chainTokensList.chainId=${chainTokensList?.chainId} chainTokensList.tokensCount=${chainTokensList?.tokensCount} chainTokensList.tokensInstances?.length=${chainTokensList?.tokensInstances?.length}`)
          let _tokensInstances:TTokensInstances;
          if (chainTokensList && chainTokensList.tokensInstances && chainTokensList.tokensInstances.length) {
            const connectedADDRESS = (connectedAddress?connectedAddress.toUpperCase():"");
            const targetADDRESS = _targetAddress.toUpperCase();
            // let tmp: TTokensInstances = []
            _tokensInstances = chainTokensList.tokensInstances;
            // console.debug(`getUpdatedChainTokensListTokensInstances _tokensInstances =`)
            // console.dir(_tokensInstances)

            if (chainTokensList.loadState == EChainTokensListLoadState.notLoaded) {
              // console.debug(`getUpdatedChainTokensListTokensInstances EStepsLoadTokensData == NOTLOADED`)
              // Load contracts
              _tokensInstances = await loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.contracts, null, null, true)
              chainTokensList.loadState = EChainTokensListLoadState.contracts // EChainTokensListLoadState.contracts
              // console.debug(`getUpdatedChainTokensListTokensInstances EStepsLoadTokensData.contracts _tokensInstances =`)
              // console.dir(_tokensInstances)
            }

            if (chainTokensList.loadState == EChainTokensListLoadState.contracts) {
              // console.debug(`getUpdatedChainTokensListTokensInstances chainTokensList.loadState == EChainTokensListLoadState.CONTRACTS`)
              // Load everything else : sourceBalances, decimals, names, symbols
              // tokens names
              const tokensNamesPromises = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.names, null, null, true)

              // tokens connected user (source) balances
              const tokensSourceBalancesPromises = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.sourceBalances, connectedAddress, null, true)

              // tokens source transferability
              const tokensSourceCanTransferPromises = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.sourceTransferAbility, connectedAddress, connectedAddress, true);

              // tokens decimals
              const tokensDecimalsPromises = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.decimals, null, null, true)
              // tokens symbols
              const tokensSymbolsPromises = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.symbols, null, null, true)

              // If _targetAddress is already set, load Additionnal data: targetBalances, transferAbility
              // tokens target user balances
              const tokensTargetBalancesPromises = _targetAddress ? loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.targetBalances, null, _targetAddress, true) : null ;
              // tokens target transferability
              // const tokensTargetCanTransferToPromises = _targetAddress ? loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.targetTransferAbility,true,connectedAddress,_targetAddress, true) : null ;
              const tokensTargetCanTransferToPromises = _targetAddress ? loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.targetTransferAbility, null, _targetAddress, true) : null ;

              // console.debug(`getUpdatedChainTokensListTokensInstances BEFORE Promise.all`)

              // Wait for all promises to resolve
              // const loadTokensOnChainDataPromises = _targetAddress ? await Promise.all([names, sourceBalances, decimals, symbols, targetBalances, canTransferToTarget]) : await Promise.all([names, sourceBalances, decimals, symbols]) ;
              // const loadTokensOnChainDataPromises = await Promise.all( [tokensNamesPromises, tokensSourceBalancesPromises, tokensDecimalsPromises, tokensSymbolsPromises]) ;
              const [tokensNames, tokensSourceBalances, tokensSourceCanTransfer, tokensDecimals, tokensSymbols, tokensTargetBalances, tokensTargetCanTransferTo ] =
                _targetAddress ?
                  await Promise.all( [tokensNamesPromises, tokensSourceBalancesPromises, tokensSourceCanTransferPromises, tokensDecimalsPromises, tokensSymbolsPromises]) :
                  await Promise.all( [tokensNamesPromises, tokensSourceBalancesPromises, tokensSourceCanTransferPromises, tokensDecimalsPromises, tokensSymbolsPromises, tokensTargetBalancesPromises, tokensTargetCanTransferToPromises ]) ;

              // console.debug(`getUpdatedChainTokensListTokensInstances AFTER Promise.all`)

              // Check for errors
              if ( (tokensNames && tokensNames.length || tokensSymbols && tokensSymbols.length) &&
                  tokensSourceBalances && tokensSourceCanTransfer && tokensDecimals &&
                  (!_targetAddress ? true : tokensTargetBalances && tokensTargetBalances.length && tokensTargetCanTransferTo && tokensTargetCanTransferTo.length) ) {

                // const namesErrors = tokensNames?.some( (tokenName) => tokenName.name == undefined)
                // const symbolsErrors = tokensSymbols?.some( (tokensSymbol) => tokensSymbol.symbol == undefined)
                // console.debug(`getUpdatedChainTokensListTokensInstances MISSING names ${namesErrors} or symbols ${symbolsErrors}`)
                // console.dir(tokensNames)
                // console.dir(tokensSymbols)

                const sourceBalancesErrors = tokensSourceBalances?.some( (tokenSourceBalance:any) => tokenSourceBalance.balance == undefined)
                const sourceCanTransferErrors = tokensSourceCanTransfer?.some( (tokenSourceCanTransfer) => tokenSourceCanTransfer == undefined)
                const decimalsErrors = tokensDecimals?.some( (tokenDecimals) => tokenDecimals.decimals == undefined)
                // console.dir(tokensSourceBalances)
                // console.dir(tokensSourceCanTransfer)
                // console.dir(tokensDecimals)

                if (sourceBalancesErrors || sourceCanTransferErrors || decimalsErrors) {
                  console.debug(`getUpdatedChainTokensListTokensInstances MISSING sourceBalances ${sourceBalancesErrors} or sourceCanTransfer ${sourceCanTransferErrors} or decimals ${decimalsErrors}`)
                  setStateErrorLoadingTokensInstances(true)
                  return chainTokensList.tokensInstances;
                }

                if (_targetAddress) {
                  const targetBalancesErrors = tokensTargetBalances?.some( (tokenTargetBalance:any) => { tokenTargetBalance == undefined})
                  const targetCanTransferToErrors = tokensTargetCanTransferTo?.some( (tokenTargetCanTransferTo:any) => { tokenTargetCanTransferTo == undefined})
                  console.dir(tokensTargetBalances)
                  console.dir(tokensTargetCanTransferTo)
                  if (targetBalancesErrors || targetCanTransferToErrors) {
                    console.debug(`getUpdatedChainTokensListTokensInstances MISSING targetBalances ${targetBalancesErrors} or targetCanTransferTo ${targetCanTransferToErrors}`)
                    setStateErrorLoadingTokensInstances(true)
                    return chainTokensList.tokensInstances;
                  }
                }

              } else {
                // Missing promises results
                console.debug(`getUpdatedChainTokensListTokensInstances MISSING PROMISES RESULTS`)
                setStateErrorLoadingTokensInstances(true)
                return chainTokensList.tokensInstances;
              }


              // Merge loadTokensOnChainDataPromises results
              const tokensInstancesAllData = _tokensInstances?.map( (_tokenInstance:TTokenInstance, index:number) => {
                // Update tokenInstance with data from promises
                if (tokensNames && tokensSourceBalances && tokensSourceCanTransfer && tokensDecimals && tokensSymbols) {
                    _tokenInstance.name = tokensNames[index].name // tokens names
                    const {balance} = tokensSourceBalances[index] as unknown as TTokenInstanceUserData
                    _tokenInstance.userData[connectedADDRESS as any] = {..._tokenInstance.userData[connectedADDRESS as any], /* ...tokensSourceBalances[index] */balance, ...tokensSourceCanTransfer[index]} // source balances, can transfer from source
                    _tokenInstance.decimals = tokensDecimals[index].decimals // tokens decimals
                    _tokenInstance.symbol = tokensSymbols[index].symbol // tokens symbols
// console.debug(`getUpdatedChainTokensListTokensInstances fetch data : SET TRANSFER AMOUNT TO BALANCE ${balance||0n}`)
//                     _tokenInstance.transferAmount = balance||0n // tokens transfer amount
                    // TODO : CHECK IT IS WORKING
                    // TODO : CHECK IT IS WORKING
                    // TODO : CHECK IT IS WORKING
                    if (_targetAddress && tokensTargetBalances && tokensTargetCanTransferTo) {
                      // console.debug(`getUpdatedChainTokensListTokensInstances _targetAddress IS SET _targetAddress && tokensTargetBalances && tokensTargetCanTransferTo MERGING promises`)
                      _tokenInstance.userData[targetADDRESS as any] = {..._tokenInstance.userData[targetADDRESS as any], ...tokensTargetBalances[index], ...tokensTargetCanTransferTo[index]} // target balances, can transfer to target
                  } // if (tokensTargetBalances && tokensTargetCanTransferTo)

                }
                return _tokenInstance;
              }) // map

              // console.debug(`getUpdatedChainTokensListTokensInstances AFTER MERGE promises (names, user balances, decimals, symbols, [target balances, cantransfer]) tokensInstancesAllData =`)
              // console.dir(tokensInstancesAllData)

              // update chainTokensList
              chainTokensList.tokensInstances = tokensInstancesAllData;
              if (!_targetAddress) {
                // console.debug(`getUpdatedChainTokensListTokensInstances (names, user balances, decimals, symbols) _targetAddress is NOT SET`)
                // Everything up to symbols included is loaded
                chainTokensList.loadState = EChainTokensListLoadState.symbols
              } else {
                // Everything up to transferAbility included is loaded
                // console.debug(`getUpdatedChainTokensListTokensInstances (names, user balances, decimals, symbols, target balances, cantransfer) _targetAddress IS SET`)
                
                chainTokensList.loadState = EChainTokensListLoadState.targetTransferAbility
              }

            } // if (chainTokensList.loadState == EChainTokensListLoadState.contracts)
            else {
              // console.debug(`getUpdatedChainTokensListTokensInstances EChainTokensListLoadState. <> CONTRACTS`)
              // Contracts, names, sourceBalances, decimals, symbols already loaded

              // Check if _targetAddress is set
              // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
              // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
              // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
              // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE

              // TODO: CLEAR SELECTED TOKENS
              // TODO: CLEAR SELECTED TOKENS
              // TODO: CLEAR SELECTED TOKENS
              // TODO: CLEAR SELECTED TOKENS
              // TODO: CLEAR SELECTED TOKENS
              // TODO: CLEAR SELECTED TOKENS
              // TODO: CLEAR SELECTED TOKENS
              // TODO: CLEAR SELECTED TOKENS

              if (_targetAddress) {

                // console.debug(`getUpdatedChainTokensListTokensInstances EChainTokensListLoadState. <> CONTRACTS _targetAddress is set`)

                // Load State : Symbol = load targetBalances, transferAbility
                if (chainTokensList.loadState == EChainTokensListLoadState.symbols) {
                  // console.debug(`getUpdatedChainTokensListTokensInstances EChainTokensListLoadState == SYMBOLS _targetAddress is set`)
                  // Load target data

                  // Dirty hack to avoid hidding already loaded data 
                  setStateUpdatingTokensInstances(true)

                  const _tokensInstancesTargetData = await loadTargetData(_tokensInstances, _targetAddress)
                  if (_tokensInstancesTargetData && _tokensInstancesTargetData.length ) {
                    _tokensInstances = _tokensInstancesTargetData
                  }

                  // // tokens target user balances
                  // const targetBalances = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetBalances,true,"", _targetAddress, true);
                  // // tokens transfer ability
                  // const canTransfer = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.transferAbility,true,connectedAddress,_targetAddress, true);

                  // // Wait for all promises to resolve
                  // const loadTokensOnChainDataPromises = await Promise.all([targetBalances, canTransfer]);

                  // // Merge loadTokensOnChainDataPromises results
                  // const tokensInstancesAllData = _tokensInstances?.map( (_tokenInstance:TTokenInstance, index:number) => {
                  //   if (loadTokensOnChainDataPromises && loadTokensOnChainDataPromises[0] && loadTokensOnChainDataPromises[1] ) {
                  //     _tokenInstance.userData = {
                  //       ..._tokenInstance.userData,
                  //       ...loadTokensOnChainDataPromises[0][index].userData, // target balances
                  //       ...loadTokensOnChainDataPromises[1][index].userData, // can transfer
                  //     }
                  //   }
                  //   return _tokenInstance;
                  // })

                  // console.debug(`getUpdatedChainTokensListTokensInstances AFTER MERGE promises (target balances, cantransfer) _tokensInstancesTargetData =`)
                  // console.dir(_tokensInstancesTargetData)

                  // update chainTokensList
                  chainTokensList.tokensInstances = _tokensInstancesTargetData;
                  // Everything up to targetTransferAbility included is loaded
                  chainTokensList.loadState = EChainTokensListLoadState.targetTransferAbility

                } // if (chainTokensList.loadState == EChainTokensListLoadState.symbols)
                else {
                  // console.debug(`getUpdatedChainTokensListTokensInstances EChainTokensListLoadState <> SYMBOLS _targetAddress is set`)
                  // Check _targetAddress for missing data
                  const allInstancesWithTargetData = _tokensInstances?.every( (_tokenInstance:TTokenInstance) => {
                    return ( _tokenInstance.userData && _tokenInstance.userData[targetADDRESS as any] &&
                      !(_tokenInstance.userData[targetADDRESS as any].balance == undefined || _tokenInstance.userData[targetADDRESS as any].balance == null
                      || _tokenInstance.userData[targetADDRESS as any].canTransfer == undefined || _tokenInstance.userData[targetADDRESS as any].canTransfer == null)
                    )
                  })

                  if (!allInstancesWithTargetData) {

                    // Dirty hack to avoid hidding already loaded data 
                    setStateUpdatingTokensInstances(true)

                    // console.debug(`getUpdatedChainTokensListTokensInstances EChainTokensListLoadState <> SYMBOLS ; _targetAddress is set ; NOT ALLINSTANCESWITHTARGET LOADING TARGET DATA`)
                    const _tokensInstancesTargetData = await loadTargetData(_tokensInstances, _targetAddress)
                    // console.debug(`getUpdatedChainTokensListTokensInstances AFTER loadTargetData _tokensInstancesTargetData =`)
                    // console.dir(_tokensInstancesTargetData)
                    if (_tokensInstancesTargetData && _tokensInstancesTargetData.length ) {
                      _tokensInstances = _tokensInstancesTargetData
                    }

                    // console.debug(`getUpdatedChainTokensListTokensInstances AFTER MERGE promises (target balances, cantransfer) _tokensInstancesTargetData =`)
                    // console.dir(_tokensInstancesTargetData)

                    // update chainTokensList
                    chainTokensList.tokensInstances = _tokensInstancesTargetData;
                    // Everything up to targetTransferAbility included is loaded
                    chainTokensList.loadState = EChainTokensListLoadState.targetTransferAbility
                  }
                  else {
                    // console.debug(`getUpdatedChainTokensListTokensInstances EChainTokensListLoadState <> SYMBOLS ; _targetAddress is set ; ALLINSTANCESWITHTARGET EVERYTHING IS LOADED`)
                  }

                  // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                  // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                  // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                  // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                  // console.debug(`getUpdatedChainTokensListTokensInstances chainTokensList.loadState=${chainTokensList.loadState} TARGETADDRESS is set, NOTHING TO DO`)
                }
                // // Load State : targetBalances = load transferAbility
                // if (chainTokensList.loadState == EChainTokensListLoadState.targetBalances) {
                //   // Load transfer ability
                //   _tokensInstances = await loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.transferAbility,true,connectedAddress,_targetAddress, true)
                //   chainTokensList.loadState = EChainTokensListLoadState.transferAbility

                // }

              } // if (_targetAddress)
              else {
                // console.info(`getUpdatedChainTokensListTokensInstances chainTokensList.loadState=${chainTokensList.loadState} BUT TARGETADDRESS is NOT YET set, nothing to do`)
              }

            } // else

            // console.debug(`getUpdatedChainTokensListTokensInstances BEFORE RETURN chainTokensList.tokensInstances`)
            return chainTokensList.tokensInstances;
          } // if (chainTokensList && chainTokensList.tokensInstances && chainTokensList.tokensInstances.length)
          else {
            console.warn(`getUpdatedChainTokensListTokensInstances chainTokensList is NULL/UNDEF`)
          }
          // return undefined;
        } catch (error) {
          console.error(`getUpdatedChainTokensListTokensInstances error: ${error}`);
        }

        finally {
          // console.debug(`getUpdatedChainTokensListTokensInstances AFTER RETURN chainTokensList.tokensInstances elapsed=${Date.now() - start}ms`)
          console.log(`loading chaind ${chainTokensList?.chainId} tokens data took: ${Date.now() - start}ms`)
          
        }

      } // getUpdatedChainTokensListTokensInstances

      // ---

      const getUpdatedTokensInstancesArray = async (_chainsTokensList:TChainsTokensListArrayNullUndef, _targetAddress: TAddressEmpty):Promise<TTokensInstances[]/*  | undefined */> => {
        let result:TTokensInstances[] = []
        try {
          // console.debug(`useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray`)
          if (_chainsTokensList && _chainsTokensList.length) {
            const connectedADDRESS = (connectedAddress?connectedAddress.toUpperCase():"");
            const targetADDRESS = targetAddress.toUpperCase();
            const tokenInstances = _chainsTokensList.map( async(chainTokensList:TChainsTokensListNullUndef) => {
              // console.dir(chainTokensList)
              const updatedChainTokensListTokensInstances = await getUpdatedChainTokensListTokensInstances(chainTokensList, _targetAddress)
              // console.debug(`useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: getUpdatedChainTokensListTokensInstances t=`)
              // console.dir(t)
              // update
              // chainTokensList.tokensInstances = t
              const updatedChainTokensListTokensInstancesProps = updatedChainTokensListTokensInstances?.map( (tokenInstance:TTokenInstance) => {
                // console.debug(`useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: getUpdatedChainTokensListTokensInstances t=`)
                // console.dir(tokenInstance)
                // console.debug(`useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: getUpdatedChainTokensListTokensInstances t.userData=`)
                // console.dir(tokenInstance.userData)
                const selectable = (tokenInstance.userData
                  && (tokenInstance.userData[connectedADDRESS as any]?.balance || 0n > 0n)
                  && tokenInstance.userData[connectedADDRESS as any]?.canTransfer && tokenInstance.userData[targetADDRESS as any]?.canTransfer) ? true : false ;
                const transferAmount = (!selectable && tokenInstance.transferAmount>0n ? 0n : (tokenInstance.transferAmount?tokenInstance.transferAmount:tokenInstance.userData[connectedADDRESS as any]?.balance || 0n))
                const selected = (tokenInstance.selected && selectable) ? true : false ;
                const transferAmountLock = (selectable && tokenInstance.transferAmountLock) ? true : false ;

                return { ...tokenInstance,
                  selectable,
                  // transferAmount: 500n,
                  transferAmount,
                  selected,
                  transferAmountLock
                };
              }) // updatedChainTokensListTokensInstances?.map
              
              // if (chainTokensList) {
              //   chainTokensList.tokensInstances = updatedChainTokensListTokensInstancesProps
              // }
              // console.debug(`useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: updatedChainTokensListTokensInstancesProps=`)
              // console.dir(updatedChainTokensListTokensInstancesProps)
              return updatedChainTokensListTokensInstancesProps;
            })

            // if (tokenInstances && tokenInstances.length) {
              // const tokenInstancesArrayUpdated = await Promise.all(tokenInstances  as Promise<TTokensInstances>[])
              // result = tokenInstancesArrayUpdated; // RETURN
              result = await Promise.all(tokenInstances  as Promise<TTokensInstances>[])
              // console.debug(`useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: tokenInstances=`)
              // console.dir(result)
            // }
  
          } // if (_chainsTokensList && _chainsTokensList.length)
          // For each chain tokens list, get/update its tokens instances
        } catch (error) {
          console.error(`useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray error: ${error}`);
        }
        // console.debug(`useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray result=`)
        // console.dir(result)
        // console.debug(`useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray BEFORE RETURN`)
        return result
      } // getUpdatedTokensInstancesArray

      // ---

      const updateChainTokensListTokensInstances = async (_chainsTokensList:TChainsTokensListArrayNullUndef, _targetAddress: TAddressEmpty):Promise<TChainsTokensListArrayNullUndef> => {
        // let chainsTokensListResult:TChainsTokensListArrayNullUndef // = [];
        try {
          // console.debug(`useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances`)
          // chainsTokensListResult = _chainsTokensList;
          const updatedTokensInstancesArray = await getUpdatedTokensInstancesArray(_chainsTokensList, _targetAddress)
          // console.debug(`useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances: AFTER getUpdatedTokensInstancesArray`)
          // updatedTokensInstancesArray.then( (updatedTokensInstancesArray:TTokensInstances[]) => {
  
            if (updatedTokensInstancesArray && updatedTokensInstancesArray.length) {
              _chainsTokensList?.forEach( (_chainsTokensList:TChainsTokensListNullUndef, index) => {
                // Update each _chainsTokensList with updated tokensInstances
                if (_chainsTokensList && updatedTokensInstancesArray[index] ) {
                  // console.debug(`updateChainTokensListTokensInstances: updatedTokensInstancesArray[${index}]=`)
                  // console.dir(updatedTokensInstancesArray[index])
                  _chainsTokensList.tokensInstances = updatedTokensInstancesArray[index]
                }
              })
            } // if (_tokenInstancesArray)
            else {
              // console.warn(`useEffect [SELECTABLE TOKENSLISTS]: updatedTokensInstancesArray.length <= 00`)
            }
          // }) // updatedTokensInstancesArray.then

          // console.debug(`updateChainTokensListTokensInstances: updatedTokensInstancesArray =`)
          // console.dir(updatedTokensInstancesArray)

        } catch (error) {
          console.error(`useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances error: ${error}`);
        }
        // return chainsTokensListResult;
        // console.debug(`updateChainTokensListTokensInstances: _chainsTokensList =`)
        // console.dir(_chainsTokensList)
        return _chainsTokensList
      } // updateChainTokensListTokensInstances

      // ---

      // const start:number = Date.now()
      try {
        // console.debug(`useEffect [SELECTABLE TOKENSLISTS]`)
        const newSelectedChainsTokensList:TChainsTokensListArrayNullUndef = [];
        // const tokensInstances:TTokensInstances = [];
        // console.debug(`useEffect [SELECTABLE TOKENSLISTS]: tokensLists=${tokensLists} tokensLists?.length=${tokensLists?.length}`)
        const selectedTokenLists = getSelectedTokenLists(selectableTokensLists);
        // console.debug(`useEffect [SELECTABLE TOKENSLISTS]: selectedTokenLists.length = ${selectedTokenLists?.length}, selectedTokenLists= `)
        // console.dir(selectedTokenLists)
        selectedTokenLists?.map( (selectedTokenList:TSelectableTokensList) => {
          // console.debug(`useEffect [SELECTABLE TOKENSLISTS]: selectedTokenList=`)
          // console.dir(selectedTokenList)
          // Find selected tokensList in all tokensLists
          
          tokensLists?.forEach( (tokensList:TTokensList) => {
            // console.debug(`useEffect [SELECTABLE TOKENSLISTS]: tokensList.id=${tokensList.id} (current) tokensList=`)
            // console.dir(tokensList)
            // debugger
            if (tokensList.id == selectedTokenList.tokensList.id) {
              // console.debug(`useEffect [SELECTABLE TOKENSLISTS]: MATCH tokensList.id == selectedTokenList.tokensList.id  tokensList.id=${tokensList.id}`)
              const chainTokensList = getChainTokensList(tokensList, chainId) // TChainsTokensListNullUndef
              newSelectedChainsTokensList.push(chainTokensList)
            }
          }) // tokensLists?.forEach
          
        })
        // console.debug(`useEffect [SELECTABLE TOKENSLISTS]: newSelectedChainsTokensList.length = ${newSelectedChainsTokensList?.length}, newSelectedChainsTokensList[]=`)
        // console.dir(newSelectedChainsTokensList)

        // console.debug(`useEffect [SELECTABLE TOKENSLISTS]: newSelectedChainsTokensList to TTokenChainDataArray`)
        if (newSelectedChainsTokensList.length > 0) {

          // setLoadingDataState(true)
          // setisLoading(true)

          // chainTokensList.loadState == EChainTokensListLoadState.symbols)
          setStateLoadingTokensInstances(true)
          setStateIsFetchingData(true)
          // debugger;
          setStateErrorLoadingTokensInstances(false)
          fetchDataIssuesWarnShown.current = false;

          // let tokensCount = 0
          newSelectedChainsTokensList.forEach( (selected_chainTokensList:TChainsTokensListNullUndef) => {
            if (selected_chainTokensList) {
              // Assume chain tokens count <> chain tokens instances count means tokens instances are not initialized
              if (selected_chainTokensList.tokensCount != selected_chainTokensList.tokensInstances?.length) {
                // Init tokensInstances
                // console.debug(`useEffect [SELECTABLE TOKENSLISTS]: (RE)INIT selected_chainTokensList.tokensInstances selected_chainTokensList.tokensCount=${selected_chainTokensList.tokensCount} selected_chainTokensList.tokensInstances?.length=${selected_chainTokensList.tokensInstances?.length}`)
                const selected_chainTokensList_tokensInstances:TTokensInstances = [];
                // console.debug(`useEffect [SELECTABLE TOKENSLISTS]: selected_chainTokensList.chainId=${selected_chainTokensList.chainId} selected_chainTokensList.tokensCount=${selected_chainTokensList.tokensCount}`)
                selected_chainTokensList.tokens?.forEach( (token:TTokenChainData, index) => {
                  const _tokenInstance = initTokenInstance(token, index+1)
                  // console.dir(_tokenInstance)
                  if (_tokenInstance) selected_chainTokensList_tokensInstances.push(_tokenInstance);
                })

                // Update selected ChainsTokensList tokensInstances
                selected_chainTokensList.tokensInstances = selected_chainTokensList_tokensInstances;
                // _selectedChainsTokensList.push(selected_chainTokensList)
                
              } // if (selected_chainTokensList.tokensCount != selected_chainTokensList.tokensInstances?.length)
              else {
                // Tokens instances already initialized
                // TODO: check if tokensInstances are up to date : remove user data if user changed account
                // TODO: check if tokensInstances are up to date : remove user data if user changed account
                // TODO: check if tokensInstances are up to date : remove user data if user changed account
                // TODO: check if tokensInstances are up to date : remove user data if user changed account
                // TODO: check if tokensInstances are up to date : remove user data if user changed account
                // console.debug(`useEffect [SELECTABLE TOKENSLISTS]: selected_chainTokensList.tokensInstances ALREADY INITIALIZED selected_chainTokensList.tokensCount=${selected_chainTokensList.tokensCount} selected_chainTokensList.tokensInstances?.length=${selected_chainTokensList.tokensInstances?.length}`)

              }
              // tokensInstances.push(...selected_chainTokensList.tokensInstances)
              
            } // if (selected_chainTokensList && selected_chainTokensList.tokensCount != selected_chainTokensList.tokensInstances?.length)

          }) // newSelectedChainsTokensList.forEach
          // console.debug(`useEffect [SELECTABLE TOKENSLISTS]: newSelectedChainsTokensList.length=${newSelectedChainsTokensList.length} newSelectedChainsTokensList[]=`)
          // console.dir(newSelectedChainsTokensList)

          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // TODO: Although newSelectedChainsTokensList is not fully loaded, call setselectedChainsTokensList for displaying loading effect ...
          // setselectedChainsTokensList(newSelectedChainsTokensList);

            updateChainTokensListTokensInstances(newSelectedChainsTokensList, targetAddress).then( (updatedChainsTokensList:TChainsTokensListArrayNullUndef) => {
            // console.debug(`useEffect [SELECTABLE TOKENSLISTS] AFTER updateChainTokensListTokensInstances.then`)
            // console.debug(`useEffect [SELECTABLE TOKENSLISTS]: SET SelectedChainsTokensList`)
            setselectedChainsTokensList(updatedChainsTokensList)
            // console.dir(updatedChainsTokensList)
            setStateLoadingTokensInstances(false)
            setStateUpdatingTokensInstances(false)
            setStateIsFetchingData(false)
            // console.debug(`useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances elapsed=${Date.now() - start}ms`)
            // console.debug(`useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances elapsed=${Date.now() - start}ms`)
          }).catch( (error) => {
            console.error(`useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances error: ${error}`);
            setStateLoadingTokensInstances(false)
            setStateUpdatingTokensInstances(false)
            setStateErrorLoadingTokensInstances(true)
            setStateIsFetchingData(false)
          })

        } // if (newSelectedChainsTokensList.length > 0)
        // else {
        //   // settokensInstances(null)
        //   console.debug(`useEffect [SELECTABLE TOKENSLISTS]: newSelectedChainsTokensList.length <= 00`)
        // }
        // console.debug(`useEffect [SELECTABLE TOKENSLISTS]: SET SelectedChainsTokensList`)
        // setselectedChainsTokensList(newSelectedChainsTokensList)
        // console.dir(newSelectedChainsTokensList)
      } catch (error) {
        console.error(`useEffect [SELECTABLE TOKENSLISTS]: error=${error}`)
      }
      // finally {
      //   // console.debug(`useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances elapsed=${Date.now() - start}ms`)
      //   console.log(`loading all selected chains tokens data took: ${Date.now() - start}ms`)
      // }
    },
    [tokensLists, selectableTokensLists,
      chainId, targetAddress, connectedAddress,
      getSelectedTokenLists, initTokenInstance, loadTokensOnChainData,
      setStateLoadingTokensInstances, setStateErrorLoadingTokensInstances, setStateUpdatingTokensInstances,
      setStateIsFetchingData]
  ) // useEffect

  /**
   * useEffect: update tokens instances
   * triggered by selectedChainsTokensList update
   * For each token list, get its tokens instances and push it into tokensInstances
   * then update tokensInstances index (for transfers watch)
   */
  useEffect(
    () =>
    {
      const tokensInstancesFromSelectedTokensLists: TTokensInstances = []
      if (selectedChainsTokensList && selectedChainsTokensList.length) {
        selectedChainsTokensList.forEach( (selectedChainsTokensList:TChainsTokensListNullUndef) => {
          if (selectedChainsTokensList && selectedChainsTokensList.tokensInstances && selectedChainsTokensList.tokensInstances.length) {
            tokensInstancesFromSelectedTokensLists.push(...selectedChainsTokensList.tokensInstances)
            }
          })
        settokensInstances(tokensInstancesFromSelectedTokensLists)
        settokensInstanceIndex(getTokensInstanceIndex(tokensInstancesFromSelectedTokensLists))
      }
    },
    [getTokensInstanceIndex, selectedChainsTokensList]
  )

  /**
   * Sets up the watch for Transfer Events
   */
  useEffect(
    () =>
    {
      const watchTransferEvents = async ():Promise<any> =>
      {
        if (unwatch.current) {
          unwatch.current() // remove previous watch
        }
        if (tokensInstances && tokensInstances.length) {
          // array of tokens addresses
          const tokensAddresses = tokensInstances.map( (tokenInstance:TTokenInstance) => tokenInstance.address )
          if (tokensAddresses && tokensAddresses.length) {
            const unwatchFn = publicClient.watchContractEvent({
              address: tokensAddresses,
              strict: true,
              onError: (error:Error) => reportWatchError(error),
              abi: erc20ABI,
              eventName: 'Transfer',
              onLogs: (logs:Log[]) => processTransferEvent(logs)
            })
            unwatch.current = unwatchFn;
          }
        }
      }
      watchTransferEvents()
    }, [processTransferEvent, publicClient, tokensInstances, reportWatchError]
  )

  // ---------------------------------------------------

  return (
    <>
      { (step < 0 || step > 3) &&
        <div className=" w-full bg-error text-error-content" >
          <MainContentContainer>
              <StepError setpreviousDisabled={setpreviousDisabled} setNextDisabled={setNextDisabled} />
          </MainContentContainer>
        </div>
      }
      { step === 0 &&
        <div className="w-full" >
          <MainContentContainer>
            <Step0
              setNextDisabled={setNextDisabled}
              selectableTokensLists={selectableTokensLists}
              setselectableTokensLists={setselectableTokensLists}
              accountAddress={connectedAddress}
              targetAddress={targetAddress}
              tokensInstances={tokensInstances}
              chainId={chainId}
              isLoadingTokensLists={isLoadingTokensLists}
              isErrorTokensLists={isErrorTokensLists}
              isLoadingTokensInstances={isLoadingTokensInstances} isErrorTokensInstances={isErrorTokensInstances} isUpdatingTokensInstances={isUpdatingTokensInstances}
              tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
            />
          </MainContentContainer>

        </div>
      }
      { step === 1 &&
        <div className="w-full" >
          <MainContentContainer>
            <Step1
              setNextDisabled={setNextDisabled}
              accountAddress={connectedAddress}
              tokensInstances={tokensInstances}
              chainId={chainId}
              targetAddress={targetAddress}
              settargetAddress={settargetAddress}
              isLoadingTokensInstances={isLoadingTokensInstances} isErrorTokensInstances={isErrorTokensInstances} isUpdatingTokensInstances={isUpdatingTokensInstances}
              tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
            />
          </MainContentContainer>
        </div>
      }
      { step === 2 &&
        <div className="w-full" >
          <MainContentContainer>
              <Step2
              setNextDisabled={setNextDisabled}
              tokensInstances={tokensInstances}
              setShowProgressBar={setShowProgressBar}
              accountAddress={connectedAddress}
              targetAddress={targetAddress}
              isLoadingTokensInstances={isLoadingTokensInstances} isErrorTokensInstances={isErrorTokensInstances} isUpdatingTokensInstances={isUpdatingTokensInstances}
              tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
                />
          </MainContentContainer>
        </div>
      }
      { step === 3 &&
        <div className="w-full px-1" >
          <MainContentContainer>
            <Step3
              chainId={chainId}
              setNextDisabled={setNextDisabled}
              tokensInstances={tokensInstances}
              setShowProgressBar={setShowProgressBar}
              accountAddress={connectedAddress}
              targetAddress={targetAddress}
              tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
              setmigrationState={setmigrationState}
              updateTokenOnTransferProcessed={updateTokenOnTransferProcessed}
              updateTokenInstanceTransferState={updateTokenInstanceTransferState}
            />
          </MainContentContainer>
        </div>
      }
    </>
  );
}