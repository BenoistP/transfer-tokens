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
            tokensInstances={tokensInstances}
            accountAddress={accountAddress}
            targetAddress={targetAddress}
            tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
          />
      </div>
  </>
  );
}

// ------------------------------

export default Step3;