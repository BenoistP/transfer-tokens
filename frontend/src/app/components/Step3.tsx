// React
import { useEffect } from "react";
// Components
import TokenInstanceMigrationListTable from "@Components/TokenInstanceMigrationListTable";
// Icons
import { FaceSmileIcon } from '@heroicons/react/24/solid'

// ------------------------------

const Step3 = ( {
  tokensInstances,
  setNextDisabled,
  setShowProgressBar,
  accountAddress,
  targetAddress,
  tokensInstancesListTablePropsHandlers,
  transferTokens,
  }: IStep3Props ) => {

  // ---

   useEffect( () =>
   {
     setShowProgressBar(true)
     setNextDisabled(true)
     transferTokens(tokensInstances, accountAddress, targetAddress)
   },
   [transferTokens, setNextDisabled, setShowProgressBar, tokensInstances, accountAddress, targetAddress]
 )

  // ---


  return (
    <>
      <div className="w-full block p-2">

        <div className="bg-neutral w-full rounded-box border border-base-300-content p-2">
          <p className="text-sm sm:text-base md:text-lg overflow-hidden text-center text-accent p-2 pb-0  animate-pulse">
            {"COMING"}
          </p>&nbsp;
          <div className="flex text-neutral-content justify-center p-0">
            <FaceSmileIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12  animate-pulse " />
          </div>
          <p className="text-sm sm:text-base md:text-lg overflow-hidden text-center text-warning font-extrabold p-2  animate-pulse">
            {"SOON"}
          </p>
        </div>
        <div className="w-full p-0 m-0">
            <TokenInstanceMigrationListTable
              // chainId={chainId}
              tokensInstances={tokensInstances}
              accountAddress={accountAddress}
              targetAddress={targetAddress}
              tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
            />
        </div>
      </div>
  </>
  );
}

/*
  return (
    <>
      <div className="bg-neutral w-full m-2 p-2 rounded-box border border-base-300-content">
          <p className="text-sm sm:text-base md:text-lg overflow-hidden text-center text-accent">
            {"COMING"}
          </p>&nbsp;
          <p className="text-sm sm:text-base md:text-lg overflow-hidden text-center text-warning font-extrabold">
            {"SOON"}
          </p>
      </div>
    </>
  );
*/


// ------------------------------

export default Step3;