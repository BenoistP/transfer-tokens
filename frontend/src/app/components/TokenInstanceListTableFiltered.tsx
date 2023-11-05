// React
import { useEffect, useMemo, useState } from "react";
// Components
import TokenInstanceListFiltered from "@Components/TokenInstanceListFiltered";
import SortIcon from "@Components/SortIcon";
// Translation
import { useTranslation } from "react-i18next";
// Icons
import { ArrowPathRoundedSquareIcon, FunnelIcon, ExclamationCircleIcon, InformationCircleIcon, BackspaceIcon } from '@heroicons/react/24/solid'
// Styles
import { clsLoadingTokenLists, clsIconStatusSize, clsIconMedium } from "@uiconsts/twDaisyUiStyles";

const TokenInstanceListTableFiltered = (
    { tokensInstances,
      accountAddress,
      // chainId, // , transferTokens,
      enableCheckboxes,
      targetAddress,
      // isError,
      isLoadingTokensInstances, isErrorTokensInstances,
      enableEditable,
      tokensInstancesListTablePropsHandlers }: ITokensListTableFilteredProps )  =>
  {

  // console.log(`TokenInstanceListTableFiltered.tsx render chainId: accountAddress:${accountAddress} targetAddress=${targetAddress} tokensInstances=`);
  // console.dir(tokensInstances)

  const { t } = useTranslation()
  const [selectAllDisabled, setSelectAllDisabled] = useState(false)

  // ---

  useEffect( () =>
    {
      // console.debug(`TokenInstanceListTableFiltered.tsx useEffect [tokensInstances] tokensInstances?.length: ${tokensInstances?.length}`)
      // setSelectAllDisabled(!tokensInstances?.length)
      if (tokensInstances?.length && enableEditable) {
        const noneSelectable = tokensInstances.every( (tokenInstance) => {
          // const notSelectable = ( !tokenInstance.selectable || !tokenInstance.userData[accountAddress as any]?.canTransfer || !tokenInstance.userData[targetAddress as any]?.canTransfer )
          // console.debug(`selectable :${tokenInstance.selectable} accountAddress: ${tokenInstance.userData[accountAddress as any]?.canTransfer} targetAddress: ${tokenInstance.userData[targetAddress as any]?.canTransfer} notSelectable: ${notSelectable}`)
          // return ( notSelectable )
          return !tokenInstance.selectable
        })
        // console.debug(`TokenInstanceListTableFiltered.tsx useEffect [tokenInstances] noneSelectable: ${noneSelectable}`)
        setSelectAllDisabled(noneSelectable)
      } else {
        setSelectAllDisabled(true)
      }
    },
    [tokensInstances, accountAddress, targetAddress, enableEditable]
  )

  // ---

  useEffect( () =>
    {
      // console.debug(`TokenInstanceListTableFiltered.tsx useEffect [tokensInstances] tokensInstances?.length: ${tokensInstances?.length}`)
      // setSelectAllDisabled(!tokensInstances?.length)
      if (selectAllDisabled && tokensInstancesListTablePropsHandlers.selectStates.selectAll) {
        tokensInstancesListTablePropsHandlers.updateHandlers.handleCheckSelectAll()
        // tokensInstancesListTablePropsHandlers.updateHandlers.handleUnselectAll()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectAllDisabled, tokensInstancesListTablePropsHandlers.selectStates, tokensInstancesListTablePropsHandlers.updateHandlers.handleCheckSelectAll]
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
        enableEditable={enableEditable}
      />,
      [tokensInstances, accountAddress, targetAddress, tokensInstancesListTablePropsHandlers, enableEditable ]
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

  const clsIconBig = "w-6 h-6 sm:w-10 sm:h-10"
  const clsIconBigInvert = clsIconBig + " -ml-1 -mt-1 sm:-mt-2 md:-mt-1 scale-75 hover:scale-85 md:scale-100 md:hover:scale-100 transition-all duration-300 ease-in-out " + ( selectAllDisabled ? "fill-neutral-content opacity-70 cursor-not-allowed" : "fill-base-content opacity-40 cursor-pointer") ;
  // const clsIcon = 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2' 

  const clsStatus = "flex justify-center font-semibold pt-2 text-md sm:text-base md:text-xl" // 'flex justify-center font-semibold pt-2 pb-3 text-md sm:text-base md:text-xl'

  // ---

  return (
      <>

      <div className="w-full">

        <div className="min-w-full rounded-lg border border-neutral">

          <div className="flex min-w-full px-1">

            <div className="flex w-3/4 rounded-lg border border-neutral m-2">

              <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content transition-all">

                <thead className="min-w-full bg-base-200 text-left">
                  <tr className=" text-xs sm:text-sm md:text-base font-semibold">
                    <th className="p-2 font-medium">{t("moveTokens.stepAny.tokensTable.search.name")}</th>
                    <th className="p-2 font-medium">{t("moveTokens.stepAny.tokensTable.search.balance")}</th>
                    <th className="p-2 font-medium">{t("moveTokens.stepAny.tokensTable.search.balanceGt0")}</th>
                    <th className="p-2 font-medium">{t("moveTokens.stepAny.tokensTable.search.clear")}</th>
                  </tr>
                </thead>
                <tbody className="min-w-full text-xs sm:text-sm md:text-base">
                  <tr className="bg-base-300">
                    <td className="p-2">
                      <input className="input input-bordered input-xs text-xs sm:text-sm sm:input-sm md:text-base md:input-md w-full"
                        type="text"
                        value={tokensInstancesListTablePropsHandlers.filterStates.name}
                        onChange={(e)=>{tokensInstancesListTablePropsHandlers.filterHandlers.tokenInstanceFilterParamsUpdaters.updateNameFilter(e)}}
                        placeholder="..." spellCheck="false" >
                      </input>
                    </td>
                    <td className="p-2">
                      <input className="input input-bordered input-xs text-xs sm:text-sm sm:input-sm md:text-base md:input-md"
                        type="number"
                        value={tokensInstancesListTablePropsHandlers.filterStates.balance.valueOf()}
                        onChange={(e)=>{tokensInstancesListTablePropsHandlers.filterHandlers.tokenInstanceFilterParamsUpdaters.updateBalanceFilter(e)}}
                        step={0.001} min={0} max={10000000000000}
                        placeholder="...">
                      </input>
                    </td>
                    <td className="p-2">
                      <label>
                        {/* Balance greater than 0 filter checkbox */}
                        <input className="checkbox checkbox-xs sm:checkbox-md md:checkbox-lg"
                          type="checkbox"
                          checked={tokensInstancesListTablePropsHandlers.filterStates.balanceGt0} onChange={()=>{tokensInstancesListTablePropsHandlers.filterHandlers.tokenInstanceFilterParamsUpdaters.switchBalanceGt0Filter()}}
                          disabled={!tokensInstances?.length}
                          />
                      </label>
                    </td>
                    <td className="p-2 pt-1 md:pt-0">
                      <label>
                        {/* Clear filters */}
                        <BackspaceIcon className={clsIconBig} onClick={()=>{tokensInstancesListTablePropsHandlers.filterHandlers.tokenInstanceFilterParamsUpdaters.clearAllFilters()}} />
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table> {/* MAIN search PARAMETERS table */}
            </div>

            <div className="flex w-1/4 rounded-lg border border-neutral m-2 ml-0">

              <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content transition-all">

                <thead className="min-w-full bg-base-200 text-left">
                  <tr className=" text-xs sm:text-sm md:text-base font-semibold">
                    <th className="p-2 font-medium">{t("moveTokens.stepAny.tokensTable.select.selectAll")}</th>
                    <th className="p-2 font-medium">{t("moveTokens.stepAny.tokensTable.select.invertSelection")}</th>
                  </tr>
                </thead>
                <tbody className="min-w-full text-xs sm:text-sm md:text-base">
                  <tr className="bg-base-300">
                    <td className="p-2">
                      <label>
                        {/* Select ALL checkbox */}
                        <input className="checkbox checkbox-xs sm:checkbox-md md:checkbox-lg"
                          type="checkbox"
                          checked={tokensInstancesListTablePropsHandlers.selectStates.selectAll}
                          onChange={()=>{tokensInstancesListTablePropsHandlers.updateHandlers.handleCheckSelectAll()}}
                          disabled={selectAllDisabled}
                          />
                      </label>
                    </td>
                    <td className="p-2">
                      <label>
                        {/* INVERT ALL checkbox */}
                        <ArrowPathRoundedSquareIcon className={clsIconBigInvert} onClick={ ()=>{ if (!selectAllDisabled) {tokensInstancesListTablePropsHandlers.updateHandlers.handleInvertAllChecks()} } } />
                      </label>
                    </td>

                  </tr>
                </tbody>
              </table> {/* SELECT table */}

            </div>

          </div>

          <div className="px-2 pt-1">
            <div className="collapse collapse-arrow border border-neutral bg-base-100">
              <input type="checkbox" /> 
              <div className="collapse-title text-xs sm:text-sm md:text-base font-light justify-center flex">
                {t("moveTokens.stepAny.tokensTable.search.additional.title")}
                  <FunnelIcon className={clsIconMedium} />
                {/* {t("moveTokens.stepAny.tokensTable.search.additional.title")}  */}
              </div>
              <div className="collapse-content"> 

                <div className="divider m-0 p-0"></div>
                <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content transition-all">

                  <thead className="min-w-full bg-base-200 text-left">
                    <tr className=" text-xs sm:text-sm md:text-base font-semibold">
                      <th className="p-2 font-medium">{t("moveTokens.stepAny.tokensTable.search.additional.address")}</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody className="min-w-full text-xs sm:text-sm md:text-base">
                    <tr className="bg-base-300">
                      <td className="p-2">
                        <input type="text" value={tokensInstancesListTablePropsHandlers.filterStates.address} onChange={(e)=>{tokensInstancesListTablePropsHandlers.filterHandlers.tokenInstanceFilterParamsUpdaters.updateAddressFilter(e)}}
                        className="input input-bordered input-xs text-xs sm:text-sm sm:input-sm md:text-base md:input-md w-full" placeholder={t("moveTokens.stepAny.address.placeholder")} >
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
              {t("moveTokens.stepAny.tokensTable.results.found.selected")}: {countSelected(tokensInstances)}
            </div>

            <div className="flex-grow text-center">
              {t("moveTokens.stepAny.tokensTable.results.found.visible")}: {countDisplayed(tokensInstances)}
            </div>

            <div className="flex-grow text-center">
              {t("moveTokens.stepAny.tokensTable.results.found.hidden")}: { (tokensInstances? (tokensInstances?.length||0)-countDisplayed(tokensInstances) : 0 ) }
            </div>

            <div className="flex-grow text-center">
              {t("moveTokens.stepAny.tokensTable.results.found.total")}:  {tokensInstances?.length||0}
            </div>

          </div> {/* Tokens list summary : selected/total/... */}

        </div> {/* Search parameters */}

        <div className="min-w-full rounded-lg border border-neutral mt-2 transition-all">

          { (!isErrorTokensInstances && tokensInstances?.length) ?

              <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content">

                <thead className="min-w-full text-neutral-content text-left">
                  <tr className="bg-neutral text-xs sm:text-sm md:text-base font-semibold">
                    <th className="p-2 font-medium justify-center flex-none">
                      <div className="flex  w-min-full">
                        <SortIcon sortOrder={tokensInstancesListTablePropsHandlers.sortStates.sortOrderTokenDisplayId} changeSortFnCb={tokensInstancesListTablePropsHandlers.sortHandlers.sortByTokenDisplayId} />
                        {t("moveTokens.stepAny.tokensTable.results.titles.tokenId")}
                      </div>
                    </th>
                    <th className="p-2 font-medium  flex">
                      <div className="flex justify-left w-min-full">
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
                    { enableEditable
                      &&
                    <>
                      <th className="p-2 font-medium">
                        {enableCheckboxes?t("moveTokens.stepAny.tokensTable.results.titles.selected"):""}
                      </th>
                      <th className="p-2 font-medium">
                        {t("moveTokens.stepAny.tokensTable.results.titles.tokenAmount")}
                      </th>
                    </>
                    }
                    
                    <th className="p-2 font-medium flex-none">
                      {t("moveTokens.stepAny.tokensTable.results.titles.tokenInfo")}
                    </th>
                  </tr>
                </thead>


                <tbody className="min-w-full mt-2 text-xs sm:text-sm md:text-base">
                  { TokenInstanceListFilteredMemo }
                </tbody>

              </table>
            :
              isErrorTokensInstances ?
                  <div className={clsStatus+" text-error"}>
                    <div className="pt-0">
                      <ExclamationCircleIcon className={clsIconStatusSize} />
                    </div>
                    <div className="pt-0 pr-3 ">
                      {t("moveTokens.stepAny.tokensTable.errorLoadingTokens")}
                    </div>
                  </div>
                :
                  <>
                  {
                    isLoadingTokensInstances ?
                      <div className={clsStatus+" text-info"}>
                        <div className="pt-0">
                          <InformationCircleIcon className={clsIconStatusSize} />
                        </div>
                        <div className="pt-0 pr-3 ">
                          {t("moveTokens.stepAny.tokensTable.loadingTokens")}
                        </div>
                        <div className={clsLoadingTokenLists}/>
                      </div>
                      :
                      <div className={clsStatus+" text-info"}>
                        <div className="pt-0">
                          <InformationCircleIcon className={clsIconStatusSize} />
                        </div>
                        <div className="pt-0 pr-3 ">
                          {t("moveTokens.stepAny.tokensTable.noTokens")}
                        </div>
                      </div>
                  }
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