// React
import { useMemo } from "react";
// Components
import TokenInstanceList from "@Components/TokenInstanceList";
import SortIcon from "@Components/SortIcon";
// Icons
import { ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
// Translation
import { useTranslation } from "react-i18next";

// ------------------------------

const TokenInstanceListTable = (
   {tokensInstances, // settokensInstances,
    accountAddress,
    // chainId,
    targetAddress,
    isLoading, isError,
    tokensInstancesListTablePropsHandlers,
    }: ITokensInstancesListTableProps )  => {

  // ---

  const { t } = useTranslation()

  // const [showIsLoading, setshowIsLoading] = useState<boolean>(false);
  // const [showIsEmpty, setshowIsEmpty] = useState<boolean>(false);

  // ---
  
  const TokenInstanceListMemo = useMemo(
    () =>
      <TokenInstanceList
        tokensInstances={tokensInstances}
        // chainId={chainId}
        accountAddress={accountAddress}
        targetAddress={targetAddress}
        sortTokensInstances={tokensInstancesListTablePropsHandlers.sortHandlers.sortTokensInstances}
      />
    , [tokensInstances, accountAddress, targetAddress, tokensInstancesListTablePropsHandlers.sortHandlers.sortTokensInstances]
  );

  // ---

  const clsIcon = 'w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 stroke-2'

  // ----------------------------

  return (
    <div className="w-full">

      <div className="min-w-full rounded-lg border border-neutral my-2 transition-all" id="currenttop">

      { (!isError && tokensInstances?.length) ?

            <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content">

              <thead className="min-w-full text-neutral-content text-left">
                <tr className="bg-neutral text-xs sm:text-sm md:text-base font-semibold">
                  <th className="p-2 font-medium justify-center flex-none">
                    <div className="flex">
                      <SortIcon sortOrder={tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenDisplayId} changeSortFnCb={tokensInstancesListTablePropsHandlers.sortHandlers.sortByTokenDisplayId} />
                      {t("moveTokens.stepTwo.tokensTable.results.titles.tokenId")}
                    </div>
                  </th>
                  <th className="p-2 font-medium w-96 flex">
                    <div className="flex justify-left">
                      <SortIcon sortOrder={tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenName} changeSortFnCb={tokensInstancesListTablePropsHandlers.sortHandlers.sortByTokenName} />
                      {t("moveTokens.stepTwo.tokensTable.results.titles.tokenName")}
                    </div>
                  </th>
                  <th className="p-2 font-medium flex-none">
                    <div className="flex justify-end grow-0">
                      <SortIcon sortOrder={tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenBalance} changeSortFnCb={tokensInstancesListTablePropsHandlers.sortHandlers.sortByTokenBalance} />
                      {t("moveTokens.stepTwo.tokensTable.results.titles.tokenBalance")}
                    </div>
                  </th>
                  <th className="p-2 font-medium flex-none">
                    {t("moveTokens.stepTwo.tokensTable.results.titles.tokenInfo")}
                  </th>
                </tr>
              </thead>

              <tbody className="min-w-full mt-2 text-xs sm:text-sm md:text-base">
                { TokenInstanceListMemo }
              </tbody>

            </table>

          :

          isError ?

              <div className="flex justify-center text-error font-semibold pt-2 text-md sm:text-base md:text-xl">
                <div className="pt-0 pr-3 ">
                {t("moveTokens.stepAny.tokensTable.errorLoadingTokens")}
                </div>
                <div className="pt-0">
                  <ExclamationCircleIcon className={clsIcon} />
                </div>
              </div>
            :
              <>
                {
                  isLoading ?

                    <div className="flex justify-center text-info font-semibold pt-2 text-md sm:text-base md:text-xl">
                      <div className="pt-0 pr-3 ">
                        {t("moveTokens.stepAny.tokensTable.loadingTokens")}
                      </div>
                      <div className="loading loading-dots loading-sm md:loading-md lg:loading-lg"/>
                    </div>

                  :
                    <div className="flex justify-center text-info font-semibold pt-2 text-md sm:text-base md:text-xl">
                      <div className="pt-0 pr-3 ">
                        {t("moveTokens.stepAny.tokensTable.noTokens")}
                      </div>
                      <div className="pt-0">
                        <InformationCircleIcon className={clsIcon} />
                      </div>
                    </div>
                }
              </>
      }

      </div>
    </div>
  );
} // TokenInstanceListTable

// ----------------------------

export default TokenInstanceListTable;