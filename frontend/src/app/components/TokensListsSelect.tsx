// React
import { useCallback, useEffect, useState } from "react"
// Components
import SelectableTokensLists from "@Components/SelectableTokensLists"
// Translation
import { useTranslation } from "react-i18next"
// Icons
import { ArrowPathRoundedSquareIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
// Styles
import { clsLoadingTokenLists, clsIconStatusSize } from "@uiconsts/twDaisyUiStyles";

export default function TokensListsSelect (
  { selectableTokensLists, setselectableTokensLists, isLoading, isError }: ITokensListsSelectProps )
  {

  const { t } = useTranslation()
  const [isCheckAllDisabled, setisCheckAllDisabled] = useState(false)
  const [checkAll, setCheckAll] = useState<boolean>(false);

  // Styles
  const iconClsInvert = "w-6 h-6 sm:w-10 sm:h-10 -ml-1 -mt-1 sm:-mt-2 md:-mt-1 scale-75 hover:scale-85 md:scale-100 md:hover:scale-100 transition-all duration-300 ease-in-out "
  + ( (!selectableTokensLists?.length) ? "fill-base-content opacity-10 cursor-not-allowed" : "fill-base-content opacity-40 cursor-pointer") ;

  /**
   * Swap one token list selection
   */
  const handleSwapTokenListSelection:IHandleSwapTokenListSelection = useCallback(
    (id) =>
    {
        setselectableTokensLists( selectableTokensLists?.map( (selectableTokensList) =>
          ( selectableTokensList.tokensList?.id === id ? {...selectableTokensList, selected: !selectableTokensList.selected} : selectableTokensList ) ) );
    },
    [selectableTokensLists, setselectableTokensLists]
  )

  /**
   * Invert all token lists selection
   */
  const handleInvertAllTokensListSelection = useCallback( () =>
    {
      setselectableTokensLists( selectableTokensLists?.map( (selectableTokensList) =>
        ( {...selectableTokensList, selected: ( selectableTokensList.selectable ? !selectableTokensList.selected : false )} ) ) );
    },
    [selectableTokensLists, setselectableTokensLists]
  );

  /**
   * Select all token lists
   */
  const handleAllTokensListSelection = useCallback( () =>
    {
      const newCheckAll = !checkAll
      setCheckAll(newCheckAll);
      setselectableTokensLists( selectableTokensLists?.map( (selectableTokensList) =>
        ( {...selectableTokensList, selected: ( selectableTokensList.selectable ? newCheckAll : false )} ) ) );
    },
    [checkAll, selectableTokensLists, setselectableTokensLists]
  );

  /**
   * Keep token lists "Check all" selection status updated
   */
  useEffect( () =>
    {
      try {
        setisCheckAllDisabled( (selectableTokensLists?.length ? selectableTokensLists.every ((selectableTokensList) => (selectableTokensList.selectable === false)) : true) )
        setCheckAll( (selectableTokensLists?.length ? selectableTokensLists.every( (selectableTokensList) => ( selectableTokensList.selected || !selectableTokensList.selectable ) ) : false) )
      } catch (error) {
        console.error(`TokensListsSelect.tsx: useEffect[selectableTokensLists]: error=${error}`);
      }
    }, [selectableTokensLists]
  );

  return (
    <>
      <div className="w-full bg-base-200 overflow-x-hidden shadow-xl rounded-box bg-cover bg-top p-4 ">

        <div className="overflow-x-auto scrollbar scrollbar-thumb-neutral scrollbar-track-base-100">

        <div className="min-w-full rounded-lg">

          <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content">
            <thead className="bg-base-300 text-accent-content text-sm sm:text-md md:text-base font-semibold">
              <tr>
                <th className="p-2 flex w-10">
                  <label className="m-0 mr-2">
                    <input type="checkbox" className="checkbox checkbox-xs sm:checkbox-md md:checkbox-lg"
                      checked={checkAll}
                      onChange={handleAllTokensListSelection}
                      disabled={isCheckAllDisabled}
                    />
                  </label>
                  <label>
                    <ArrowPathRoundedSquareIcon className={iconClsInvert} onClick={handleInvertAllTokensListSelection} />
                  </label>
                </th>
                <th className="p-2 text-center font-medium">{t('moveTokens.stepZero.tokensListsTable.listName')}</th>
                <th className="p-2 text-center font-medium">{t('moveTokens.stepZero.tokensListsTable.listDescription')}</th>
                <th className="p-2 text-center w-52"></th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>
        </div>

          <table className="table table-zebra">

            <tbody>

            { (!isError && selectableTokensLists?.length) ?

              <SelectableTokensLists
                selectableTokensLists={selectableTokensLists}
                handleSwapTokenListSelection={handleSwapTokenListSelection}
              />
              :
              <tr>
                <td colSpan={2}>
                {
                isError ?
                  <div className="flex justify-center pb-3 text-error font-semibold pt-2 text-md sm:text-base md:text-xl">
                      <div className="pt-0 pr-3">
                        {t('moveTokens.stepZero.tokensListsTable.errorLoadingTokensLists')}
                      </div>
                      <div className="pt-0">
                        <ExclamationCircleIcon className={clsIconStatusSize} />
                      </div>
                  </div>
                :
                  isLoading ?
                    <div className="flex justify-center pb-3 text-info font-semibold pt-2 text-md sm:text-base md:text-xl">
                      <div className="pt-0">
                        <InformationCircleIcon className={clsIconStatusSize} />
                      </div>
                      <div className="pt-0 pr-1">
                          {t('moveTokens.stepZero.tokensListsTable.loadingTokensLists')}
                        </div>
                        <div className={clsLoadingTokenLists}/>
                    </div>
                  :
                    <div className="flex justify-center pb-3 text-info font-semibold pt-2 text-md sm:text-base md:text-xl">
                      <div className="pt-0 pr-3">
                        {t('moveTokens.stepZero.tokensListsTable.noTokensLists')}
                      </div>
                      <div className="pt-0">
                        <InformationCircleIcon className={clsIconStatusSize} />
                      </div>
                    </div>
                }
                  </td>
                </tr>

            }

            </tbody>

          </table>
        </div>

      </div>

    </>
  );
}