import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { /* useAccount , */ useNetwork, /* useBalance */ } from 'wagmi'
import { isChainSupported } from "~/utils/blockchainUtils";
import ProgressContainer from "./ProgressContainer";
import StepsContainer from "./StepsContainer";
import MainContentContainer from "./MainContentContainer";
import { tokenLists as tokensLists_TokenData } from '@utils/tokensLists';
// import { useMoveTokensAppContext } from "~/js/providers/MoveTokensAppProvider/MoveTokensAppContext";

// import { useRouteLoaderData } from "@remix-run/react";

export const MainContent = ( /* { } :IContentProps */ ) => {

    const { t } = useTranslation();
    const { chain } = useNetwork()

    // const { moveTokensAppData: {tokensLists/* : tokensListsAppContext */} } = useMoveTokensAppContext()

    // const { tokensLists: loaderTokensLists } = useRouteLoaderData("routes/moveTokens2._index");
    // const [tokensLists, setTokensLists] = useState<TTokensLists>(loaderTokensLists)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [tokensLists, setTokensLists] = useState<TTokensLists>(null)

    const [previousDisabled, setpreviousDisabled] = useState<boolean>(false);
    const [nextDisabled, setNextDisabled] = useState<boolean>(false);
    const [showProgressBar, setshowProgressBar] = useState<boolean>(false)
    const [progressBarPercentage, setprogressBarPercentage] = useState<number>(0)

    // const [tokensLists, setTokensLists] = useState<TTokensLists>(tokensListsAppContext)

    useEffect(() => {
      setTokensLists(tokensLists_TokenData)
    
    }, [tokensLists_TokenData])

    // useEffect( () => {
    //   console.debug(`MainContent.tsx useEffect`)
    //   if (tokensListsAppContext) {
    //     console.log('MainContent.tsx: useEffect: tokensLists=');
    //     console.dir(tokensListsAppContext);
    //     setTokensLists(tokensListsAppContext)
    //   } else {
    //     console.debug('MainContent.tsx: useEffect: tokensLists is undefined');
    //   }
    // }, [tokensListsAppContext] )
/*
    const [selectableTokensLists, setselectableTokensLists] = useState<TSelectableTokensLists>()

    useEffect( () => {
      console.debug(`MainContent.tsx useEffect`)
      if (tokensLists) {
        console.log('MainContent.tsx: useEffect: tokensLists=');
        console.dir(tokensLists);
      } else {
        console.debug('MainContent.tsx: useEffect: tokensLists is undefined');
      }

      // TODO: filter upon chain id
      const filteredSelectableTokensLists: TSelectableTokensLists = []
      tokensLists?.forEach( (tokensList: TTokensList) => {
        // console.dir(tokensList);
        if (tokensList && tokensList.tokens && tokensList.tokens.length > 0) {
          console.debug(`MainContent.tsx: useEffect: tokensList DEFINED && tokensList.tokens.length > 0`);
          if (tokensList.chains && tokensList.chains.length > 0 && tokensList.chains.includes((chain?.id ? chain?.id : -1))) {
            console.debug(`MainContent.tsx: useEffect: tokensList.chains DEFINED && tokensList.chains.length > 0 && tokensList.chains.includes(chain.id) (${chain?.id}))`);
            filteredSelectableTokensLists.push({ tokensList, selected: false }) // as TSelectableTokensList
          } else {
            console.debug(`MainContent.tsx: useEffect: tokensList.chains is undefined or tokensList.chains.length <= 0 , or tokensList.chains does not include chain.id (${chain?.id})})`);
          }
        } else {
          console.debug(`MainContent.tsx: useEffect: tokensList is undefined or tokensList.tokens.length <= 0`);
        }
      }) as TSelectableTokensLists

      console.log('MainContent.tsx: filteredSelectableTokensLists=');
      console.dir(filteredSelectableTokensLists);
      setselectableTokensLists(filteredSelectableTokensLists)
    }, [tokensLists] )
*/
    return (
        <>
          <div className="w-full flex flex-row z-0 m-0 p-1 " >
          {/* CONTENT ------------------- */}

            {/* <div className="w-full base-100 rounded-lg shadow-xl" > */}
            <div className="w-full base-100  " >

              { ! chain?.id
                ?
                <div className="w-full p-0 m-0  base-100 text-primary-content" >
                  {/* Please connect ... */}
                  <MainContentContainer>
                    {t('moveTokens.warnings.connectawallet')}
                  </MainContentContainer>
                </div>
                :
                ! isChainSupported(chain?.id)
                ?
                  <div className="w-full p-0 m-0  base-100 text-primary-content" >
                  {/* Unsupported chain ... */}
                    {t('moveTokens.warnings.wrongchain')}
                  </div>
                  :
                  <div>

                    <div className="w-full p-0 m-0 mb-4 base-100 text-primary-content" >
                        <ProgressContainer
                          previousDisabled={previousDisabled} nextDisabled={nextDisabled}
                          showProgressBar={showProgressBar} progressBarPercentage={progressBarPercentage}
                        />
                    </div>

                    <div className="w-full p-0 m-0 mt-1 base-100 text-primary-content" >
                      {/* <StepsContainer selectableTokensLists={selectableTokensLists} chainId={chain?.id} /> */}
                      <StepsContainer
                        tokensLists={tokensLists}
                        // chainId={chain?.id}
                        setpreviousDisabled={setpreviousDisabled} setNextDisabled={setNextDisabled}
                        setShowProgressBar={setshowProgressBar} setProgressBarPercentage={setprogressBarPercentage}
                      />
                    </div>

                  </div>

              }

            </div>
              {/* CONTENT ------------------- */}
          </div>
        </>
    );
};