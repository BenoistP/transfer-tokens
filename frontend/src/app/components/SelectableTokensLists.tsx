// React

// Components
import { SelectableTokensList } from "@Components/SelectableTokensList";

export default function SelectableTokensLists(
  { selectableTokensLists, handleSwapTokenListSelection }: ISelectableTokensListsProps): JSX.Element {

  return (
    <>
      {selectableTokensLists?.map(
        (selectableTokensList: TSelectableTokensList) =>
          <tr key={`${selectableTokensList?.tokensList?.id}-${selectableTokensList?.tokensList?.timestamp}`}>
            <SelectableTokensList
              selectableTokensList={selectableTokensList}
              handleSwapTokenListSelection={handleSwapTokenListSelection}
            />
          </tr>
      )}
    </>
  )

}