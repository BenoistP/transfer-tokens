// React
import { useEffect } from "react";
// Components
import TokenInstanceMigrationListTable from "@Components/TokenInstanceMigrationListTable";

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
      <div className="w-full p-0 m-0">
          <TokenInstanceMigrationListTable
            // chainId={chainId}
            tokensInstances={tokensInstances}
            accountAddress={accountAddress}
            targetAddress={targetAddress}
            tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
          />
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