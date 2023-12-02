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
import {
  EStepsLoadTokensData, EChainTokensListLoadState,
  ESteps, ETokenTransferState
} from "@jsconsts/enums";
import {
  DURATION_LONG,
  FETCHDATA_MULTICALL_MAX_RETRY, FETCHDATA_MULTICALL_SUCCESSSTATUS
} from "@App/js/constants/ui/uiConsts";
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

export default function StepsContainer(
  { tokensLists, chainId, setpreviousDisabled, setNextDisabled,
    isLoadingTokensLists, isErrorTokensLists, setShowProgressBar, setmigrationState, setshowActivity,
  }: IStepsContainerProps) {

  const { t } = useTranslation()
  const { address: connectedAddress } = useAccount()
  const { moveTokensAppData: { step = -1 }, moveTokensAppDataHandlers: { resetToInitialStep } } = useMoveTokensAppContext()

  const [selectableTokensLists, setselectableTokensLists] = useState<TSelectableTokensLists>(null)

  const [selectedChainTokensLists, setselectedChainTokensLists] = useState<TChainsTokensListArrayNullUndef>(null)
  const [tokensInstances, settokensInstances] = useState<TTokensInstances>(null)
  // Array of tokensInstances indexed by address in UPPER CASE (used for events)
  const [tokensInstancesIndex, settokensInstancesIndex] = useState<TTokenInstanceIndex>(new Map())

  const [targetAddress, settargetAddress] = useState<TAddressStringEmpty>("")

  const [isLoadingTokensInstances, setisLoadingTokensInstances] = useState<boolean>(false)
  const [isErrorTokensInstances, setisErrorTokensInstances] = useState(false)
  const [isUpdatingTokensInstances, setisUpdatingTokensInstances] = useState(false)

  // Sorting
  // 0: unsorted, 1: lowest first , 2 highest first
  const [sortOrderTokenDisplayId, setsortOrderTokenDisplayId] = useState<TsortOrder>(0) 
  const [sortOrderTokenName, setsortOrderTokenName] = useState<TsortOrder>(0)
  const [sortOrderTokenBalance, setsortOrderTokenBalance] = useState<TsortOrder>(0)

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

  // Wagmi public client
  const publicClient = usePublicClient({ chainId: chainId })

  /**
   * Display warning message toast
   */
  const showWarningToast = useCallback(
    async (_message: string): Promise<void> => {
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
    (error: Error) => {
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
    async (_tokenInstance: TTokenInstance, _address: TAddressStringEmptyNullUndef): Promise<bigint | undefined> => {
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
   * Update tokenInstance in its chainTokensList and in tokensInstancesIndex
   * @param _tokenInstance
   */
  // const updateChainTokenListTokenInstance = useCallback(
  //   async (_tokenInstance: TTokenInstance) => {
  //     try {
  //       if (_tokenInstance.chainTokensList.tokensInstances && _tokenInstance.chainTokensList.tokensInstances.length > _tokenInstance.index) {
  //         _tokenInstance.chainTokensList.tokensInstances[_tokenInstance.index] = _tokenInstance
  //       }
  //     } catch (error) {
  //       console.error(`updateChainTokenListTokenInstance error: ${error}`);
  //     }
  //   },
  //   []
  // )

  // const updateTokensInstancesIndex = useCallback(
  //   async (_tokenInstance: TTokenInstance) => {
  //       tokensInstancesIndex.set(_tokenInstance.address.toUpperCase() as TTokenContractAddress, _tokenInstance)
  //   },
  //   [tokensInstancesIndex]
  // )

  /**
   * Update tokenInstance in its chainTokensList
   */
  const updateTokenInstanceRefs = useCallback(
    async (_tokenInstance: TTokenInstance) => {
      try {
        // updateChainTokenListTokenInstance(_tokenInstance)
        // updateTokensInstancesIndex(_tokenInstance)
        tokensInstancesIndex.set(_tokenInstance.address.toUpperCase() as TTokenContractAddress, _tokenInstance)
        if (_tokenInstance.chainTokensList.tokensInstances && _tokenInstance.chainTokensList.tokensInstances.length > _tokenInstance.index) {
          _tokenInstance.chainTokensList.tokensInstances[_tokenInstance.index] = _tokenInstance
        }
      } catch (error) {
        console.error(`updateChainTokenListTokenInstance error: ${error}`);
      }
    },
    [/* updateChainTokenListTokenInstance, updateTokensInstancesIndex */tokensInstancesIndex]
  )

  // const updateAllTokensInstanceRefs = useCallback(
  //   async (_tokenInstance: TTokenInstance) => {
  //     try {
  //       tokensInstancesIndex.set(_tokenInstance.address.toUpperCase() as TTokenContractAddress, _tokenInstance)
  //       if (_tokenInstance.chainTokensList.tokensInstances && _tokenInstance.chainTokensList.tokensInstances.length > _tokenInstance.index) {
  //         _tokenInstance.chainTokensList.tokensInstances[_tokenInstance.index] = _tokenInstance
  //       }
  //     } catch (error) {
  //       console.error(`updateChainTokenListTokenInstance error: ${error}`);
  //     }
  //   },
  //   [/* updateChainTokenListTokenInstance, updateTokensInstancesIndex */tokensInstancesIndex]
  // )


  /**
   * Update tokenInstance with balances and transfer state
   * @param _tokensInstances
   * @param _tokenInstanceAddress
   * @param _updateFromAddress
   * @param _fromAddress
   * @param _fromAddressBalanceUpdate
   * @param _updateToAddress
   * @param _toAddress
   * @param _targetAddressBalanceUpdate
   * @param _processedState optionnal ETokenTransferState when called from transfer
   */
  // const updateTokenInstanceBalancesAndTransferState = useCallback(
  //   (_tokensInstances: TTokensInstances, _tokenInstanceAddress: TAddressString, _updateFromAddress: boolean, _fromAddress: TAddressString, _fromAddressBalanceUpdate: TTokenAmount,
  //     _updateToAddress: boolean, _toAddress: TAddressString, _toAddressBalanceUpdate: TTokenAmount, _processedState?: ETokenTransferState) => {
  //     try {
  //       if (_tokensInstances && _tokensInstances.length && _tokenInstanceAddress && (_updateFromAddress || _updateToAddress || _processedState)) {
  //         const tokensInstancesUpdate = _tokensInstances.map((tokenInstance: TTokenInstance) => {
  //           if (tokenInstance.address == _tokenInstanceAddress) {
  //             const fromADDRESS = _fromAddress?.toUpperCase()
  //             const toADDRESS = _toAddress?.toUpperCase()
  //             let { transferAmount, lockTransferAmount, selected, selectable, userData } = tokenInstance;
  //             const { transferState } = tokenInstance;
  //             // Update balances
  //             if (_updateFromAddress || _updateToAddress) {
  //               if (_updateFromAddress) {
  //                 userData = {
  //                   ...userData,
  //                   [fromADDRESS as any]: (_updateFromAddress ? { ...userData[fromADDRESS as any], balance: _fromAddressBalanceUpdate } : { ...userData[fromADDRESS as any] })
  //                 };
  //               }
  //               if (_updateToAddress) {
  //                 userData = {
  //                   ...userData,
  //                   [toADDRESS as any]: (_updateToAddress ? { ...userData[toADDRESS as any], balance: _toAddressBalanceUpdate } : { ...userData[toADDRESS as any] })
  //                 };
  //               }
  //               const connectedADDRESS = connectedAddress?.toUpperCase()
  //               if (connectedADDRESS == fromADDRESS && _updateFromAddress) {
  //                 if (!_fromAddressBalanceUpdate) {
  //                   selectable = false; selected = false; transferAmount = 0n; lockTransferAmount = false;
  //                 } else {
  //                   if (transferAmount > _fromAddressBalanceUpdate) {
  //                     transferAmount = _fromAddressBalanceUpdate;
  //                   }
  //                   if (_fromAddressBalanceUpdate) {
  //                     selectable = true;
  //                   }
  //                 }
  //               }
  //               if (connectedADDRESS == toADDRESS && _updateToAddress) {
  //                 if (!_toAddressBalanceUpdate) {
  //                   selectable = false; selected = false; transferAmount = 0n; lockTransferAmount = false;
  //                 } else {
  //                   if (transferAmount > _toAddressBalanceUpdate) {
  //                     transferAmount = _toAddressBalanceUpdate;
  //                   }
  //                   if (_toAddressBalanceUpdate) {
  //                     selectable = true;
  //                   }
  //                 }
  //               }
  //             }
  //             // Update processed state, reset selected, transfer amount and lock depending on processed state
  //             if (_processedState) {
  //               transferState.transfer = _processedState;
  //               if (_processedState == ETokenTransferState.processed) {
  //                 selected = false; transferAmount = 0n; lockTransferAmount = false;
  //               } else if (_processedState == ETokenTransferState.skipped) selected = false;
  //             }
  //             const tokenInstanceUpdate = { ...tokenInstance, userData, transferAmount, lockTransferAmount, selected, selectable, transferState }
  //             // updateChainTokenListTokenInstance(tokenInstanceUpdate)
  //             updateTokenInstanceRefs(tokenInstanceUpdate)
  //             return tokenInstanceUpdate
  //           }
  //           return tokenInstance
  //         })
  //         settokensInstances(tokensInstancesUpdate)
  //       }
  //     } catch (error) {
  //       console.error(`updateTokenInstanceBalancesAndTransferState error: ${error}`);
  //     }
  //   },
  //   [connectedAddress, /* updateChainTokenListTokenInstance */updateTokenInstanceRefs]
  // )

  const updateTokenInstanceBalancesAndTransferState = useCallback(
    (/* _tokensInstances: TTokensInstances, */ _tokenInstanceAddress: TAddressString, _updateFromAddress: boolean, _fromAddress: TAddressString, _fromAddressBalanceUpdate: TTokenAmount,
      _updateToAddress: boolean, _toAddress: TAddressString, _toAddressBalanceUpdate: TTokenAmount, _processedState?: ETokenTransferState) => {
      try {
        const tokensInstances = Array.from(tokensInstancesIndex.values(), (tokenInstance: TTokenInstance) => tokenInstance)
        if (tokensInstances && tokensInstances.length && _tokenInstanceAddress && (_updateFromAddress || _updateToAddress || _processedState)) {
          const tokensInstancesUpdate = tokensInstances.map((tokenInstance: TTokenInstance) => {
            if (tokenInstance.address == _tokenInstanceAddress) {
              const fromADDRESS = _fromAddress?.toUpperCase()
              const toADDRESS = _toAddress?.toUpperCase()
              let { transferAmount, lockTransferAmount, selected, selectable, userData } = tokenInstance;
              const { transferState } = tokenInstance;
              // Update balances
              if (_updateFromAddress || _updateToAddress) {
                if (_updateFromAddress) {
                  userData = {
                    ...userData,
                    [fromADDRESS as any]: (_updateFromAddress ? { ...userData[fromADDRESS as any], balance: _fromAddressBalanceUpdate } : { ...userData[fromADDRESS as any] })
                  };
                }
                if (_updateToAddress) {
                  userData = {
                    ...userData,
                    [toADDRESS as any]: (_updateToAddress ? { ...userData[toADDRESS as any], balance: _toAddressBalanceUpdate } : { ...userData[toADDRESS as any] })
                  };
                }
                const connectedADDRESS = connectedAddress?.toUpperCase()
                if (connectedADDRESS == fromADDRESS && _updateFromAddress) {
                  if (!_fromAddressBalanceUpdate) {
                    selectable = false; selected = false; transferAmount = 0n; lockTransferAmount = false;
                  } else {
                    if (transferAmount > _fromAddressBalanceUpdate) {
                      transferAmount = _fromAddressBalanceUpdate;
                    }
                    if (_fromAddressBalanceUpdate) {
                      selectable = true;
                    }
                  }
                }
                if (connectedADDRESS == toADDRESS && _updateToAddress) {
                  if (!_toAddressBalanceUpdate) {
                    selectable = false; selected = false; transferAmount = 0n; lockTransferAmount = false;
                  } else {
                    if (transferAmount > _toAddressBalanceUpdate) {
                      transferAmount = _toAddressBalanceUpdate;
                    }
                    if (_toAddressBalanceUpdate) {
                      selectable = true;
                    }
                  }
                }
              }
              // Update processed state, reset selected, transfer amount and lock depending on processed state
              if (_processedState) {
                transferState.transfer = _processedState;
                if (_processedState == ETokenTransferState.processed) {
                  selected = false; transferAmount = 0n; lockTransferAmount = false;
                } else if (_processedState == ETokenTransferState.skipped) selected = false;
              }
              const tokenInstanceUpdate = { ...tokenInstance, userData, transferAmount, lockTransferAmount, selected, selectable, transferState }
              // updateChainTokenListTokenInstance(tokenInstanceUpdate)
              updateTokenInstanceRefs(tokenInstanceUpdate)
              return tokenInstanceUpdate
            }
            return tokenInstance
          })
          settokensInstances(tokensInstancesUpdate)
        }
      } catch (error) {
        console.error(`updateTokenInstanceBalancesAndTransferState error: ${error}`);
      }
    },
    [connectedAddress, /* updateChainTokenListTokenInstance */updateTokenInstanceRefs, tokensInstancesIndex]
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
    (_tokenInstanceAddress: TAddressString, _processedState: ETokenTransferState) => {
      try {
        if (tokensInstances && tokensInstances.length) {
          const tokensInstancesUpdate = tokensInstances.map((tokenInstance: TTokenInstance) => {
            if (tokenInstance.address == _tokenInstanceAddress) {
              const { transferState } = tokenInstance;
              let { transferAmount, lockTransferAmount, selected } = tokenInstance;
              // Update processed state, reset selected, transfer amount and lock depending on processed state
              transferState.transfer = _processedState;
              if (_processedState == ETokenTransferState.processed) {
                selected = false; transferAmount = 0n; lockTransferAmount = false;
              } else if (_processedState == ETokenTransferState.skipped) {
                selected = false;
              }
              const tokenInstanceUpdate = { ...tokenInstance, transferAmount, lockTransferAmount, selected, transferState }
              // updateChainTokenListTokenInstance(tokenInstanceUpdate)
              updateTokenInstanceRefs(tokenInstanceUpdate)
              return tokenInstanceUpdate
            }
            return tokenInstance
          })
          settokensInstances(tokensInstancesUpdate)
        }
      } catch (error) {
        console.error(`updateTokenInstanceTransferState error: ${error}`);
      }
    },
    [tokensInstances, /* updateChainTokenListTokenInstance */updateTokenInstanceRefs]
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
    async (_tokenInstance: TTokenInstance,
      _fromAddress: TAddressStringNullUndef, _toAddress: TAddressStringNullUndef,
      _delay?: number, _processedState?: ETokenTransferState) => {
      try {
        if (_fromAddress && _toAddress) {
          if (_delay) { await new Promise(r => setTimeout(r, _delay)); } // Delay balance & state update
          const fromADDRESS = _fromAddress.toUpperCase() as TAddressString;
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
          if (updateFromAddress || updateToAddress || _processedState) {
            // updateTokenInstanceBalancesAndTransferState(tokensInstances, _tokenInstance.address, updateFromAddress, _fromAddress, fromAddressBalanceUpdate, updateToAddress, _toAddress, toAddressBalanceUpdate, _processedState)
            updateTokenInstanceBalancesAndTransferState(_tokenInstance.address, updateFromAddress, _fromAddress, fromAddressBalanceUpdate, updateToAddress, _toAddress, toAddressBalanceUpdate, _processedState)
          }
        }
      } catch (error) {
        console.error(`updateTokenOnTransferProcessed error: ${error}`);
      }
    },
    [getTokenOnChainData_addressBalance, updateTokenInstanceBalancesAndTransferState/* , tokensInstances */]
  );

  /**
   * Update tokenInstance on transfer
  */
  const processTransferEvent = useCallback(async (logs: Log[]) => {
    try {
      if (logs && logs.length) {
        logs.forEach(async (log: any) => {
          const logADDRESS = log.address.toUpperCase()
          // Find token instance in indexed "array"
          const tokenInstance = tokensInstancesIndex.get(logADDRESS)
          if (tokenInstance) {
            if (log.args) {
              const from = log.args["from"], to = log.args["to"], value = log.args["value"];
              // showTransfer(tokenInstance, from, to, value) // show ALL transfers
              if (tokenInstance.userData && from && to && value) {
                updateTokenOnTransferProcessed(tokenInstance, from, to)
              }
            }
          }
        })
      }
    } catch (error) {
      console.error(`processTransferEvent logs: ${logs} error: ${error}`);
    }
  },
    [tokensInstancesIndex, updateTokenOnTransferProcessed]
  );

  // ------------------------------

  // Filters

  /**
   * Name filter
   */
  const updateNameFilter = useCallback(
    (e: React.FormEvent<HTMLInputElement>): void => {
      try {
        setFilterName(e.currentTarget.value);
      } catch (error) {
        console.error(`updateNameFilter e.currentTarget.value: ${e.currentTarget.value} error: ${error}`);
      }
    },
    []
  );

  /**
   * Balance filter
   */
  const updateBalanceFilter = useCallback(
    (e: React.FormEvent<HTMLInputElement>): void => {
      try {
        setFilterBalance(e.currentTarget.value);
      } catch (error) {
        console.error(`updateBalanceFilter e.currentTarget.value: ${e.currentTarget.value} error: ${error}`);
      }
    },
    []
  );

  /**
   * Balance > 0 filter
   */
  const switchBalanceGt0Filter = useCallback(
    (): void => {
      try {
        setFilterBalanceGt0(!balanceGt0Filter);
      } catch (error) {
        console.error(`switchBalanceGt0Filter error: ${error}`);
      }
    },
    [balanceGt0Filter]
  );

  /**
   * Address filter
   */
  const updateAddressFilter = useCallback(
    (e: React.FormEvent<HTMLInputElement>): void => {
      try {
        setFilterAddress(e.currentTarget.value);
      } catch (error) {
        console.error(`updateAddressFilter e.currentTarget.value: ${e.currentTarget.value} error: ${error}`);
      }
    },
    []
  );

  /**
   * Clear all filters
   */
  const clearAllFilters = useCallback(
    (): void => {
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
  );

  const tokenInstanceFilterParamsUpdaters = {
    updateNameFilter, switchBalanceGt0Filter, updateBalanceFilter, updateAddressFilter, clearAllFilters
  }

  /**
   * TokenInstance Filter Params (name, balance, address, balanceGt0) memoized
   */
  const tokenInstanceFilterParams = useMemo(() => {
    return {
      name: nameFilter, balanceGt0: balanceGt0Filter, balance: balanceFilter, address: addressFilter
    }
  }, [nameFilter, balanceGt0Filter, balanceFilter, addressFilter]);

  /**
   * TokenInstance Filter
   * @param token
   * @returns true if tokenInstance should be filtered out
   */
  const filterTokenInstance = useCallback((token: TTokenInstance) => {
    const filterTokenInstanceWithFilterProps = (filter: ITokenInstanceListFilterStates, token: TTokenInstance) => {
      try {
        const nameFilter = filter.name && token.name ? token.name.toLowerCase().includes(filter.name.toLowerCase()) : true;
        if (!nameFilter) return false; // RETURN

        const connectedADDRESS = connectedAddress?.toUpperCase();
        const balanceGt0Filter = filter.balanceGt0 ? (token.userData[connectedADDRESS as any]?.balance || 0) > 0 : true;
        if (!balanceGt0Filter) return false; // RETURN

        if (filter.balance) {
          const balanceSplit = filter.balance.split('.')
          const intPart: string = balanceSplit[0]
          const intValueBI = BigInt(intPart)
          const floatPart: string = balanceSplit[1]
          const leadingZeros: number = floatPart?.match(/^0+/)?.[0].length || 0
          const floatValue = floatPart ? BigInt(floatPart) : 0n
          const filterValueInt = BigInt(Math.pow(10, token.decimals)) * intValueBI
          const filterValueFloat = BigInt(Math.pow(10, token.decimals - (leadingZeros + floatValue.toString().length))) * floatValue
          const filterValue = filterValueInt + filterValueFloat
          const balanceFilter = filter.balance && token.decimals ? (token.userData[connectedADDRESS as any]?.balance || 0) >= filterValue : true;
          if (!balanceFilter) return false; // RETURN
        }
        const addressFilter = filter.address && token.address ? token.address.toLowerCase().includes(filter.address.toLowerCase()) : true;
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
  )

  // ------------------------------

  // Sort

  /**
   * Sort tokensInstances by displayId
   */
  const sortByTokenDisplayId = useCallback(() => {
    if (sortOrderTokenDisplayId === 0) {
      setsortOrderTokenDisplayId(1)
    } else if (sortOrderTokenDisplayId === 1) {
      setsortOrderTokenDisplayId(2)
    } else {
      setsortOrderTokenDisplayId(0)
    }
  }, [sortOrderTokenDisplayId]);

  /**
   * Sort tokensInstances by tokenName
   */
  const sortByTokenName = useCallback(() => {
    if (sortOrderTokenName === 0) {
      setsortOrderTokenName(1)
    } else if (sortOrderTokenName === 1) {
      setsortOrderTokenName(2)
    } else {
      setsortOrderTokenName(0)
    }
  }, [sortOrderTokenName]);

  /**
   * Sort tokensInstances by tokenBalance
   */
  const sortByTokenBalance = useCallback(() => {
    if (sortOrderTokenBalance === 0) {
      setsortOrderTokenBalance(1)
    } else if (sortOrderTokenBalance === 1) {
      setsortOrderTokenBalance(2)
    } else {
      setsortOrderTokenBalance(0)
    }
  }, [sortOrderTokenBalance]);

  /**
   * Sort order params
   */
  const sortOrderParams = { displayId: sortOrderTokenDisplayId, tokenName: sortOrderTokenName, tokenBalance: sortOrderTokenBalance } as ISortOrderParams

  /**
   * @param a tokenInstance
   * @param b tokenInstance
   * @returns sort order : 0: equal, 1: a<b, 2: a>b
   */
  const sortTokensInstances = (a: TTokenInstance, b: TTokenInstance) => {
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
            return a.name?.localeCompare(b.name ?? "")
          }
          return -1
        }
        else {
          if (b.name) {
            return b.name?.localeCompare(a.name ?? "")
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
  }

  // ------------------------------

  // Selection

  /**
   * Update "check all" checkbox status
   * @param tokensInstances
   */
  const updateCheckAll = useCallback(
    (tokensInstances: TTokensInstances) => {
      try {
        if (tokensInstances && connectedAddress) {
          const isAllChecked = tokensInstances.every((tokensInstance) => {
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
  const updateCheckAllVisible = useCallback((tokensInstances: TTokensInstances) => {
    try {
      if (tokensInstances && connectedAddress) {
        const isAllChecked = tokensInstances.every((tokensInstance) => {
          if (tokensInstance.selectable && tokensInstance.transferAmount && filterTokenInstance(tokensInstance)) {
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
    (filter: boolean = false) => {
      try {
        if (tokensInstances) {
          const connectedADDRESS = (connectedAddress ? connectedAddress.toUpperCase() : "");
          const targetADDRESS = targetAddress.toUpperCase();
          const newCheckAll = (filter ? !selectAll : !selectAllVisible);
          const tokensInstancesCheckAll = tokensInstances.map((tokensInstance) => {
            // TODO: simplify with selectable ?
            if (tokensInstance.selectable && targetADDRESS && tokensInstance.userData &&
              tokensInstance.userData[targetADDRESS as any].canTransfer &&
              tokensInstance.userData[connectedADDRESS as any].canTransfer &&
              (tokensInstance.userData[connectedADDRESS as any].balance || 0n) > 0n &&
              tokensInstance.transferAmount > 0n
            ) {
              if (filter) {
                if (filterTokenInstance(tokensInstance)) {
                  tokensInstance.selected = newCheckAll;
                  updateTokenInstanceRefs(tokensInstance)
                }
              } else {
                tokensInstance.selected = newCheckAll;
                updateTokenInstanceRefs(tokensInstance)
              }
            }
            return {...tokensInstance }
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
      filterTokenInstance, updateCheckAll, selectAllVisible, updateCheckAllVisible, updateTokenInstanceRefs]
  );

  /**
   * Inverts all tokensInstances selection depending on filter
   */
  const handleInvertAllChecks = useCallback(
    (filter: boolean = false) => {
      try {
        if (tokensInstances) {
          const connectedADDRESS = (connectedAddress ? connectedAddress.toUpperCase() : "");
          const targetADDRESS = targetAddress.toUpperCase();
          const tokensInstancesInvertCheck = tokensInstances.map((tokensInstance) => {
            if (tokensInstance.selectable) {
              if (tokensInstance.userData && targetADDRESS && tokensInstance.userData[connectedADDRESS as any]
                && tokensInstance.userData[connectedADDRESS as any].canTransfer
                && tokensInstance.userData[targetADDRESS as any].canTransfer
                && tokensInstance.transferAmount > 0
              ) {
                if (filter) {
                  if (filterTokenInstance(tokensInstance)) {
                    tokensInstance.selected = !tokensInstance.selected;
                    updateTokenInstanceRefs(tokensInstance)
                  }
                } else {
                  tokensInstance.selected = !tokensInstance.selected;
                  updateTokenInstanceRefs(tokensInstance)
                }
              }
            }
            return { ...tokensInstance }
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
      filterTokenInstance, updateCheckAll, updateCheckAllVisible, invertAllVisible, updateTokenInstanceRefs]
  );

  /**
   * Called when a checkbox is clicked
   * @param id tokenInstance.selectID
   * @param value checkbox value
   */
  const updateCheckboxStatus: IUpdateCheckboxStatus = (id: string, value: TChecked | undefined) => {
    try {
      const connectedADDRESS = (connectedAddress ? connectedAddress.toUpperCase() : "");
      const tokensInstancesUpdated = tokensInstances?.map((tokenInstance) => {
        if (tokenInstance.selectID === id) {
          if (connectedADDRESS && tokenInstance.userData && tokenInstance.userData[connectedADDRESS as any]) {
            if (value) {
              tokenInstance.selected = value.checked;
            } else {
              tokenInstance.selected = !tokenInstance.selected;
            }
            updateTokenInstanceRefs(tokenInstance)
          }
        }
        return { ...tokenInstance }
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
  const updateTransferAmount: IUpdateTransferAmount = useCallback(
    (id: string, amount: TTokenAmount) => {
      try {
        const tokensInstancesUpdated = tokensInstances?.map((tokenInstance) => {
          if (tokenInstance.selectID === id) {
            tokenInstance.transferAmount = amount;
            updateTokenInstanceRefs(tokenInstance)
          }
          return { ...tokenInstance }
        })
        settokensInstances(tokensInstancesUpdated);
        updateCheckAll(tokensInstancesUpdated);
        updateCheckAllVisible(tokensInstancesUpdated);
      } catch (error) {
        console.error(`updateTransferAmount error: ${error}`);
      }
    },
    [tokensInstances, updateCheckAll, updateCheckAllVisible, updateTokenInstanceRefs]
  )

  /**
   * Called on transfer amount lock change
   * @param id tokenInstance.selectID
   * @param value lock value
   */
  const updateTransferAmountLock: ITransferAmountLock = useCallback(
    (id: string, value: boolean) => {
      try {
        const connectedADDRESS = (connectedAddress ? connectedAddress.toUpperCase() : "");
        const tokensInstancesUpdated = tokensInstances?.map((tokenInstance) => {
          if (tokenInstance.selectID === id) {
            if (connectedADDRESS && tokenInstance.userData && tokenInstance.userData[connectedADDRESS as any]) {
              tokenInstance.lockTransferAmount = value;
              updateTokenInstanceRefs(tokenInstance)
            }
          }
          return { ...tokenInstance }
        })
        settokensInstances(tokensInstancesUpdated);
      } catch (error) {
        console.error(`updateTransferAmountLock error: ${error}`);
      }
    },
    [tokensInstances, connectedAddress, updateTokenInstanceRefs]
  )

  /**
   * Handlers for tokensInstancesListTableProps
   */
  const tokensInstancesListTablePropsHandlers: ITokensInstancesListTableStatesHandlers = {
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
  const getSelectedTokenLists = useCallback((selectableTokensLists: TSelectableTokensLists): TSelectableTokensLists => {
    try {
      const selectedTokensLists = selectableTokensLists?.filter((selectableTokensList: TSelectableTokensList) => {
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

  /**
   * Sets default values for tokenInstance
   */
  const initTokenInstance = useCallback((_chainTokensList: TChainTokensList, _indexToken: number): TTokenInstance | TNullUndef => {
    if (_chainTokensList.tokens) {
      const _token = _chainTokensList.tokens[_indexToken]
      if (_token?.address) {
        const connectedADDRESS = (connectedAddress ? connectedAddress.toUpperCase() : "");
        const tokenInstanceUserDataArray: TTokenInstanceUserData[] = new Array<TTokenInstanceUserData>()
        if (connectedADDRESS) {
          tokenInstanceUserDataArray[connectedADDRESS as any] = {
            balance: null,
            canTransfer: true, // warn: COULD BE FALSE for non transferable tokens, should be defaulted to false then checked with a multicall
          }
        }
        return {
          chainId, type: (_token.extraData && _token.extraData.type ? _token.extraData.type : "ERC20" as TTokenType),
          address: _token.address, contract: null, decimals: 18, name: "", symbol: "", displayed: true, displayId: _indexToken + 1, selectID: chainId + "-" + _token.address,
          selectable: false, selected: false, transferAmount: 0n, lockTransferAmount: false, transferState: { processing: false, transfer: ETokenTransferState.none },
          userData: tokenInstanceUserDataArray, chainTokensList: _chainTokensList, index: _indexToken,
        }
      }
    }
  },
    [chainId, connectedAddress]
  )

  // ------------------------------

  const setStateLoadingTokensInstances = useCallback((isLoading: boolean) => {
    setisLoadingTokensInstances(isLoading)
  }, []
  )

  const setStateUpdatingTokensInstances = useCallback((isUpdating: boolean) => {
    setisUpdatingTokensInstances(isUpdating)
  }, []
  )

  const setStateErrorLoadingTokensInstances = useCallback((isError: boolean) => {
    setisErrorTokensInstances(isError)
  }, []
  )

  const setStateIsFetchingData = useCallback((isWorking: boolean) => {
    setshowActivity(isWorking)
  }, [setshowActivity]
  )

  // ------------------------------

  /**
   * @param defaultBatchSize 
   * @returns max batch size: number of call in one multicall
   */
  const getMaxBatchSize = (defaultBatchSize: number) => {
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
  const MAXBATCHSIZE: number = useMemo(
    () => getMaxBatchSize(PUBLIC_MULTICALL_MAX_BATCH_SIZE_DEFAULT),
    []
  );


  /**
   * Contracts instanciation
   */
  const loadTokensContracts = useCallback(
    async (tokensInstances: TTokensInstances): Promise<TTokensInstances> => {
    try {
      const contractCoinBridgeTokenABI = JSON.parse(CoinBridgeToken.ABI)
      tokensInstances?.forEach((tokenInstance: TTokenInstance) => {
        const abi = tokenInstance.type == "COINBRIDGE" as TTokenType ? contractCoinBridgeTokenABI : erc20ABI;
        if (tokenInstance?.address) {
          tokenInstance.contract = getContract({ address: tokenInstance.address, abi })
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

  /**
   * Fetches token onchain data using multicall
   */
  const getOnChainData = useCallback(
    async (multicallInput: any[], _maxbatchSize: number = MAXBATCHSIZE): Promise<any[]> => {
    let multicallAllBatchesResult: any[] = [];
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
  );

  /**
   * Fetch on chain data
   * @param multicallInput
   * @returns multicall results
   * Handle errors and retries
   */
  const fetchOnChainData = useCallback(async (multicallInput: any[]): Promise<any[]> => {
    let multicallResults: any[] = []; // Final result sent back
    const multicallFetchResults: any[][] = []; // Temporary result
    try {
      let retryFetchCount = 0, multicallHasErrors = false, maxBatchSize = MAXBATCHSIZE;
      do {
        if (retryFetchCount > 1) {
          await new Promise(resolve => setTimeout(resolve, retryFetchCount * 1_000)); // Wait <retryFetchCount> seconds before retry
          maxBatchSize = Math.floor(maxBatchSize / 2); // try smaller batch size
        }
        multicallFetchResults[retryFetchCount] = await getOnChainData(multicallInput, maxBatchSize)
        // Search for error(s)
        multicallHasErrors = multicallFetchResults[retryFetchCount].some((multicallResult) => (multicallResult && multicallResult.status != FETCHDATA_MULTICALL_SUCCESSSTATUS))
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
          if (retryFetchCount >= 2 && !fetchDataIssuesWarnShown.current) {
            fetchDataIssuesWarnShown.current = true;
            showWarningToast("moveTokens.warnings.fetchData")
          }
          retryFetchCount++;
          // Search again for error(s) after merge
          multicallHasErrors = multicallResults.some((multicallResult) => {
            return (multicallResult && multicallResult.status != FETCHDATA_MULTICALL_SUCCESSSTATUS)
          })
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

  /**
   * Fetches token onchain data
   * accepts multicallInput as array of: {abi, address, functionName, args} or {result: value}
   * 
   * @param multicallInput
   * @returns multicall results
   */
  const fetchOnChainDataWrapper = useCallback(async (multicallInput: any[]): Promise<any[]> => {
    let multicallRes: any[] = [];
    try {
      const multicallInputCall = [] as any[] // contains real multicall inputs
      const inputRes = [] as any[] // contains inputs (data already available)

      for (let i = 0; i < multicallInput.length; i++) {
        const element = multicallInput[i];
        if (typeof (element) != "object" || !element.abi || !element.address || !element.functionName) {
          inputRes.push(element);
        }
        else {
          multicallInputCall.push(element);
          inputRes.push(null);
        }
      }
      let multicallFetchRes = [] as any[] // contains multicall results
      if (multicallInputCall.length > 0) {
        multicallFetchRes = await fetchOnChainData(multicallInputCall);
      }
      if (inputRes.length > 0) {
        // Merge multicall results with inputs
        let j = 0;
        for (let i = 0; i < inputRes.length; i++) {
          const element = inputRes[i];
          if (element) {
            multicallRes.push({ result: element.value });
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

  /**
   * Fetches token onchain data for tokens balances of one address
   * requires tokensInstances to be initialized with tokenInstance.contract
   */
  const loadTokensOnChainData_addressBalances = useCallback(
    async (_tokensInstances: TTokensInstances, _resultOnly: boolean, _address: TAddressStringEmptyNullUndef): Promise<TTokensInstances> => {
      try {
        if (_tokensInstances && _tokensInstances.length) {
          const multicallArray = _tokensInstances.map(async (token) => {
            if (token?.contract) {
              return { ...token.contract, functionName: 'balanceOf', args: [_address] }
            }
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall

          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map(async (tokenInstance, index) => {
              const userBalance = onchainData[index]?.result; // Token User balance
              if (_resultOnly) {
                return { balance: userBalance };
              }
              const tokenInstanceUserDataArray: TTokenInstanceUserData[] = tokenInstance.userData;
              if (_address) {
                tokenInstanceUserDataArray[_address as any] = ({
                  ...tokenInstanceUserDataArray[_address as any],
                  balance: userBalance,
                })
              }
              return { ...tokenInstance, userData: tokenInstanceUserDataArray }
            });
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          }
        }
      } catch (error) {
        console.error(`loadTokensOnChainData_addressBalances error: ${error}`);
      }
    },
    [fetchOnChainDataWrapper]
  );

  /**
   * Fetches token onchain data for tokens transferability from one address to another
   * requires tokensInstances to be initialized with tokenInstance.contract
   */
  const loadTokensOnChainData_TransferAbility = useCallback(
    async (_tokensInstances: TTokensInstances, _resultOnly: boolean,
      _source: TAddressStringEmptyNullUndef, _target: TAddressStringEmptyNullUndef): Promise<TTokensInstances> => {
      try {
        if (_tokensInstances && _tokensInstances.length) {
          const secondaryAddress = (_target ? _target : _source)
          const multicallArray = _tokensInstances.map(async (token) => {
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
            }
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall
          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map(async (tokenInstance, index) => {
              const canTransfer = (onchainData[index] && onchainData[index]?.result && onchainData[index]?.result[0] ? true : false); // can transfer from to // result: bool, uint256, uint256
              if (_resultOnly) {
                return { canTransfer };
              }
              let tokenInstanceUserDataArray: TTokenInstanceUserData[] = tokenInstance.userData;
              if (!tokenInstanceUserDataArray) tokenInstanceUserDataArray = new Array<TTokenInstanceUserData>();
              tokenInstanceUserDataArray[secondaryAddress as any] = ({ ...tokenInstance.userData[secondaryAddress as any], canTransfer })
              return {
                ...tokenInstance,
                userData: tokenInstanceUserDataArray,
              }
            });
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          }
        }
      } catch (error) {
        console.error(`loadTokensOnChainData_TransferAbility error: ${error}`);
      }
    },
    [fetchOnChainDataWrapper]
  );

  /**
 * Fetches token onchain data for tokens decimals
 * requires tokensInstances to be initialized with tokenInstance.contract
 */
  const loadTokensOnChainData_decimals = useCallback(
    async (_tokensInstances: TTokensInstances, _resultOnly: boolean): Promise<TTokensInstances> => {
      try {
        if (_tokensInstances && _tokensInstances.length) {
          const multicallArray = _tokensInstances.map(async (token) => {
            if (token?.contract) {
              return { ...token.contract, functionName: 'decimals' }
            }
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall
          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map(async (tokenInstance, index) => {
              if (_resultOnly) {
                return { decimals: onchainData[index]?.result };
              }
              return { ...tokenInstance, decimals: onchainData[index]?.result };

            });
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          }
        }
      } catch (error) {
        console.error(`loadTokensOnChainData_decimals error: ${error}`);
      }
    },
    [fetchOnChainDataWrapper]
  );

  /**
   * Fetches token onchain data for tokens names
   * requires tokensInstances to be initialized with tokenInstance.contract
   */
  const loadTokensOnChainData_names = useCallback(
    async (_tokensInstances: TTokensInstances, _resultOnly: boolean): Promise<TTokensInstances> => {
      try {
        if (_tokensInstances && _tokensInstances.length) {
          const multicallArray = _tokensInstances.map(async (token) => {
            if (token?.contract) {
              return { ...token.contract, functionName: 'name' }
            }
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall
          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map(async (tokenInstance, index) => {
              if (_resultOnly) {
                return { name: onchainData[index]?.result };
              }
              return { ...tokenInstance, name: onchainData[index]?.result };
            });
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          }
        }
      } catch (error) {
        console.error(`loadTokensOnChainData_names error: ${error}`);
      }
    },
    [fetchOnChainDataWrapper]
  );

  /**
   * Fetches token onchain data for tokens symbols
   * requires tokensInstances to be initialized with tokenInstance.contract
   */
  const loadTokensOnChainData_symbols = useCallback(
    async (_tokensInstances: TTokensInstances, _resultOnly: boolean): Promise<TTokensInstances> => {
      try {
        if (_tokensInstances && _tokensInstances.length) {
          const multicallArray = _tokensInstances.map(async (token) => {
            if (token?.contract) {
              return { ...token.contract, functionName: 'symbol' }
            }
            return null;
          });
          const multicallData = await Promise.all(multicallArray);
          const onchainData = await fetchOnChainDataWrapper(multicallData); // Multicall
          if (onchainData?.length > 0) {
            const tokensInstancesWithOnchainData = _tokensInstances.map(async (tokenInstance, index) => {
              if (_resultOnly) {
                return { symbol: onchainData[index]?.result };
              }
              return { ...tokenInstance, symbol: onchainData[index]?.result };
            });
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          }
        }
      } catch (error) {
        console.error(`loadTokensOnChainData_symbols error: ${error}`);
      }
    },
    [fetchOnChainDataWrapper]
  );

  /**
   * Groups onchain data fetches
   * as well as contract instances initialization
   */
  const loadTokensOnChainData = useCallback(
    async (_tokensInstances: TTokensInstances, step: number,
      _from: TAddressStringEmptyNullUndef, _to: TAddressStringEmptyNullUndef, _resultOnly: boolean): Promise<TTokensInstances> => {
      try {
        if (_tokensInstances && _tokensInstances.length) {
          switch (step) {
            case EStepsLoadTokensData.contracts:
              return await loadTokensContracts(_tokensInstances)
            case EStepsLoadTokensData.sourceBalances:
              return loadTokensOnChainData_addressBalances(_tokensInstances, _resultOnly, _from);
            case EStepsLoadTokensData.sourceTransferAbility:
              return loadTokensOnChainData_TransferAbility(_tokensInstances, _resultOnly, _from, _from);
            case EStepsLoadTokensData.decimals:
              return loadTokensOnChainData_decimals(_tokensInstances, _resultOnly);
            case EStepsLoadTokensData.names:
              return loadTokensOnChainData_names(_tokensInstances, _resultOnly);
            case EStepsLoadTokensData.symbols:
              return loadTokensOnChainData_symbols(_tokensInstances, _resultOnly);
            case EStepsLoadTokensData.targetBalances:
              return loadTokensOnChainData_addressBalances(_tokensInstances, _resultOnly, _to);
            case EStepsLoadTokensData.targetTransferAbility:
              return loadTokensOnChainData_TransferAbility(_tokensInstances, _resultOnly, _to, _to);
            default:
              console.warn(`loadTokensOnChainData error: step=${step} not found`)
              return _tokensInstances;
          }
        }
      }
      catch (error) {
        console.error(`loadTokensOnChainData error: ${error}`);
      }
    },
    [loadTokensContracts, loadTokensOnChainData_addressBalances, loadTokensOnChainData_TransferAbility,
      loadTokensOnChainData_decimals, loadTokensOnChainData_names, loadTokensOnChainData_symbols]
  );

  /**
   * Callback to reset to initial step
   */
  const resetToInitialStepCB = useCallback(() => {
    resetToInitialStep()
  },
    [resetToInitialStep]
  )

  /**
   * Get tokens instances index
   */
  const getTokensInstancesIndex = useCallback(
    (tokensInstances: TTokensInstances): TTokenInstanceIndex => {
      const tokenInstanceIndex: TTokenInstanceIndex = new Map();
      try {
        tokensInstances?.forEach( (tokenInstance: TTokenInstance) => tokenInstanceIndex.set(tokenInstance.address.toUpperCase() as TTokenContractAddress, tokenInstance) )
      } catch (error) {
        console.error(`getTokensInstancesIndex error: ${error}`);
      }
      return tokenInstanceIndex;
    },
    []
  )

  /**
   * Initialize tokens lists
  */
  const initSelectableTokensLists = useCallback(async () => {

    try {
      const filteredSelectableTokensLists: TSelectableTokensLists = []
      tokensLists?.forEach((tokensList: TTokensList) => {
        const chainTokensList = getChainTokensList(tokensList, chainId)
        const currentChainTokensCount = (chainTokensList ? chainTokensList.tokensCount : 0)
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


  /**
   * Sets target (to) data (balance, canTransfer) for tokensInstances
   * @param _tokensInstances 
   * @param _targetAddress 
   * @returns updated tokensInstances
   */
  const loadTargetData = useCallback(
    async (_tokensInstances: TTokensInstances, _targetAddress: TAddressStringEmpty): Promise<TTokenInstance[]> => {
      let tokensInstancesData: TTokenInstance[] = []
      try {
        if (_tokensInstances && _targetAddress) {
          const targetADDRESS = _targetAddress.toUpperCase();
          const targetTokensBalancesPromises = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.targetBalances, null, _targetAddress, true); // tokens target user balances
          const targetCanTransferTokensPromises = loadTokensOnChainData(_tokensInstances, EStepsLoadTokensData.targetTransferAbility, null, _targetAddress, true); // tokens transfer ability
          const [targetTokensBalances, targetCanTransferTokens] = await Promise.all([targetTokensBalancesPromises, targetCanTransferTokensPromises]); // Wait for all promises to resolve
          // Check for errors: empty results arrays
          if (!(targetTokensBalances && targetTokensBalances.length && targetCanTransferTokens && targetCanTransferTokens.length)) {
            setStateErrorLoadingTokensInstances(true)
            return _tokensInstances; // Errors ? return original tokensInstances
          }
          // Check for errors: undefined results in arrays
          const targetTokensBalancesErrors = targetTokensBalances?.some((targetTokenBalance: any) => { targetTokenBalance == undefined })
          const targetCanTransferTokensToErrors = targetTokensBalances?.some((targetCanTransferTokenTo: any) => { targetCanTransferTokenTo == undefined })
          if (targetTokensBalancesErrors || targetCanTransferTokensToErrors) {
            setStateErrorLoadingTokensInstances(true)
            return _tokensInstances; // Errors ? return original tokensInstances
          }
          // Merge promises results
          tokensInstancesData = _tokensInstances?.map((_tokenInstance: TTokenInstance, index: number) => {
            _tokenInstance.userData[targetADDRESS as any] = {
              ..._tokenInstance.userData[targetADDRESS as any],
              ...targetTokensBalances[index], // target balances
              ...targetCanTransferTokens[index], // can transfer
            }
            return _tokenInstance;
          })
        }
      } catch (error) {
        console.error(`loadTargetData error: ${error}`);
      }
      return tokensInstancesData;
    },
    [loadTokensOnChainData, setStateErrorLoadingTokensInstances]
  )

  /**
   * Update chainTokensList tokensInstances with rules:
   * - if targetAddress is set, load target data (balance, canTransfer)
   * - if connectedAddress is set, load source data (balance, canTransfer)
   * @param _chainTokensList
   * @param _targetAddress
   */
  const updateChainTokensListTokensInstancesDisplayProperties = useCallback(
    async (_chainTokensList: TChainTokensList, _targetAddress: TAddressStringEmpty) => {
      const connectedADDRESS = (connectedAddress ? connectedAddress.toUpperCase() : "");
      const targetADDRESS = _targetAddress.toUpperCase();
      const updatedChainTokensListTokensInstancesProps = _chainTokensList.tokensInstances?.map((tokenInstance: TTokenInstance) => {
        const selectable = (tokenInstance.userData
          && (tokenInstance.userData[connectedADDRESS as any]?.balance || 0n > 0n)
          && tokenInstance.userData[connectedADDRESS as any]?.canTransfer && tokenInstance.userData[targetADDRESS as any]?.canTransfer) ? true : false;
        const transferAmount = (!selectable && tokenInstance.transferAmount > 0n ? 0n : (tokenInstance.transferAmount ? tokenInstance.transferAmount : tokenInstance.userData[connectedADDRESS as any]?.balance || 0n))
        const selected = (tokenInstance.selected && selectable) ? true : false;
        const lockTransferAmount = (selectable && tokenInstance.lockTransferAmount) ? true : false;
        return { ...tokenInstance, selectable, transferAmount, selected, lockTransferAmount };
      })
      _chainTokensList.tokensInstances = updatedChainTokensListTokensInstancesProps;
    },
    [connectedAddress]
  )

  /**
   * updateChainTokensListTokensInstances
   * @param _chainTokensList
   * @param _targetAddress
   * Load tokensInstances data
   * Updates _chainTokensList.tokensInstances, _chainTokensList.loadState
   * 
   */
  const updateChainTokensListTokensInstances = useCallback(
    async (_chainTokensList: TChainTokensList, _targetAddress: TAddressStringEmpty) => {
      try {
        if (_chainTokensList.tokensInstances && _chainTokensList.tokensInstances.length) {
          const targetADDRESS = _targetAddress.toUpperCase();
          if (_chainTokensList.loadState == EChainTokensListLoadState.notLoaded) {
            // Load contracts
            _chainTokensList.tokensInstances = await loadTokensOnChainData(_chainTokensList.tokensInstances, EStepsLoadTokensData.contracts, null, null, true)
            _chainTokensList.loadState = EChainTokensListLoadState.contracts
          }
          if (_chainTokensList.loadState == EChainTokensListLoadState.contracts) {
            const connectedADDRESS = (connectedAddress ? connectedAddress.toUpperCase() : "");
            // Load : names, decimals, sourceBalances, symbols, sourceTransferAbility, [targetBalances, targetTransferAbility]
            // tokens names
            const tokensNamesPromises = loadTokensOnChainData(_chainTokensList.tokensInstances, EStepsLoadTokensData.names, null, null, true)
            // tokens connected user (source) balances
            const tokensSourceBalancesPromises = loadTokensOnChainData(_chainTokensList.tokensInstances, EStepsLoadTokensData.sourceBalances, connectedAddress, null, true)
            // tokens source transferability
            const tokensSourceCanTransferPromises = loadTokensOnChainData(_chainTokensList.tokensInstances, EStepsLoadTokensData.sourceTransferAbility, connectedAddress, connectedAddress, true);
            // tokens decimals
            const tokensDecimalsPromises = loadTokensOnChainData(_chainTokensList.tokensInstances, EStepsLoadTokensData.decimals, null, null, true)
            // tokens symbols
            const tokensSymbolsPromises = loadTokensOnChainData(_chainTokensList.tokensInstances, EStepsLoadTokensData.symbols, null, null, true)
            // If _targetAddress is already set, load Additionnal data: targetBalances, transferAbility
            const tokensTargetBalancesPromises = _targetAddress ? loadTokensOnChainData(_chainTokensList.tokensInstances, EStepsLoadTokensData.targetBalances, null, _targetAddress, true) : null;
            const tokensTargetCanTransferToPromises = _targetAddress ? loadTokensOnChainData(_chainTokensList.tokensInstances, EStepsLoadTokensData.targetTransferAbility, null, _targetAddress, true) : null;
            // Wait for all promises to resolve
            const [tokensNames, tokensSourceBalances, tokensSourceCanTransfer, tokensDecimals, tokensSymbols, tokensTargetBalances, tokensTargetCanTransferTo] =
              _targetAddress ?
                await Promise.all([tokensNamesPromises, tokensSourceBalancesPromises, tokensSourceCanTransferPromises, tokensDecimalsPromises, tokensSymbolsPromises, tokensTargetBalancesPromises, tokensTargetCanTransferToPromises]) :
                await Promise.all([tokensNamesPromises, tokensSourceBalancesPromises, tokensSourceCanTransferPromises, tokensDecimalsPromises, tokensSymbolsPromises]);
            // Check for errors
            if ((!(tokensNames && tokensNames.length) && !(tokensSymbols && tokensSymbols.length))
              || !tokensSourceBalances || !tokensSourceCanTransfer || !tokensDecimals
              || (_targetAddress && (!tokensTargetBalances || !tokensTargetCanTransferTo))) {
              // Missing promises results
              setStateErrorLoadingTokensInstances(true)
              return
            }
            // TODO: check for errors in Tokens names and symbols
            // const namesErrors = tokensNames?.some( (tokenName) => tokenName.name == undefined)
            // const symbolsErrors = tokensSymbols?.some( (tokensSymbol) => tokensSymbol.symbol == undefined)
            const sourceBalancesErrors = tokensSourceBalances?.some((tokenSourceBalance: any) => tokenSourceBalance.balance == undefined)
            const sourceCanTransferErrors = tokensSourceCanTransfer?.some((tokenSourceCanTransfer) => tokenSourceCanTransfer == undefined)
            const decimalsErrors = tokensDecimals?.some((tokenDecimals) => tokenDecimals.decimals == undefined)
            if (sourceBalancesErrors || sourceCanTransferErrors || decimalsErrors) {
              setStateErrorLoadingTokensInstances(true)
              return
            }
            if (_targetAddress) {
              const targetBalancesErrors = tokensTargetBalances?.some((tokenTargetBalance: any) => { tokenTargetBalance == undefined })
              const targetCanTransferToErrors = tokensTargetCanTransferTo?.some((tokenTargetCanTransferTo: any) => { tokenTargetCanTransferTo == undefined })
              if (targetBalancesErrors || targetCanTransferToErrors) {
                setStateErrorLoadingTokensInstances(true)
                return
              }
            }
            // Merge loadTokensOnChainDataPromises results
            _chainTokensList.tokensInstances = _chainTokensList.tokensInstances?.map((_tokenInstance: TTokenInstance, index: number) => {
              // Update tokenInstance with data from promises
              if (tokensNames && tokensSourceBalances && tokensSourceCanTransfer && tokensDecimals && tokensSymbols) {
                _tokenInstance.name = tokensNames[index].name // tokens names
                const { balance } = tokensSourceBalances[index] as unknown as TTokenInstanceUserData
                _tokenInstance.userData[connectedADDRESS as any] = { ..._tokenInstance.userData[connectedADDRESS as any], balance, ...tokensSourceCanTransfer[index] } // source balances, can transfer from source
                _tokenInstance.decimals = tokensDecimals[index].decimals // tokens decimals
                _tokenInstance.symbol = tokensSymbols[index].symbol // tokens symbols
                if (_targetAddress && tokensTargetBalances && tokensTargetCanTransferTo) {
                  _tokenInstance.userData[targetADDRESS as any] = { ..._tokenInstance.userData[targetADDRESS as any], ...tokensTargetBalances[index], ...tokensTargetCanTransferTo[index] } // target balances, can transfer to target
                }
              }
              return _tokenInstance;
            })
            _chainTokensList.loadState = (!_targetAddress ? EChainTokensListLoadState.symbols : EChainTokensListLoadState.targetTransferAbility)

          } else if (_targetAddress) {
            const allInstancesWithTargetData = _chainTokensList.tokensInstances?.every((_tokenInstance: TTokenInstance) =>
              _tokenInstance.userData && _tokenInstance.userData[targetADDRESS as any] && _tokenInstance.userData[targetADDRESS as any].balance && _tokenInstance.userData[targetADDRESS as any].canTransfer)
            if (!allInstancesWithTargetData) {
              // TODO: hack to avoid hidding already loaded data
              setStateUpdatingTokensInstances(true)
              const tokensInstancesTargetData = await loadTargetData(_chainTokensList.tokensInstances, _targetAddress)
              if (tokensInstancesTargetData && tokensInstancesTargetData.length) {
                _chainTokensList.loadState = EChainTokensListLoadState.targetTransferAbility
                _chainTokensList.tokensInstances = tokensInstancesTargetData
              }
            }
          }
          updateChainTokensListTokensInstancesDisplayProperties(_chainTokensList, _targetAddress)
        }
      } catch (error) {
        console.error(`updateChainTokensListTokensInstances error: ${error}`);
      }
    },
    [connectedAddress, loadTargetData, loadTokensOnChainData, setStateErrorLoadingTokensInstances, setStateUpdatingTokensInstances, updateChainTokensListTokensInstancesDisplayProperties]
  )

  /**
   * Update all tokensInstances of one chainTokensList
   */
  const updateChainTokenListTokensInstances = useCallback(
    async (_chainTokensList: TChainTokensList) => {
      try {
        if (_chainTokensList.tokensCount && _chainTokensList?.tokens?.length && (!_chainTokensList.tokensInstances || (_chainTokensList.tokensCount != _chainTokensList.tokensInstances?.length))) {
          _chainTokensList.tokensInstances = new Array<TTokenInstance>();
          for (let indexToken = 0; indexToken < _chainTokensList?.tokens?.length; indexToken++) {
            const _tokenInstance = initTokenInstance(_chainTokensList, indexToken)
            if (_tokenInstance) _chainTokensList.tokensInstances.push(_tokenInstance);
          }
        }
        await updateChainTokensListTokensInstances(_chainTokensList, targetAddress)
      } catch (error) {
        console.error(`updateChainTokenListTokensInstances error: ${error}`);
      }
    },
    [initTokenInstance, targetAddress, updateChainTokensListTokensInstances]
  )

  /**
   * Watch Transfer Events
   */
  const watchTransferEvents = useCallback(
    async (): Promise<any> => {
      if (unwatch.current) unwatch.current() // remove previous watch
      if (tokensInstancesIndex && tokensInstancesIndex.size) {
        console.log(`watchTransferEvents: tokensInstancesIndex.size=${tokensInstancesIndex.size}`)
        // array of tokens addresses
        const tokensAddresses = Array.from(tokensInstancesIndex.values(), (tokenInstance: TTokenInstance) => tokenInstance.address)
        const unwatchFn = publicClient.watchContractEvent({
          address: tokensAddresses,
          strict: true,
          onError: (error: Error) => {
            reportWatchError(error)
            watchTransferEvents() // relaunch watch
          },
          abi: erc20ABI,
          eventName: 'Transfer',
          onLogs: (logs: Log[]) => processTransferEvent(logs)
        })

        unwatch.current = unwatchFn;
      }
    },
    [processTransferEvent, publicClient, reportWatchError, tokensInstancesIndex]
  )

  // ========================================================
  // USE EFFECTS
  // ========================================================

  /**
   * Reset to initial step when chainId or connectedAddress changes
   */
  useEffect(() => {
    resetToInitialStepCB()
    settokensInstances(null)
    settokensInstancesIndex(new Map())
  },
    [chainId, connectedAddress, resetToInitialStepCB]
  )

  /**
   * Initialize tokens lists
  */
  useEffect(() => { initSelectableTokensLists() }, [initSelectableTokensLists]);

  /**
   * Update tokens migration state on step change
   * step forward : set tokensInstances.transferState.processing to true and update tokensInstances.transferState.transfer for previous processed tokens
   * step back : set tokensInstances.transferState.processing to false
   */
  useEffect(
    () => {
      try {
        if (step == ESteps.tokensToMigrate && previousStep.current == ESteps.migration) {
          // Step back
          const updatedTokensInstances = tokensInstances?.map((tokenInstance: TTokenInstance) => {
            if (tokenInstance.transferState.processing) {
              const tokenInstanceUpdate = { ...tokenInstance, transferState: { ...tokenInstance.transferState, processing: false } } // reset processing state
              updateTokenInstanceRefs(tokenInstanceUpdate)
              return tokenInstanceUpdate
            }
            return tokenInstance;
          })
          settokensInstances(updatedTokensInstances)
        } else if (step == ESteps.migration && previousStep.current == ESteps.tokensToMigrate) {
          // Step forward
          const updatedTokensInstances = tokensInstances?.map((tokenInstance: TTokenInstance) => {
            if (tokenInstance.selected) {
              const tokenInstanceUpdate = { ...tokenInstance, transferState: { processing: true, transfer: ETokenTransferState.none } } // Selected, mark as processing (= "to process") and reinit transfer state
              updateTokenInstanceRefs(tokenInstanceUpdate)
              return tokenInstanceUpdate
            }
            if (tokenInstance.transferState.transfer == ETokenTransferState.processed || tokenInstance.transferState.transfer == ETokenTransferState.error || tokenInstance.transferState.transfer == ETokenTransferState.skipped) {
              const tokenInstanceUpdate = {
                ...tokenInstance, // Not selected: reinit transfer state and change previously transferred state to "previous" state
                transferState: {
                  processing: tokenInstance.transferState.processing,
                  transfer: (tokenInstance.transferState.transfer == ETokenTransferState.processed ?
                    ETokenTransferState.previous_processed : (tokenInstance.transferState.transfer == ETokenTransferState.error ? ETokenTransferState.previous_error :
                      (tokenInstance.transferState.transfer == ETokenTransferState.skipped ? ETokenTransferState.previous_skipped : tokenInstance.transferState.transfer)))
                }
              }
              updateTokenInstanceRefs(tokenInstanceUpdate)
              return tokenInstanceUpdate
            }
            return tokenInstance;
          })
          settokensInstances(updatedTokensInstances)
        }
        previousStep.current = step;
      } catch (error) {
        console.error(`useEffect step error: ${error}`);
      }
    },
    [step, tokensInstances, updateTokenInstanceRefs]
  )

  /**
   * Update all selected chain tokensLists
   */
  useEffect(
    () => {
      const newSelectedChainsTokensList: TChainsTokensListArrayNullUndef = [];
      const selectedTokenLists = getSelectedTokenLists(selectableTokensLists)
      selectedTokenLists?.map((selectedTokenList: TSelectableTokensList) => {
        tokensLists?.forEach((tokensList: TTokensList) => {
          if (tokensList.id == selectedTokenList.tokensList.id) {
            const chainTokensList = getChainTokensList(tokensList, chainId)
            newSelectedChainsTokensList.push(chainTokensList)
          }
        })
      })
      setselectedChainTokensLists(newSelectedChainsTokensList)
    },
    [chainId, getSelectedTokenLists, selectableTokensLists, tokensLists]
  )

  /**
   * Update all selected tokensLists tokensInstances
   */
  useEffect(
    () => {
      const updateChainTokenListsTokensInstances = async () => {
        const promises: Promise<any>[] = []
        selectedChainTokensLists?.forEach(async (selectedChainTokensList: TChainTokensListNullUndef) => {
          selectedChainTokensList && promises.push(updateChainTokenListTokensInstances(selectedChainTokensList))
        })
        await Promise.all(promises)
      }
      // const start: number = Date.now()
      setStateErrorLoadingTokensInstances(false)
      setStateLoadingTokensInstances(true)
      setStateIsFetchingData(true)

      updateChainTokenListsTokensInstances().then(() => {
        const tokensInstancesFromSelectedTokensLists: TTokensInstances = []
        selectedChainTokensLists?.forEach((selectedChainTokensList: TChainTokensListNullUndef) => {
          if (selectedChainTokensList?.tokensInstances) {
            tokensInstancesFromSelectedTokensLists.push(...selectedChainTokensList.tokensInstances)
          }
        })
        setStateLoadingTokensInstances(false)
        setStateUpdatingTokensInstances(false)
        setStateIsFetchingData(false)
        settokensInstancesIndex(getTokensInstancesIndex(tokensInstancesFromSelectedTokensLists))
        settokensInstances(tokensInstancesFromSelectedTokensLists)
        // console.log(`updateChainTokenListsTokensInstances took: ${Date.now() - start}ms`)
      })
    },
    [selectedChainTokensLists, updateChainTokenListTokensInstances, settokensInstancesIndex, getTokensInstancesIndex,
      setStateErrorLoadingTokensInstances, setStateLoadingTokensInstances, setStateIsFetchingData, setStateUpdatingTokensInstances]
  )

  console.dir(tokensInstancesIndex)
  console.dir(tokensInstances)


  /**
   * Sets up the watch for Transfer Events
   */
  useEffect(
    () => {
      watchTransferEvents()
    }, [watchTransferEvents]
  )

  return (
    <>
      {(step < 0 || step > 3) &&
        <div className=" w-full bg-error text-error-content" >
          <MainContentContainer>
            <StepError setpreviousDisabled={setpreviousDisabled} setNextDisabled={setNextDisabled} />
          </MainContentContainer>
        </div>
      }
      {step === 0 &&
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
      {step === 1 &&
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
      {step === 2 &&
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
      {step === 3 &&
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