// React
import { useCallback, useEffect, useState } from "react";
// Components
import ProgressContainer from "@Components/ProgressContainer";
import StepsContainer from "@Components/StepsContainer";
import MainContentContainer from "@Components/MainContentContainer";
// Utils
import { isChainSupported } from "@jsutils/blockchainUtils";
import { getTokenLists } from '@jsutils/tokensLists';
// Translation
import { useTranslation } from "react-i18next";
// Wagmi
import { useNetwork } from 'wagmi'

// ------------------------------

export const MainContent = ( ) => {

  const { t } = useTranslation();
  const { chain } = useNetwork()

  const [tokensLists, setTokensLists] = useState<TTokensLists>(null)
  const [previousDisabled, setpreviousDisabled] = useState<boolean>(false);
  const [nextDisabled, setNextDisabled] = useState<boolean>(false);

  const [isLoadingTokensLists, setisLoadingTokensLists] = useState<boolean>(false)
  const [isErrorTokensLists, setisErrorTokensLists] = useState(false)

  // const [showProgressBar, setshowProgressBar] = useState<boolean>(false)
  // const [progressBarPercentage, setprogressBarPercentage] = useState<number>(0)

  // ---

  const setStateLoadingTokensLists = useCallback( (isLoading:boolean) =>
    {
      setisLoadingTokensLists(isLoading)
    }, []
  )

  // ---

  const setStateIsErrorTokensLists = useCallback( (isError:boolean) =>
    {
      setisErrorTokensLists(isError)
    }, []
  )

  // ---

  useEffect(() =>
    {

      const initTokensLists = async () => {
        const tokenLists = await getTokenLists()
        setTokensLists(tokenLists) // Set inital token list data
      }

      try {
        setStateLoadingTokensLists(true)
        setStateIsErrorTokensLists(false)
        initTokensLists().
          then( () => {
            setStateLoadingTokensLists(false)
          }).
          catch( (error) => {
            console.error(`MainContent.tsx useEffect initTokensLists error: ${error}`);
            setStateIsErrorTokensLists(true)
            setStateLoadingTokensLists(false)
          })
      } catch (error) {
        setStateLoadingTokensLists(false)
        setisErrorTokensLists(true)
        console.error(`MainContent.tsx useEffect initTokensLists error: ${error}`);
      }
    },
    [setStateIsErrorTokensLists, setStateLoadingTokensLists]
  );

  // ---

  const clsParagraph = "text-base sm:text-lg md:text-xl font-semibold transition-all duration-300 ease-in-out"

  // -------------------

  return (
    <>
      <div className="w-full flex flex-row z-0 m-0 p-1 " >

        <div className="w-full base-100  " >

          { ! chain?.id
            ?
              /* Please connect ... */
              <div className="w-full p-0 m-0  base-100 text-primary-content" >
                <MainContentContainer>
                  <p className={"text-info "+clsParagraph}>{t('moveTokens.warnings.connectawallet')}</p>
                </MainContentContainer>
              </div>
              :
                ! isChainSupported(chain?.id)
                ?
                  /* Unsupported chain ... */
                  <div className="w-full p-0 m-0  base-100 text-primary-content" >
                    <MainContentContainer>
                      <p className={"text-warning "+clsParagraph}>{t('moveTokens.warnings.wrongchain')}</p>
                    </MainContentContainer>
                  </div>
                  :
                  <div>
                    <div className="w-full p-0 m-0 mb-1 base-100 text-primary-content" >
                        <ProgressContainer
                          previousDisabled={previousDisabled} nextDisabled={nextDisabled}
                          // showProgressBar={showProgressBar} progressBarPercentage={progressBarPercentage}
                        />
                    </div>
                    <div className="w-full p-0 m-0 mt-1 base-100 text-primary-content" >
                      <StepsContainer
                        tokensLists={tokensLists}
                        chainId={chain?.id}
                        setpreviousDisabled={setpreviousDisabled} setNextDisabled={setNextDisabled}
                        isLoadingTokensLists={isLoadingTokensLists} isErrorTokensLists={isErrorTokensLists}
                        // setShowProgressBar={setshowProgressBar} setProgressBarPercentage={setprogressBarPercentage}
                      />
                    </div>
                  </div>
          }

        </div>

      </div>
    </>
  );
};