// React
import { useCallback, useEffect, useMemo, useState } from "react";

// Components
import MainContentContainer from "@Components/MainContentContainer";

import StepError from "@Components/StepError";
import Step0 from "@Components/Step0";
import Step1 from "@Components/Step1";
import Step2 from "@Components/Step2";
import Step3 from "@Components/Step3";

// Context Hooks
import { useMoveTokensAppContext } from '@Providers/MoveTokensAppProvider/MoveTokensAppContext'


// Utils
import { getChainTokensList } from "@jsutils/tokensListsUtils";

// Wagmi
import { getContract, multicall } from '@wagmi/core'
import { useAccount } from 'wagmi'

// ABIs
import { erc20ABI } from 'wagmi'
import CoinBridgeToken from "@abis/CoinBridgeToken.json";

// Consts & Enums
import { PUBLIC_MULTICALL_MAX_BATCH_SIZE_DEFAULT } from "@uiconsts/misc";
import { EStepsLoadTokensData, EChainTokensListLoadState } from "@jsconsts/enums"; 

// ------------------------------

const StepsContainer = ( {
  tokensLists,
  chainId,
  setpreviousDisabled, setNextDisabled,
  // setShowProgressBar, setProgressBarPercentage,
 } :IStepsContainerProps ) => {

  // console.debug(`StepsContainer.tsx render`)


// ------------------------------

  const { address: connectedAddress, /* status, isConnected ,  isConnecting,  isDisconnected*/ } = useAccount()
  const { moveTokensAppData: { step = -1 } } = useMoveTokensAppContext()

  const [selectableTokensLists, setselectableTokensLists] = useState<TSelectableTokensLists>(null)

  const [selectedChainsTokensList, setselectedChainsTokensList] = useState<TChainsTokensListArrayNullUndef>(null)
  const [tokensInstances, settokensInstances] = useState<TTokensInstances>(null)

  const [targetAddress, settargetAddress] = useState<TAddressEmpty>("")

  const [isLoading, setisLoading] = useState<boolean>(false)
  // const [loadStep, setloadStep] = useState<ESLoadtate>(ESLoadtate.notLoaded)
  const [isError, setisError] = useState(false)

  // Sorting
  const [sortOrderTokenDisplayId, setsortOrderTokenDisplayId] = useState<TsortOrder>(0) // 0: unsorted, 1: lowest first , 2 highest first
  const [sortOrderTokenName, setsortOrderTokenName] = useState<TsortOrder>(0) // 0: unsorted, 1: lowest first , 2 highest first
  const [sortOrderTokenBalance, setsortOrderTokenBalance] = useState<TsortOrder>(0) // 0: unsorted, 1: lowest first , 2 highest first

  // Filtering
  const [nameFilter, setnameFilter] = useState<string>("")
  const [balanceGt0Filter, setBalanceGt0Filter] = useState<boolean>(false)
  const [balanceFilter, setBalanceFilter] = useState<string>("")
  const [addressFilter, setaddressFilter] = useState<string>("")

  // Selection
  const [selectAll, setselectAll] = useState<boolean>(false);
  const [invertAll, setinvertAll] = useState(false)

  // ------------------------------

  // Filter

  const updateNameFilter = useCallback(
    (e: React.FormEvent<HTMLInputElement>): void =>
      {
        try {
          // console.debug(`updateNameFilter e.currentTarget.value: ${e.currentTarget.value}`);
          setnameFilter(e.currentTarget.value);
        } catch (error) {
          console.error(`StepsContainer.tsx updateNameFilter e.currentTarget.value: ${e.currentTarget.value} error: ${error}`);
        }
      },
      []
  ); // updateNameFilter

  // ---

  const updateBalanceFilter = useCallback(
    (e: React.FormEvent<HTMLInputElement>): void =>
      {
        try {
          // console.debug(`updateBalanceFilter e.currentTarget.value: ${e.currentTarget.value}`);
          // const balance = BigInt(e.currentTarget.value);
          setBalanceFilter(e.currentTarget.value);
          // setBalanceFilter(balance.toString());
        } catch (error) {
          console.error(`StepsContainer.tsx updateBalanceFilter e.currentTarget.value: ${e.currentTarget.value} error: ${error}`);
        }
      },
      []
  ); // updateBalanceFilter

  // ---

  // const updateBalanceGt0Filter = useCallback(
  const switchBalanceGt0Filter = useCallback(
    (/* e: React.FormEvent<HTMLInputElement> */): void =>
      {
        try {
          // console.debug(`switchBalanceGt0Filter `);
          // setBalanceGt0Filter(e.currentTarget.value);
          setBalanceGt0Filter(!balanceGt0Filter);
        } catch (error) {
          console.error(`StepsContainer.tsx switchBalanceGt0Filter error: ${error}`);
        }
      },
      [balanceGt0Filter]
  ); // switchBalanceGt0Filter

  // ---

  const updateAddressFilter = useCallback(
    (e: React.FormEvent<HTMLInputElement>): void =>
      {
        try {
          // console.debug(`updateAddressFilter e.currentTarget.value: ${e.currentTarget.value}`);
          setaddressFilter(e.currentTarget.value);
        } catch (error) {
          console.error(`StepsContainer.tsx updateAddressFilter e.currentTarget.value: ${e.currentTarget.value} error: ${error}`);
        }
      },
      []
  ); // updateAddressFilter

  const tokenInstanceFilterParamsUpdaters = {
    updateNameFilter, switchBalanceGt0Filter, updateBalanceFilter, updateAddressFilter
  } as ItokenInstanceFilterParamsUpdaters
    // ---


  const filterTokenInstanceWithFilterProps = (filter: /* ITokenInstanceListFilterProps */ ITokenInstanceListFilterStates, token:TTokenInstance) =>
  {
    try {
      // console.debug(`StepsContainer.tsx filterTokenInstanceWithFilterProps filter.name=${filter.name} accountAddress: ${accountAddress}`);
      const nameFilter = filter.name && token.name ? token.name.toLowerCase().includes(filter.name.toLowerCase()) : true ;

      if (!nameFilter) return false ; // RETURN
      const balanceGt0Filter = filter.balanceGt0 ? (token.userData[/* accountAddress */ connectedAddress as any]?.balance || 0) > 0 : true ;

      if (!balanceGt0Filter) return false ; // RETURN

      const balance = Number(filter.balance)
      const intValueBI = BigInt(balance.toString())
      const floatPart:string = balance.toString(10)?.split('.')[1]
      const leadingZeros:number = floatPart?.match(/^0+/)?.[0].length || 0
      const floatValue = floatPart ? BigInt(floatPart) : 0n

      const filterValueInt =  BigInt(Math.pow(10, token.decimals)) * intValueBI
      const filterValueFloat = BigInt(Math.pow(10, token.decimals-(leadingZeros+floatValue.toString().length))) * floatValue
      const filterValue = filterValueInt + filterValueFloat
      const balanceFilter = filter.balance && token.decimals ? (token.userData[/* accountAddress */ connectedAddress as any]?.balance || 0) >= filterValue : true ;

      if (!balanceFilter) return false ;

      const addressFilter = filter.address && token.address ? token.address.toLowerCase().includes(filter.address.toLowerCase()) : true ;

      return addressFilter; // RETURN
    } catch (error) {
      console.error(`StepsContainer.tsx filterTokenInstanceWithFilterProps error: ${error}`);
      return true; // error : skip and RETURN TRUE
    }
  }

  // ---

  const tokenInstanceFilterParams = {
    name: nameFilter, balanceGt0: balanceGt0Filter, balance: balanceFilter, address: addressFilter
  } as ITokenInstanceListFilterStates // ITokenInstanceListFilterProps

  // ---

  const filterTokenInstance = (token:TTokenInstance) =>
  {
    try {
      return filterTokenInstanceWithFilterProps(tokenInstanceFilterParams, token)
    } catch (error) {
      console.error(`StepsContainer.tsx filterTokenInstance error: ${error}`);
      return true; // error : skip and RETURN TRUE
    }
  }

  // ------------------------------

  // Sort

  const sortByTokenDisplayId = useCallback( () => {
    // console.log(`StepsContainer.tsx sortByTokenDisplayId sortOrderTokenDisplayId: ${sortOrderTokenDisplayId}`);
    if (sortOrderTokenDisplayId === 0) {
      setsortOrderTokenDisplayId(1)
    } else if (sortOrderTokenDisplayId === 1) {
      setsortOrderTokenDisplayId(2)
    } else {
      setsortOrderTokenDisplayId(0)
    }
    // console.log(`StepsContainer.tsx sortByTokenDisplayId sortOrderTokenDisplayId: ${sortOrderTokenDisplayId}`);
  }, [/* tokensInstances, */ sortOrderTokenDisplayId] );

  // ---

  const sortByTokenName = useCallback( () => {
    // console.log(`StepsContainer.tsx sortByTokenName sortOrderTokenName: ${sortOrderTokenName}`);
    if (sortOrderTokenName === 0) {
      setsortOrderTokenName(1)
    } else if (sortOrderTokenName === 1) {
      setsortOrderTokenName(2)
    } else {
      setsortOrderTokenName(0)
    }
    // console.log(`StepsContainer.tsx sortByTokenName sortOrderTokenName: ${sortOrderTokenName}`);
  }, [/* tokensInstances, */ sortOrderTokenName] );

  // ---

  const sortByTokenBalance = useCallback( () => {
    // console.log(`StepsContainer.tsx sortByTokenBalance sortOrderTokenBalance: ${sortOrderTokenBalance}`);
    if (sortOrderTokenBalance === 0) {
      setsortOrderTokenBalance(1)
    } else if (sortOrderTokenBalance === 1) {
      setsortOrderTokenBalance(2)
    } else {
      setsortOrderTokenBalance(0)
    }
    // console.log(`StepsContainer.tsx sortByTokenBalance sortOrderTokenBalance: ${sortOrderTokenBalance}`);
  }, [/* tokensInstances, */ sortOrderTokenBalance] );

  // ---

  const sortOrderParams = { displayId: sortOrderTokenDisplayId, tokenName: sortOrderTokenName, tokenBalance: sortOrderTokenBalance } as ISortOrderParams

  // ---

  const sortTokensInstances = (a:TTokenInstance, b:TTokenInstance) =>
  {
    // console.debug(`StepsContainer.tsx sortTokensInstances sortOrderParams.displayId=${sortOrderParams.displayId} sortOrderParams.tokenName=${sortOrderParams.tokenName} sortOrderParams.tokenBalance=${sortOrderParams.tokenBalance}`);
    try {
      if (sortOrderParams.displayId === 0) {
        if (sortOrderParams.tokenName === 0) {
          if (sortOrderParams.tokenBalance === 0) {
            return 0
          }
          const aBalance = a.userData?.[connectedAddress as any].balance || 0n
          const bBalance = b.userData?.[connectedAddress as any].balance || 0n
          if (sortOrderParams.tokenBalance === 1) {
            const compAMinusB = aBalance - bBalance
            // console.debug(`StepsContainer.tsx sortTokensInstances 1 ${aBalance} , ${bBalance} compAMinusB: ${compAMinusB}`);
            return Number(compAMinusB)
          } else {
            const compBMinusA = bBalance - aBalance
            // console.debug(`StepsContainer.tsx sortTokensInstances 2 ${bBalance} , ${aBalance} compBMinusA: ${compBMinusA}`);
            return Number(compBMinusA)
          }
        }
        else if (sortOrderParams.tokenName === 1) {
          // return a.name?.localeCompare(b.name??"")
          if (a.name) {
            return a.name?.localeCompare(b.name??"")
          }
          return -1
        }
        else {
          // return b.name?.localeCompare(a.name??"")
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
      console.error(`StepsContainer.tsx sortTokensInstances error: ${error} connectedAddress=${connectedAddress}`);
      // console.debug(`StepsContainer.tsx sortTokensInstances error: ${error} connectedAddress=${connectedAddress}`);
      // console.dir(a)
      // console.dir(b)
      return 0
    }
  } // sortTokensInstances

  // ------------------------------

  // Selection

  const updateCheckAll = useCallback(  (tokensInstances:TTokensInstances) => {
    try {
      
      // console.debug(`StepsContainer.tsx x realTokensList: ${realTokensList}`);
      if (tokensInstances && /*accountAddress*/ connectedAddress) {
        const isAllChecked = tokensInstances.every(
          (tokensInstance) => {
            if (tokensInstance.selectable) {
              if (tokensInstance.transferAmount)
                return tokensInstance.selected;
            }
            return true; // not selectable OR no amount : RETURN TRUE
          } // every
        );
        setselectAll(isAllChecked);
      } else {
        // Empty list
        setselectAll(false);
      }
    } catch (error) {
      console.error(`StepsContainer.tsx updateCheckAll error: ${error}`);
    }

  }, [/*accountAddress*/ connectedAddress]); // updateCheckAll

  // ---

  const handleCheckSelectAll = useCallback(
    () =>
      {
        try {
          
          console.debug(`handleCheckSelectAll selectAll: ${selectAll}`);
          if (tokensInstances) {
            const newCheckAll = !selectAll
            const tokensInstancesCheckAll = tokensInstances.map((tokensInstance) => {

              if (tokensInstance.address.toUpperCase() == "0X8D1090DF790FFAFDACCDA03015C05DF3B4CC9C21") {
                console.debug(`handleCheckSelectAll tokensInstance=`);
                  console.dir(tokensInstance)
              } // debug
              if (  tokensInstance.selectable && targetAddress && tokensInstance.userData &&
                    tokensInstance.userData[targetAddress as any].canTransfer &&
                    tokensInstance.userData[connectedAddress as any].canTransfer &&
                    (tokensInstance.userData[connectedAddress as any].balance||0n) > 0n &&
                    // tokensInstance.userData[targetAddress as any].transferAmount>0
                    tokensInstance.transferAmount > 0n
                  )
              {
                // tokensInstance.userData[targetAddress as any].selected = newCheckAll;
                tokensInstance.selected = newCheckAll;
              }
              return {
                ...tokensInstance,
              } as TTokenInstance;
            });
            settokensInstances(tokensInstancesCheckAll);
            // console.dir(tokensInstancesCheckAll);
            setselectAll(newCheckAll);
            console.debug(`handleCheckSelectAll newCheckAll: ${newCheckAll}`);
          } // if (tokensInstances)
        } catch (error) {
          console.error(`StepsContainer.tsx handleCheckSelectAll error: ${error}`);
        }
      },
      [tokensInstances, /*accountAddress*/ /* connectedAddress, */ connectedAddress, targetAddress, selectAll]
  ); // handleCheckSelectAll

  // ---
  
  const handleInvertAllChecks = useCallback(
    () =>
      {
        // console.debug(`handleInvertAllChecks invertAll: ${invertAll}`);
        try {
          
          if (tokensInstances) {

            if (tokensInstances) {
              const tokensInstancesInvertCheck = tokensInstances.map((tokensInstance) => {
                if (tokensInstance.selectable) {
                  if (tokensInstance.userData && targetAddress && tokensInstance.userData[/*accountAddress*/ connectedAddress as any]
                    && tokensInstance.userData[/*accountAddress*/ connectedAddress as any].canTransfer
                    && tokensInstance.userData[/*accountAddress*/ targetAddress as any].canTransfer
                    && tokensInstance.transferAmount>0
                    ) {
                    // if (tokensInstance.userData[/*accountAddress*/ connectedAddress as any].transferAmount>0) {
                      // tokensInstance.userData[/*accountAddress*/ connectedAddress as any].selected = ! tokensInstance.userData[/*accountAddress*/ connectedAddress as any].selected;
                      tokensInstance.selected = ! tokensInstance.selected;
                    // }
                  }
                }
                return {
                  ...tokensInstance,
                } as TTokenInstance;
              });
              settokensInstances(tokensInstancesInvertCheck);
              // console.dir(tokensInstancesInvertCheck);
              }
            setinvertAll(!invertAll); // just for style
            updateCheckAll(tokensInstances);
            // console.debug(`handleInvertAllChecks invertAll: ${!invertAll}`);
          }
        } catch (error) {
          console.error(`StepsContainer.tsx handleInvertAllChecks error: ${error}`);
        }
      },
      [tokensInstances, invertAll, updateCheckAll, connectedAddress, targetAddress]
  ); // handleInvertAllChecks

  // ---

  const updateCheckboxStatus:IUpdateCheckboxStatus = /* useCallback( */
    (id: string, value: TChecked | undefined) =>
      {
        try {
          // console.info(`updateCheckboxStatus id=${id} `);
          const tokensInstancesUpdated = tokensInstances?.map((tokenInstance) => {
            // if (tokenInstance.chainId+"-"+tokenInstance.address === id) {
            if (tokenInstance.selectID === id) {
              // console.debug(`updateCheckboxStatus id=${id} tokenInstance.selected=${tokenInstance.selected} `);
              if (connectedAddress /* && typeof connectedAddress === "string" */ && tokenInstance.userData && tokenInstance.userData[connectedAddress as any]) {
                if (value) {
                  // console.debug(`updateCheckboxStatus id=${id} value.checked=${value.checked} `);
                  // tokenInstance.userData[connectedAddress as any].selected = value.checked;
                  tokenInstance.selected = value.checked;
                } else {
                  // console.debug(`updateCheckboxStatus id=${id} !tokenInstance.selected=${!tokenInstance.selected} `);
                  tokenInstance.selected = !tokenInstance.selected;
                }
              } // if (accountAddress && ...
            } // if (tokenInstance.selectID === id)
            return {
              ...tokenInstance,
            } as TTokenInstance;
          })
          settokensInstances(tokensInstancesUpdated);
          updateCheckAll(tokensInstancesUpdated);
        } catch (error) {
          console.error(`StepsContainer.tsx updateCheckboxStatus error: ${error}`);
        }
      }
      /* ,
      []
  );  */
  // updateCheckboxStatus

  // ---

  const updateTransferAmount:IUpdateTransferAmount = /* useCallback( */
    (id: string, amount: TTokenAmount) =>
      {
        try {
          // console.info(`updateTransferAmount id=${id} amount=${amount} `);
          const tokensInstancesUpdated = tokensInstances?.map((tokenInstance) => {
            // if (tokenInstance.chainId+"-"+tokenInstance.address === id) {
            if (tokenInstance.selectID === id) {
              // console.debug(`updateTransferAmount id=${id} FOUND`);
              // console.dir(tokenInstance);
              tokenInstance.transferAmount = amount;
            } // if (tokenInstance.selectID === id)
            return {
              ...tokenInstance,
            } as TTokenInstance;
          })
          settokensInstances(tokensInstancesUpdated);
          updateCheckAll(tokensInstancesUpdated);
        } catch (error) {
          console.error(`StepsContainer.tsx updateTransferAmount error: ${error}`);
        }
      }
      /* ,
      []
  );  */
  // updateTransferAmount

  // ---

  const updateTransferAmountLock:ITransferAmountLock = /* useCallback( */
    (id: string, value: boolean) =>
      {
        try {
          // console.info(`updateTransferAmountLock id=${id} `);
          const tokensInstancesUpdated = tokensInstances?.map((tokenInstance) => {
            // if (tokenInstance.chainId+"-"+tokenInstance.address === id) {
            if (tokenInstance.selectID === id) {
              // console.debug(`updateTransferAmountLock id=${id} tokenInstance.transferAmountLock=${tokenInstance.transferAmountLock} value=${value}`);
              // console.dir(tokenInstance);
              if (connectedAddress/*  && typeof connectedAddress === "string" */ && tokenInstance.userData && tokenInstance.userData[connectedAddress as any]) {
                tokenInstance.transferAmountLock = value;
              } // if (accountAddress && ...
            } // if (tokenInstance.selectID === id)
            return {
              ...tokenInstance,
            } as TTokenInstance;
          })
          settokensInstances(tokensInstancesUpdated);
          updateCheckAll(tokensInstancesUpdated);
        } catch (error) {
          console.error(`StepsContainer.tsx updateTransferAmountLock error: ${error}`);
        }
      }
      /* ,
      []
  );  */
  // updateTransferAmountLock

  // ---

  const tokensInstancesListTablePropsHandlers:ITokensInstancesListTableStatesHandlers = {
    sortStates: {
      sortOrderTokenDisplayId,
      sortOrderTokenName,
      sortOrderTokenBalance,
    },
    sortHandlers: {
      sortByTokenDisplayId,
      sortByTokenName,
      sortByTokenBalance,
      sortTokensInstances,
    },
    selectStates: {
      selectAll,
      invertAll
    },
    updateHandlers: {
      handleCheckSelectAll,
      handleInvertAllChecks,
      updateCheckboxStatus,
      updateTransferAmount,
      updateTransferAmountLock,
    },
    filterStates: {
      name: nameFilter,
      balanceGt0: balanceGt0Filter,
      balance: balanceFilter,
      address: addressFilter,
    },
    filterHandlers: {
      filterTokenInstance,
      tokenInstanceFilterParamsUpdaters,
    },

  } // as ITokensInstancesListTableStatesHandlers

  // ---

  const getSelectedTokenLists = useCallback( (selectableTokensLists:TSelectableTokensLists):TSelectableTokensLists =>
    {
      try {
        // console.debug(`StepsContainer.tsx getSelectedTokenLists selectableTokensLists=${selectableTokensLists}`)
        // let selectedTokenList:TSelectableTokensList = null
        const selectedTokensLists = selectableTokensLists?.filter( (selectableTokensList:TSelectableTokensList) => {
          // console.debug(`StepsContainer.tsx getSelectedTokenLists selectableTokensList=${selectableTokensList}`)
          return selectableTokensList.selected && selectableTokensList.chainId == chainId
        })
        // console.debug(`StepsContainer.tsx getSelectedTokenLists selectedTokensLists?.length = ${selectedTokensLists?.length} `)
        // console.dir(selectedTokensLists)
        return selectedTokensLists;
      } catch (error) {
        console.error(`StepsContainer.tsx getSelectedTokenLists error: ${error}`);
        return null;
      }
    },
    [chainId]
  ) // getSelectedTokenLists

  // ------------------------------

  // Tokens Data init & loading

  const initTokenInstance = useCallback( (_token:TTokenChainData, _displayId:TDisplayId ): TTokenInstance|TNullUndef =>
    {
      if (_token?.address) {
        const tokenInstanceUserDataArray:TTokenInstanceUserData[] = new Array<TTokenInstanceUserData>()
        if (connectedAddress && typeof connectedAddress == 'string') {
          tokenInstanceUserDataArray[connectedAddress as any] = {
            // selected: false,
            balance: null,
            // transferAmount: 0n,
            canTransfer: true, // warn: COULD BE FALSE for non transferable tokens, should be defaulted to false then checked with a multicall
          } // as TTokenInstanceUserData
        }
        // debugger;
        const _tokenInstance = {
          chainId,
          type: (_token.extraData && _token.extraData.type ? _token.extraData.type : "ERC20" as TTokenType),
          address: _token.address,
          contract: null,
          decimals: 18,
          name: "",
          symbol: "",
          status: 0,
          displayed: true,
          displayId: _displayId,
          selectID: chainId+"-"+_token.address,
          selectable: false,
          selected: false,
          transferAmount: 0n,
          transferAmountLock: false,
          userData: tokenInstanceUserDataArray,
        } // as TTokenInstance
        // console.dir(_tokenInstance)
        return _tokenInstance
      }
    },
    [chainId, connectedAddress]
  )

// ---

/*
   const decreaseAndHideProgressBar = useCallback(
    () => {
      setProgressBarPercentage(0)
      setTimeout( () => {
        console.debug(`StepsContainer useEffect ProgressBar settimeout`)
        // setShowProgressBar(false), 1_000
      })
    },
    [],
  )
 */

  // const decreaseAndHideProgressBar = 
  //   useCallback(() => {
  //     setProgressBarPercentage(0)
  //     setTimeout( () => {
  //       // console.debug(`StepsContainer decreaseAndHideProgressBar ProgressBar`)
  //       // setShowProgressBar(false), 1_000
  //     })
  //   },
  //   [setProgressBarPercentage]
  // )

  // ---

  const setLoadingDataState = useCallback( (isLoading:boolean) =>
    {
      // console.debug(`StepsContainer.tsx setLoadingDataState isLoading: ${isLoading}`);
      setisLoading(isLoading)
    }, []
  )

  // ---

  const setErrorLoadingDataState = useCallback( (isError:boolean) =>
    {
      // console.debug(`StepsContainer.tsx setErrorLoadingDataState isError: ${isError}`);
      setisError(isError)
    }, []
  )

  // ------------------------------

  const getMaxBatchSize = ( defaultBatchSize: number ) =>
  {
   let MAXBATCHSIZE = defaultBatchSize;
   try {
     const val = // getPublicEnv("PUBLIC_MULTICALL_MAX_BATCH_SIZE")
      import.meta.env.PUBLIC_MULTICALL_MAX_BATCH_SIZE
     if (val) {
       MAXBATCHSIZE = Number.isSafeInteger(Number.parseFloat(val))
         ? Number.parseInt(val, 10)
         : defaultBatchSize;
       }
       return MAXBATCHSIZE
     } catch (error) {
     console.error(`StepsContainer.tsx getMaxBatchSize error: ${error}`);
     return MAXBATCHSIZE
   }
  } // getMaxBatchSize

  const MAXBATCHSIZE:number = useMemo( () =>
    {
      return getMaxBatchSize(PUBLIC_MULTICALL_MAX_BATCH_SIZE_DEFAULT)
    },
    []
  ) // MAXBATCHSIZE

  // ---

  const loadTokensContracts = useCallback( async(tokensInstances:TTokensInstances/* TTokenChainDataArray */):Promise<TTokensInstances> =>
    {
      try {
        console.debug(`StepsContainer.tsx loadTokensContracts`)
        const contractCoinBridgeTokenABI = JSON.parse(CoinBridgeToken.ABI)

        tokensInstances?.forEach( (tokenInstance:TTokenInstance/* TTokenChainData */) => {
          // console.debug(`${tokenInstance}`)
          const abi = tokenInstance.type == "COINBRIDGE" as TTokenType ? contractCoinBridgeTokenABI : erc20ABI;
          if (tokenInstance?.address) {
            const contract = getContract({
              address: tokenInstance.address,
              abi,
            })
            tokenInstance.contract = contract;
          }
        })

        return tokensInstances
      } // try
      catch (error) {
        console.error(`loadTokensContracts error: ${error}`);
      } // catch (error)
    },
    [/* tokens *//* , chainId */]
  ); // loadTokensContracts

  // ---

  const fetchOnChainData = useCallback( async(multicallInput : any[] ) :  Promise<any[]>  =>
   {
    let multicallAllBatchesResult : any[] = [];
    try {
       // console.debug(`StepsContainer.tsx fetchOnChainData multicallInput.length: ${multicallInput.length}`);
       // throw new Error("fetchOnChainData error test")
       for (let i = 0; i < Math.ceil(multicallInput.length / MAXBATCHSIZE); i++) {
         const batch = multicallInput.slice(i * MAXBATCHSIZE, (i + 1) * MAXBATCHSIZE);
         // console.debug(`StepsContainer.tsx fetchOnChainData batch.length: ${batch.length}`);
         // console.dir(batch);
         const multicallBatchResult = await multicall({
           contracts: batch,
           // allowFailure: false, // disable error throwing
         }) // multicall
         // console.debug(`StepsContainer.tsx fetchOnChainData result.length: ${multicallBatchResult.length}`);
         // console.dir(multicallBatchResult);
         multicallAllBatchesResult = multicallAllBatchesResult.concat(multicallBatchResult);
       } // for (let i = 0; i < Math.ceil(multicall.length / MAXBATCHSIZE); i++)

       // console.debug(`StepsContainer.tsx fetchOnChainData setErrorLoadingDataState(false)`);
      //  setErrorLoadingDataState(false)
     } // try
     catch (error) {
       console.error(`StepsContainer.tsx fetchOnChainData error: ${error}`);
      //  setisLoading(false)
       // console.debug(`StepsContainer.tsx fetchOnChainData setErrorLoadingDataState(TRUE)`);
      //  setErrorLoadingDataState(true)
     } // catch (error)
     // console.debug(`StepsContainer.tsx fetchOnChainData result.length: ${multicallAllBatchesResult.length}`);
     // console.dir(multicallAllBatchesResult);
     return multicallAllBatchesResult;
    }
    ,
    [ MAXBATCHSIZE /* , setErrorLoadingDataState */ ]
  ); // fetchOnChainData

  // ---

  const fetchOnChainDataWrapper = useCallback( async(multicallInput : any[] ) : Promise<any[]> =>
    {
      let multicallRes : any[] = [];

      try {
        // console.debug(`StepsContainer.tsx fetchOnChainDataWrapper multicallInput.length: ${multicallInput.length} multicallInput=`);
        // console.dir(multicallInput);
        const multicallInputCall = [] as any[] // contains real multicall inputs
        const inputRes = [] as any[] // contains inputs

        for (let i = 0; i < multicallInput.length; i++) {
          const element = multicallInput[i];

          if ( typeof(element) != "object" || !element.abi || !element.address || !element.functionName) {
            inputRes.push(element);
          }
          else { // if ('abi' in element && 'address' in element /* && 'args' in element */ && 'functionName' in element) {
            multicallInputCall.push(element);
            inputRes.push(null);
          }
        } // for (let i = 0; i < multicallInput.length; i++)
        let multicallFetchRes = [] as any[] // contains multicall results
        if (multicallInputCall.length>0) {
          multicallFetchRes = await fetchOnChainData(multicallInputCall);
        }
        if (inputRes.length>0) {
          // Merge
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
        console.error(`StepsContainer.tsx fetchOnChainDataWrapper error: ${error}`);
        return multicallRes;
      }
      // finally {
      // }
    },
    [fetchOnChainData]
  ) // fetchOnChainDataWrapper

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
        console.debug(`StepsContainer.tsx loadTokensOnChainData_addressBalances: GET ADDRESS TOKENS BALANCES`)
        if (_tokensInstances && _tokensInstances.length) {
          const multicallArray = _tokensInstances.map( async (token) => {
            if (token?.contract) {
              return {
                ...token.contract,
                functionName: 'balanceOf',
                args: [_address],
              }
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
              if (_address /* && typeof _from == 'string' */) {
                // debugger
                tokenInstanceUserDataArray[_address as any] = ({
                  // selected: false,
                  ...tokenInstanceUserDataArray[_address as any],
                  balance: userBalance,
                  // transferAmount: userBalance,
                }) // as TTokenInstanceUserData)
              } // if (_from && typeof _from == 'string')
              return {
                ...tokenInstance,
                status: step,
                userData: tokenInstanceUserDataArray,
              } // as TTokenInstance;

            }); // _tokensInstances.map
            // const allPromiseResolved = // await
            //                                      Promise.all(tokensInstancesWithOnchainData);
            // return allPromiseResolved as Promise<TTokensInstances>;
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          } // if (onchainData?.length > 0
        } // if (_tokensInstances && _tokensInstances.length)
      } catch (error) {
        console.error(`StepsContainer.tsx loadTokensOnChainData_addressBalances error: ${error}`);
      }
    } // loadTokensOnChainData_addressBalances
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
          console.debug(`StepsContainer.tsx loadTokensOnChainData_TransferAbility: GET TOKENS TRANSFER FROM:${(_source?_source.substring(0,6)+"..."+_source.substring(_source.length-5,_source.length):"null/undef")} TO:${(secondaryAddress?secondaryAddress.substring(0,6)+"..."+secondaryAddress.substring(secondaryAddress.length-5,secondaryAddress.length):"null/undef")}`)
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
                status: step,
              } //as TTokenInstance;
            }); // _tokensInstances.map
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          } // if (onchainData?.length > 0
        } // if (_tokensInstances && _tokensInstances.length)
      } catch (error) {
        console.error(`StepsContainer.tsx loadTokensOnChainData_TransferAbility error: ${error}`);
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
        console.debug(`StepsContainer.tsx loadTokensOnChainData_sourceBalances: GET TOKENS DECIMALS`)
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
                status: step,
              } as TTokenInstance;

            }); // _tokensInstances.map
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          } // if (onchainData?.length > 0
        } // if (_tokensInstances && _tokensInstances.length)
      } catch (error) {
        console.error(`StepsContainer.tsx loadTokensOnChainData_decimals error: ${error}`);
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
        console.debug(`StepsContainer.tsx loadTokensOnChainData_names: GET TOKENS NAMES`)
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
                status: step,
              } // as TTokenInstance;
            }); // _tokensInstances.map
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          } // if (onchainData?.length > 0
        } // if (_tokensInstances && _tokensInstances.length)
      } catch (error) {
        console.error(`StepsContainer.tsx loadTokensOnChainData_names error: ${error}`);
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
        console.debug(`StepsContainer.tsx loadTokensOnChainData_symbols: GET TOKENS SYMBOLS`)
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
                status: step,
              } // as TTokenInstance;
            }); // _tokensInstances.map
            return Promise.all(tokensInstancesWithOnchainData) as Promise<TTokensInstances>;
          } // if (onchainData?.length > 0
        } // if (_tokensInstances && _tokensInstances.length)
      } catch (error) {
        console.error(`StepsContainer.tsx loadTokensOnChainData_symbols error: ${error}`);
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
    _tokensInstances: TTokensInstances, step:number, _showProgressBar:boolean,
    _from:TAddressEmptyNullUndef, _to:TAddressEmptyNullUndef, _resultOnly:boolean
    ): Promise<TTokensInstances> =>
    {
      try {
        // console.debug(`StepsContainer.tsx loadTokensOnChainData ProgressBar _tokensInstances?.length=${_tokensInstances?.length}}, step=${step}`)
        if (_tokensInstances && _tokensInstances.length) {
          switch (step) {
            // Step contracts: get tokens contracts
            case EStepsLoadTokensData.contracts:
              // console.debug(`StepsContainer.tsx loadTokensOnChainData Step EStepsLoadTokensData.contracts: GET TOKENS CONTRACTS`)
              // tokensInstancesResults = await loadTokensContracts(_tokensInstances)
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
              console.error(`StepsContainer.tsx loadTokensOnChainData error: step=${step} not found`)
              return _tokensInstances;
          } // switch (step)
          // if (_showProgressBar) {
          //   setProgressBarPercentage(progress)
          // }
        } // if (tokens?.length > 0)
      } // try
      catch (error) {
        console.error(`loadTokensOnChainData error: ${error}`);
      } // catch (error)
    },
    [ loadTokensContracts, loadTokensOnChainData_addressBalances, loadTokensOnChainData_TransferAbility,
      loadTokensOnChainData_decimals, loadTokensOnChainData_names, loadTokensOnChainData_symbols ]
  ); // loadTokensOnChainData

  // ----------------------------------------------

  // USE EFFECTS

  useEffect( () =>
  {

      const loadTargetData = async( _tokensInstances:TTokensInstances, targetAddress:TAddressEmpty) : Promise<TTokenInstance[]> =>
      {
        let tokensInstancesData:TTokenInstance[] = []
        try {
          console.debug(`StepsContainer.tsx loadTargetData BEFORE MERGE promises (target balances, cantransfer) tokensInstancesData =`)

          if (_tokensInstances && targetAddress) {

            // Load target balances
            // tokens target user balances
            const targetBalances = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetBalances,true,"", targetAddress, true);
            // tokens transfer ability
            // const canTransfer = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetTransferAbility,true,connectedAddress,targetAddress, true);
            const canTransfer = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetTransferAbility,true,null,targetAddress, true);

            // Wait for all promises to resolve
            const loadTokensOnChainDataPromises = await Promise.all([targetBalances, canTransfer]);
            // console.debug(`StepsContainer.tsx loadTargetData AFTER await Promise.all`)
            // console.dir(loadTokensOnChainDataPromises[0])
            // console.dir(loadTokensOnChainDataPromises[1])

            // Merge loadTokensOnChainDataPromises results
            tokensInstancesData = _tokensInstances?.map( (_tokenInstance:TTokenInstance, index:number) => {
              if (loadTokensOnChainDataPromises && loadTokensOnChainDataPromises[0] && loadTokensOnChainDataPromises[1] ) {
                
                // console.dir(_tokenInstance.userData[targetAddress as any])
                // _tokenInstance.userData = {
                //   ..._tokenInstance.userData,
                //   ...loadTokensOnChainDataPromises[0][index].userData, // target balances
                //   ...loadTokensOnChainDataPromises[1][index].userData, // can transfer
                // }
                _tokenInstance.userData[targetAddress as any] = {
                  ..._tokenInstance.userData[targetAddress as any],
                  ...loadTokensOnChainDataPromises[0][index], // target balances
                  ...loadTokensOnChainDataPromises[1][index], // can transfer
                }
              } // if (loadTokensOnChainDataPromises && loadTokensOnChainDataPromises[0] && loadTokensOnChainDataPromises[1] )
              return _tokenInstance;
            })

            // console.debug(`StepsContainer.tsx loadTargetData AFTER MERGE promises (target balances, cantransfer) tokensInstancesData =`)
            // console.dir(tokensInstancesData)

            // // update chainTokensList
            // chainTokensList.tokensInstances = tokensInstancesData;
            // // Everything up to transferAbility included is loaded
            // chainTokensList.loadState = EChainTokensListLoadState.transferAbility
            // return tokensInstancesData;

          } // if (targetAddress)

        } catch (error) {
          console.error(`StepsContainer.tsx loadTargetData error: ${error}`);
        }
        return tokensInstancesData;
      } // loadTargetData

      /**
       * 
       * @param chainTokensList
       * on chain data loading must be done in order
       * @returns Promise<TTokensInstances>
       */
      const getUpdatedChainTokensListTokensInstances = async( chainTokensList:TChainsTokensListNullUndef ) : Promise<TTokensInstances> =>
      {
        const start:number = Date.now()
        try {
          console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances chainTokensList.chainId=${chainTokensList?.chainId} chainTokensList.tokensCount=${chainTokensList?.tokensCount} chainTokensList.tokensInstances?.length=${chainTokensList?.tokensInstances?.length}`)
          let _tokensInstances:TTokensInstances;
          if (chainTokensList && chainTokensList.tokensInstances && chainTokensList.tokensInstances.length) {
            // let tmp: TTokensInstances = []
            _tokensInstances = chainTokensList.tokensInstances;
            // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances _tokensInstances =`)
            // console.dir(_tokensInstances)

            if (chainTokensList.loadState == EChainTokensListLoadState.notLoaded) {
              console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EStepsLoadTokensData == NOTLOADED`)
              // Load contracts
              _tokensInstances = await loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.contracts,true,null,"", true)
              chainTokensList.loadState = EChainTokensListLoadState.contracts // EChainTokensListLoadState.contracts
              // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EStepsLoadTokensData.contracts _tokensInstances =`)
              // console.dir(_tokensInstances)
            }

            if (chainTokensList.loadState == EChainTokensListLoadState.contracts) {
              console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances chainTokensList.loadState == EChainTokensListLoadState.CONTRACTS`)
              // Load everything else : sourceBalances, decimals, names, symbols
              // tokens names
              const tokensNamesPromises = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.names,true,null,"", true)

              // tokens connected user (source) balances
              const tokensSourceBalancesPromises = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.sourceBalances,true,connectedAddress,"", true)

              // tokens source transferability
              const tokensSourceCanTransferPromises = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.sourceTransferAbility,true,connectedAddress,connectedAddress, true);

              // tokens decimals
              const tokensDecimalsPromises = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.decimals,true,null,"", true)
              // tokens symbols
              const tokensSymbolsPromises = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.symbols,true,null,"", true)

              // If targetAddress is already set, load Additionnal data: targetBalances, transferAbility
              // tokens target user balances
              const tokensTargetBalancesPromises = targetAddress ? loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetBalances,true,"", targetAddress, true) : null ;
              // tokens target transferability
              // const tokensTargetCanTransferToPromises = targetAddress ? loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetTransferAbility,true,connectedAddress,targetAddress, true) : null ;
              const tokensTargetCanTransferToPromises = targetAddress ? loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetTransferAbility,true,null,targetAddress, true) : null ;

              // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances BEFORE Promise.all`)

              // Wait for all promises to resolve
              // const loadTokensOnChainDataPromises = targetAddress ? await Promise.all([names, sourceBalances, decimals, symbols, targetBalances, canTransferToTarget]) : await Promise.all([names, sourceBalances, decimals, symbols]) ;
              // const loadTokensOnChainDataPromises = await Promise.all( [tokensNamesPromises, tokensSourceBalancesPromises, tokensDecimalsPromises, tokensSymbolsPromises]) ;
              const [tokensNames, tokensSourceBalances, tokensSourceCanTransfer, tokensDecimals, tokensSymbols, tokensTargetBalances, tokensTargetCanTransferTo ] =
                targetAddress ?
                  await Promise.all( [tokensNamesPromises, tokensSourceBalancesPromises, tokensSourceCanTransferPromises, tokensDecimalsPromises, tokensSymbolsPromises]) :
                  await Promise.all( [tokensNamesPromises, tokensSourceBalancesPromises, tokensSourceCanTransferPromises, tokensDecimalsPromises, tokensSymbolsPromises, tokensTargetBalancesPromises, tokensTargetCanTransferToPromises ]) ;

              // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER Promise.all`)

              // Merge loadTokensOnChainDataPromises results
              const tokensInstancesAllData = _tokensInstances?.map( (_tokenInstance:TTokenInstance, index:number) => {
                // Update tokenInstance with data from promises
                if (tokensNames && tokensSourceBalances && tokensSourceCanTransfer && tokensDecimals && tokensSymbols ) {
                    _tokenInstance.name = tokensNames[index].name // tokens names
                    const {balance} = tokensSourceBalances[index] as unknown as TTokenInstanceUserData
                    _tokenInstance.userData[connectedAddress as any] = {..._tokenInstance.userData[connectedAddress as any], /* ...tokensSourceBalances[index] */balance, ...tokensSourceCanTransfer[index]} // source balances, can transfer from source
                    _tokenInstance.decimals = tokensDecimals[index].decimals // tokens decimals
                    _tokenInstance.symbol = tokensSymbols[index].symbol // tokens symbols
                    _tokenInstance.transferAmount = balance||0n // tokens transfer amount
                    // TODO : CHECK IT IS WORKING
                    // TODO : CHECK IT IS WORKING
                    // TODO : CHECK IT IS WORKING
                    if (targetAddress && tokensTargetBalances && tokensTargetCanTransferTo) {
                      console.warn(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances targetAddress IS SET targetAddress && tokensTargetBalances && tokensTargetCanTransferTo MERGING promises`)
                      _tokenInstance.userData[targetAddress as any] = {..._tokenInstance.userData[targetAddress as any], ...tokensTargetBalances[index], ...tokensTargetCanTransferTo[index]} // target balances, can transfer to target
                  } // if (tokensTargetBalances && tokensTargetCanTransferTo)

                }
                return _tokenInstance;
              }) // map

              // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER MERGE promises (names, user balances, decimals, symbols, [target balances, cantransfer]) tokensInstancesAllData =`)
              // console.dir(tokensInstancesAllData)

              // update chainTokensList
              chainTokensList.tokensInstances = tokensInstancesAllData;
              if (!targetAddress) {
                console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances (names, user balances, decimals, symbols) targetAddress is NOT SET`)
                // Everything up to symbols included is loaded
                chainTokensList.loadState = EChainTokensListLoadState.symbols
              } else {
                // Everything up to transferAbility included is loaded
                console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances (names, user balances, decimals, symbols, target balances, cantransfer) targetAddress IS SET`)
                
                chainTokensList.loadState = EChainTokensListLoadState.targetTransferAbility
              }

            } // if (chainTokensList.loadState == EChainTokensListLoadState.contracts)
            else {
              console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState. <> CONTRACTS`)
              // Contracts, names, sourceBalances, decimals, symbols already loaded

              // Check if targetAddress is set
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

              if (targetAddress) {

                console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState. <> CONTRACTS targetAddress is set`)

                // Load State : Symbol = load targetBalances, transferAbility
                if (chainTokensList.loadState == EChainTokensListLoadState.symbols) {
                  console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState == SYMBOLS targetAddress is set`)
                  // Load target data

                  const _tokensInstancesTargetData = await loadTargetData(_tokensInstances, targetAddress)
                  if (_tokensInstancesTargetData && _tokensInstancesTargetData.length ) {
                    _tokensInstances = _tokensInstancesTargetData
                  }

                  // // tokens target user balances
                  // const targetBalances = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetBalances,true,"", targetAddress, true);
                  // // tokens transfer ability
                  // const canTransfer = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.transferAbility,true,connectedAddress,targetAddress, true);

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

                  // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER MERGE promises (target balances, cantransfer) _tokensInstancesTargetData =`)
                  // console.dir(_tokensInstancesTargetData)
    
                  // update chainTokensList
                  chainTokensList.tokensInstances = _tokensInstancesTargetData;
                  // Everything up to targetTransferAbility included is loaded
                  chainTokensList.loadState = EChainTokensListLoadState.targetTransferAbility
                  
                } // if (chainTokensList.loadState == EChainTokensListLoadState.symbols)
                else {
                  console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState <> SYMBOLS targetAddress is set`)

                  // Check targetAddress
                  const allInstancesWithTarget = _tokensInstances?.every( (_tokenInstance:TTokenInstance) => {
                    return ( _tokenInstance.userData && _tokenInstance.userData[targetAddress as any] &&
                      !(_tokenInstance.userData[targetAddress as any].balance == undefined || _tokenInstance.userData[targetAddress as any].balance == null
                      || _tokenInstance.userData[targetAddress as any].canTransfer == undefined || _tokenInstance.userData[targetAddress as any].canTransfer == null)
                    )
                  })

                  if (!allInstancesWithTarget) {
                    console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState <> SYMBOLS ; targetAddress is set ; NOT ALLINSTANCESWITHTARGET LOADING TARGET DATA`)

                    const _tokensInstancesTargetData = await loadTargetData(_tokensInstances, targetAddress)
                    console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER loadTargetData _tokensInstancesTargetData =`)
                    console.dir(_tokensInstancesTargetData)
                    if (_tokensInstancesTargetData && _tokensInstancesTargetData.length ) {
                      _tokensInstances = _tokensInstancesTargetData
                    }

                    // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER MERGE promises (target balances, cantransfer) _tokensInstancesTargetData =`)
                    // console.dir(_tokensInstancesTargetData)
      
                    // update chainTokensList
                    chainTokensList.tokensInstances = _tokensInstancesTargetData;
                    // Everything up to targetTransferAbility included is loaded
                    chainTokensList.loadState = EChainTokensListLoadState.targetTransferAbility
                  }
                  else {
                    console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState <> SYMBOLS ; targetAddress is set ; ALLINSTANCESWITHTARGET EVERYTHING IS LOADED`)
                  }

                  // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                  // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                  // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                  // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                  // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances chainTokensList.loadState=${chainTokensList.loadState} TARGETADDRESS is set, NOTHING TO DO`)
                }
                // // Load State : targetBalances = load transferAbility
                // if (chainTokensList.loadState == EChainTokensListLoadState.targetBalances) {
                //   // Load transfer ability
                //   _tokensInstances = await loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.transferAbility,true,connectedAddress,targetAddress, true)
                //   chainTokensList.loadState = EChainTokensListLoadState.transferAbility

                // }

              } // if (targetAddress)
              else {

                console.info(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances chainTokensList.loadState=${chainTokensList.loadState} BUT TARGETADDRESS is NOT YET set, nothing to do`)
              }

            } // else

            // console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances BEFORE RETURN chainTokensList.tokensInstances`)
            return chainTokensList.tokensInstances;
          } // if (chainTokensList && chainTokensList.tokensInstances && chainTokensList.tokensInstances.length)
          else {
            console.warn(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances chainTokensList is NULL/UNDEF`)
          }
          // return undefined;
        } catch (error) {
          console.error(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances error: ${error}`);
        }

        finally {
          console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER RETURN chainTokensList.tokensInstances elapsed=${Date.now() - start}ms`)
        }

      } // getUpdatedChainTokensListTokensInstances
      

      // const getUpdatedTokensInstancesArray = async (_chainsTokensList:TChainsTokensListArrayNullUndef):Promise<TTokensInstances[] | undefined> => {
      // const getUpdatedTokensInstancesArray = async (_chainsTokensList:TChainsTokensListArrayNullUndef):Promise<TTokensInstances[]/*  | undefined */> => {
      //   let result:TTokensInstances[] = []
      //   try {
      //     console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray`)
      //     // For each chain tokens list, get/update its tokens instances
      //     const tokenInstancesPromises = _chainsTokensList?.map( (chainTokensList:TChainsTokensListNullUndef) => {
      //       // console.dir(chainTokensList)
      //       const updatedChainTokensListTokensInstances = /* AWAIT */ getUpdatedChainTokensListTokensInstances(chainTokensList)
      //       // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: getUpdatedChainTokensListTokensInstances t=`)
      //       // console.dir(t)
      //       // update
      //       // chainTokensList.tokensInstances = t
      //       return updatedChainTokensListTokensInstances
      //     })
      //     const tokenInstancesArrayUpdated = await Promise.all(tokenInstancesPromises  as Promise<TTokensInstances>[])
      //     result = tokenInstancesArrayUpdated; // RETURN
      //   } catch (error) {
      //     console.error(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray error: ${error}`);
      //   }
      //   // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray result=`)
      //   // console.dir(result)
      //   return result
      // } // getUpdatedTokensInstancesArray

      const getUpdatedTokensInstancesArray = async (_chainsTokensList:TChainsTokensListArrayNullUndef):Promise<TTokensInstances[]/*  | undefined */> => {
        let result:TTokensInstances[] = []
        try {
          // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray`)
          if (_chainsTokensList && _chainsTokensList.length) {

            const tokenInstances = _chainsTokensList.map( async(chainTokensList:TChainsTokensListNullUndef) => {
              // console.dir(chainTokensList)
              const updatedChainTokensListTokensInstances = await getUpdatedChainTokensListTokensInstances(chainTokensList)
              // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: getUpdatedChainTokensListTokensInstances t=`)
              // console.dir(t)
              // update
              // chainTokensList.tokensInstances = t
              updatedChainTokensListTokensInstances?.forEach( (tokenInstance:TTokenInstance) => {
                // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: getUpdatedChainTokensListTokensInstances t=`)
                // console.dir(tokenInstance)
                // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: getUpdatedChainTokensListTokensInstances t.userData=`)
                // console.dir(tokenInstance.userData)
                const selectable = (tokenInstance.userData
                  && (tokenInstance.userData[connectedAddress as any]?.balance || 0n > 0n)
                  && tokenInstance.userData[connectedAddress as any]?.canTransfer && tokenInstance.userData[connectedAddress as any]?.canTransfer) ? true : false ;
                tokenInstance.selectable = selectable;
                // If not selectable : reset selected and transferAmount
                if (!selectable && (tokenInstance.selected || (tokenInstance.transferAmount||0n>0n)) ) {
                  tokenInstance.transferAmount = 0n;
                  tokenInstance.selected = false;
                  tokenInstance.transferAmountLock = false;
                }
              })
              return updatedChainTokensListTokensInstances
            })

            // if (tokenInstances && tokenInstances.length) {
              // const tokenInstancesArrayUpdated = await Promise.all(tokenInstances  as Promise<TTokensInstances>[])
              // result = tokenInstancesArrayUpdated; // RETURN
              result = await Promise.all(tokenInstances  as Promise<TTokensInstances>[])
            // }
  
          } // if (_chainsTokensList && _chainsTokensList.length)
          // For each chain tokens list, get/update its tokens instances
        } catch (error) {
          console.error(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray error: ${error}`);
        }
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray result=`)
        // console.dir(result)
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray BEFORE RETURN`)
        return result
      } // getUpdatedTokensInstancesArray



      const updateChainTokensListTokensInstances = async (_chainsTokensList:TChainsTokensListArrayNullUndef):Promise<TChainsTokensListArrayNullUndef> => {
        // let chainsTokensListResult:TChainsTokensListArrayNullUndef // = [];
        try {
          // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances`)
          // chainsTokensListResult = _chainsTokensList;
          const updatedTokensInstancesArray = await getUpdatedTokensInstancesArray(_chainsTokensList)
          // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances: AFTER getUpdatedTokensInstancesArray`)
          // updatedTokensInstancesArray.then( (updatedTokensInstancesArray:TTokensInstances[]) => {
  
            if (updatedTokensInstancesArray && updatedTokensInstancesArray.length) {
              _chainsTokensList?.forEach( (_chainsTokensList:TChainsTokensListNullUndef, index) => {
                // Update each _chainsTokensList with updated tokensInstances
                if (_chainsTokensList && updatedTokensInstancesArray[index] ) {
                  // console.debug(`StepsContainer.tsx updateChainTokensListTokensInstances: updatedTokensInstancesArray[${index}]=`)
                  // console.dir(updatedTokensInstancesArray[index])
                  _chainsTokensList.tokensInstances = updatedTokensInstancesArray[index]
                }
              })
      
            } // if (_tokenInstancesArray)
            else {
              console.warn(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: updatedTokensInstancesArray.length <= 00`)
            }
          // }) // updatedTokensInstancesArray.then
  
        } catch (error) {
          console.error(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances error: ${error}`);
        }
        // return chainsTokensListResult;
        return _chainsTokensList
      } // updateChainTokensListTokensInstances

      // ---

      const start:number = Date.now()
      try {
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]`)
        const newSelectedChainsTokensList:TChainsTokensListArrayNullUndef = [];
        // const tokensInstances:TTokensInstances = [];
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: tokensLists=${tokensLists}`)
        const selectedTokenLists = getSelectedTokenLists(selectableTokensLists);
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: selectedTokenLists.length = ${selectedTokenLists?.length}, selectedTokenLists= `)
        // console.dir(selectedTokenLists)
        selectedTokenLists?.map( (selectedTokenList:TSelectableTokensList) => {
          // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: selectedTokenList=`)
          // console.dir(selectedTokenList)
          // Find selected tokensList in all tokensLists
          
          tokensLists?.forEach( (tokensList:TTokensList) => {
            // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: tokensList.id=${tokensList.id} (current) tokensList=`)
            // console.dir(tokensList)
            if (tokensList.id == selectedTokenList.tokensList.id) {
              // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: MATCH tokensList.id == selectedTokenList.tokensList.id  tokensList.id=${tokensList.id}`)
              const chainTokensList = getChainTokensList(tokensList, chainId) // TChainsTokensListNullUndef
              newSelectedChainsTokensList.push(chainTokensList)
            }
          }) // tokensLists?.forEach
          
        })
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: newSelectedChainsTokensList.length = ${newSelectedChainsTokensList?.length}, newSelectedChainsTokensList[]=`)
        // console.dir(newSelectedChainsTokensList)

        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: newSelectedChainsTokensList to TTokenChainDataArray`)
        if (newSelectedChainsTokensList.length > 0) {

          setLoadingDataState(true)
          // debugger;
          setErrorLoadingDataState(false)

          // let tokensCount = 0
          newSelectedChainsTokensList.forEach( (selected_chainTokensList:TChainsTokensListNullUndef) => {
            if (selected_chainTokensList) {
              // Assume chain tokens count <> chain tokens instances count means tokens instances are not initialized
              if (selected_chainTokensList.tokensCount != selected_chainTokensList.tokensInstances?.length) {
                // Init tokensInstances
                // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: (RE)INIT selected_chainTokensList.tokensInstances selected_chainTokensList.tokensCount=${selected_chainTokensList.tokensCount} selected_chainTokensList.tokensInstances?.length=${selected_chainTokensList.tokensInstances?.length}`)
                const selected_chainTokensList_tokensInstances:TTokensInstances = [];
                // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: selected_chainTokensList.chainId=${selected_chainTokensList.chainId} selected_chainTokensList.tokensCount=${selected_chainTokensList.tokensCount}`)
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
                console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: selected_chainTokensList.tokensInstances ALREADY INITIALIZED selected_chainTokensList.tokensCount=${selected_chainTokensList.tokensCount} selected_chainTokensList.tokensInstances?.length=${selected_chainTokensList.tokensInstances?.length}`)

              }
              // tokensInstances.push(...selected_chainTokensList.tokensInstances)
              
            } // if (selected_chainTokensList && selected_chainTokensList.tokensCount != selected_chainTokensList.tokensInstances?.length)

          }) // newSelectedChainsTokensList.forEach
          // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: newSelectedChainsTokensList.length=${newSelectedChainsTokensList.length} newSelectedChainsTokensList[]=`)
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

          // setisLoading(false)
          /*
          const updatedTokensInstancesArray = getUpdatedTokensInstancesArray(newSelectedChainsTokensList)
          updatedTokensInstancesArray.then( (updatedTokensInstancesArray:TTokensInstances[]) => {

            if (updatedTokensInstancesArray && updatedTokensInstancesArray.length) {
              newSelectedChainsTokensList.forEach( (newSelectedChainsTokensList:TChainsTokensListNullUndef, index) => {
                // Update each newSelectedChainsTokensList with updated tokensInstances
                if (newSelectedChainsTokensList && updatedTokensInstancesArray[index] ) {
                  // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: updatedTokensInstancesArray[${index}]=`)
                  // console.dir(updatedTokensInstancesArray[index])
                  newSelectedChainsTokensList.tokensInstances = updatedTokensInstancesArray[index]
                }
              })
      
            } // if (_tokenInstancesArray)
            else {
              console.warn(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: updatedTokensInstancesArray.length <= 00`)
            }
          }) // updatedTokensInstancesArray.then
          */
          updateChainTokensListTokensInstances(newSelectedChainsTokensList).then( (updatedChainsTokensList:TChainsTokensListArrayNullUndef) => {
            // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] AFTER updateChainTokensListTokensInstances.then`)
            // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: SET SelectedChainsTokensList`)
            setselectedChainsTokensList(updatedChainsTokensList)
            setLoadingDataState(false)
            // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances elapsed=${Date.now() - start}ms`)
            console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances elapsed=${Date.now() - start}ms`)
          }).catch( (error) => {
            console.error(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances error: ${error}`);
            setLoadingDataState(false)
            setErrorLoadingDataState(true)
          })

        } // if (newSelectedChainsTokensList.length > 0)
        // else {
        //   // settokensInstances(null)
        //   console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: newSelectedChainsTokensList.length <= 00`)
        // }
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: SET SelectedChainsTokensList`)
        // setselectedChainsTokensList(newSelectedChainsTokensList)
        // console.dir(newSelectedChainsTokensList)
      } catch (error) {
        console.error(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: error=${error}`)
      }
      finally {
        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances elapsed=${Date.now() - start}ms`)
        // setLoadingDataState(false)
      }
    },
    [ tokensLists, selectableTokensLists,
      // getUpdatedChainTokensListTokensInstances,
      chainId, targetAddress, connectedAddress,
      getSelectedTokenLists, initTokenInstance, loadTokensOnChainData,
      setLoadingDataState, setErrorLoadingDataState
    ]
  ) // useEffect

  // ---

  /**
   * useEffect: update tokens instances
   * triggered by selectedChainsTokensList update
   */

  useEffect( () =>
    {
      // console.debug(`StepsContainer.tsx useEffect [SELECTEDCHAINSTOKENSLIST]`)
      // console.debug(`StepsContainer.tsx useEffect [SELECTEDCHAINSTOKENSLIST] = selectedChainsTokensList[]=`)
      // console.dir(selectedChainsTokensList)

      const tokensInstancesFromSelectedTokensLists: TTokensInstances = []
      if (selectedChainsTokensList && selectedChainsTokensList.length) {
        selectedChainsTokensList.forEach( (selectedChainsTokensList:TChainsTokensListNullUndef) => {
        
          if (selectedChainsTokensList && selectedChainsTokensList.tokensInstances && selectedChainsTokensList.tokensInstances.length) {
            tokensInstancesFromSelectedTokensLists.push(...selectedChainsTokensList.tokensInstances)
          }
          })

        settokensInstances(tokensInstancesFromSelectedTokensLists)
        // console.debug(`StepsContainer.tsx useEffect [SELECTED CHAINSTOKENSLIST] = tokensInstancesFromSelectedTokensLists[]=`)
        // console.dir(tokensInstancesFromSelectedTokensLists)
      }
    
    },
    [selectedChainsTokensList]
  ) // useEffect [selectedChainsTokensList]

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

      { 
        step === 0 &&
        <div className="w-full" >
                
          <MainContentContainer>
              <Step0
                // selectableTokensLists={selectableTokensLists}
                tokensLists={tokensLists}
                // chainId={chainId}
                // changeTokensListCheckboxStatus={changeTokensListCheckboxStatus}
                // setpreviousDisabled={setpreviousDisabled}
                setNextDisabled={setNextDisabled}
                // tokenChainDataArray={selectedTokensChainDataArray}
                // setSelectedTokensChainDataArray={setSelectedTokensChainDataArray}
                selectableTokensLists={selectableTokensLists}
                setselectableTokensLists={setselectableTokensLists}
                // setShowProgressBar={setShowProgressBar}
                accountAddress={connectedAddress}
                targetAddress={targetAddress}
                tokensInstances={tokensInstances}
                chainId={chainId}
                isLoading={isLoading} isError={isError}
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
                // setShowProgressBar={setShowProgressBar}
                isLoading={isLoading} isError={isError}
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
                // setShowProgressBar={setShowProgressBar}
                // setProgressBarPercentage={setProgressBarPercentage}
                accountAddress={connectedAddress}
                // chainId={chainId}
                targetAddress={targetAddress}
                isError={isError}
                tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
                />
          </MainContentContainer>
        </div>
      }

      { step === 3 &&
        <div className="w-full" >
          <MainContentContainer>
            <Step3
              // setShowProgressBar={setShowProgressBar}
              // setProgressBarPercentage={setProgressBarPercentage}
            />
          </MainContentContainer>
        </div>
      }

    </>
  );
}

// ------------------------------

export default StepsContainer;