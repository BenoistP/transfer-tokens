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
  setShowProgressBar, setProgressBarPercentage,
 } :IStepsContainerProps ) => {

  // console.debug(`StepsContainer.tsx render`)


// ------------------------------

  const { address: connectedAddress, /* status, isConnected ,  isConnecting,  isDisconnected*/ } = useAccount()
  const { moveTokensAppData: { step = -1 } } = useMoveTokensAppContext()

  const [selectableTokensLists, setselectableTokensLists] = useState<TSelectableTokensLists>(null)

  const [selectedChainsTokensList, setselectedChainsTokensList] = useState<TChainsTokensListArrayNullUndef>(null)
  const [tokensInstances, settokensInstances] = useState<TTokensInstances>(null)

  const [targetAddress, settargetAddress] = useState<TAddressEmpty>("")

  // const [isLoading, setisLoading] = useState<boolean>(false)
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
              if (tokensInstance.userData[/*accountAddress*/ connectedAddress as any]) {
                return (
                  (tokensInstance.userData[/*accountAddress*/ connectedAddress as any].selected ? true : false)
                )
              }
              return true; // not user data : skip and RETURN TRUE
            }
            return true; // not selectable : skip and RETURN TRUE
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
              if (  tokensInstance.selectable && /*accountAddress*/ connectedAddress && typeof /*accountAddress*/ connectedAddress === "string" && tokensInstance.userData &&
                  tokensInstance.userData[/*accountAddress*/ connectedAddress as any].canTransfer && (tokensInstance.userData[/*accountAddress*/ connectedAddress as any].balance||0)>0)
              {
                // if (tokensInstance.userData[/*accountAddress*/ connectedAddress as any].transferAmount>0) {
                  // if (tokensInstance.userData[/*accountAddress*/ connectedAddress as any]) {
                    tokensInstance.userData[/*accountAddress*/ connectedAddress as any].selected = newCheckAll;
                  // }
                // }
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
      [tokensInstances, /*accountAddress*/ connectedAddress, selectAll]
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
                  if (tokensInstance.userData[/*accountAddress*/ connectedAddress as any]) {
                    // if (tokensInstance.userData[/*accountAddress*/ connectedAddress as any].transferAmount>0) {
                      tokensInstance.userData[/*accountAddress*/ connectedAddress as any].selected = ! tokensInstance.userData[/*accountAddress*/ connectedAddress as any].selected;
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
      [tokensInstances, invertAll, updateCheckAll, connectedAddress]
  ); // handleInvertAllChecks

  // ---

  const changeCheckboxStatus:IChangeCheckboxStatus = /* useCallback( */
    (id: string) =>
      {
        try {
          
          console.info(`changeCheckboxStatus id=${id} `);
          const tokensInstancesUpdated = tokensInstances?.map((tokenInstance) => {
            if (tokenInstance.chainId+"-"+tokenInstance.address === id) {
              // console.debug(`changeCheckboxStatus id=${id} tokenInstance.chainId+"-"+tokenInstance.address=${tokenInstance.chainId+"-"+tokenInstance.address} tokenInstance.userData[/*accountAddress*/ connectedAddress as any]?.selected=${tokenInstance.userData[/*accountAddress*/ connectedAddress as any]?.selected} `);
              if (/*accountAddress*/ connectedAddress && typeof /*accountAddress*/ connectedAddress === "string" && tokenInstance.userData && tokenInstance.userData[/*accountAddress*/ connectedAddress as any]) {
                tokenInstance.userData[/*accountAddress*/ connectedAddress as any].selected = !tokenInstance.userData[/*accountAddress*/ connectedAddress as any].selected;
              } // if (accountAddress && ...
            } // if (tokenInstance.chainId+"-"+tokenInstance.address === id)
            return {
              ...tokenInstance,
            } as TTokenInstance;
          })
          settokensInstances(tokensInstancesUpdated);
          updateCheckAll(tokensInstancesUpdated);
        } catch (error) {
          console.error(`StepsContainer.tsx changeCheckboxStatus error: ${error}`);
        }
      }
      /* ,
      []
  );  */
  // changeCheckboxStatus

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
    selectHandlers: {
      handleCheckSelectAll,
      handleInvertAllChecks,
      changeCheckboxStatus,
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

  const hasSomeTokenListSelected = useCallback( ():boolean =>
    {
      try {
        console.debug(`StepsContainer.tsx hasSomeTokenListSelected selectableTokensLists?.length=${selectableTokensLists?.length} chainId=${chainId}`)
        // console.debug(`StepsContainer.tsx hasSomeTokenListSelected selectableTokensLists=`)
        // console.dir(selectableTokensLists)
        if (!selectableTokensLists||!selectableTokensLists.length) return false
        return selectableTokensLists?.some( (selectableTokensList:TSelectableTokensList) => {
        // console.debug(`StepsContainer.tsx hasSomeTokenListSelected selectableTokensList=${selectableTokensList}`)
          console.debug(`StepsContainer.tsx hasSomeTokenListSelected selectableTokensList.selected = ${selectableTokensList.selected} selectableTokensList.chainId == ${selectableTokensList.chainId} chainId=${chainId} selectableTokensList.selected && selectableTokensList.chainId == chainId = ${selectableTokensList.selected && selectableTokensList.chainId == chainId}`)
          return (selectableTokensList.selected && selectableTokensList.chainId == chainId)
          // return (true)
        })
        // return res
        // console.debug(`StepsContainer.tsx hasSomeTokenListSelected hasSelected=${hasSelected}`)
      } catch (error) {
        console.error(`StepsContainer.tsx hasSomeTokenListSelected error: ${error}`);
      }
      return false
    },
    [chainId, selectableTokensLists]
  ) // hasSomeTokenListSelected


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
        console.debug(`StepsContainer.tsx getSelectedTokenLists selectedTokensLists?.length = ${selectedTokensLists?.length} `)
        console.dir(selectedTokensLists)
        return selectedTokensLists;
      } catch (error) {
        console.error(`StepsContainer.tsx getSelectedTokenLists error: ${error}`);
        return null;
      }
    },
    [chainId]
  ) // getSelectedTokenLists

  // (selectableTokensList.selected && selectableTokensList.chainId == chainId)

  // ------------------------------

  // Tokens Data init & loading

  const initTokenInstance = useCallback( (_token:TTokenChainData, _displayId:TDisplayId ): TTokenInstance|TNullUndef =>
    {
      if (_token?.address) {
        const tokenInstanceUserDataArray:TTokenInstanceUserData[] = new Array<TTokenInstanceUserData>()
        // console.debug(`StepsContainer.tsx getTokensInstancesFromSelectedTokensLists: typeof connectedAddress=${typeof connectedAddress}`)
        if (connectedAddress && typeof connectedAddress == 'string') {
          // const connectedAddressLC:any = connectedAddress.toLowerCase()
          tokenInstanceUserDataArray[connectedAddress as any] = ({
            selected: false,
            balance: null,
            transferAmount: 0n,
            canTransfer: false,
          } as TTokenInstanceUserData)
          }
        return {
        // tokensInstances.push({
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
          selectable: false,
          userData: tokenInstanceUserDataArray,
        } // as TTokenInstance
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

  // ------------------------------


  const loadTokensContracts = useCallback( async(tokensInstances:TTokensInstances/* TTokenChainDataArray */):Promise<TTokensInstances> =>
    {
      try {
        console.debug(`StepsContainer.tsx loadTokensContracts tokensInstances?.length=${tokensInstances?.length}`)
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
  //  finally {
  //    console.debug(`StepsContainer.tsx getMaxBatchSize MAXBATCHSIZE: ${MAXBATCHSIZE}`);
  //  }
  }

  const MAXBATCHSIZE:number = useMemo( () =>
    {
      return getMaxBatchSize(PUBLIC_MULTICALL_MAX_BATCH_SIZE_DEFAULT)
    },
    []
  )

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

       // console.debug(`StepsContainer.tsx fetchOnChainData setisError(false)`);
       setisError(false)
     } // try
     catch (error) {
       console.error(`StepsContainer.tsx fetchOnChainData error: ${error}`);
       // setisLoading(false)
       // console.debug(`StepsContainer.tsx fetchOnChainData setisError(TRUE)`);
       setisError(true)
     } // catch (error)
     // console.debug(`StepsContainer.tsx fetchOnChainData result.length: ${multicallAllBatchesResult.length}`);
     // console.dir(multicallAllBatchesResult);
     return multicallAllBatchesResult;
    }
    ,
    [MAXBATCHSIZE]
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

  const loadTokensOnChainData = useCallback( async(_tokensInstances: TTokensInstances  /* TTokenInstance[] */ /* tokens:TTokenChainDataArray */
  , step:number, _showProgressBar:boolean, _from:TAddressEmptyNullUndef, _to:TAddressEmptyNullUndef, resultOnly:boolean ):Promise<TTokensInstances> =>
    {
      try {
        // console.debug(`StepsContainer.tsx loadTokensOnChainData ProgressBar _tokensInstances?.length=${_tokensInstances?.length}}, step=${step}`)
        let tokensInstancesUpdated:TTokensInstances;
        // const baseProgress = 11
        // const loadTokensOnChainDataProgress = 89 - 3
        // const steps = 4
        // let progressStep=(loadTokensOnChainDataProgress/(_tokensInstances?_tokensInstances.length:1))/steps
        // let progressStep=loadTokensOnChainDataProgress/steps
        let progress = 0

        if (_tokensInstances && _tokensInstances.length > 0) {
          let multicallArray: any[] = [];

          switch (step) {

            // Step 0: get tokens contracts
            case EStepsLoadTokensData.contracts:
              console.debug(`StepsContainer.tsx loadTokensOnChainData Step EStepsLoadTokensData.contracts: GET TOKENS CONTRACTS`)
              // console.debug(`StepsContainer.tsx loadTokensOnChainData Step 0: GET TOKENS CONTRACTS _tokensInstances.length=${_tokensInstances.length} _tokensInstances=`)
              // console.dir(_tokensInstances)
              tokensInstancesUpdated = await loadTokensContracts(_tokensInstances)
              progress = 11
              break;

            // Step 1: get tokens source user balances
            case EStepsLoadTokensData.sourceBalances:
              console.debug(`StepsContainer.tsx loadTokensOnChainData Step EStepsLoadTokensData.sourceBalances: GET USER TOKENS BALANCES`)
              // console.debug(`StepsContainer.tsx loadTokensOnChainData Step 0: GET USER TOKENS BALANCES _tokensInstances.length=${_tokensInstances.length} _tokensInstances=`)
              // console.dir(_tokensInstances)
              // const balancesSourceMulticallArray = _tokensInstances.map( async (token) => {
              multicallArray = _tokensInstances.map( async (token) => {
                if (token?.contract) {
                  return {
                    ...token.contract,
                    functionName: 'balanceOf',
                    args: [_from],
                  }
                }
                return null;
              });
              // multicallArray = balancesSourceMulticallArray;
              progress = 33
              break;

            // Step 2: get token decimals
            case EStepsLoadTokensData.decimals:
              console.debug(`StepsContainer.tsx loadTokensOnChainData Step EStepsLoadTokensData.decimals: GET TOKENS DECIMALS`)
              // const decimalsMulticallArray = _tokensInstances.map( async (token) => {
                multicallArray = _tokensInstances.map( async (token) => {
                if (token?.contract) {
                  return {
                    ...token.contract,
                    functionName: 'decimals',
                  }
                }
                return null;
              });
              // multicallArray = decimalsMulticallArray;
              progress = 55
              break;

            // Step 3: get token name
            case EStepsLoadTokensData.names:
              console.debug(`StepsContainer.tsx loadTokensOnChainData Step EStepsLoadTokensData.names: GET TOKENS NAMES`)
              // const nameMulticallArray = _tokensInstances.map( async (token) => {
              multicallArray = _tokensInstances.map( async (token) => {
                if (token?.contract) {
                  return {
                    ...token.contract,
                    functionName: 'name',
                  }
                }
                return null;
              });
              // multicallArray = nameMulticallArray;
              progress = 77
              break;

            // Step 4: get token symbol
            case EStepsLoadTokensData.symbols:
              console.debug(`StepsContainer.tsx loadTokensOnChainData Step EStepsLoadTokensData.symbols: GET TOKENS SYMBOLS`)
              // const symbolMulticallArray = _tokensInstances.map( async (token) => {
              multicallArray = _tokensInstances.map( async (token) => {
                if (token?.contract) {
                  return {
                    ...token.contract,
                    functionName: 'symbol',
                  }
                }
                return null;
              });
              // multicallArray = symbolMulticallArray;
              progress = 90
              break;


            // Step 5: get tokens target user balances
            case EStepsLoadTokensData.targetBalances:
              console.debug(`StepsContainer.tsx loadTokensOnChainData Step EStepsLoadTokensData.targetBalances: GET TARGET USER TOKENS BALANCES`)
              // const balancesTargetMulticallArray = _tokensInstances.map( async (token) => {
              multicallArray = _tokensInstances.map( async (token) => {
                if (token?.contract) {
                  return {
                    ...token.contract,
                    functionName: 'balanceOf',
                    // args: [connectedAddress],
                    args: [_to],
                  }
                }
                return null;
              });
              // multicallArray = balancesTargetMulticallArray;
              progress = 50
              break;

            // Step 6: get canTransfer token from address to address
            case EStepsLoadTokensData.transferAbility:
              console.debug(`StepsContainer.tsx loadTokensOnChainData Step EStepsLoadTokensData.transferAbility: GET TOKENS TRANSFER ABILITY`)
              // const canTransferMulticallArray = _tokensInstances.map( async (token) => {
              multicallArray = _tokensInstances.map( async (token) => {

                if (token?.contract) {
                  if (token?.type == "COINBRIDGE" as TTokenType) { // TEST
                  // if (token?.type == "ERC20" as TTokenType) {
                    // const amount = token.userData && token.userData[connectedAddress as any]?.balance || 1
                    const amount = token.userData && token.userData[_from as any]?.balance || 1
                    // console.debug(`StepsContainer.tsx loadTokensOnChainData StepsContainer canTransfer from=${connectedAddress} to=${targetAddress} amount=${amount}`)
                    return {
                      ...token.contract,
                      functionName: 'canTransfer',
                      // query: From address, To address , Amount uint256 ;  response: bool, uint256, uint256
                      // args: [connectedAddress, targetAddress, amount],
                      args: [_from, _to, amount],
                      // functionName: 'transfer',
                      // // To, Amount
                      // args: [targetAddress, amount],
                      // functionName: 'transferFrom',
                      // // To, Amount
                      // args: [connectedAddress, targetAddress, amount],
                    }
                  }
                  // don't call contract, just provide return value
                    return {
                        value: [true],
                      }
                } // if (token?.contract)
                return null;
              });
              // multicallArray = canTransferMulticallArray;
              progress = 100
              break;

            // Step 7: Watch transfers : TODO

          }

          // Step 0: Load contracts
          // Steps 1..7: Load onchain data

          if (step > 0) {
            // Multicall
            const multicallData = await Promise.all(multicallArray);
           console.debug(`StepsContainer.tsx loadTokensOnChainData multicallData.length=${multicallData.length} multicallData=`) 
            console.dir(multicallData);
            // const onchainData = await fetchOnChainData(multicallData);
            const onchainData = await fetchOnChainDataWrapper(multicallData);

            // if (step == EStepsLoadTokensData.sourceBalances) {
            //   console.debug(`StepsContainer.tsx loadTokensOnChainData ProgressBar sourceBalances from=${connectedAddress} to=${targetAddress} onchainData.length=${onchainData?.length}`)
            //   console.dir(onchainData)
            // }
  
            // const tokensListLength = _tokensInstances.length
            if (onchainData?.length > 0) {
              const tokensInstancesWithOnchainData = _tokensInstances.map( async (tokenInstance, index) => {
                // Step 1: get tokens source user balances
                if (step == EStepsLoadTokensData.sourceBalances) {
                  // tokens balances
                  // let tokenInstanceUserDataArray:TTokenInstanceUserData[] = new Array<TTokenInstanceUserData>()
                  let tokenInstanceUserDataArray:TTokenInstanceUserData[] = tokenInstance.userData;
                  if (!tokenInstanceUserDataArray) {
                    tokenInstanceUserDataArray = new Array<TTokenInstanceUserData>()
                  }
                  const userBalance = onchainData[index]?.result; // Token User balance
                  if (_from && typeof _from == 'string') {
                    tokenInstanceUserDataArray[_from as any] = ({
                      // selected: false,
                      balance: userBalance,
                      transferAmount: userBalance,
                      // canTransfer: false,
                    } as TTokenInstanceUserData)
                  } // if (_from && typeof _from == 'string')
                  if (resultOnly) {
                    return {
                      userData: tokenInstanceUserDataArray,
                    };
                  }
                  return {
                    ...tokenInstance,
                    status: step,
                    // displayed: true,
                    // selectable: false,
                    userData: tokenInstanceUserDataArray,
                  } as TTokenInstance;
                }
                // Step 2: get token decimals
                if (step == EStepsLoadTokensData.decimals) {
                  // decimals
                  if (resultOnly) {
                    return {
                      decimals: onchainData[index]?.result, // Token decimals
                    };
                  }
                  return {
                    ...tokenInstance,
                    decimals: onchainData[index]?.result, // Token decimals
                    status: step,
                  } as TTokenInstance;
                }
                // Step 3: get token name
                if (step == EStepsLoadTokensData.names) {
                  // name
                  if (resultOnly) {
                    return {
                      name: onchainData[index]?.result, // Token name
                    };
                  }
                  return {
                    ...tokenInstance,
                    name: onchainData[index]?.result, // Token name
                    status: step,
                  } as TTokenInstance;
                }
                // Step 4: get token symbol
                if (step == EStepsLoadTokensData.symbols) {
                  // symbol
                  if (resultOnly) {
                    return {
                      symbol: onchainData[index]?.result, // Token symbol
                    };
                  }
                  return {
                    ...tokenInstance,
                    symbol: onchainData[index]?.result, // Token symbol
                    status: step,
                  } as TTokenInstance;
                }
                // Step 5: get tokens target user balances
                if (step == EStepsLoadTokensData.targetBalances) {
                  // tokens balances
                  // let tokenInstanceUserDataArray = tokenInstance.userData;
                  let tokenInstanceUserDataArray:TTokenInstanceUserData[] = tokenInstance.userData;
                  if (!tokenInstanceUserDataArray) {
                    tokenInstanceUserDataArray = new Array<TTokenInstanceUserData>()
                  }
                  if (_to && typeof _to == 'string') {
                    // tokenInstanceUserDataArray[toAddressLC] = ({
                    tokenInstanceUserDataArray[_to as any] = ({
                      selected: false,
                      balance: onchainData[index]?.result, // Token User balance
                      transferAmount: 0n,
                      canTransfer: false,
                    } as TTokenInstanceUserData)

                  } // if (_to && typeof _to == 'string')
                  if (resultOnly) {
                    return {
                      userData: tokenInstanceUserDataArray,
                    };
                  }
                  return {
                    ...tokenInstance,
                    status: step,
                    // displayed: true,
                    // selectable: false,
                    userData: tokenInstanceUserDataArray,
                  } as TTokenInstance;
                }
                // Step 6: get canTransfer token from address to address
                if (step == EStepsLoadTokensData.transferAbility) {
                  // can transfer from to
                  // console.debug(`StepsContainer.tsx loadTokensOnChainData ProgressBar canTransfer from=${connectedAddress} to=${targetAddress} result=${onchainData[index]?.result}`)
                  // const tokenInstanceUserDataArray:TTokenInstanceUserData[] = tokenInstance.userData;
                  // let tokenInstanceUserDataArray = tokenInstance.userData;
                  let tokenInstanceUserDataArray:TTokenInstanceUserData[] = tokenInstance.userData;
                  if (!tokenInstanceUserDataArray) {
                    tokenInstanceUserDataArray = new Array<TTokenInstanceUserData>()
                  }
                  // console.debug(`StepsContainer.tsx loadTokensOnChainData StepsContainer canTransfer from=${_from} to=${_to} result=${onchainData[index]?.result}`)
                  // console.dir(onchainData[index]?.result)
                  const canTransfer = (onchainData[index] && onchainData[index]?.result && onchainData[index]?.result[0] ? true : false) ; // can transfer from to
                  let {selectable} = tokenInstance
                  tokenInstanceUserDataArray[_from as any] = ({
                      ...tokenInstance.userData[_from as any],
                      // result: bool, uint256, uint256
                      canTransfer,
                      // transferAmount: 0n,
                    } as TTokenInstanceUserData)

                  if (_from && typeof _from == 'string') {
                    if (tokenInstanceUserDataArray[_from as any]) {
                      selectable = ( (tokenInstanceUserDataArray[_from as any].balance || 0n) > 0n
                        && canTransfer)
                    }
                  }
                  // console.info(`StepsContainer.tsx loadTokensOnChainData StepsContainer canTransfer=${canTransfer} from=${_from} to=${_to} result=${onchainData[index]?.result} selectable=${selectable} `)
                  // if (_to && typeof _to == 'string') {
                  //   // tokenInstanceUserDataArray[_from as any] = ({
                  //   tokenInstanceUserDataArray[_to as any] = ({
                  //     ...tokenInstance.userData[_to as any],
                  //     canTransfer: onchainData[index]?.result, // can transfer from to
                  //   } as TTokenInstanceUserData)
                  // } // if (_to && typeof _to == 'string')
                  if (resultOnly) {
                    return {
                      userData: tokenInstanceUserDataArray,
                    };
                  }
                  return {
                    ...tokenInstance,
                    selectable,
                    userData: tokenInstanceUserDataArray,
                    status: step,
                  } as TTokenInstance;
                }

                console.error(`StepsContainer.tsx loadTokensOnChainData error: step=${step} not found`)
                return tokenInstance;

              }); // map
  
              const allPromiseResolved = await Promise.all(tokensInstancesWithOnchainData);
              // setProgressBarPercentage(100)
              // console.debug(`loadTokensOnChainData connectedAddress:${connectedAddress} allPromiseResolved.length: ${allPromiseResolved.length}`);
              // console.dir(allPromiseResolved);
              tokensInstancesUpdated = allPromiseResolved as TTokensInstances; // FORCE type for resultOnly results
              // settokensInstances(allPromiseResolved);
  
            } // if (onchainData?.length > 0
          } // if (step > 0)
          
          // console.debug(`StepsContainer.tsx loadTokensOnChainData ProgressBar progress=${progress}`)
          if (_showProgressBar) {
            setProgressBarPercentage(progress)
          }

          console.debug(`StepsContainer.tsx loadTokensOnChainData BEFORE RETURN tokensInstancesUpdated=`)  
          console.dir(tokensInstancesUpdated)
          return tokensInstancesUpdated

        } // if (tokens?.length > 0)

      } // try
      catch (error) {
        console.error(`loadTokensOnChainData error: ${error}`);
      } // catch (error)
    },
    [
      // /* tokens, */ chainId, /* fetchOnChainData */ fetchOnChainDataWrapper, connectedAddress, targetAddress
      // EStepsLoadTokensData.contracts, EStepsLoadTokensData.sourceBalances, EStepsLoadTokensData.decimals,
      // EStepsLoadTokensData.names, EStepsLoadTokensData.symbols, EStepsLoadTokensData.targetBalances, EStepsLoadTokensData.transferAbility,
      loadTokensContracts, fetchOnChainDataWrapper, setProgressBarPercentage
      // connectedAddress,
      // targetAddress,
    ]
  ); // loadTokensOnChainData

  // ----------------------------------------------

  // USE EFFECTS

  useEffect( () =>
  {

    /**
     * 
     * @param chainTokensList
     * on chain data loading must be done in order
     * @returns Promise<TTokensInstances>
     */

    const getUpdatedChainTokensListTokensInstances = async( chainTokensList:TChainsTokensListNullUndef ) : Promise<TTokensInstances> =>
    {
      try {
        
        console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances chainTokensList.chainId=${chainTokensList?.chainId} chainTokensList.tokensCount=${chainTokensList?.tokensCount} chainTokensList.tokensInstances?.length=${chainTokensList?.tokensInstances?.length}`)
        
        let _tokensInstances:TTokensInstances;
        if (chainTokensList && chainTokensList.tokensInstances && chainTokensList.tokensInstances.length) {
          // let tmp: TTokensInstances = []
          _tokensInstances = chainTokensList.tokensInstances;
          console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances _tokensInstances =`)
          console.dir(_tokensInstances)

          if (chainTokensList.loadState == EChainTokensListLoadState.notLoaded) {
            console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EStepsLoadTokensData == NOTLOADED`)
            // Load contracts
            _tokensInstances = await loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.contracts,true,null,"", true)
            chainTokensList.loadState = EChainTokensListLoadState.contracts
            console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EStepsLoadTokensData.contracts _tokensInstances =`)
            console.dir(_tokensInstances)
          }

          if (chainTokensList.loadState == EChainTokensListLoadState.contracts) {

            console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState.CONTRACTS`)
            // Load everything else : sourceBalances, decimals, names, symbols
            // tokens names
            const names = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.names,true,null,"", true)
            // tokens connected user (source) balances
            const sourceBalances = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.sourceBalances,true,connectedAddress,"", true)
            // tokens decimals
            const decimals = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.decimals,true,null,"", true)
            // tokens symbols
            const symbols = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.symbols,true,null,"", true)

            // If targetAddress is set, Load Additionnal data: targetBalances, transferAbility
            // tokens target user balances
            const targetBalances = targetAddress ? loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetBalances,true,"", targetAddress, true) : null ;
            // tokens transfer ability
            const canTransfer = targetAddress ? loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.transferAbility,true,connectedAddress,targetAddress, true) : null ;

            // Wait for all promises to resolve
            const loadTokensOnChainDataPromises = targetAddress ? await Promise.all([names, sourceBalances, decimals, symbols, targetBalances, canTransfer]) : await Promise.all([names, sourceBalances, decimals, symbols]) ;

            // Merge loadTokensOnChainDataPromises results
            const tokensInstancesAllData = _tokensInstances?.map( (_tokenInstance:TTokenInstance, index:number) => {
              if (loadTokensOnChainDataPromises && loadTokensOnChainDataPromises[0] && loadTokensOnChainDataPromises[1] && loadTokensOnChainDataPromises[2] && loadTokensOnChainDataPromises[3] ) {
                _tokenInstance.name = loadTokensOnChainDataPromises[0][index].name // tokens names
                _tokenInstance.userData = loadTokensOnChainDataPromises[1][index].userData // user balances
                _tokenInstance.decimals = loadTokensOnChainDataPromises[2][index].decimals // tokens decimals
                _tokenInstance.symbol = loadTokensOnChainDataPromises[3][index].symbol // tokens symbols
                if (loadTokensOnChainDataPromises[4] && loadTokensOnChainDataPromises[5]) {
                  _tokenInstance.userData = {
                    ..._tokenInstance.userData,
                    ...loadTokensOnChainDataPromises[4][index].userData, // target balances
                    ...loadTokensOnChainDataPromises[5][index].userData, // can transfer
                  }
                }
              }
              return _tokenInstance;
            })

            console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER MERGE promises (names, user balances, decimals, symbols, [target balances, cantransfer]) tokensInstancesAllData =`)
            console.dir(tokensInstancesAllData)

            // update chainTokensList
            chainTokensList.tokensInstances = tokensInstancesAllData;
            if (!targetAddress) {
              console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances (names, user balances, decimals, symbols) targetAddress is NOT SET`)
              // Everything up to symbols included is loaded
              chainTokensList.loadState = EChainTokensListLoadState.symbols
            } else {
              // Everything up to transferAbility included is loaded
              console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances (names, user balances, decimals, symbols, target balances, cantransfer) targetAddress IS SET`)
              
              chainTokensList.loadState = EChainTokensListLoadState.transferAbility
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

            if (targetAddress) {

              console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState. <> CONTRACTS targetAddress is set`)

              // Load State : Symbol = load targetBalances, transferAbility
              if (chainTokensList.loadState == EChainTokensListLoadState.symbols) {
                console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState == SYMBOLS targetAddress is set`)
                // Load target balances
                // tokens target user balances
                const targetBalances = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetBalances,true,"", targetAddress, true);
                // tokens transfer ability
                const canTransfer = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.transferAbility,true,connectedAddress,targetAddress, true);

                // Wait for all promises to resolve
                const loadTokensOnChainDataPromises = await Promise.all([targetBalances, canTransfer]);

                // Merge loadTokensOnChainDataPromises results
                const tokensInstancesAllData = _tokensInstances?.map( (_tokenInstance:TTokenInstance, index:number) => {
                  if (loadTokensOnChainDataPromises && loadTokensOnChainDataPromises[0] && loadTokensOnChainDataPromises[1] ) {
                    _tokenInstance.userData = {
                      ..._tokenInstance.userData,
                      ...loadTokensOnChainDataPromises[0][index].userData, // target balances
                      ...loadTokensOnChainDataPromises[1][index].userData, // can transfer
                    }
                  }
                  return _tokenInstance;
                })

                console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER MERGE promises (target balances, cantransfer) tokensInstancesAllData =`)
                console.dir(tokensInstancesAllData)
  
                // update chainTokensList
                chainTokensList.tokensInstances = tokensInstancesAllData;
                // Everything up to transferAbility included is loaded
                chainTokensList.loadState = EChainTokensListLoadState.transferAbility
                
              } // if (chainTokensList.loadState == EChainTokensListLoadState.symbols)
              else {
                console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState <> SYMBOLS targetAddress is set`)
                // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                // TODO: CHECK IF TARGETADDRESS IS THE RIGHT ONE
                console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances chainTokensList.loadState=${chainTokensList.loadState} TARGETADDRESS is set, NOTHING TO DO`)
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

          return chainTokensList.tokensInstances;
        } // if (chainTokensList && chainTokensList.tokensInstances && chainTokensList.tokensInstances.length)
        else {
          console.warn(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances chainTokensList is NULL/UNDEF`)
        }
        // return undefined;
      } catch (error) {
        console.error(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances error: ${error}`);
      }
  
    } // getUpdatedChainTokensListTokensInstances
    

    // const getUpdatedTokensInstancesArray = async (_chainsTokensList:TChainsTokensListArrayNullUndef):Promise<TTokensInstances[] | undefined> => {
    const getUpdatedTokensInstancesArray = async (_chainsTokensList:TChainsTokensListArrayNullUndef):Promise<TTokensInstances[]/*  | undefined */> => {
      let result:TTokensInstances[] = []
      try {
        console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS] getUpdatedTokensInstancesArray`)

        // For each chain tokens list, get/update its tokens instances
        const tokenInstancesPromises = _chainsTokensList?.map( (chainTokensList:TChainsTokensListNullUndef) => {
          // console.dir(chainTokensList)
          const t = getUpdatedChainTokensListTokensInstances(chainTokensList)
          console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS] getUpdatedTokensInstancesArray: getUpdatedChainTokensListTokensInstances t=`)
          console.dir(t)
          // update
          // chainTokensList.tokensInstances = t
          return t
        })

        const tokenInstancesArrayUpdated = await Promise.all(tokenInstancesPromises  as Promise<TTokensInstances>[])

        // return tokenInstancesArrayUpdated;
        result = tokenInstancesArrayUpdated;


      } catch (error) {
        console.error(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS] getUpdatedTokensInstancesArray error: ${error}`);
      }

      console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS] getUpdatedTokensInstancesArray result=`)
      console.dir(result)
      return result
      
    } // getUpdatedTokensInstancesArray


    try {
      // setisLoading(true)
      console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]`)


      const newSelectedChainsTokensList:TChainsTokensListArrayNullUndef = [];
      // const tokensInstances:TTokensInstances = [];

      // console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: tokensLists=${tokensLists}`)

      const selectedTokenLists = getSelectedTokenLists(selectableTokensLists);
      console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: selectedTokenLists.length = ${selectedTokenLists?.length}, selectedTokenLists= `)
      console.dir(selectedTokenLists)
      selectedTokenLists?.map( (selectedTokenList:TSelectableTokensList) => {
        console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: selectedTokenList=`)
        console.dir(selectedTokenList)
        // Find selected tokensList in all tokensLists
        
        tokensLists?.forEach( (tokensList:TTokensList) => {
          console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: tokensList.id=${tokensList.id} (current) tokensList=`)
          console.dir(tokensList)
          if (tokensList.id == selectedTokenList.tokensList.id) {
            console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: MATCH tokensList.id == selectedTokenList.tokensList.id  tokensList.id=${tokensList.id}`)
            const chainTokensList = getChainTokensList(tokensList, chainId) // TChainsTokensListNullUndef
            newSelectedChainsTokensList.push(chainTokensList)
          }
        }) // tokensLists?.forEach
        
      })
      console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: newSelectedChainsTokensList.length = ${newSelectedChainsTokensList?.length}, newSelectedChainsTokensList[]=`)
      console.dir(newSelectedChainsTokensList)

      // console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: newSelectedChainsTokensList to TTokenChainDataArray`)
      if (newSelectedChainsTokensList.length > 0) {
        // let tokensCount = 0
        newSelectedChainsTokensList.forEach( (selected_chainTokensList:TChainsTokensListNullUndef) => {
          if (selected_chainTokensList) {
            
            if (selected_chainTokensList.tokensCount != selected_chainTokensList.tokensInstances?.length) {
              // Init tokensInstances
              console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: (RE)INIT selected_chainTokensList.tokensInstances selected_chainTokensList.tokensCount=${selected_chainTokensList.tokensCount} selected_chainTokensList.tokensInstances?.length=${selected_chainTokensList.tokensInstances?.length}`)
              const selected_chainTokensList_tokensInstances:TTokensInstances = [];
              // console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: selected_chainTokensList.chainId=${selected_chainTokensList.chainId} selected_chainTokensList.tokensCount=${selected_chainTokensList.tokensCount}`)
              selected_chainTokensList.tokens?.forEach( (token:TTokenChainData, index) => {
                const _tokenInstance = initTokenInstance(token, index+1)
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
              console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: selected_chainTokensList.tokensInstances ALREADY INITIALIZED selected_chainTokensList.tokensCount=${selected_chainTokensList.tokensCount} selected_chainTokensList.tokensInstances?.length=${selected_chainTokensList.tokensInstances?.length}`)

            }
            // tokensInstances.push(...selected_chainTokensList.tokensInstances)
            
          } // if (selected_chainTokensList && selected_chainTokensList.tokensCount != selected_chainTokensList.tokensInstances?.length)

        }) // newSelectedChainsTokensList.forEach
        console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: newSelectedChainsTokensList.length=${newSelectedChainsTokensList.length} newSelectedChainsTokensList[]=`)
        // debugger
        console.dir(newSelectedChainsTokensList)


        // setisLoading(false)
        // return tokensInstances // RETURN

        const updatedTokensInstancesArray = getUpdatedTokensInstancesArray(newSelectedChainsTokensList)
        updatedTokensInstancesArray.then( (updatedTokensInstancesArray:TTokensInstances[]) => {

          if (updatedTokensInstancesArray && updatedTokensInstancesArray.length) {
            newSelectedChainsTokensList.forEach( (newSelectedChainsTokensList:TChainsTokensListNullUndef, index) => {
              // Update each newSelectedChainsTokensList with updated tokensInstances
              if (newSelectedChainsTokensList && updatedTokensInstancesArray[index] ) {
                console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: updatedTokensInstancesArray[${index}]=`)
                console.dir(updatedTokensInstancesArray[index])
                newSelectedChainsTokensList.tokensInstances = updatedTokensInstancesArray[index]
              }
            })
    
          } // if (_tokenInstancesArray)
          else {
            console.warn(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: updatedTokensInstancesArray.length <= 00`)
          }

        }) // updatedTokensInstancesArray.then




      }
      else {
        // settokensInstances(null)
        console.debug(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: newSelectedChainsTokensList.length <= 00`)
        
      }

      setselectedChainsTokensList(newSelectedChainsTokensList)

    } catch (error) {
      console.error(`StepsContainer.tsx useEffect [SELECTABLETOKENSLISTS]: error=${error}`)
    }



  }
  ,[
    //     tokensLists, selectableTokensLists, chainId
    tokensLists, /* connectedAddress, */ getSelectedTokenLists, initTokenInstance,
    chainId, selectableTokensLists,
    // getUpdatedChainTokensListTokensInstances,
    targetAddress,
    connectedAddress, loadTokensOnChainData
  ]
  )

  useEffect(() => {
    // console.debug(`StepsContainer.tsx useEffect [SELECTEDCHAINSTOKENSLIST]`)
    console.debug(`StepsContainer.tsx useEffect [SELECTEDCHAINSTOKENSLIST] = selectedChainsTokensList[]=`)
    console.dir(selectedChainsTokensList)

    const tokensInstancesFromSelectedTokensLists: TTokensInstances = []
    if (selectedChainsTokensList && selectedChainsTokensList.length) {
      selectedChainsTokensList.forEach( (selectedChainsTokensList:TChainsTokensListNullUndef) => {
      
        if (selectedChainsTokensList && selectedChainsTokensList.tokensInstances && selectedChainsTokensList.tokensInstances.length) {
          tokensInstancesFromSelectedTokensLists.push(...selectedChainsTokensList.tokensInstances)
        }
        })

      settokensInstances(tokensInstancesFromSelectedTokensLists)
    }
  
  }, [selectedChainsTokensList])
  


/**
 *  useEffect: load tokens instances
 *  
 */


  useEffect( () => {

    /**
     * params: _chainsTokensListArray - chains tokens lists[]
     * UPDATES chain tokens lists TOKENS INSTANCES if necessary
     * @returns 
     */

    // const getUpdateTokensInstances_From_ChainsTokensList = async (_chainsTokensListArray:TChainsTokensListArrayNullUndef) => {

    //   try {
        

    //     console.debug(`StepsContainer (inside useEffect) updateTokensInstances : getUpdateTokensInstances_From_ChainsTokensList _chainsTokensListArray[]=`)
    //     console.dir(_chainsTokensListArray)

    //     // const tokenInstancesPromises = _chainsTokensListArray?.map( (chainTokensList:TChainsTokensListNullUndef) => {
    //     //   // console.dir(chainTokensList)
    //     //   return getUpdatedChainTokensListTokensInstances(chainTokensList)
    //     // })
    //     // For each chain tokens list, get/update its tokens instances
    //     const tokenInstancesPromises = _chainsTokensListArray?.map( (chainTokensList:TChainsTokensListNullUndef) => {
    //       // console.dir(chainTokensList)
    //       const t = getUpdatedChainTokensListTokensInstances(chainTokensList)
    //       console.dir(t)
    //       return t
    //     })

    //     // const _tokenInstances = await Promise.all(tokenInstancesPromises  as Promise<TTokensInstances>[])
    //     // console.debug(`StepsContainer (inside useEffect) updateTokensInstances : getUpdateTokensInstances_From_ChainsTokensList _tokenInstances=`)
    //     // console.dir(_tokenInstances)

    //     // if (_tokenInstances) {
    //     //   settokensInstances(_tokenInstances)
    //     // }

    //   } catch (error) {
    //     console.error(`StepsContainer (inside useEffect) updateTokensInstances : getUpdateTokensInstances_From_ChainsTokensList error=${error}`)
    //   }

    // } // getUpdateTokensInstances_From_ChainsTokensList

    try {

      console.debug(`StepsContainer useEffect updateTokensInstances `)
      if (hasSomeTokenListSelected()) {
        console.debug(`StepsContainer useEffect updateTokensInstances : Some TokenListSelected`)
        // Load tokens instances
        // let _tokensInstances:TTokensInstances = [] // new Array<TTokenInstance>()
        // _tokensInstances = getTokensInstancesFromSelectedTokensLists(chainId, selectableTokensLists)
        // Get selected tokens lists with updated tokens instances
        // const selectedChainsTokensListArray = getTokensInstances_from_SelectedTokensLists()

        // // TODO ? : Compare (current) selected tokens lists with (previous) tokens lists
        // // selectedChainsTokensList.

        // // console.dir(_tokensInstances)
        // // console.dir(selectedChainsTokensListArray)
        // if (selectedChainsTokensListArray && selectedChainsTokensListArray.length) {

        //   // selectedChainsTokensListArray?.forEach( (selectedChainsTokensList:TChainsTokensListNullUndef) => {
        //   //   // console.debug(`StepsContainer useEffect updateTokensInstances : selectedChainsTokensList.chainId=${selectedChainsTokensList.chainId} selectedChainsTokensList.tokensCount=${selectedChainsTokensList.tokensCount} selectedChainsTokensList.tokensInstances?.length=${selectedChainsTokensList.tokensInstances?.length}`)
        //   //   // console.dir(selectedChainsTokensList)
        //   //   await updateChainTokensListTokensInstances(selectedChainsTokensList)
        //   // })

        //   selectedChainsTokensListArray?.forEach( (selectedChainsTokensList:TChainsTokensListNullUndef) => {
        //     console.debug(`StepsContainer useEffect updateTokensInstances : selectedChainsTokensList=`)
        //     console.dir(selectedChainsTokensList)
        //   })
        //   getUpdateTokensInstances_From_ChainsTokensList(selectedChainsTokensListArray)
          

        // } // if (selectedChainsTokensListArray && selectedChainsTokensListArray.length)


      } // if (hasSomeTokenListSelected())
      else {
        console.debug(`StepsContainer useEffect updateTokensInstances : NO TokenListSelected`)
        settokensInstances(null) // clear TokensInstances
      }
    } catch (error) {
      console.error(`StepsContainer useEffect updateTokensInstances : error=${error}`)
    }

  }, [/* selectableTokensLists,  chainId,  */ /* getTokensInstancesFromSelectedTokensLists */
    // getTokensInstances_from_SelectedTokensLists,
    // getUpdatedChainTokensListTokensInstances,
    hasSomeTokenListSelected
  ])
  

  

  /**
   * useEffect: load tokens contracts and onchain data
   */
/*
  useEffect( () =>
    {
      const start:number = Date.now()

      const loadOnChainData = async (tokensInstances:TTokensInstances):Promise<TTokensInstances> => {
        const start:number = Date.now()
        try {
          console.debug(`StepsContainer useEffect 1 [selectableTokensLists, chain?.id]: loadOnChainData`)
          const tokensInstancesCount = tokensInstances?.length||0;
          if (tokensInstancesCount > 0) {

            setisLoading(true)
            console.debug(`StepsContainer useEffect 1 [selectableTokensLists, chain?.id]: loadOnChainData tokensInstancesCount > 0`)
            // const targetAddress = ""
            const tokensInstancesContracts = await loadTokensOnChainData(tokensInstances,EStepsLoadTokensData.contracts,true,null,"", true)
            settokensInstances(tokensInstancesContracts)
            const names = loadTokensOnChainData(tokensInstancesContracts,EStepsLoadTokensData.names,true,null,"", true)
            const sourceBalances = loadTokensOnChainData(tokensInstancesContracts,EStepsLoadTokensData.sourceBalances,true,connectedAddress,"", true)
            const decimals = loadTokensOnChainData(tokensInstancesContracts,EStepsLoadTokensData.decimals,true,null,"", true)
            const symbols = loadTokensOnChainData(tokensInstancesContracts,EStepsLoadTokensData.symbols,true,null,"", true)
            const targetBalances = targetAddress ? loadTokensOnChainData(tokensInstancesContracts,EStepsLoadTokensData.targetBalances,true,"", targetAddress, true) : null ;
            const canTransfer = targetAddress ? loadTokensOnChainData(tokensInstancesContracts,EStepsLoadTokensData.transferAbility,true,connectedAddress,targetAddress, true) : null ;
            const promises = targetAddress ? await Promise.all([names, sourceBalances, decimals, symbols, targetBalances, canTransfer]) : await Promise.all([names, sourceBalances, decimals, symbols]) ;
            // Merge promises results
            const tokensInstancesAllData = tokensInstancesContracts?.map( (tokenInstanceContract:TTokenInstance, index:number) => {
              if (promises && promises[0] && promises[1] && promises[2] && promises[3] ) {
                tokenInstanceContract.name = promises[0][index].name // tokens names
                tokenInstanceContract.userData = promises[1][index].userData // user balances
                tokenInstanceContract.decimals = promises[2][index].decimals // tokens decimals
                tokenInstanceContract.symbol = promises[3][index].symbol // tokens symbols
                if (promises[4] && promises[5]) {
                  tokenInstanceContract.userData = {
                    ...tokenInstanceContract.userData,
                    ...promises[4][index].userData, // target balances
                    ...promises[5][index].userData, // can transfer
                  }
                }
              }
              return tokenInstanceContract;
            })
            console.dir(tokensInstancesAllData)
            setisLoading(false)
            return tokensInstancesAllData;
            } // if tokensInstancesCount > 0
            else {
              console.debug(`StepsContainer useEffect 1 [selectableTokensLists, chain?.id]: loadOnChainData tokensInstancesCount = 0000`)
            }
          } catch (error) {
            console.error(`StepsContainer useEffect 1 [selectableTokensLists, chain?.id]: loadOnChainData error=${error}`)
          }
          finally {
            const elapsed = Date.now() - start
            console.debug(`StepsContainer useEffect 1 [selectableTokensLists, chain?.id]: loadOnChainData elapsed=${elapsed}`)
          }
        // await loadTokensOnChainData(tokens);

      } // loadOnChainData

      // ---
      
      try {
        // console.debug(`StepsContainer useEffect 1 [selectableTokensLists, chain?.id]`)
        // if (chainId && selectableTokensLists && selectableTokensLists.length > 0) {

        console.debug(`StepsContainer useEffect 1 [selectableTokensLists, chain?.id]: chainId=${chainId} selectableTokensLists.length=${selectableTokensLists?.length} hasSomeTokenListSelected(selectableTokensLists)= ${hasSomeTokenListSelected(selectableTokensLists) }`)

        // Are some token lists selected ?
        if (chainId && hasSomeTokenListSelected(selectableTokensLists)) {
          
          let _tokensInstances:TTokensInstances = [] // new Array<TTokenInstance>()
          // Check current load step
          if (loadStep == ESLoadtate.notLoaded) {
            // Get tokens instances
            setisLoading(true)
            console.debug(`StepsContainer useEffect 1 GETTOKENSINSTANCES`)
            _tokensInstances = getTokensInstances(chainId, selectableTokensLists)
            setloadStep(ESLoadtate.contracts)
          } // if (loadStep == ESLoadtate.notLoaded)
          else {
            console.debug(`StepsContainer useEffect 1 SKIP GETTOKENSINSTANCES`)
            _tokensInstances = tokensInstances
          }

          // settokensDataState(EStepsLoadTokensData.contracts)
          // settokensInstances(_tokensInstances)
          if (_tokensInstances &&_tokensInstances.length > 0) {
            // console.debug(`StepsContainer useEffect 1 [selectableTokensLists, chain?.id]: setShowProgressBar(true)`)
            setProgressBarPercentage(1)
            setShowProgressBar(true)
            // contracts(_tokensInstances)
            loadOnChainData(_tokensInstances)
              .then( (tokensInstancesWithData) => {
                setisLoading(false)
                settokensInstances(tokensInstancesWithData)
                // console.dir(tokensInstancesWithData)
                setTimeout( () => {
                  // console.debug(`StepsContainer useEffect 1 ProgressBar settimeout`)
                  decreaseAndHideProgressBar()
                  // setShowProgressBar(false), 1_000
                }, 1_000)
              })
            
            // .then( () => {
            //   setProgressBarPercentage(0)
            //   setTimeout( () => {
            //     console.debug(`StepsContainer useEffect 1 ProgressBar settimeout`)
            //     // setShowProgressBar(false), 1_000
            //   })
            //   console.debug(`StepsContainer useEffect 1 ProgressBar after loadOnChainData`)
            // })
            
          } // if (_tokensInstances &&_tokensInstances.length > 0)

        } // if (chainId && selectableTokensLists && selectableTokensLists.length > 0)
        else {
          setloadStep(ESLoadtate.notLoaded)
        }
      } catch (error) {
        console.error(`StepsContainer useEffect 1 [selectableTokensLists, chain?.id]: error=${error}`)
      } finally {
        setisLoading(false)
        const elapsed = Date.now() - start
        console.debug(`StepsContainer useEffect 1 targetAddress loadOnChainData elapsed=${elapsed}`)
      }
    },
    [
      // selectableTokensLists, chainId
      selectableTokensLists, chainId, 
      EStepsLoadTokensData.contracts, EStepsLoadTokensData.names, EStepsLoadTokensData.sourceBalances,
      EStepsLoadTokensData.decimals, EStepsLoadTokensData.symbols, EStepsLoadTokensData.targetBalances, EStepsLoadTokensData.transferAbility,
      connectedAddress,
      targetAddress,
      loadTokensOnChainData, getTokensInstances, setProgressBarPercentage, setShowProgressBar, decreaseAndHideProgressBar,
      
      hasSomeTokenListSelected, setloadStep, loadStep,
      ESLoadtate.contracts, ESLoadtate.notLoaded,
      // tokensInstances <- never
    ]
  ) // useEffect loadOnChainData
*/

  /**
   * useEffect: complete onchain data loading
   *  - targetAddress and canTransfer
   */
/*
  useEffect( () =>
    {

      const loadOnChainDataAdditionalData = async (_tokensInstances:TTokensInstances):Promise<TTokensInstances> =>
      {
        const start:number = Date.now()
        try {
          // console.debug(`StepsContainer useEffect 2 targetAddress loadOnChainDataAdditionalData`)
          // console.debug(`StepsContainer useEffect 2 targetAddress loadOnChainDataAdditionalData targetAddress=${targetAddress}`)
          // console.dir(_tokensInstances)
          if (targetAddress && _tokensInstances && _tokensInstances.length > 0) {
            // const tokensInstancesTargetBalances = await loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetBalances,true,"", targetAddress, false)
            // const tokensInstancesCanTransfer = await loadTokensOnChainData(tokensInstancesTargetBalances,EStepsLoadTokensData.transferAbility,true,connectedAddress,targetAddress, false)
            // console.dir(tokensInstancesCanTransfer)
            // settokensDataState(EStepsLoadTokensData.transferAbility)
            // return tokensInstancesCanTransfer

            const tokensInstancesTargetBalances = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetBalances,true,"", targetAddress, true)
            const tokensInstancesCanTransfer = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.transferAbility,true,connectedAddress,targetAddress, true)
            const promises = await Promise.all([tokensInstancesTargetBalances, tokensInstancesCanTransfer]) ;

            if (promises && promises[0] && promises[1]) {
              const tokensInstancesAdditionalData = _tokensInstances.map( (tokenInstance:TTokenInstance, index:number) =>
              {
                if (promises && promises[0] && promises[1]) {
                  tokenInstance.userData = {
                    ...tokenInstance.userData,
                    ...promises[0][index].userData, // target balances
                    ...promises[1][index].userData, // can transfer
                  }
                }
                return tokenInstance;
              })
              return tokensInstancesAdditionalData;
            } // if (promises && promises[0] && promises[1])
            return null;
          }
        } catch (error) {
          console.error(`StepsContainer useEffect 2 targetAddress loadOnChainDataAdditionalData error=${error}`)
        }
        finally {
          const elapsed = Date.now() - start
          console.debug(`StepsContainer useEffect 2 targetAddress loadOnChainDataAdditionalData elapsed=${elapsed}`)
        }
        // await loadTokensOnChainData(tokens);
      } // loadOnChainDataAdditionalData

      // ---
      try {
        // console.debug(`StepsContainer useEffect 2 [targetAddress]`)
        // console.debug(`StepsContainer useEffect 2 [targetAddress]: selectableTokensLists?.length=${selectableTokensLists?.length}}`)
        // console.debug(`StepsContainer useEffect 2 [targetAddress]: tokensInstances?.length=${tokensInstances?.length} targetAddress=${targetAddress}`)
          if (!isLoading && tokensInstances && tokensInstances.length > 0) {
            // if (tokensDataState < EStepsLoadTokensData.targetBalances) {
              if (targetAddress) {
                loadOnChainDataAdditionalData(tokensInstances)
                    .then( (tokensInstancesWithData) => {
                      settokensInstances(tokensInstancesWithData)
                      // console.dir(tokensInstancesWithData)
                      setTimeout( () => {
                        // console.debug(`StepsContainer useEffect 2 ProgressBar settimeout`)
                        decreaseAndHideProgressBar()
                        // setShowProgressBar(false), 1_000
                      }, 1_000)
                    })
              } // if (targetAddress)
            // } // if (tokensDataState < EStepsLoadTokensData.targetBalances)
          } // if (_tokensInstances &&_tokensInstances.length > 0)

        // } // if (chainId && selectableTokensLists && selectableTokensLists.length > 0)
      } catch (error) {
        console.error(`StepsContainer useEffect 2 [targetAddress]: error=${error}`)
      }
    },
    [
      // targetAddress, isLoading
      // , tokensInstances,
      connectedAddress, targetAddress,
      isLoading,
      // tokensInstances,
      EStepsLoadTokensData.targetBalances, EStepsLoadTokensData.transferAbility,
      loadTokensOnChainData, decreaseAndHideProgressBar
    ]
  ) // useEffect loadOnChainDataAdditionalData
*/ 

  // ---------------------------------------------------

  return (
    <>

      { (step < 0 || step > 3) &&
        <div className=" w-full bg-error text-error-content" >
          <MainContentContainer>
            {/* <div className="bg-white"> */}
              <StepError setpreviousDisabled={setpreviousDisabled} setNextDisabled={setNextDisabled} />
            {/* </div> */}
          </MainContentContainer>
        </div>
      }

      { 
        step === 0 &&
        <div className="w-full" >
                
          <MainContentContainer>
            {/* <div className="bg-red-500 rounded-full"> */}
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
                setShowProgressBar={setShowProgressBar}

                accountAddress={connectedAddress}
                targetAddress={targetAddress}
                tokensInstances={tokensInstances}
                chainId={chainId}
                isError={isError}
                tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
              />
            {/* </div> */}
          </MainContentContainer>

        </div>
      }

      { step === 1 &&
        <div className="w-full" >
          <MainContentContainer>
            {/* <div className="bg-orange-500"> */}
              <Step1
                setNextDisabled={setNextDisabled}
                accountAddress={connectedAddress}
                tokensInstances={tokensInstances}
                chainId={chainId}
                targetAddress={targetAddress}
                settargetAddress={settargetAddress}
                // setShowProgressBar={setShowProgressBar}
                isError={isError}
                tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
              />
            {/* </div> */}
          </MainContentContainer>
        </div>
      }

      { step === 2 &&
        <div className="w-full" >
          <MainContentContainer>
            {/* <div className="bg-yellow-600"> */}
              <Step2
                setNextDisabled={setNextDisabled}
                tokensInstances={tokensInstances}
                setShowProgressBar={setShowProgressBar}
                setProgressBarPercentage={setProgressBarPercentage}
                accountAddress={connectedAddress}
                // chainId={chainId}
                targetAddress={targetAddress}
                isError={isError}
                tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
                />
            {/* </div> */}
          </MainContentContainer>
        </div>
      }

      { step === 3 &&
        <div className="w-full" >
          <MainContentContainer>
            {/* <div className="bg-yellow-300"> */}
            <Step3
              setShowProgressBar={setShowProgressBar}
              setProgressBarPercentage={setProgressBarPercentage}
            />
            {/* </div> */}
          </MainContentContainer>
        </div>
      }

    </>
  );
}

// ------------------------------

export default StepsContainer;