// React

import { SelectableTokensList } from "@Components/SelectableTokensList";

// ------------------------------

const SelectableTokensLists = ( {
  selectableTokensLists,
  // chainId,
  changeTokensListCheckboxStatus
}: ISelectableTokensListsProps ) => {

// console.debug(`RealTokenInstanceList2.tsx render accountAddress: ${accountAddress}`);

// ------------------------------

  return (
    <>
      {
        selectableTokensLists?.map( (selectableTokensList:TSelectableTokensList, index:number) =>
        {
          const key = `${index}-${selectableTokensList?.tokensList?.id}`;
          return (
            <tr className=" "
              key={key}
            >
              <SelectableTokensList
                  selectableTokensList={selectableTokensList}
                  changeTokensListCheckboxStatus={changeTokensListCheckboxStatus}
              />
            </tr>
          )
        })
      }
    </>
  )

}

export default SelectableTokensLists;