// React

// Icons
import { Bars3Icon, BarsArrowDownIcon, BarsArrowUpIcon } from '@heroicons/react/24/solid'

export default function SortIcon({ sortOrder, changeSortFnCb }: ISortIconProps): JSX.Element {

  const clsIcon = 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-2'

  return (
    <>
      {sortOrder === 0 ?
        <Bars3Icon className={clsIcon} onClick={() => changeSortFnCb()} />
        : sortOrder === 1 ?
          <BarsArrowDownIcon className={clsIcon} onClick={() => changeSortFnCb()} />
          :
          <BarsArrowUpIcon className={clsIcon} onClick={() => changeSortFnCb()} />
      }
    </>
  );
}