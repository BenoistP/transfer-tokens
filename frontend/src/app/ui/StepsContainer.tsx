import MainContentContainer from "./MainContentContainer";

import StepError from "./StepError";
import Step0 from "./Step0";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

import { useMoveTokensAppContext } from '@Providers/MoveTokensAppProvider/MoveTokensAppContext'

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useNetwork } from 'wagmi'

import { getChainTokensList } from "~/js/utils/tokensListsUtils";
import { getContract, multicall } from '@wagmi/core'

// import { ContractFunctionConfig, ContractFunctionResult } from 'viem/src/types/contract'
// import { MulticallContracts } from 'viem/src/types/multicall'
// import { MulticallParameters } from 'viem/dist/types/contract'


// ABIs
import { erc20ABI } from 'wagmi'
import CoinBridgeToken from "@abis/CoinBridgeToken.json";
// import { getPublicEnv } from "./public-env";
import { PUBLIC_MULTICALL_MAX_BATCH_SIZE_DEFAULT } from "~/js/constants/misc";

// import { DEFAULT_TARGET_ADDRESS } from "~/utils/constants/addresses";
// import { /* useAccount , */ useNetwork, /* useBalance */ } from 'wagmi'

// ------------------------------

const StepsContainer = ( {
  // selectableTokensLists,
  tokensLists,
  // chainId,
  setpreviousDisabled, setNextDisabled,
  setShowProgressBar, setProgressBarPercentage,
 } :IStepsContainerProps ) => {

  // console.debug(`StepsContainer.tsx render`)

  const { chain } = useNetwork()
  const { address: connectedAddress, /* status, isConnected ,  isConnecting,  isDisconnected*/ } = useAccount()

  enum EStepsLoadTokensData {
    contracts = 0,
    sourceBalances = 1,
    decimals = 2,
    names = 3,
    symbols = 4,
    targetBalances = 5,
    transferAbility = 6,
    // watchTransfers = 7, // TODO
  }

  enum ESLoadtate {
    notLoaded = 0,
    contracts = 1,
    sourceBalances = 2,
    decimals = 3,
    names = 4,
    symbols = 5,
    targetBalances = 6,
    transferAbility = 7,
    // watchTransfers = 8, // TODO
  }
// ------------------------------

  const { moveTokensAppData: { step = -1 } } = useMoveTokensAppContext()

  const [selectableTokensLists, setselectableTokensLists] = useState<TSelectableTokensLists>(null)
  const [tokensInstances, settokensInstances] = useState<TTokensInstances>(null)
  const [chainId, setchainId] = useState<TChainId>(-1)
  const [targetAddress, settargetAddress] = useState<TAddressEmpty>("")

  const [isLoading, setisLoading] = useState<boolean>(false)
  const [loadStep, setloadStep] = useState<ESLoadtate>(ESLoadtate.notLoaded)
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
      // console.debug(`StepsContainer.tsx filterTokenInstanceWithFilterProps nameFilter=${nameFilter} accountAddress: ${accountAddress} nameFilter=${nameFilter}`);
      if (!nameFilter) return false ;
      const balanceGt0Filter = filter.balanceGt0 ? (token.userData[/* accountAddress */ connectedAddress as any]?.balance || 0) > 0 : true ;
      // console.debug(`StepsContainer.tsx filterTokenInstanceWithFilterProps nameFilter=${nameFilter} accountAddress: ${accountAddress} balanceGt0Filter=${balanceGt0Filter} token.userData[accountAddress as any]?.amount=${token.userData[accountAddress as any]?.amount} filter.balanceGt0=${filter.balanceGt0}`);
      // return balanceGt0Filter;
      if (!balanceGt0Filter) return false ;

      // const balanceValue = balance.valueOf();// + 1n;
      // const intValue = ( balanceValue / (10n**decimals) );
      // const decimalValue = (balanceValue - intValue * (10n**decimals));

      // console.log (`typeof filter.balance= ${typeof filter.balance}} filter.balance=${filter.balance}`)

      // const balanceFilter = filter.balance && token.decimals ? token.userData[accountAddress as any]?.amount >= (BigInt(Math.pow(10, token.decimals)) * filter.balance) : true ;
      // const intValueBI = BigInt(filter.balance.toFixed(0))
      const balance = Number(filter.balance)
      // console.debug (`tokenInstanceFilterParamsUpdaters: balance= ${balance} `)

      // const intValueBI = BigInt(Number.parseInt(filter.balance.toString()))
      const intValueBI = BigInt(balance.toString())
      // console.debug (`tokenInstanceFilterParamsUpdaters: intValueBI= ${intValueBI} `)

      // console.debug (`intValueBI= ${intValueBI} `)

      // const floatValueBI = BigInt( Number(filter.balance.toFixed(18)) - Number(intValueBI.toString()) )

      // const floatPart:string = filter.balance.toString(10)?.split('.')[1]
      // const floatPart:string = Number(filter.balance).toString(10)?.split('.')[1]
      const floatPart:string = balance.toString(10)?.split('.')[1]
      // console.debug (`tokenInstanceFilterParamsUpdaters: floatPart= ${floatPart} `)

      const leadingZeros:number = floatPart?.match(/^0+/)?.[0].length || 0
      const floatValue = floatPart ? BigInt(floatPart) : 0n

      // const filterValue = BigInt(Math.pow(10, token.decimals)) * intValueBI + BigInt(Math.pow(10, token.decimals-(1+leadingZeros))) * floatValue
      const filterValueInt =  BigInt(Math.pow(10, token.decimals)) * intValueBI
      const filterValueFloat = BigInt(Math.pow(10, token.decimals-(leadingZeros+floatValue.toString().length))) * floatValue
      const filterValue = filterValueInt + filterValueFloat

      // console.log (`filter.balance.toFixed(11)= ${filter.balance.toFixed(11)} filter.balance.toString(10)= ${filter.balance.toString(10)}`)
      // console.log (`floatPart=${floatPart} leadingZeros=${leadingZeros} intValueBI=${intValueBI} floatValue=${floatValue} filterValue=${filterValue} filterValueInt=${filterValueInt} filterValueFlo=${filterValueFloat} token.decimals-(1+leadingZeros)=${token.decimals-(1+leadingZeros)}`)

      // console.log (`filterValue=${filterValue} filterValueInt=${filterValueInt} filterValueFlo=${filterValueFloat} leadingZeros=${leadingZeros} floatValue.toString.length=${floatValue.toString().length} token.decimals-(1+leadingZeros+floatValue.toString.length)=${token.decimals-(1+leadingZeros+floatValue.toString.length)}`)
      const balanceFilter = filter.balance && token.decimals ? (token.userData[/* accountAddress */ connectedAddress as any]?.balance || 0) >= filterValue : true ;

      // console.debug(`StepsContainer.tsx filterTokenInstanceWithFilterProps nameFilter=${nameFilter} accountAddress: ${accountAddress} balanceFilter=${balanceFilter} token.userData[accountAddress as any]?.amount=${token.userData[accountAddress as any]?.amount} filter.balance=${filter.balance}`);
      // return balanceFilter;
      if (!balanceFilter) return false ;

      const addressFilter = filter.address && token.address ? token.address.toLowerCase().includes(filter.address.toLowerCase()) : true ;
      // console.debug(`StepsContainer.tsx filterTokenInstanceWithFilterProps nameFilter=${nameFilter} accountAddress: ${accountAddress} addressFilter=${addressFilter}`);
      return addressFilter;
    } catch (error) {
      console.error(`StepsContainer.tsx filterTokenInstanceWithFilterProps error: ${error}`);
      return true; // error : skip and RETURN TRUE
    }
  }

  // ---

  const tokenInstanceFilterParams = {
    // name: nameFilter, balanceGt0: balanceGt0Filter, balance: Number(balanceFilter), address: addressFilter
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

  // ---
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

  useEffect( () => {
    setchainId(chain?.id ? chain?.id : -1)
  }, [chain?.id] )

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

  // ---

  // ---

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

  const hasSomeTokenListSelected = useCallback( (_selectableTokensLists:TSelectableTokensLists):boolean =>
    {
      try {
        console.debug(`StepsContainer.tsx hasSomeTokenListSelected _selectableTokensLists=`)
        console.dir(_selectableTokensLists)
        if (!_selectableTokensLists) return false
        return _selectableTokensLists?.some( (selectableTokensList:TSelectableTokensList) => {
        // console.debug(`StepsContainer.tsx hasSomeTokenListSelected _selectableTokensList=${_selectableTokensList}`)
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
    [chainId/* , selectableTokensLists */]
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
        console.debug(`StepsContainer.tsx selectedTokensLists?.length = ${selectedTokensLists?.length} `)
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

  // ---------------------------------------------------

  const getTokensInstances = useCallback( (chainId:TChainId, selectableTokensLists:TSelectableTokensLists):TTokensInstances =>
    {
      try {
        // setisLoading(true)
        console.debug(`StepsContainer.tsx getTokensInstances`)


        const chainsTokensLists:TChainsTokensListArrayNullUndef = [];
        const tokensInstances:TTokensInstances = [];
        // console.debug(`StepsContainer.tsx getTokensInstances: tokensLists=${tokensLists}`)
        // console.debug(`StepsContainer.tsx getTokensInstances: selectableTokensLists=${selectableTokensLists}`)

        // selectableTokensLists?.forEach( (selectableTokensList:TSelectableTokensList) => {
        //   // console.debug(`StepsContainer.tsx getTokensInstances: selectableTokensList=${selectableTokensList}`)
        //   // console.debug(`StepsContainer.tsx getTokensInstances: selectableTokensList=${selectableTokensList}`)
        //   if (selectableTokensList.selected && selectableTokensList.chainId == chainId) {
        //     // console.debug(`StepsContainer.tsx getTokensInstances: selectableTokensList.selected=${selectableTokensList.selected}`)
        //     tokensLists?.forEach( (tokensList:TTokensList) => {
        //       // console.debug(`StepsContainer.tsx getTokensInstances: tokensList.id=${tokensList.id}`)
        //       if (tokensList.id == selectableTokensList.tokensList.id) {
        //         // console.debug(`StepsContainer.tsx getTokensInstances: MATCH tokensList.id == selectableTokensList.tokensList.id  tokensList.id=${tokensList.id}`)
        //         const chainTokensList = getChainTokensList(tokensList, chainId) // TChainsTokensListNullUndef
        //         chainsTokensLists.push(chainTokensList)
        //       }
        //     }) // tokensLists?.forEach
        //   }
        // }) // selectableTokensLists?.forEach

        const selectedTokenLists = getSelectedTokenLists(selectableTokensLists);
        selectedTokenLists?.map( (selectedTokenList:TSelectableTokensList) => {
          console.debug(`StepsContainer.tsx getTokensInstances: selectedTokenList=${selectedTokenList}`)
          // Find selected tokensList in all tokensLists
          
          tokensLists?.forEach( (tokensList:TTokensList) => {
            // console.debug(`StepsContainer.tsx getTokensInstances: tokensList.id=${tokensList.id}`)
            if (tokensList.id == selectedTokenList.tokensList.id) {
              console.debug(`StepsContainer.tsx getTokensInstances: MATCH tokensList.id == selectedTokenList.tokensList.id  tokensList.id=${tokensList.id}`)
              const chainTokensList = getChainTokensList(tokensList, chainId) // TChainsTokensListNullUndef
              chainsTokensLists.push(chainTokensList)
            }
          }) // tokensLists?.forEach
          
        })
        console.dir(chainsTokensLists)

        // console.debug(`StepsContainer.tsx getTokensInstances: chainsTokensLists to TTokenChainDataArray`)
        if (chainsTokensLists && chainsTokensLists?.length > 0) {
          let tokensCount = 0
          chainsTokensLists.forEach( (chainTokensList:TChainsTokensListNullUndef) => {
            if (chainTokensList) {

              if (chainTokensList.tokensCount != chainTokensList.tokensInstances?.length) {
                // Init tokensInstances
                console.debug(`StepsContainer.tsx getTokensInstances: (re)Init chainTokensList.tokensInstances chainTokensList.tokensCount=${chainTokensList.tokensCount} chainTokensList.tokensInstances?.length=${chainTokensList.tokensInstances?.length}`)
                const chainTokensList_tokensInstances:TTokensInstances = [];
                // console.debug(`StepsContainer.tsx getTokensInstances: chainTokensList.chainId=${chainTokensList.chainId} chainTokensList.tokensCount=${chainTokensList.tokensCount}`)
                chainTokensList.tokens?.forEach( (token:TTokenChainData) => {
                  if (token?.address) {
                    const tokenInstanceUserDataArray:TTokenInstanceUserData[] = new Array<TTokenInstanceUserData>()
                    // console.debug(`StepsContainer.tsx getTokensInstances: typeof connectedAddress=${typeof connectedAddress}`)
                    if (connectedAddress && typeof connectedAddress == 'string') {
                      // const connectedAddressLC:any = connectedAddress.toLowerCase()
                      tokenInstanceUserDataArray[connectedAddress as any] = ({
                        selected: false,
                        balance: null,
                        transferAmount: 0n,
                        canTransfer: false,
                      } as TTokenInstanceUserData)
                      }
                    chainTokensList_tokensInstances.push({
                    // tokensInstances.push({
                      chainId: chainId,
                      type: (token.extraData && token.extraData.type ? token.extraData.type : "ERC20" as TTokenType),
                      address: token.address,
                      contract: null,
                      decimals: 18,
                      name: "",
                      symbol: "",
                      status: 0,
                      displayed: true,
                      displayId: ++tokensCount,
                      selectable: false,
                      userData: tokenInstanceUserDataArray,
                    } as TTokenInstance )
                  }
                })
                chainTokensList.tokensInstances = chainTokensList_tokensInstances;
                
              } // if (chainTokensList.tokensCount != chainTokensList.tokensInstances?.length)
              else {
                console.debug(`StepsContainer.tsx getTokensInstances: chainTokensList.tokensInstances ALREADY INITIALIZED chainTokensList.tokensCount=${chainTokensList.tokensCount} chainTokensList.tokensInstances?.length=${chainTokensList.tokensInstances?.length}`)
              }
              tokensInstances.push(...chainTokensList.tokensInstances)
            } // if (chainTokensList && chainTokensList.tokensCount != chainTokensList.tokensInstances?.length)

          })
          console.debug(`StepsContainer.tsx getTokensInstances: chainsTokensLists.length=${chainsTokensLists.length}`)
        }
        else {
          // settokensInstances(null)
          console.debug(`StepsContainer.tsx getTokensInstances: chainsTokensLists.length <= 00`)
          
        }

        // console.debug(`StepsContainer.tsx getTokensInstances: tokensInstances.length=${tokensInstances.length}`)
        // setisLoading(false)
        return tokensInstances // RETURN
      } catch (error) {
        console.error(`StepsContainer.tsx getTokensInstances: error=${error}`)
      }

      return null // RETURN
    },
    //     tokensLists, selectableTokensLists, chainId
    [tokensLists, connectedAddress, getSelectedTokenLists]
  ) // getTokensInstances


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
  const decreaseAndHideProgressBar = 
    useCallback(() => {
      setProgressBarPercentage(0)
      setTimeout( () => {
        // console.debug(`StepsContainer decreaseAndHideProgressBar ProgressBar`)
        // setShowProgressBar(false), 1_000
      })
    },
    [setProgressBarPercentage]
  )

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

  const fetchOnChainDataWrapper = useCallback( async(multicallInput : any[] ) :  Promise<any[]> =>
    {
      let multicallRes : any[] = [];

      try {
        // console.debug(`StepsContainer.tsx fetchOnChainDataWrapper multicallInput.length: ${multicallInput.length}`);
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
        }
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



  // ---

  const loadTokensOnChainData = useCallback( async(tokensInstances:TTokensInstances/* tokens:TTokenChainDataArray */
  , step:number, _showProgressBar:boolean, _from:TAddressEmptyNullUndef, _to:TAddressEmptyNullUndef, resultOnly:boolean ):Promise<TTokensInstances> =>
    {
      try {
        // console.debug(`StepsContainer.tsx loadTokensOnChainData ProgressBar tokensInstances?.length=${tokensInstances?.length}}, step=${step}`)
        let tokensInstancesUpdated:TTokensInstances;
        // const baseProgress = 11
        // const loadTokensOnChainDataProgress = 89 - 3
        // const steps = 4
        // let progressStep=(loadTokensOnChainDataProgress/(tokensInstances?tokensInstances.length:1))/steps
        // let progressStep=loadTokensOnChainDataProgress/steps
        let progress = 0

        if (tokensInstances && tokensInstances.length > 0) {
          let multicallArray: any[] = [];

          switch (step) {
            // Step 0: get tokens contracts
            case EStepsLoadTokensData.contracts:
              tokensInstancesUpdated = await loadTokensContracts(tokensInstances)
              progress = 11
              break;
            // Step 1: get tokens source user balances
            case EStepsLoadTokensData.sourceBalances:
              // const balancesSourceMulticallArray = tokensInstances.map( async (token) => {
              multicallArray = tokensInstances.map( async (token) => {
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
              // const decimalsMulticallArray = tokensInstances.map( async (token) => {
                multicallArray = tokensInstances.map( async (token) => {
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
              // const nameMulticallArray = tokensInstances.map( async (token) => {
              multicallArray = tokensInstances.map( async (token) => {
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
              // const symbolMulticallArray = tokensInstances.map( async (token) => {
              multicallArray = tokensInstances.map( async (token) => {
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
              // const balancesTargetMulticallArray = tokensInstances.map( async (token) => {
              multicallArray = tokensInstances.map( async (token) => {
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
              // const canTransferMulticallArray = tokensInstances.map( async (token) => {
              multicallArray = tokensInstances.map( async (token) => {

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
            // const onchainData = await fetchOnChainData(multicallData);
            const onchainData = await fetchOnChainDataWrapper(multicallData);

            // if (step == EStepsLoadTokensData.sourceBalances) {
            //   console.debug(`StepsContainer.tsx loadTokensOnChainData ProgressBar sourceBalances from=${connectedAddress} to=${targetAddress} onchainData.length=${onchainData?.length}`)
            //   console.dir(onchainData)
            // }
  
            // const tokensListLength = tokensInstances.length
            if (onchainData?.length > 0) {
              const tokensInstancesWithOnchainData = tokensInstances.map( async (tokenInstance, index) => {
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
          return tokensInstancesUpdated

        } // if (tokens?.length > 0)

      } // try
      catch (error) {
        console.error(`loadTokensOnChainData error: ${error}`);
      } // catch (error)
    },
    [
      // /* tokens, */ chainId, /* fetchOnChainData */ fetchOnChainDataWrapper, connectedAddress, targetAddress
      EStepsLoadTokensData.contracts, EStepsLoadTokensData.sourceBalances, EStepsLoadTokensData.decimals,
      EStepsLoadTokensData.names, EStepsLoadTokensData.symbols, EStepsLoadTokensData.targetBalances, EStepsLoadTokensData.transferAbility,
      loadTokensContracts, fetchOnChainDataWrapper, setProgressBarPercentage
      // connectedAddress,
      // targetAddress,
      ]
  ); // loadTokensOnChainData

  // ---

  /**
   * useEffect: load tokens contracts and onchain data
   */
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
            /*
            .then( () => {
              setProgressBarPercentage(0)
              setTimeout( () => {
                console.debug(`StepsContainer useEffect 1 ProgressBar settimeout`)
                // setShowProgressBar(false), 1_000
              })
              console.debug(`StepsContainer useEffect 1 ProgressBar after loadOnChainData`)
            })
            */
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
                // settokensInstances={settokensInstances}
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
                // tokensLists={tokensLists}
                setNextDisabled={setNextDisabled}
                // selectableTokensLists={selectableTokensLists}
                accountAddress={connectedAddress}
                tokensInstances={tokensInstances}
                // settokensInstances={settokensInstances}
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
                // settokensInstances={settokensInstances}
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