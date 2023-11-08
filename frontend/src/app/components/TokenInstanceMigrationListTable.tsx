// React
import { useMemo } from "react";
// Components
import TokenInstanceMigrationList from "@Components/TokenInstanceMigrationList";
import SortIcon from "@Components/SortIcon";
// Icons
import { ExclamationCircleIcon } from '@heroicons/react/24/solid'
// Translation
import { useTranslation } from "react-i18next";
// Styles
import { clsIconStatusSize } from "@uiconsts/twDaisyUiStyles";

// ------------------------------

const TokenInstanceMigrationListTable = (
   {tokensInstances, // settokensInstances,
    accountAddress,
    // chainId,
    targetAddress,
    // isLoading,
    // isError,
    tokensInstancesListTablePropsHandlers,
    }: ITokenInstancesMigrationListTableProps )  => {

  // ---

  const { t } = useTranslation()

  // const [showIsLoading, setshowIsLoading] = useState<boolean>(false);
  // const [showIsEmpty, setshowIsEmpty] = useState<boolean>(false);

  // ---
  
  const TokenInstanceMigrationListMemo = useMemo(
    () =>
      <TokenInstanceMigrationList
        tokensInstances={tokensInstances}
        // chainId={chainId}
        accountAddress={accountAddress}
        targetAddress={targetAddress}
        sortTokensInstances={tokensInstancesListTablePropsHandlers.sortHandlers.sortTokensInstances}
      />
    , [tokensInstances, accountAddress, targetAddress, tokensInstancesListTablePropsHandlers.sortHandlers.sortTokensInstances]
  );

  // ---

  // const clsStatus = 'flex justify-center font-semibold pt-2 pb-3 text-md sm:text-base md:text-xl'

  // ----------------------------

  return (
    <div className="w-full">

      <div className="min-w-full rounded-lg border border-neutral my-2 transition-all" id="currenttop">

      { (tokensInstances?.length) ?

            <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content">

              <thead className="min-w-full text-neutral-content text-left">
                <tr className="bg-neutral text-xs sm:text-sm md:text-base font-semibold">
                  <th className="p-2 font-medium justify-center flex-none">
                    <div className="flex">
                      <SortIcon sortOrder={tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenDisplayId} changeSortFnCb={tokensInstancesListTablePropsHandlers.sortHandlers.sortByTokenDisplayId} />
                      {t("moveTokens.stepAny.tokensTable.results.titles.tokenId")}
                    </div>
                  </th>
                  <th className="p-2 font-medium w-96 flex">
                    <div className="flex justify-left">
                      <SortIcon sortOrder={tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenName} changeSortFnCb={tokensInstancesListTablePropsHandlers.sortHandlers.sortByTokenName} />
                      {t("moveTokens.stepAny.tokensTable.results.titles.tokenName")}
                    </div>
                  </th>
                  <th className="p-2 font-medium flex-none">
                    <div className="flex justify-end grow-0">
                      <SortIcon sortOrder={tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenBalance} changeSortFnCb={tokensInstancesListTablePropsHandlers.sortHandlers.sortByTokenBalance} />
                      {t("moveTokens.stepAny.tokensTable.results.titles.tokenBalance")}
                    </div>
                  </th>
                  <th className="p-2 font-medium flex-none">
                    {t("moveTokens.stepAny.tokensTable.results.titles.tokenInfo")}
                  </th>
                </tr>
              </thead>

              <tbody className="min-w-full mt-2 text-xs sm:text-sm md:text-base">
                { TokenInstanceMigrationListMemo }
              </tbody>

            </table>

          :
/*             
              <div className="w-full p-0 m-0 base-100 text-primary-content" >
                <div className="flex flex-col justify-center items-center">
                  <div className="flex flex-col justify-center items-center">
                    <div className="flex flex-row justify-center items-center">
                      {<ExclamationCircleIcon className={clsIconStatusSize} />}
                      <p className="text-sm sm:text-base md:text-lg overflow-hidden text-center text-warning">
                        {t('moveTokens.warnings.nofoundtokens')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
 */
              <div className="flex justify-center font-semibold pt-2 text-md sm:text-base md:text-xl text-warning pb-2">
                <div className="pt-0">
                  <ExclamationCircleIcon className={clsIconStatusSize} />
                </div>
                <div className="pt-0 pr-3 ">
                  {t("moveTokens.stepThree.tokensMigrationListTable.noTokens")}
                </div>
              </div>
      }

      </div>
    </div>
  );
} // TokenInstanceMigrationListTable

// ----------------------------

export default TokenInstanceMigrationListTable;