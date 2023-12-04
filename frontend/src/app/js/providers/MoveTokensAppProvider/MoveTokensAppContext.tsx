import { createContext, useContext, useMemo, useState } from 'react'

const initialMoveTokensAppData: TMoveTokensAppDataContext = {
  step: 0,
  minStep: 0,
  maxStep: 3,
  tokensLists: null,
}

const initialMoveTokensAppDataHandlers: TMoveTokensAppDataHandlersContext = {
  nextStep: () => { },
  prevStep: () => { },
  resetToInitialStep: () => { },
}

const MoveTokensAppContext = createContext<TMoveTokensAppContext>(
  {
    // Initial context
    moveTokensAppData: initialMoveTokensAppData,
    moveTokensAppDataHandlers: initialMoveTokensAppDataHandlers
  })


MoveTokensAppContext.displayName = 'App_Context'

const MoveTokensAppProvider = ({ children }: any) => {

  const [moveTokensAppData, setmoveTokensAppData] = useState<TMoveTokensAppDataContext>(initialMoveTokensAppData);

  const moveTokensDataHandlers = useMemo(
    () => ({
      nextStep: () => {
        setmoveTokensAppData((prevAppData) => {
          return {
            ...prevAppData,
            step: (prevAppData.step < prevAppData.maxStep ? prevAppData.step + 1 : prevAppData.step),
          }
        })
      },
      prevStep: () => {
        setmoveTokensAppData((prevAppData) => {
          return {
            ...prevAppData,
            step: (prevAppData.step > prevAppData.minStep ? prevAppData.step - 1 : prevAppData.step),
          }
        })
      },
      resetToInitialStep: () => {
        setmoveTokensAppData((prevAppData) => {
          return {
            ...prevAppData,
            step: prevAppData.minStep,
          }
        })
      },
    }),
    []
  )

  return (
    <MoveTokensAppContext.Provider value={{ moveTokensAppData: moveTokensAppData, moveTokensAppDataHandlers: moveTokensDataHandlers }}>
      {children}
    </MoveTokensAppContext.Provider>
  )

}

const useMoveTokensAppContext = () => {
  if (!MoveTokensAppContext) throw new Error('useMoveTokensAppContext must be used within a MoveTokensAppProvider')
  return useContext(MoveTokensAppContext)
}

export { MoveTokensAppProvider, useMoveTokensAppContext };