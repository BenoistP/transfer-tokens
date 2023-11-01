// React
import { useEffect, useState } from "react";

// Components
import ProgressContainer from "@Components/ProgressContainer";
import StepsContainer from "@Components/StepsContainer";
import MainContentContainer from "@Components/MainContentContainer";

import { isChainSupported } from "@jsutils/blockchainUtils";
import { /* tokenListsData */getTokenLists } from '@jsutils/tokensLists';

// Translation
import { useTranslation } from "react-i18next";

import { useNetwork } from 'wagmi'

// ------------------------------

export const MainContent = ( ) => {

    const { t } = useTranslation();
    const { chain } = useNetwork()

    const [tokensLists, setTokensLists] = useState<TTokensLists>(null)
    const [previousDisabled, setpreviousDisabled] = useState<boolean>(false);
    const [nextDisabled, setNextDisabled] = useState<boolean>(false);
    // const [showProgressBar, setshowProgressBar] = useState<boolean>(false)
    // const [progressBarPercentage, setprogressBarPercentage] = useState<number>(0)

    // ---

    useEffect(() => {
      const initTokensLists = async () => {
        const tokenLists = await getTokenLists()
        // console.dir(tokenLists)
        setTokensLists(tokenLists) // Set inital token list data
      }
      // console.dir(tokenListsData)
      // setTokensLists(tokenListsData) // Set inital token list data
      initTokensLists()
    }, [])

    // -------------------

    return (
        <>
          <div className="w-full flex flex-row z-0 m-0 p-1 " >

            <div className="w-full base-100  " >

              { ! chain?.id
                ?
                <div className="w-full p-0 m-0  base-100 text-primary-content" >
                  <MainContentContainer>
                    {t('moveTokens.warnings.connectawallet') /* Please connect ... */}
                  </MainContentContainer>
                </div>
                :
                ! isChainSupported(chain?.id)
                ?
                  <div className="w-full p-0 m-0  base-100 text-primary-content" >
                    {t('moveTokens.warnings.wrongchain') /* Unsupported chain ... */}
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