// React

// Components
import { SelectableTokensList } from "@Components/SelectableTokensList";

export default function SelectableTokensLists(
  { selectableTokensLists, handleSwapTokenListSelection }: ISelectableTokensListsProps): JSX.Element {

  return (
    <>
      {
        selectableTokensLists?.map((selectableTokensList: TSelectableTokensList, index: number) => {
          const key = `${index}-${selectableTokensList?.tokensList?.id}`;
          return (
            <tr key={key}>
              <SelectableTokensList
                selectableTokensList={selectableTokensList}
                handleSwapTokenListSelection={handleSwapTokenListSelection}
              />
            </tr>
          )
        })
      }
    </>
  )

}