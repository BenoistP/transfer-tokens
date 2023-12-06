// React

// Icons
import { Bars3Icon, BarsArrowDownIcon, BarsArrowUpIcon } from '@heroicons/react/24/solid'
// Styles
import { clsIconMedium } from "@uiconsts/twDaisyUiStyles";

export default function SortIcon({ sortOrder, changeSortFnCb }: ISortIconProps): JSX.Element {

  return (
    <>
      {sortOrder === 0 ?
        <Bars3Icon className={clsIconMedium} onClick={() => changeSortFnCb()} />
        : sortOrder === 1 ?
          <BarsArrowDownIcon className={clsIconMedium} onClick={() => changeSortFnCb()} />
          :
          <BarsArrowUpIcon className={clsIconMedium} onClick={() => changeSortFnCb()} />
      }
    </>
  );
}