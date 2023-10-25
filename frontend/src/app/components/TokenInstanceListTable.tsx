// React
import { useMemo } from "react";

// Components
import TokenInstanceList from "@Components/TokenInstanceList";

// Icons
import SortIcon from "@Components/SortIcon";

// Translation
import { useTranslation } from "react-i18next";

// ------------------------------

const TokenInstanceListTable = (
   {tokensInstances, // settokensInstances,
    accountAddress,
    // chainId,
    targetAddress,
    isError,
    tokensInstancesListTablePropsHandlers,
    }: ITokensInstancesListTableProps )  => {

  // console.log(`TokenInstanceListTable.tsx render chainId: ${chainId} accountAddress: ${accountAddress}`);

  const { t } = useTranslation()

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

  // ----------------------------

  // console.log(`TokenInstanceListTable.tsx render isError: ${isError} tokensInstances?.length ?=${tokensInstances?.length} (!isError && tokensInstances?.length)=${(!isError && tokensInstances?.length)} `);

  return (
    <>

      {/* <div className="w-full h-2 sticky top--200 bg-red-500 invisible" id="currenttop">
      </div> */}
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

              <>
                <p className="text-center text-sm sm:text-md md:text-lg font-medium bg-error text-error-content rounded-lg h-full">
                  {t("moveTokens.stepTwo.tokensTable.errorLoadingTokens")}
                </p>
              </>
              :
              <>
                <p className="text-center text-sm sm:text-md md:text-lg font-medium bg-info text-info-content rounded-lg h-full">
                  {t("moveTokens.stepTwo.tokensTable.empty")}
                </p>
              </>

        }

        </div>

      </div>

    </>
  );
  
} // TokenInstanceListTable

// ----------------------------

export default TokenInstanceListTable;