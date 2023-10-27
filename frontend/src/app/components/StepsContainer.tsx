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

              // if (tokensInstance.userData[connectedAddress as any]) {
              //   return (
              //     // (tokensInstance.userData[connectedAddress as any].selected ? true : false)
              //     (tokensInstance.selected ? true : false)
              //   )
              // }
              // return true; // not user data : skip and RETURN TRUE
              return tokensInstance.selected;
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
              // if (  tokensInstance.selectable && /*accountAddress*/ connectedAddress && typeof /*accountAddress*/ connectedAddress === "string" && tokensInstance.userData &&
              //     tokensInstance.userData[/*accountAddress*/ connectedAddress as any].canTransfer && (tokensInstance.userData[/*accountAddress*/ connectedAddress as any].balance||0)>0)
              if (  tokensInstance.selectable && targetAddress && tokensInstance.userData &&
                    tokensInstance.userData[targetAddress as any].canTransfer &&
                    // (tokensInstance.userData[targetAddress as any].balance||0)>0 &&
                    // tokensInstance.userData[targetAddress as any].transferAmount>0
                    tokensInstance.transferAmount>0
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
      [tokensInstances, /*accountAddress*/ /* connectedAddress, */ targetAddress, selectAll]
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
                  // if (tokensInstance.userData[/*accountAddress*/ connectedAddress as any]) {
                  if (tokensInstance.userData && targetAddress && tokensInstance.userData[/*accountAddress*/ connectedAddress as any]
                    && tokensInstance.userData[/*accountAddress*/ targetAddress as any].canTransfer
                    // && tokensInstance.userData[/*accountAddress*/ targetAddress as any].transferAmount>0
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

  const changeCheckboxStatus:IChangeCheckboxStatus = /* useCallback( */
    (id: string, value: TChecked | undefined) =>
      {
        try {
          
          console.info(`changeCheckboxStatus id=${id} `);
          const tokensInstancesUpdated = tokensInstances?.map((tokenInstance) => {
            // if (tokenInstance.chainId+"-"+tokenInstance.address === id) {
            if (tokenInstance.selectID === id) {
              // console.debug(`changeCheckboxStatus id=${id} tokenInstance.chainId+"-"+tokenInstance.address=${tokenInstance.chainId+"-"+tokenInstance.address} tokenInstance.userData[/*accountAddress*/ connectedAddress as any]?.selected=${tokenInstance.userData[/*accountAddress*/ connectedAddress as any]?.selected} `);
              if (/*accountAddress*/ connectedAddress && typeof /*accountAddress*/ connectedAddress === "string" && tokenInstance.userData && tokenInstance.userData[/*accountAddress*/ connectedAddress as any]) {
                if (value) {
                  console.debug(`changeCheckboxStatus id=${id} value.checked=${value.checked} `);
                  // tokenInstance.userData[/*accountAddress*/ connectedAddress as any].selected = value.checked;
                  tokenInstance.selected = value.checked;
                } else {
                  // console.debug(`changeCheckboxStatus id=${id} !tokenInstance.userData[/*accountAddress*/ connectedAddress as any].selected=${!tokenInstance.userData[/*accountAddress*/ connectedAddress as any].selected} `);
                  console.debug(`changeCheckboxStatus id=${id} !tokenInstance.selected=${!tokenInstance.selected} `);
                  // tokenInstance.userData[/*accountAddress*/ connectedAddress as any].selected = !tokenInstance.userData[/*accountAddress*/ connectedAddress as any].selected;
                  tokenInstance.selected = !tokenInstance.selected;
                }
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
        // console.debug(`StepsContainer.tsx loadTokensContracts tokensInstances?.length=${tokensInstances?.length}`)
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

  const loadTokensOnChainData = useCallback( async(
    _tokensInstances: TTokensInstances, step:number, _showProgressBar:boolean,
    _from:TAddressEmptyNullUndef, _to:TAddressEmptyNullUndef, _resultOnly:boolean 
    ): Promise<TTokensInstances> =>
    {
      try {
        // console.debug(`StepsContainer.tsx loadTokensOnChainData ProgressBar _tokensInstances?.length=${_tokensInstances?.length}}, step=${step}`)
        let tokensInstancesResults:TTokensInstances;
        // const baseProgress = 11
        // const loadTokensOnChainDataProgress = 89 - 3
        // const steps = 4
        // let progressStep=(loadTokensOnChainDataProgress/(_tokensInstances?_tokensInstances.length:1))/steps
        // let progressStep=loadTokensOnChainDataProgress/steps
        // let progress = 0

        if (_tokensInstances && _tokensInstances.length > 0) {
          let multicallArray: any[] = [];

          switch (step) {

            // Step 0: get tokens contracts
            case EStepsLoadTokensData.contracts:
              console.debug(`StepsContainer.tsx loadTokensOnChainData Step EStepsLoadTokensData.contracts: GET TOKENS CONTRACTS`)
              // console.debug(`StepsContainer.tsx loadTokensOnChainData Step 0: GET TOKENS CONTRACTS _tokensInstances.length=${_tokensInstances.length} _tokensInstances=`)
              // console.dir(_tokensInstances)
              tokensInstancesResults = await loadTokensContracts(_tokensInstances)
              // progress = 11
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
              // progress = 33
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
              // progress = 55
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
              // progress = 77
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
              // progress = 90
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
              // progress = 50
              break;

            // Step 6: get canTransfer token from address to address
            case EStepsLoadTokensData.targetTransferAbility:
              console.debug(`StepsContainer.tsx loadTokensOnChainData Step EStepsLoadTokensData.targetTransferAbility: GET TOKENS TRANSFER ABILITY`)
              // const canTransferMulticallArray = _tokensInstances.map( async (token) => {
              multicallArray = _tokensInstances.map( async (token) => {

                if (token?.contract) {
                  if (token?.type == "COINBRIDGE" as TTokenType) { // TEST
                  // if (token?.type == "ERC20" as TTokenType) {
                    // const amount = token.userData && token.userData[connectedAddress as any]?.balance || 1
                    const amount = token.userData && token.userData[_from as any]?.balance || 1 // set minimal amount for checking transferability
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
                  // Anything else than COINBRIDGE
                  // don't call contract, just provide return value assuming (transferability is) true
                    return {
                        value: [true],
                      }
                } // if (token?.contract)
                return null;
              });
              // multicallArray = canTransferMulticallArray;
              // progress = 100
              break;

            // Step 7: Watch transfers : TODO

          }

          // Step 0: Load contracts
          // Steps 1..7: Load onchain data

          if (step > 0) {

            // Multicall
            const multicallData = await Promise.all(multicallArray);
            // console.debug(`StepsContainer.tsx loadTokensOnChainData multicallData.length=${multicallData.length} multicallData=`) 
            // console.dir(multicallData);
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
                  /* let */ // const tokenInstanceUserDataArray:TTokenInstanceUserData[] = tokenInstance.userData;


                  // return { userData: tokenInstanceUserDataArray, }
                  // console.dir(tokenInstanceUserDataArray)

                  // if (!tokenInstanceUserDataArray) {
                  //   console.warn(`StepsContainer.tsx loadTokensOnChainData Step EStepsLoadTokensData.sourceBalances: tokenInstance.userData is null or undefined`)
                  //   tokenInstanceUserDataArray = new Array<TTokenInstanceUserData>()
                  // }
                  const userBalance = onchainData[index]?.result; // Token User balance
                  // if (_from /* && typeof _from == 'string' */) {
                  //   // debugger
                  //   tokenInstanceUserDataArray[_from as any] = ({
                  //     // selected: false,
                  //     ...tokenInstanceUserDataArray[_from as any],
                  //     balance: userBalance,
                  //     // transferAmount: userBalance,
                  //   } as TTokenInstanceUserData)
                  // } // if (_from && typeof _from == 'string')
                  if (_resultOnly) {
                    return {
                      // userData: {balance: userBalance,},
                      balance: userBalance,
                    };
                  }
                  const tokenInstanceUserDataArray:TTokenInstanceUserData[] = tokenInstance.userData;
                  if (_from /* && typeof _from == 'string' */) {
                    // debugger
                    tokenInstanceUserDataArray[_from as any] = ({
                      // selected: false,
                      ...tokenInstanceUserDataArray[_from as any],
                      balance: userBalance,
                      // transferAmount: userBalance,
                    } as TTokenInstanceUserData)
                  } // if (_from && typeof _from == 'string')
                  return {
                    ...tokenInstance,
                    status: step,
                    userData: tokenInstanceUserDataArray,
                  } as TTokenInstance;
                }

                // Step 2: get token decimals
                if (step == EStepsLoadTokensData.decimals) {
                  // decimals
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
                }

                // Step 3: get token name
                if (step == EStepsLoadTokensData.names) {
                  // name
                  if (_resultOnly) {
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
                  if (_resultOnly) {
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
                  // let tokenInstanceUserDataArray:TTokenInstanceUserData[] = tokenInstance.userData;
                  // if (!tokenInstanceUserDataArray) tokenInstanceUserDataArray = new Array<TTokenInstanceUserData>();
                  // if (_to && typeof _to == 'string') {
                  //   tokenInstanceUserDataArray[_to as any] = ({
                  //     // selected: false,
                  //     balance: onchainData[index]?.result, // Token User balance
                  //     // transferAmount: 0n,
                  //     canTransfer: false,
                  //   } // as TTokenInstanceUserData
                  //   )
                  // } // if (_to && typeof _to == 'string')
                  if (_resultOnly) {
                    return {
                      // userData: {
                        balance: onchainData[index]?.result, // Token User balance
                        canTransfer: false // defaulted to false, then fetched after with a multicall
                      // },
                    };
                  }
                  let tokenInstanceUserDataArray:TTokenInstanceUserData[] = tokenInstance.userData;
                  if (!tokenInstanceUserDataArray) tokenInstanceUserDataArray = new Array<TTokenInstanceUserData>();
                  if (_to /* && typeof _to == 'string' */) {
                    tokenInstanceUserDataArray[_to as any] = ({
                      // selected: false,
                      balance: onchainData[index]?.result, // Token User balance
                      // transferAmount: 0n,
                      canTransfer: false,
                    } // as TTokenInstanceUserData
                    )
                  } // if (_to && typeof _to == 'string')
                  return {
                    ...tokenInstance,
                    status: step,
                    // displayed: true,
                    // selectable: false,
                    userData: tokenInstanceUserDataArray,
                  } as TTokenInstance;
                }
                // Step 6: get canTransfer token from address to address
                if (step == EStepsLoadTokensData.targetTransferAbility) {
                  // can transfer from to
                  // console.debug(`StepsContainer.tsx loadTokensOnChainData ProgressBar canTransfer from=${connectedAddress} to=${targetAddress} result=${onchainData[index]?.result}`)
                  // console.debug(`StepsContainer.tsx loadTokensOnChainData StepsContainer canTransfer from=${_from} to=${_to} result=${onchainData[index]?.result}`)
                  // console.dir(onchainData[index]?.result)
                  const canTransfer = (onchainData[index] && onchainData[index]?.result && onchainData[index]?.result[0] ? true : false) ; // can transfer from to
                  // let {selectable} = tokenInstance;
                  // if (_from && typeof _from == 'string') {
                  //   if (tokenInstanceUserDataArray[_from as any]) {
                  //     selectable = ( (tokenInstanceUserDataArray[_from as any].balance || 0n) > 0n
                  //       && canTransfer)
                  //   }
                  // }
                  // console.info(`StepsContainer.tsx loadTokensOnChainData StepsContainer canTransfer=${canTransfer} from=${_from} to=${_to} result=${onchainData[index]?.result} selectable=${selectable} `)
                  // if (_to && typeof _to == 'string') {
                  //   // tokenInstanceUserDataArray[_from as any] = ({
                  //   tokenInstanceUserDataArray[_to as any] = ({
                  //     ...tokenInstance.userData[_to as any],
                  //     canTransfer: onchainData[index]?.result, // can transfer from to
                  //   } as TTokenInstanceUserData)
                  // } // if (_to && typeof _to == 'string')
                  if (_resultOnly) {
                    return {
                      // userData: tokenInstanceUserDataArray,
                      // selectable,
                      canTransfer, // can transfer from to
                    };
                  }
                  let tokenInstanceUserDataArray:TTokenInstanceUserData[] = tokenInstance.userData;
                  if (!tokenInstanceUserDataArray) tokenInstanceUserDataArray = new Array<TTokenInstanceUserData>();
                  tokenInstanceUserDataArray[/* _from */_to as any] = ({
                      ...tokenInstance.userData[/* _from */ _to as any],
                      // result: bool, uint256, uint256
                      canTransfer,
                      // transferAmount: 0n,
                    } //  as TTokenInstanceUserData
                  )
                  return {
                    ...tokenInstance,
                    // selectable,
                    userData: tokenInstanceUserDataArray,
                    status: step,
                  } as TTokenInstance;
                }

                console.error(`StepsContainer.tsx loadTokensOnChainData error: step=${step} not found`)
                return tokenInstance;

              }); // map
  
              const allPromiseResolved = /* await */ Promise.all(tokensInstancesWithOnchainData);
              return allPromiseResolved as Promise<TTokensInstances>;
              // setProgressBarPercentage(100)
              // console.debug(`loadTokensOnChainData connectedAddress:${connectedAddress} allPromiseResolved.length: ${allPromiseResolved.length}`);
              // console.dir(allPromiseResolved);
              // tokensInstancesResults = allPromiseResolved as TTokensInstances; // FORCE type for _resultOnly results
              // settokensInstances(allPromiseResolved);
  
            } // if (onchainData?.length > 0
          } // if (step > 0)
          
          // console.debug(`StepsContainer.tsx loadTokensOnChainData ProgressBar progress=${progress}`)

          // if (_showProgressBar) {
          //   setProgressBarPercentage(progress)
          // }

          // console.debug(`StepsContainer.tsx loadTokensOnChainData BEFORE RETURN tokensInstancesResults=`)  
          // console.dir(tokensInstancesResults)
          return tokensInstancesResults

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
      loadTokensContracts, fetchOnChainDataWrapper,
      // setProgressBarPercentage
      // connectedAddress,
      // targetAddress,
    ]
  ); // loadTokensOnChainData

  // ----------------------------------------------

  // USE EFFECTS

  useEffect( () =>
  {

      const loadTargetData = async( _tokensInstances:TTokensInstances, targetAddress:TAddressEmpty) : Promise<TTokenInstance[]> => {

        let tokensInstancesData:TTokenInstance[] = []
        try {
          console.debug(`StepsContainer.tsx loadTargetData BEFORE MERGE promises (target balances, cantransfer) tokensInstancesData =`)

          if (_tokensInstances && targetAddress) {

            // Load target balances
            // tokens target user balances
            const targetBalances = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetBalances,true,"", targetAddress, true);
            // tokens transfer ability
            const canTransfer = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetTransferAbility,true,connectedAddress,targetAddress, true);

            // Wait for all promises to resolve
            const loadTokensOnChainDataPromises = await Promise.all([targetBalances, canTransfer]);
            console.debug(`StepsContainer.tsx loadTargetData AFTER await Promise.all`)

            console.dir(loadTokensOnChainDataPromises[0])
            console.dir(loadTokensOnChainDataPromises[1])
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

            console.debug(`StepsContainer.tsx loadTargetData AFTER MERGE promises (target balances, cantransfer) tokensInstancesData =`)
            console.dir(tokensInstancesData)

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
      }

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

              console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances EChainTokensListLoadState.CONTRACTS`)
              // Load everything else : sourceBalances, decimals, names, symbols
              // tokens names
              const tokensNamesPromises = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.names,true,null,"", true)
              console.dir(tokensNamesPromises)

              // tokens connected user (source) balances
              const tokensSourceBalancesPromises = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.sourceBalances,true,connectedAddress,"", true)
              console.dir(tokensSourceBalancesPromises)
              // tokens decimals
              const tokensDecimalsPromises = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.decimals,true,null,"", true)
              console.dir(tokensDecimalsPromises)
              // tokens symbols
              const tokensSymbolsPromises = loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.symbols,true,null,"", true)
              console.dir(tokensSymbolsPromises)

              // If targetAddress is already set, load Additionnal data: targetBalances, transferAbility
              // tokens target user balances
              const tokensTargetBalancesPromises = targetAddress ? loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetBalances,true,"", targetAddress, true) : null ;
              // tokens transfer ability
              const tokensTargetCanTransferToPromises = targetAddress ? loadTokensOnChainData(_tokensInstances,EStepsLoadTokensData.targetTransferAbility,true,connectedAddress,targetAddress, true) : null ;

              console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances BEFORE Promise.all`)

              // Wait for all promises to resolve
              // const loadTokensOnChainDataPromises = targetAddress ? await Promise.all([names, sourceBalances, decimals, symbols, targetBalances, canTransferToTarget]) : await Promise.all([names, sourceBalances, decimals, symbols]) ;
              // const loadTokensOnChainDataPromises = await Promise.all( [tokensNamesPromises, tokensSourceBalancesPromises, tokensDecimalsPromises, tokensSymbolsPromises]) ;
              const [tokensNames, tokensSourceBalances, tokensDecimals, tokensSymbols, tokensTargetBalances, tokensTargetCanTransferTo ] =
                targetAddress ?
                  await Promise.all( [tokensNamesPromises, tokensSourceBalancesPromises, tokensDecimalsPromises, tokensSymbolsPromises]) :
                  await Promise.all( [tokensNamesPromises, tokensSourceBalancesPromises, tokensDecimalsPromises, tokensSymbolsPromises, tokensTargetBalancesPromises, tokensTargetCanTransferToPromises ]) ;

              console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances AFTER Promise.all`)

              // Merge loadTokensOnChainDataPromises results
              const tokensInstancesAllData = _tokensInstances?.map( (_tokenInstance:TTokenInstance, index:number) => {
                // Update tokenInstance with data from promises
                if (tokensNames && tokensSourceBalances && tokensDecimals && tokensSymbols ) {
                    _tokenInstance.name = tokensNames[index].name // tokens names
                    _tokenInstance.userData[connectedAddress as any] = {..._tokenInstance.userData[connectedAddress as any], ...tokensSourceBalances[index]} // source balances
                    _tokenInstance.decimals = tokensDecimals[index].decimals // tokens decimals
                    _tokenInstance.symbol = tokensSymbols[index].symbol // tokens symbols
                    console.warn(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances MERGING promises`)
                    // TODO : CHECK IT IS WORKING
                    // TODO : CHECK IT IS WORKING
                    // TODO : CHECK IT IS WORKING
                    if (targetAddress && tokensTargetBalances && tokensTargetCanTransferTo) {
                      console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances targetAddress IS SET targetAddress && tokensTargetBalances && tokensTargetCanTransferTo MERGING promises`)
                      _tokenInstance.userData[targetAddress as any] = {..._tokenInstance.userData[targetAddress as any], ...tokensTargetBalances[index], ...tokensTargetCanTransferTo[index]} // target balances, can transfer to target
                  } // if (tokensTargetBalances && tokensTargetCanTransferTo)

                }
                return _tokenInstance;
              }) // map

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

            console.debug(`StepsContainer.tsx getUpdatedChainTokensListTokensInstances BEFORE RETURN chainTokensList.tokensInstances`)
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
          console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray`)
          if (_chainsTokensList && _chainsTokensList.length) {

            const tokenInstances = _chainsTokensList.map( async(chainTokensList:TChainsTokensListNullUndef) => {
              // console.dir(chainTokensList)
              const updatedChainTokensListTokensInstances = await getUpdatedChainTokensListTokensInstances(chainTokensList)
              // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray: getUpdatedChainTokensListTokensInstances t=`)
              // console.dir(t)
              // update
              // chainTokensList.tokensInstances = t
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
        console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] getUpdatedTokensInstancesArray BEFORE RETURN`)
        return result
      } // getUpdatedTokensInstancesArray



      const updateChainTokensListTokensInstances = async (_chainsTokensList:TChainsTokensListArrayNullUndef):Promise<TChainsTokensListArrayNullUndef> => {
        // let chainsTokensListResult:TChainsTokensListArrayNullUndef // = [];
        try {
          console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances`)
          // chainsTokensListResult = _chainsTokensList;
          const updatedTokensInstancesArray = await getUpdatedTokensInstancesArray(_chainsTokensList)
          console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances: AFTER getUpdatedTokensInstancesArray`)
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

      try {
        // setisLoading(true)
        console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]`)


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
            console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] AFTER updateChainTokensListTokensInstances.then`)
            console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: SET SelectedChainsTokensList`)
            setselectedChainsTokensList(updatedChainsTokensList)
          }).catch( (error) => {
            console.error(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS] updateChainTokensListTokensInstances error: ${error}`);
          })

        } // if (newSelectedChainsTokensList.length > 0)
        else {
          // settokensInstances(null)
          console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: newSelectedChainsTokensList.length <= 00`)
          
        }

        // console.debug(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: SET SelectedChainsTokensList`)
        // setselectedChainsTokensList(newSelectedChainsTokensList)
        // console.dir(newSelectedChainsTokensList)

      } catch (error) {
        console.error(`StepsContainer.tsx useEffect [SELECTABLE TOKENSLISTS]: error=${error}`)
      }

    },
    [ tokensLists, selectableTokensLists,
      // getUpdatedChainTokensListTokensInstances,
      chainId, targetAddress, connectedAddress,
      getSelectedTokenLists, initTokenInstance, loadTokensOnChainData ]
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
        console.debug(`StepsContainer.tsx useEffect [SELECTED CHAINSTOKENSLIST] = tokensInstancesFromSelectedTokensLists[]=`)
        console.dir(tokensInstancesFromSelectedTokensLists)
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
                setShowProgressBar={setShowProgressBar}
                accountAddress={connectedAddress}
                targetAddress={targetAddress}
                tokensInstances={tokensInstances}
                chainId={chainId}
                isError={isError}
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
                isError={isError}
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
                setProgressBarPercentage={setProgressBarPercentage}
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
              setShowProgressBar={setShowProgressBar}
              setProgressBarPercentage={setProgressBarPercentage}
            />
          </MainContentContainer>
        </div>
      }

    </>
  );
}

// ------------------------------

export default StepsContainer;