// React
import { useEffect, useState} from "react";
// Wagmi
import { watchBlockNumber } from '@wagmi/core'

// ---

export const FooterStatus = ( {showActivity=false}:iFooterStatus) =>
{
  const blockNumberInitValue = "..."
  const [blockNumber, setBlockNumber] = useState<string>(blockNumberInitValue)

  // ------------------------------

  useEffect(() =>
    {
      const blockNumberUpdate = (blockNumber:string) => {
        setBlockNumber(blockNumber);
      }

      const unwatchBlockNumber = watchBlockNumber(
        {
          listen: true
        },
        (blockNumber) => blockNumberUpdate(blockNumber.toString()),
      )

      return () => {
        unwatchBlockNumber()
      }
    },
    []
  )

  // ------------------------------

  return (
    <div className="flex">

        <div className="w-16 text-xs text-content">
          { showActivity &&
          <progress className="progress progress-info w-32 z-0"></progress>
          }
        </div>

        <div className="w-16 text-xs text-content z-10">
          {blockNumber}
        </div>

    </div>
  );

};