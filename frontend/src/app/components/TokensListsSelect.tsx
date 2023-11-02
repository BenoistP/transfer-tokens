// React
import { useCallback, useEffect, useState } from "react"
// Components
import SelectableTokensLists from "@Components/SelectableTokensLists"
// Utils
import { getChainTokensList } from "@jsutils/tokensListsUtils"
// Icons
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/solid'
// Translation
import { useTranslation } from "react-i18next"
// Icons
import { ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid'

// ------------------------------

const TokensListsSelect = ( { 
  tokensLists,
  chainId,
  selectableTokensLists,
  setselectableTokensLists,
  isLoading, isError    }: ITokensListsSelectProps ) =>
  {

  const { t } = useTranslation()
  const [isCheckAllDisabled, setisCheckAllDisabled] = useState(false)
  const [checkAll, setCheckAll] = useState<boolean>(false);

  // ---

  const isAllChecked = useCallback( () =>
    {
      try {
        if (selectableTokensLists) {
          const isAllChecked = selectableTokensLists.every(
            (selectableTokensList) => {
              return (
                selectableTokensList.selected || !selectableTokensList.selectable // === true
              )
            }
          ) // every
          return isAllChecked;
        } // if (selectableTokensLists)
      } catch (error) {
        console.error(`TokensListsSelect.tsx: isAllChecked: error=${error}`);
      }
      return false;
    },
    [selectableTokensLists]
  );

  // ---

  // const [checkAll, setCheckAll] = useState<boolean>(isAllChecked);

  // ---

  useEffect( () =>
    {
      try {
        if (!selectableTokensLists || ((selectableTokensLists.length||0) === 0)) {
          setisCheckAllDisabled(true)
        } else {
          const notSelectable = selectableTokensLists.every ( (selectableTokensList) => {
            return (
              selectableTokensList.selectable === false
            )
          })
          setisCheckAllDisabled(notSelectable)
        }
      } catch (error) {
        console.error(`TokensListsSelect.tsx: useEffect[selectableTokensLists]: error=${error}`);
      }
    }, [selectableTokensLists]
  );

  // ---

/* 
  const SelectableTokensListsListMemo = useMemo(
    () =>
      <SelectableTokensLists
        selectabletokensLists={selectableTokensLists}
        chainId={chainId}
        changeTokensListCheckboxStatus={changeTokensListCheckboxStatus}
      />
    , [ selectableTokensLists, chainId //, changeTokensListCheckboxStatus
      ]
  );
*/

  // ---

  useEffect( () =>
    {
      try {
        const filteredSelectableTokensLists: TSelectableTokensLists = []
        tokensLists?.forEach( (tokensList: TTokensList) => {
          const chainTokensList = getChainTokensList(tokensList, chainId)
          const currentChainTokensCount = (chainTokensList?chainTokensList.tokensCount:0)
          const selectable = (currentChainTokensCount > 0) && (tokensList.status == "ok")
          const selectableTokensList = {
            tokensList,
            chainId,
            selected: false,
            selectable,
            currentChainTokensCount
          } // as TSelectableTokensList

          filteredSelectableTokensLists.push(selectableTokensList)
        })
        setselectableTokensLists(filteredSelectableTokensLists)
      } catch (error) {
        console.error(`TokensListsSelect.tsx: useEffect[tokensLists, chainId, setselectableTokensLists]: error=${error}`);
      }
    },
    [tokensLists, chainId, setselectableTokensLists]
  ) // useEffect

  // ---

  const updateCheckAll = useCallback( (selectableTokensLists:TSelectableTokensLists) =>
    {
      try {
        if (selectableTokensLists) {
          setCheckAll(isAllChecked());
        } // if (selectableTokensLists)
      } catch (error) {
        console.error(`TokensListsSelect.tsx: updateCheckAll: error=${error}`);
      }
    },
    [isAllChecked]
  );
  // ---

  const changeTokensListCheckboxStatus:IChangeTokensListCheckboxStatus = useCallback(
    (id) =>
    {
      try {
        if (selectableTokensLists) {
          const new_selectableTokensLists = [...selectableTokensLists];
          selectableTokensLists.map((selectableTokensList) => {
            if (selectableTokensList.tokensList?.id === id)
              selectableTokensList.selected = !selectableTokensList.selected;
          });
          updateCheckAll(new_selectableTokensLists);
          setselectableTokensLists(new_selectableTokensLists);
        }
      } catch (error) {
        console.error(`TokensListsSelect.tsx: changeTokensListCheckboxStatus: error=${error}`);
      }
    },
    [selectableTokensLists, setselectableTokensLists, updateCheckAll],
  )

  // ---

  const handleInvertAllChecks = useCallback( () =>
    {
      try {
        // console.debug(`TokensListsSelect.tsx: handleInvertAllChecks`);
        if (selectableTokensLists && selectableTokensLists.length > 0) {
          const new_selectableTokensLists = [...selectableTokensLists];
          selectableTokensLists.map((selectableTokensList) => {
            selectableTokensList.selected = (selectableTokensList.selectable?!selectableTokensList.selected:false)
          });
          updateCheckAll(new_selectableTokensLists);
          setselectableTokensLists(new_selectableTokensLists);
        }
      } catch (error) {
        console.error(`TokensListsSelect.tsx: handleInvertAllChecks: error=${error}`);
      }
    },
    [selectableTokensLists, setselectableTokensLists, updateCheckAll]
  ); // handleInvertAllChecks

  // ---

  const handleCheckSelectAll = useCallback( () =>
    {
      try {
        const newCheckAll = !checkAll
        if (selectableTokensLists) {
          const new_selectableTokensLists = [...selectableTokensLists];
          new_selectableTokensLists.map((selectableTokensList) => {
            selectableTokensList.selected = (selectableTokensList.selectable?newCheckAll:false)
          });
          setselectableTokensLists(new_selectableTokensLists);
          updateCheckAll(new_selectableTokensLists);
        }
        setCheckAll(newCheckAll);
      } catch (error) {
        console.error(`TokensListsSelect.tsx: handleCheckSelectAll: error=${error}`);
      }
    },
    [checkAll, selectableTokensLists, setselectableTokensLists, updateCheckAll]
  ); // handleCheckSelectAll

  // ---

  const iconClsInvert = "w-6 h-6 sm:w-10 sm:h-10 -ml-1 -mt-1 sm:-mt-2 md:-mt-1 scale-75 hover:scale-85 md:scale-100 md:hover:scale-100 transition-all duration-300 ease-in-out "
   + ( ((selectableTokensLists?.length||0)=== 0) ? "fill-base-content opacity-10 cursor-not-allowed" : "fill-base-content opacity-40 cursor-pointer") ;

  const clsIcon = 'w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 stroke-2'

  // ---

  return (
    <>
      <div className="w-full bg-base-300 items-center justify-center gap-2 overflow-x-hidden border border-neutral shadow-xl rounded-box bg-cover bg-top p-4 ">

        <div className="overflow-x-auto scrollbar scrollbar-thumb-neutral scrollbar-track-base-100">

        <div className="min-w-full rounded-lg border border-neutral">

        <table className="w-full rounded-lg border-collapse overflow-hidden min-w-full table-auto m-0 text-base-content">

            <thead className="bg-base-200 text-accent-content text-sm sm:text-md md:text-base font-semibold">
              <tr>
                <th className="p-2 flex w-10">
                  <label className="m-0 mr-2">
                    <input type="checkbox" className="checkbox checkbox-xs sm:checkbox-md md:checkbox-lg"
                      checked={checkAll}
                      onChange={handleCheckSelectAll}
                      disabled={isCheckAllDisabled}
                    />
                  </label>
                  <label>
                    <ArrowPathRoundedSquareIcon className={iconClsInvert} onClick={handleInvertAllChecks} />
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
                // chainId={chainId}
                changeTokensListCheckboxStatus={changeTokensListCheckboxStatus}
              />

              :

              <tr>
                <td colSpan={2}>
                {
                isError ?
                  <div className="flex justify-center text-error font-semibold pt-2 text-md sm:text-base md:text-xl">
                      <div className="pt-0 pr-3 ">
                      {t('moveTokens.stepZero.tokensListsTable.errorLoadingTokensLists')}
                      </div>
                      <div className="pt-0">
                        <ExclamationCircleIcon className={clsIcon} />
                      </div>
                  </div>
                :
                  isLoading ?
                    <div className="flex justify-center text-info font-semibold pt-2 text-md sm:text-base md:text-xl">
                        <div className="pt-0 pr-3 ">
                        {t('moveTokens.stepZero.tokensListsTable.loadingTokensLists')}
                        </div>
                        <div className="loading loading-dots loading-sm md:loading-md lg:loading-lg"/>
                    </div>
                  :
                    <div className="flex justify-center text-info font-semibold pt-2 text-md sm:text-base md:text-xl">
                      <div className="pt-0 pr-3 ">
                        {t('moveTokens.stepZero.tokensListsTable.noTokensLists')}
                      </div>
                      <div className="pt-0">
                        <InformationCircleIcon className={clsIcon} />
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

// ------------------------------

export default TokensListsSelect;