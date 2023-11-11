// React
import { useEffect, useMemo, useState } from "react";
// Components
import TokenInstanceListFiltered from "@Components/TokenInstanceListFiltered";
import SortIcon from "@Components/SortIcon";
// Utils
import { shortenAddress } from "@App/js/utils/blockchainUtils";
// Translation
import { useTranslation } from "react-i18next";
// Icons
import { ArrowPathRoundedSquareIcon, FunnelIcon, ExclamationCircleIcon,
  InformationCircleIcon, BackspaceIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'
// Styles
import { clsLoadingTokenLists, clsIconStatusSize, clsIconMedium } from "@uiconsts/twDaisyUiStyles";

const TokenInstanceListTableFiltered = (
    { tokensInstances,
      accountAddress,
      enableCheckboxes,
      targetAddress,
      isLoadingTokensInstances, isErrorTokensInstances,
      enableEditable,
      tokensInstancesListTablePropsHandlers }: ITokensListTableFilteredProps )  =>
  {

  // ---

  const { t } = useTranslation()
  const [selectAllDisabled, setSelectAllDisabled] = useState(false)

  useEffect( () =>
    {
      if (tokensInstances?.length && enableEditable) {
        const noneSelectable = tokensInstances.every( (tokenInstance) => {
          return !tokenInstance.selectable
        })
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
      if (selectAllDisabled && tokensInstancesListTablePropsHandlers.selectStates.selectAll) {
        tokensInstancesListTablePropsHandlers.updateHandlers.handleCheckSelectAll()
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
        accountAddress={accountAddress}
        targetAddress={targetAddress}
        tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
        enableEditable={enableEditable}
      />,
      [tokensInstances, accountAddress, targetAddress, tokensInstancesListTablePropsHandlers, enableEditable ]
  );

  // ---

  const countSelected = 
    (tokensInstances:TTokensInstances) =>
    {
      let selectedCount = 0;
      try {
        if (tokensInstances && tokensInstances.length>0 && accountAddress && typeof accountAddress == "string") {
          selectedCount = tokensInstances.reduce( (selectedCount,tokensInstance) => selectedCount + ((tokensInstance.selected==true)?1:0),0 )
        }
        return selectedCount;
      } catch (error) {
        console.error(`countSelected error: ${error}`);
        return selectedCount;
      }
    }

  // ---

  const countDisplayed =
    (tokensInstances:TTokensInstances) =>
    {
      let displayedCount = 0;
      try {
        if (tokensInstances && tokensInstances.length>0) {
          displayedCount = tokensInstances.filter(tokensInstancesListTablePropsHandlers.filterHandlers.filterTokenInstance).length
        }
        return displayedCount;
      } catch (error) {
        console.error(`countDisplayed error: ${error}`);
        return displayedCount;
      }
    }

  // ---

  const clsIconSizeMedium = "w-6 h-6 sm:w-8 sm:h-8 md:w-8 md:h-8"
  const clsIconSizeSmall = "w-4 h-4 sm:w-6 sm:h-6 md:w-7 md:h-7"
  const clsIconSizeBig = "w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12"
  const clsCheckboxSizeBig = "checkbox-xs sm:checkbox-md md:checkbox-lg"
  const clsCheckboxSizeSmall = "checkbox-xs sm:checkbox-sm md:checkbox-md"
  const clsIconSelectSmall = clsIconSizeSmall + (selectAllDisabled ? " fill-base-content opacity-50" : " fill-base-content") ;
  const clsIconMediumInvert = clsIconSizeMedium + " -ml-1 -mt-1 sm:-mt-2 md:-mt-1 scale-75 hover:scale-85 md:scale-100 md:hover:scale-100 transition-all duration-300 ease-in-out "
    + ( selectAllDisabled ? "fill-base-content opacity-30 cursor-not-allowed" : "fill-base-content opacity-50 cursor-pointer") ;

  const clsStatus = "flex justify-center font-semibold pt-2 text-md sm:text-base md:text-xl"
  const clsTextSize = "text-xs sm:text-sm md:text-base"

  // ---

  return (
      <>

      <div className="w-full">

        <div className="min-w-full rounded-lg ">

          <div className="flex min-w-full px-0">

            <div className="flex w-3/4 rounded-lg p-1 m-1 pr-0">

              <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content transition-all">

                <thead className="min-w-full bg-base-300 text-left">
                  <tr className={clsTextSize+" font-semibold"}>
                    <th className="p-0 pl-1 font-medium"><FunnelIcon className={clsIconMedium} /></th>
                    <th className="p-2 font-medium">{t("moveTokens.stepAny.tokensTable.search.name")}</th>
                    <th className="p-2 font-medium">{t("moveTokens.stepAny.tokensTable.search.balance")}</th>
                    <th className="p-2 font-medium">{t("moveTokens.stepAny.tokensTable.search.balanceGt0.label")}</th>
                    <th className="p-2 font-medium">{t("moveTokens.stepAny.tokensTable.search.clearAll.label")}</th>
                  </tr>
                </thead>
                <tbody className={"min-w-full"+clsTextSize}>
                  <tr className="bg-base-300">
                    <td className="p-0"></td>
                    <td className="p-2 pl-0 w-full">
                      <input className={"w-full input input-bordered input-xs sm:input-sm md:input-md " + clsTextSize}
                        type="text"
                        value={tokensInstancesListTablePropsHandlers.filterStates.name}
                        onChange={(e)=>{tokensInstancesListTablePropsHandlers.filterHandlers.tokenInstanceFilterParamsUpdaters.updateNameFilter(e)}}
                        placeholder="..." spellCheck="false" >
                      </input>
                    </td>
                    <td className="p-2 pl-0">
                      <input className="input input-bordered input-xs sm:input-sm md:input-md"
                        type="number"
                        value={tokensInstancesListTablePropsHandlers.filterStates.balance.valueOf()}
                        onChange={(e)=>{tokensInstancesListTablePropsHandlers.filterHandlers.tokenInstanceFilterParamsUpdaters.updateBalanceFilter(e)}}
                        step={0.001} min={0} max={10000000000000}
                        placeholder="...">
                      </input>
                    </td>
                    <td className="p-2 pl-0">
                      <label>
                        {/* Balance greater than 0 filter checkbox */}
                        <div className="tooltip tooltip-left" data-tip={t("moveTokens.stepAny.tokensTable.search.balanceGt0.hint")}>
                          <input className={"checkbox " + clsCheckboxSizeBig}
                            type="checkbox"
                            checked={tokensInstancesListTablePropsHandlers.filterStates.balanceGt0} onChange={()=>{tokensInstancesListTablePropsHandlers.filterHandlers.tokenInstanceFilterParamsUpdaters.switchBalanceGt0Filter()}}
                            disabled={!tokensInstances?.length}
                            />
                        </div>
                      </label>
                    </td>
                    <td className="p-2 pl-0">
                      <label>
                        {/* Clear filters */}
                        <div className="tooltip tooltip-left" data-tip={t("moveTokens.stepAny.tokensTable.search.clearAll.hint")}>
                          <BackspaceIcon className={clsIconSizeBig} onClick={()=>{tokensInstancesListTablePropsHandlers.filterHandlers.tokenInstanceFilterParamsUpdaters.clearAllFilters()}} />
                        </div>
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table> {/* MAIN search PARAMETERS table */}
            </div>

            <div className="flex w-1/4 rounded-lg p-1 m-1 pl-0">

              <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content transition-all">

                <thead className="min-w-full bg-base-300 text-left">
                  <tr className={clsTextSize + " font-semibold"}>
                    <th colSpan={2} className="p-0 pl-12 font-medium">
                      <div className="tooltip tooltip-right" data-tip={t("moveTokens.stepAny.tokensTable.select.any.hint")}>
                        <EyeSlashIcon className={clsIconSelectSmall}/>
                      </div>
                    </th>
                    <th colSpan={2} className="p-0 pl-12 font-medium">
                      <div className="tooltip tooltip-bottom" data-tip={t("moveTokens.stepAny.tokensTable.select.visible.hint")}>
                        <EyeIcon className={clsIconSelectSmall}/>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className={clsTextSize + " min-w-full"}>

                  <tr className="bg-base-300 text-center font-thin">
                    <td className="">
                      <label>
                        {t("moveTokens.stepAny.tokensTable.select.any.selectAll")}
                      </label>
                    </td>
                    <td className="">
                      <label>
                        {t("moveTokens.stepAny.tokensTable.select.any.invertSelection")}
                      </label>
                    </td>
                    <td className="">
                      <label>
                        {t("moveTokens.stepAny.tokensTable.select.visible.selectAll")}
                      </label>
                    </td>
                    <td className="">
                      <label>
                        {t("moveTokens.stepAny.tokensTable.select.visible.invertSelection")}
                      </label>
                    </td>
                  </tr>

                  <tr className="bg-base-300">

                    <td className="p-2">
                      <label>
                        {/* Select ALL checkbox */}
                        <input className={"checkbox " + clsCheckboxSizeSmall}
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
                        <ArrowPathRoundedSquareIcon className={clsIconMediumInvert} onClick={ ()=>{ if (!selectAllDisabled) {tokensInstancesListTablePropsHandlers.updateHandlers.handleInvertAllChecks()} } } />
                      </label>
                    </td>

                    <td className="p-2">
                      <label>
                        {/* Select ALL checkbox */}
                        <input className={"checkbox " + clsCheckboxSizeSmall}
                          type="checkbox"
                          checked={tokensInstancesListTablePropsHandlers.selectStates.selectAllVisible}
                          onChange={()=>{tokensInstancesListTablePropsHandlers.updateHandlers.handleCheckSelectAll(true)}}
                          disabled={selectAllDisabled}
                          />
                      </label>
                    </td>
                    <td className="p-2">
                      <label>
                        {/* INVERT ALL checkbox */}
                        <ArrowPathRoundedSquareIcon className={clsIconMediumInvert} onClick={ ()=>{ if (!selectAllDisabled) {tokensInstancesListTablePropsHandlers.updateHandlers.handleInvertAllChecks(true)} } } />
                      </label>
                    </td>

                  </tr>
                </tbody>
              </table> {/* SELECT table */}

            </div>

          </div>

          <div className="px-1 pt-1">
            <div className="collapse collapse-arrow bg-base-300">
              <input type="checkbox" /> 
              <div className={"collapse-title font-light justify-left flex " + clsTextSize}>
                <FunnelIcon className={clsIconMedium} />
                {t("moveTokens.stepAny.tokensTable.search.additional.title")}
              </div>
              <div className="collapse-content"> 

                <div className="divider m-0 p-0"></div>
                <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content transition-all">

                  <thead className="min-w-full bg-base-200 text-left">
                    <tr className={clsTextSize + " font-semibold"}>
                      <th className="p-0 pl-2 font-medium">{t("moveTokens.stepAny.tokensTable.search.additional.address")}</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody className={"min-w-full " + clsTextSize}>
                    <tr className="bg-base-200">
                      <td className="p-2">
                        <input type="text" value={tokensInstancesListTablePropsHandlers.filterStates.address} onChange={(e)=>{tokensInstancesListTablePropsHandlers.filterHandlers.tokenInstanceFilterParamsUpdaters.updateAddressFilter(e)}}
                        className={"input input-bordered input-xs sm:input-sm md:input-md w-full " + clsTextSize} placeholder={t("moveTokens.stepAny.address.placeholder")} >
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

        <div className="min-w-full rounded-lg  mt-2 transition-all">

          { (!isErrorTokensInstances && tokensInstances?.length) ?

              <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content">

                <thead className="min-w-full text-neutral-content text-left">
                  <tr className={clsTextSize + " font-semibold bg-neutral"}>
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
                        {t("moveTokens.stepAny.tokensTable.results.titles.sourceTokenBalance")}
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
                    { targetAddress &&
                    <th className="p-2 font-light flex-none whitespace-nowrap text-ellipsis">
                      <div className={"tooltip tooltip-bottom pl-1 text-neutral-content tooltip-info"} data-tip={targetAddress} >
                        {t("moveTokens.stepAny.tokensTable.results.titles.targetTokenBalance")+ " " + shortenAddress(targetAddress)}
                      </div>
                    </th>
                    }
                  </tr>
                </thead>


                <tbody className={"min-w-full mt-2 " + clsTextSize}>
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

}

export default TokenInstanceListTableFiltered;