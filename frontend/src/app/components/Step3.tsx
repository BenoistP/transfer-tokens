// React
import { useEffect } from "react";
// Components
import TokenInstanceMigrationListTable from "@Components/TokenInstanceMigrationListTable";

// ------------------------------


// const Step3 = ( { setShowProgressBar, setProgressBarPercentage }: IStep3Props ) => {
const Step3 = ( {
  tokensInstances,
  setNextDisabled,
  setShowProgressBar,
  accountAddress,
  targetAddress,
  tokensInstancesListTablePropsHandlers,
  // migrationState, setmigrationState,
  transferTokens,
  }: IStep3Props ) => {

   // ---

  console.debug(`Step3.tsx render `)

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

  // setShowProgressBar(true)
  // setProgressBarPercentage(0)

  // ---


  return (
    <>
      <div className="w-full p-0 m-0">
          <TokenInstanceMigrationListTable
            // chainId={chainId}
            tokensInstances={tokensInstances}
            accountAddress={accountAddress}
            targetAddress={targetAddress}
            // isLoadingTokensInstances={isLoadingTokensInstances} isErrorTokensInstances={isErrorTokensInstances}
            tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
          />
      </div>
  </>
  );
}

/*
  return (
    <>
      <div className="bg-neutral w-full m-2 p-2 rounded-box border border-neutral-content">
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