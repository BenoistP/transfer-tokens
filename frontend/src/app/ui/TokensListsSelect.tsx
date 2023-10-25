// React
import { useCallback, useEffect, useState } from "react"

// Components
import SelectableTokensLists from "@components/SelectableTokensLists"

// Utils
import { getChainTokensList } from "@jsutils/tokensListsUtils"

// Icons
import { ArrowPathRoundedSquareIcon } from '@heroicons/react/24/solid'

// Translation
import { useTranslation } from "react-i18next"
import { useNetwork } from 'wagmi'

// ------------------------------

const TokensListsSelect = ( { 
  tokensLists,
  // chainId,
  selectableTokensLists,
  setselectableTokensLists,  }: ITokensListsSelectProps ) =>
  {

  // console.debug(`TokenListSelect.tsx render`)
  // console.debug(`TokenListSelect.tsx render: selectableTokensLists=${JSON.stringify(selectableTokensLists)}`)

  const { chain } = useNetwork()
  const { t } = useTranslation()

  // ---

  const isAllChecked = useCallback( () =>
    {
      if (selectableTokensLists) {
        const isAllChecked = selectableTokensLists?.every(
          (selectableTokensList) => {
            return (
              selectableTokensList.selected || !selectableTokensList.selectable // === true
            )
          }
        )
        return isAllChecked;
      } // if (selectableTokensLists)
      return false;
    },
    [selectableTokensLists]
  );

  // ---

  const [checkAll, setCheckAll] = useState<boolean>(isAllChecked);

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
      // if (selectableTokensLists&&selectableTokensLists.length>0) {
      //   if (selectableTokensLists[0].chainId !== chain?.id) {
      //     console.debug(`TokensListsSelect useEffect selectableTokensLists[0].chainId !== chain?.id`)
      //     // setselectableTokensLists(null) // clear
      //   }
      // } //  if (selectableTokensLists)
      // Reload if selectableTokensLists empty OR (not empty AND chain changed)
      if ((!selectableTokensLists||selectableTokensLists.length<=0)
        || (selectableTokensLists?.length>0&&selectableTokensLists[0].chainId !== chain?.id) ) {
        // console.debug(`TokensListsSelect useEffect`)
        // if (tokensLists) {
        //   console.log('TokensListsSelect: useEffect: tokensLists=');
        //   console.dir(tokensLists);
        // } else {
        //   console.debug('TokensListsSelect: useEffect: tokensLists is undefined');
        // }

        // TODO: filter upon chain id
        const filteredSelectableTokensLists: TSelectableTokensLists = []
        tokensLists?.forEach( (tokensList: TTokensList) => {
          /*
          // console.dir(tokensList);
          if (tokensList && tokensList.tokens && tokensList.tokens.length > 0) {
            console.debug(`TokensListsSelect: useEffect: tokensList DEFINED && tokensList.tokens.length > 0`);
            if (tokensList.chains && tokensList.chains.length > 0 && tokensList.chains.includes((chain?.id ? chain?.id : -1))) {
              console.debug(`TokensListsSelect: useEffect: tokensList.chains DEFINED && tokensList.chains.length > 0 && tokensList.chains.includes(chain.id) (${chain?.id}))`);
              filteredSelectableTokensLists.push({ tokensList, selected: false }) // as TSelectableTokensList
            } else {
              console.debug(`TokensListsSelect: useEffect: tokensList.chains is undefined or tokensList.chains.length <= 0 , or tokensList.chains does not include chain.id (${chain?.id})})`);
            }
          } else {
            console.debug(`TokensListsSelect: useEffect: tokensList is undefined or tokensList.tokens.length <= 0`);
          }
          */
        const chainId = (chain?.id ? chain?.id : -1)
        const chainTokensList = getChainTokensList(tokensList, chainId)
        // console.debug(`TokensListsSelect: useEffect: chainTokensList=`);
        // console.dir(chainTokensList);

        const currentChainTokensCount = (chainTokensList?chainTokensList.tokensCount:0)
        const selectable = (currentChainTokensCount > 0) && (tokensList.status == "ok")
        // console.debug(`TokensListsSelect: useEffect: chainTokensList?.tokensCount=${chainTokensList?.tokensCount} tokensList.status=${tokensList.status} currentChainTokensCount=${currentChainTokensCount} selectable=${selectable}`);
        const selectableTokensList = {
          tokensList,
          chainId,
          selected: false,
          selectable,
          currentChainTokensCount
        } // as TSelectableTokensList

        filteredSelectableTokensLists.push(selectableTokensList)


          // if (chainTokensList) {
          //   const selectable = (chainTokensList.tokensCount > 0) && (chainTokensList.stat === chainId)
          //   console.debug(`TokensListsSelect: useEffect: chainTokensList DEFINED && chainTokensList.tokensCount > 0`);
          //   const selectableTokensList = { tokensList, selected: false, selectable } as TSelectableTokensList
          //   filteredSelectableTokensLists.push(selectableTokensList)
          // }
          // // debug
          // else {
          //   console.debug(`TokensListsSelect: useEffect: chainTokensList is undefined or chainTokensList.tokens.length <= 0`);
          //   console.dir(tokensList.URI);
          //   console.debug(`TokensListsSelect: useEffect: tokensList.name=${tokensList.name} tokensList.URI=${tokensList.URI} chainTokensList?.tokens?.length=${chainTokensList?.tokens?.length}`);
          //   console.debug(`TokensListsSelect: useEffect: tokensList.chains=`);
          //   console.dir(tokensList.chains);
          //   chainTokensList.chainId
          // }

        }) as TSelectableTokensLists

        // console.log('TokensListsSelect: filteredSelectableTokensLists=');
        // console.dir(filteredSelectableTokensLists);

        setselectableTokensLists(filteredSelectableTokensLists)

      } // if (!selectableTokensLists||selectableTokensLists.length<=0)

    },
    [
      // tokensLists, chain?.id
      // tokensLists, chain?.id, selectableTokensLists, setselectableTokensLists
      tokensLists, chain?.id, 
    ]
  )

  // ---

  const updateCheckAll = useCallback( (selectableTokensLists:TSelectableTokensLists) =>
    {
      try {
        // console.debug(`TokensListsSelect.tsx x realTokensList: ${realTokensList}`);
        if (selectableTokensLists) {
          // const isAllChecked = realTokensList.every(
          //   (realToken) => realToken.userData.selected === true
          // );
          // const isAllChecked = selectableTokensLists.every(
          //   (selectableTokensList) => {
          //     return (
          //       // selectableTokensList.selected // === true
          //       selectableTokensList.selected || !selectableTokensList.selectable // === true
          //     )
          //   }
          // );
          // console.debug(`TokensListsSelect.tsx updateCheckAll isAllChecked:${isAllChecked}`);
          // setCheckAll(isAllChecked);
          setCheckAll(isAllChecked());
        } // if (selectableTokensLists)
      } catch (error) {
        console.error(`TokensListsSelect.tsx: updateCheckAll: error=${error}`);
      }
    },
    [/* selectableTokensLists */ isAllChecked]); // updateCheckAll
  // ---

  const changeTokensListCheckboxStatus:IChangeTokensListCheckboxStatus = useCallback(
    (id) =>
    {
      // console.debug(`TokensListsSelect.tsx changeTokensListCheckboxStatus() id="${id}"`)
      if (selectableTokensLists) {
        const new_selectableTokensLists = [...selectableTokensLists];
        selectableTokensLists.map((selectableTokensList) => {
          if (selectableTokensList.tokensList?.id === id)
            selectableTokensList.selected = !selectableTokensList.selected;
        });
        updateCheckAll(new_selectableTokensLists);
        setselectableTokensLists(new_selectableTokensLists);
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
        // console.debug(`TokensListsSelect.tsx: handleCheckSelectAll`);
        const newCheckAll = !checkAll

        if (selectableTokensLists) {
          const new_selectableTokensLists = [...selectableTokensLists];
          new_selectableTokensLists.map((selectableTokensList) => {
            // selectableTokensList.selected = newCheckAll;
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

  const iconClsInvert = "w-6 h-6 sm:w-10 sm:h-10 -ml-1 -mt-1 sm:-mt-2 md:-mt-1 scale-75 hover:scale-85 md:scale-100 md:hover:scale-100 transition-all duration-300 ease-in-out " + ((selectableTokensLists?.length||0) === 0? "fill-neutral-content opacity-70 cursor-not-allowed" : "fill-base-content opacity-40 cursor-pointer") ;

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
                      disabled={(selectableTokensLists?.length||0) === 0}
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

            { (selectableTokensLists?.length||0) === 0 ?

              <tr>
                <th>
                  <label>

                  </label>
                </th>
                <td colSpan={2}>
                  <div className="font-semibold text-md sm:text-base md:text-xl">
                   {t('moveTokens.stepZero.tokensListsTable.emptyList')}
                  </div>
                </td>
                <td>

                  <br/>
                </td>

              </tr>

              :

              <SelectableTokensLists
                selectableTokensLists={selectableTokensLists}
                // chainId={chainId}
                changeTokensListCheckboxStatus={changeTokensListCheckboxStatus}
              />
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