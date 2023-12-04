// React
import { useCallback } from "react";
// Translation
import { useTranslation } from "react-i18next"
// Icons
import { QuestionMarkCircleIcon } from '@heroicons/react/24/solid'

export default function SelectableTokensList(
  { selectableTokensList,
    handleSwapTokenListSelection
  }: ISelectableTokensListProps): JSX.Element {

  const iconCls = "fill-base-content w-6 h-6 sm:w-10 sm:h-10";
  const { t } = useTranslation()

  const handleCheckboxClick = useCallback(() => {
    const id: TTokensListId = selectableTokensList.tokensList?.id;
    handleSwapTokenListSelection(id);
  },
    [handleSwapTokenListSelection, selectableTokensList.tokensList?.id]
  );

  return (
    <>
      <th>
        <label>
          <input type="checkbox"
            className="checkbox checkbox-xs sm:checkbox-md md:checkbox-lg"
            checked={selectableTokensList.selected}
            onChange={handleCheckboxClick}
            disabled={!selectableTokensList.selectable}
          />
        </label>
      </th>
      <td>
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="mask mask-squircle w-12 h-12">
              {selectableTokensList.tokensList?.logoURI ? <img src={selectableTokensList.tokensList.logoURI} /> : <QuestionMarkCircleIcon className={iconCls} />}
            </div>
          </div>
          <div>
            <div className="font-medium">
              {selectableTokensList.tokensList?.name}
            </div>
            <span className="badge badge-ghost badge-sm bg-neutral text-neutral-content">

              {(selectableTokensList.tokensList && selectableTokensList.tokensList.tokensCount)
                ?
                <>
                  <p className="font-medium text-primary-content">
                    {(selectableTokensList.currentChainTokensCount ? selectableTokensList.currentChainTokensCount : "0")}
                  </p>
                  &nbsp;/&nbsp;
                  <p className={"font-normal " + (selectableTokensList.tokensList && selectableTokensList.tokensList.tokensCount ? "text-neutral-content" : "text-error")}>
                    {selectableTokensList.tokensList.tokensCount}
                  </p>
                </>
                :
                <p className="text-error font-medium">
                  {t("moveTokens.common.notAvailable")}
                </p>
              }

            </span>
          </div>
        </div>
      </td>
      <td>
        {selectableTokensList.tokensList?.description}
        <br />
        {
          selectableTokensList.tokensList.timestamp
          &&
          <span className="badge badge-ghost badge-sm bg-neutral text-neutral-content font-light truncate">{typeof (selectableTokensList.tokensList?.timestamp) == "number" ? new Date(selectableTokensList.tokensList.timestamp * 1_000).toLocaleString() : selectableTokensList.tokensList.timestamp}</span>
        }
      </td>
      <th>
        <button className="btn btn-ghost btn-xs">{t("moveTokens.stepZero.tokensListsTable.details")}</button>
      </th>
    </>
  );
}