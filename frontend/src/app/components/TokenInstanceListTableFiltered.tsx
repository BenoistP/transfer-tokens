// React
import { useEffect, useMemo, useState } from "react";

// Components
import TokenInstanceListFiltered from "@Components/TokenInstanceListFiltered";
import SortIcon from "@Components/SortIcon";

// Translation
import { useTranslation } from "react-i18next";

// Icons
import { ArrowPathRoundedSquareIcon, FunnelIcon } from '@heroicons/react/24/solid'

const TokenInstanceListTableFiltered = (
    { tokensInstances,
      accountAddress,
      // chainId, // , transferTokens,
      enableCheckboxes,
      targetAddress,
      isError,
      tokensInstancesListTablePropsHandlers }: ITokensListTableFilteredProps )  =>
  {

  // console.log(`TokenInstanceListTableFiltered.tsx render chainId: ${chainId} accountAddress: ${accountAddress}`);
  // console.dir(tokensInstances)

  const { t } = useTranslation()
  const [selectAllDisabled, setSelectAllDisabled] = useState(false)

  // ---

  useEffect( () =>
    {
      // console.debug(`TokenInstanceListTableFiltered.tsx useEffect [tokensInstances] tokensInstances?.length: ${tokensInstances?.length}`)
      // setSelectAllDisabled(!tokensInstances?.length)
      if (tokensInstances?.length) {
        const noneSelectable = tokensInstances.every( (tokensInstance) => {
          const notSelectable = ( !tokensInstance.selectable || !tokensInstance.userData[accountAddress as any]?.canTransfer || !tokensInstance.userData[targetAddress as any]?.canTransfer )
          // console.debug(`selectable :${tokensInstance.selectable} accountAddress: ${tokensInstance.userData[accountAddress as any]?.canTransfer} targetAddress: ${tokensInstance.userData[targetAddress as any]?.canTransfer} notSelectable: ${notSelectable}`)
          return ( notSelectable )
        })
        // console.debug(`TokenInstanceListTableFiltered.tsx useEffect [tokensInstances] noneSelectable: ${noneSelectable}`)
        setSelectAllDisabled(noneSelectable)

      } else {
        setSelectAllDisabled(true)
      }
    },
    [tokensInstances, accountAddress, targetAddress]
  )

  // ---

  const TokenInstanceListFilteredMemo = useMemo(
    () =>
      <TokenInstanceListFiltered
        tokensInstances={tokensInstances}
        // chainId={chainId}
        accountAddress={accountAddress}
        // updateCheckboxStatus={enableCheckboxes?updateCheckboxStatus:null}
        targetAddress={targetAddress}
        tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
      />,
      [tokensInstances, accountAddress, targetAddress, tokensInstancesListTablePropsHandlers]
  );

  // ---

  const countSelected = 
  // useCallback(
    (tokensInstances:TTokensInstances) =>
    // const countSelected =  (tokensInstances:TTokensInstances) =>
    {
      let selectedCount = 0;
      try {
        // console.debug(`TokenInstanceListTableFiltered.tsx countSelected tokensInstances.length: ${tokensInstances?.length} accountAddress: ${accountAddress}`);
        if (tokensInstances && tokensInstances.length>0 && accountAddress && typeof accountAddress == "string") {
          selectedCount = tokensInstances.reduce( (selectedCount,tokensInstance) => selectedCount + ((tokensInstance.selected==true)?1:0),0 )
        }
        // console.debug(`TokenInstanceListTableFiltered.tsx countSelected = ${selectedCount}`);
        return selectedCount;
      } catch (error) {
        console.error(`countSelected error: ${error}`);
        return selectedCount;
      }
    }
  //   ,
  //   [/* accountAddress, */ tokensInstances]
  // ); // countSelected

  // ---

  const countDisplayed =
  // useCallback(
    (tokensInstances:TTokensInstances) =>
    {
      let displayedCount = 0;
      try {
        if (tokensInstances && tokensInstances.length>0) {
          displayedCount = tokensInstances.filter(tokensInstancesListTablePropsHandlers.filterHandlers.filterTokenInstance).length
        }
        // console.debug(`TokenInstanceListTableFiltered.tsx countDisplayed = ${displayedCount}`);
        return displayedCount;
      } catch (error) {
        console.error(`countDisplayed error: ${error}`);
        return displayedCount;
      }
    }
  //   ,
  //   [/* accountAddress, */ tokensInstances]
  // ); // countDisplayed

  // ---

  const clsIconBigInvert = "w-6 h-6 sm:w-10 sm:h-10 -ml-1 -mt-1 sm:-mt-2 md:-mt-1 scale-75 hover:scale-85 md:scale-100 md:hover:scale-100 transition-all duration-300 ease-in-out " + ((tokensInstances?.length||0) === 0? "fill-neutral-content opacity-70 cursor-not-allowed" : "fill-base-content opacity-40 cursor-pointer") ;
  const clsIcon = 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2' 

  // ---

  return (
      <>

      <div className="w-full">

        <div className="min-w-full rounded-lg border border-neutral">

          <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content transition-all">

            <thead className="min-w-full bg-base-200 text-left">
              <tr className=" text-xs sm:text-sm md:text-base font-semibold">
                <th className="p-2 font-medium">{t("moveTokens.stepTwo.tokensTable.search.name")}</th>
                <th className="p-2 font-medium">{t("moveTokens.stepTwo.tokensTable.search.balance")}</th>
                <th className="p-2 font-medium">{t("moveTokens.stepTwo.tokensTable.search.balanceGt0")}</th>
                <th className="p-2 font-medium">{t("moveTokens.stepTwo.tokensTable.search.selectAll")}</th>
                <th className="p-2 font-medium">{t("moveTokens.stepTwo.tokensTable.search.invertSelection")}</th>
              </tr>
            </thead>
            <tbody className="min-w-full text-xs sm:text-sm md:text-base">
              <tr className="bg-base-300">
                <td className="p-2">
                  <input type="text" value={tokensInstancesListTablePropsHandlers.filterStates.name} onChange={(e)=>{tokensInstancesListTablePropsHandlers.filterHandlers.tokenInstanceFilterParamsUpdaters.updateNameFilter(e)}}
                    className="input input-bordered input-xs text-xs sm:text-sm sm:input-sm md:text-base md:input-md w-full" placeholder="..." >
                  </input>
                </td>
                <td className="p-2">
                  <input type="number"
                    value={tokensInstancesListTablePropsHandlers.filterStates.balance.valueOf()} onChange={(e)=>{tokensInstancesListTablePropsHandlers.filterHandlers.tokenInstanceFilterParamsUpdaters.updateBalanceFilter(e)}}
                    step={0.001} min={0} max={10000000000000}
                    className="input input-bordered input-xs text-xs sm:text-sm sm:input-sm md:text-base md:input-md" placeholder="...">
                  </input>
                </td>
                <td className="p-2">
                  <label>
                    {/* Balance greater than 0 filter checkbox */}
                    <input type="checkbox" className="checkbox checkbox-xs sm:checkbox-md md:checkbox-lg"
                      checked={tokensInstancesListTablePropsHandlers.filterStates.balanceGt0} onChange={()=>{tokensInstancesListTablePropsHandlers.filterHandlers.tokenInstanceFilterParamsUpdaters.switchBalanceGt0Filter()}}
                      disabled={!tokensInstances?.length}
                      />
                  </label>
                </td>
                <td className="p-2">
                  <label>
                    {/* Select ALL checkbox */}
                    <input type="checkbox" className="checkbox checkbox-xs sm:checkbox-md md:checkbox-lg"
                      checked={tokensInstancesListTablePropsHandlers.selectStates.selectAll}
                      onChange={(/* e */)=>{tokensInstancesListTablePropsHandlers.updateHandlers.handleCheckSelectAll()}}
                      disabled={selectAllDisabled}
                      />
                  </label>
                </td>
                <td className="p-2">
                  <label>
                    {/* INVERT ALL checkbox */}
                    <ArrowPathRoundedSquareIcon className={clsIconBigInvert} onClick={tokensInstancesListTablePropsHandlers.updateHandlers.handleInvertAllChecks} />
                  </label>
                </td>

              </tr>
            </tbody>
          </table> {/* MAIN search PARAMETERS table */}


          <div className="px-2">
            <div className="collapse collapse-arrow border border-neutral bg-base-100">
              <input type="checkbox" /> 
              <div className="collapse-title text-xs sm:text-sm md:text-base font-light justify-center flex">
                {t("moveTokens.stepTwo.tokensTable.search.additional.title")}
                  <FunnelIcon className={clsIcon} />
                {/* {t("moveTokens.stepTwo.tokensTable.search.additional.title")}  */}
              </div>
              <div className="collapse-content"> 

                <div className="divider m-0 p-0"></div>
                <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content transition-all">

                  <thead className="min-w-full bg-base-200 text-left">
                    <tr className=" text-xs sm:text-sm md:text-base font-semibold">
                      <th className="p-2 font-medium">{t("moveTokens.stepTwo.tokensTable.search.additional.address")}</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody className="min-w-full text-xs sm:text-sm md:text-base">
                    <tr className="bg-base-300">
                      <td className="p-2">
                        <input type="text" value={tokensInstancesListTablePropsHandlers.filterStates.address} onChange={(e)=>{tokensInstancesListTablePropsHandlers.filterHandlers.tokenInstanceFilterParamsUpdaters.updateAddressFilter(e)}}
                        className="input input-bordered input-xs text-xs sm:text-sm sm:input-sm md:text-base md:input-md w-full" placeholder="..." >
                        </input>
                      </td>
                      <td className="p-2"></td>
                    </tr>
                  </tbody>
                </table> {/* Additional seach params table */}

              </div>
            </div> {/* collapse */}
          </div>

          <div className="divider m-0 p-0"></div>

          <div className="flex justify-center items-center mx-2">

            <div className={"flex-grow text-center " + (countSelected(tokensInstances)?"font-semibold":"font-normal")}>
              {t("moveTokens.stepTwo.tokensTable.results.found.selected")}: {countSelected(tokensInstances)}
            </div>

            <div className="flex-grow text-center">
              {t("moveTokens.stepTwo.tokensTable.results.found.visible")}: {countDisplayed(tokensInstances)}
            </div>

            <div className="flex-grow text-center">
              {t("moveTokens.stepTwo.tokensTable.results.found.hidden")}: { (tokensInstances? (tokensInstances?.length||0)-countDisplayed(tokensInstances) : 0 ) }
            </div>

            <div className="flex-grow text-center">
              {t("moveTokens.stepTwo.tokensTable.results.found.total")}:  {tokensInstances?.length||0}
            </div>

          </div> {/* Tokens list summary : selected/total/... */}

        </div> {/* Search parameters */}

        <div className="min-w-full rounded-lg border border-neutral mt-2 transition-all">

          { (!isError && tokensInstances?.length) ?

              <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content">

                <thead className="min-w-full text-neutral-content text-left">
                  <tr className="bg-neutral text-xs sm:text-sm md:text-base font-semibold">
                    <th className="p-2 font-medium justify-center flex-none">
                      <div className="flex  w-min-full">
                        <SortIcon sortOrder={tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenDisplayId} changeSortFnCb={tokensInstancesListTablePropsHandlers.sortHandlers.sortByTokenDisplayId} />
                        {t("moveTokens.stepTwo.tokensTable.results.titles.tokenId")}
                      </div>
                    </th>
                    <th className="p-2 font-medium  flex">
                      <div className="flex justify-left w-min-full">
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
                    <th className="p-2 font-medium">
                      {enableCheckboxes?t("moveTokens.stepTwo.tokensTable.results.titles.selected"):""}
                    </th>
                    <th className="p-2 font-medium">
                      {t("moveTokens.stepTwo.tokensTable.results.titles.tokenAmount")}
                    </th>
                    <th className="p-2 font-medium flex-none">
                      {t("moveTokens.stepTwo.tokensTable.results.titles.tokenInfo")}
                    </th>
                  </tr>
                </thead>


                <tbody className="min-w-full mt-2 text-xs sm:text-sm md:text-base">
                  { TokenInstanceListFilteredMemo }
                </tbody>

              </table>
            :
              isError ?
                <>
                  <p className="text-center text-sm sm:text-md md:text-lg font-medium bg-error text-error-content rounded-lg">
                    {t("moveTokens.stepTwo.tokensTable.errorLoadingTokens")}
                  </p>
                </>
                :
                <>
                  <p className="text-center text-sm sm:text-md md:text-lg font-medium bg-info text-info-content rounded-lg">
                    {t("moveTokens.stepTwo.tokensTable.empty")}
                  </p>
                </>
          }

        </div> {/* Tokens list */}

      </div>

    </>
  );
  
// }
}
// );

export default TokenInstanceListTableFiltered;