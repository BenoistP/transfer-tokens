import { createContext, useContext, useMemo, useState } from 'react'

const initialMoveTokensAppData: TMoveTokensAppDataContext = {
    step:             0,
    minStep:          0,
    maxStep:          3,
    tokensLists:      null,
}

const initialMoveTokensAppDataHandlers: TMoveTokensAppDataHandlersContext = {
  nextStep: () => {},
  prevStep: () => {},
}

const MoveTokensAppContext = createContext<TMoveTokensAppContext>(
  {
    // Initial context
    moveTokensAppData: initialMoveTokensAppData,
    moveTokensAppDataHandlers: initialMoveTokensAppDataHandlers
  })


MoveTokensAppContext.displayName = 'App_Context'

const MoveTokensAppProvider = ( { children }:any ) => {

  // const tokensLists: TTokensLists|null|undefined = await loadTokensLists();
/*
  const loadTokensLists = async ():Promise<TTokensLists> =>
  {
    const start:number = Date.now()
    try {
      console.debug(`MoveTokensAppProvider.tsx: loadTokensLists`);
      const tokensLists = await getTokensLists_TokenData(TOKENS_LISTS)
      return tokensLists;
    } catch (error) {
      console.error(`MoveTokensAppProvider.tsx: loadTokensLists: error=${error}`);
    }
    finally {
      var elapsed = Date.now() - start
      console.debug(`MoveTokensAppProvider.tsx: loadTokensLists: elapsed=${elapsed} DONE` );
    }
  } // loadTokensLists
*/
  // ---
/*
  const checkTokensLists = async (tokensLists: TTokensLists) =>
  {
    try {
      console.debug(`MoveTokensAppProvider.tsx: checkTokensLists:`)

      tokensLists?.forEach( (tokensList: TTokensList) => {
        if (tokensList && tokensList.tokens && tokensList.tokens.length > 0) {
          console.debug(`MoveTokensAppProvider.tsx: checkTokensLists: tokensList DEFINED && tokensList.tokens.length > 0`);
          // if (tokensList.chains && tokensList.chains.length > 0 && tokensList.chains.includes((chain?.id ? chain?.id : -1))) {
          //   console.debug(`MoveTokensAppProvider.tsx: checkTokensLists: tokensList.chains DEFINED && tokensList.chains.length > 0 && tokensList.chains.includes(chain.id) (${chain?.id}))`);
          // } else {
          //   console.debug(`MoveTokensAppProvider.tsx: checkTokensLists: tokensList.chains is undefined or tokensList.chains.length <= 0 , or tokensList.chains does not include chain.id (${chain?.id})})`);
          // }
        }
      })


    } catch (error) {
      console.error(`MoveTokensAppProvider.tsx: checkTokensLists: error=${error}`);
    }
  } // checkTokensLists
*/
  // ---
/*
  const checkAndFetchTokensLists = async() =>
  {
    try {
        console.debug(`MoveTokensAppProvider.tsx: checkAndFetchTokensLists`);
      // if (moveTokensAppData.tokensLists) {
      //   console.debug(`MoveTokensAppProvider.tsx: checkAndFetchTokensLists: moveTokensAppData.tokensLists is defined`);
      //   checkTokensLists(moveTokensAppData.tokensLists)
      // } else {
      //   console.debug(`MoveTokensAppProvider.tsx: checkAndFetchTokensLists: moveTokensAppData.tokensLists is undefined`);
        initTokensLists()
      // }
      
    } catch (error) {
      console.error(`MoveTokensAppProvider.tsx: checkAndFetchTokensLists: error=${error}`);
    }
  } // checkAndFetchTokensLists
*/
  // ---
/*
  const initTokensLists = async() =>
  {
    console.debug(`MoveTokensAppProvider.tsx: init()`)
    const tokensLists = await loadTokensLists()
    console.debug(`MoveTokensAppProvider.tsx: tokensLists=${tokensLists}`)
    console.dir(tokensLists);
    setmoveTokensAppData( (prevAppData) => {
      return {
        ...prevAppData,
        tokensLists: tokensLists,
      }
    })
  }
*/
  // ------------------------------
/*
  useEffect( () =>
  {
    try {
      console.debug(`MoveTokensAppProvider.tsx: useEffect`)
      checkAndFetchTokensLists();
      const updateInterval = setInterval( () => {
        checkAndFetchTokensLists();
      }, 600_000)

      return () => {
        console.debug(`MoveTokensAppProvider.tsx: useEffect: cleanup`)
        clearInterval(updateInterval)
        // setmoveTokensAppData( (prevAppData) => {
        //   return {
        //     ...prevAppData,
        //     tokensLists: null,
        //   }
        // })
      }
    } catch (error) {
      console.error(`MoveTokensAppProvider.tsx: useEffect: error=${error}`);  
    }
  }, [] ) // useEffect
*/

  const [moveTokensAppData, setmoveTokensAppData] = useState<TMoveTokensAppDataContext>(initialMoveTokensAppData);

  const moveTokensDataHandlers = useMemo(
    () => ({
      nextStep: () => {
        setmoveTokensAppData( (prevAppData) => {
          return {
            ...prevAppData,
            step: (prevAppData.step < prevAppData.maxStep ? prevAppData.step + 1 : prevAppData.step ),
          }
        })
      },
      prevStep: () => {
        setmoveTokensAppData( (prevAppData) => {
          return {
            ...prevAppData,
            step: (prevAppData.step > prevAppData.minStep ? prevAppData.step - 1 : prevAppData.step ),
          }
        })
      },
    }),
    []
  )

  // ------------------------------

  return (
    <MoveTokensAppContext.Provider value={{moveTokensAppData:moveTokensAppData, moveTokensAppDataHandlers:moveTokensDataHandlers}}>
      {children}
    </MoveTokensAppContext.Provider>
  )

}

const useMoveTokensAppContext = () => {
  if (!MoveTokensAppContext) throw new Error('useMoveTokensAppContext must be used within a MoveTokensAppProvider')
  return useContext(MoveTokensAppContext)
}

export {MoveTokensAppProvider, useMoveTokensAppContext /* , MoveTokensAppContext, MoveTokensAppConsumer */ };