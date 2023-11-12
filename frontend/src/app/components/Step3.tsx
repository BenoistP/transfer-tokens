// React
import { useEffect } from "react";
// Components
import TokenInstanceMigrationListTable from "@Components/TokenInstanceMigrationListTable";
// Icons
// import { FaceSmileIcon } from '@heroicons/react/24/solid'

// ------------------------------

const Step3 = ( {
  tokensInstances,
  setNextDisabled,
  setShowProgressBar,
  accountAddress,
  targetAddress,
  tokensInstancesListTablePropsHandlers,
  transferTokens,
  stopTransfers, setstopTransfers,
  pauseTransfers, setpauseTransfers
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

  const handlePauseTransfers = () => {
    setpauseTransfers(!pauseTransfers)
  }

  const handleStopTransfers = () => {
    setstopTransfers(!stopTransfers)
  }

  // ------------------------------

  return (
    <>

<div className="">
  

      <div className="min-w-full ">
        <div className="flex justify-center p-1 bg-base-300 rounded-lg">

          {/* <div className="join"> */}

            <input type="checkbox" className="toggle mt-1" checked={pauseTransfers} onChange={handlePauseTransfers}  /> 
            <label className={(pauseTransfers?"animate-pulse text-warning font-semibold":"text-neutral font-bold")+" text-sm md:text-lg lg:text-lg ml-2 mr-2"}>
              {"Pause"}
            </label>

            <button className="btn btn-xs sm:btn-sm btn-warning pl-4" onClick={handleStopTransfers}>Stop</button>

          {/* </div> */}

        </div>
      </div>

      <div className="min-w-full bg-base-100 my-2"></div>

      <div className="w-full block p-2">
{/* 
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
 */}



        <div className="w-full p-0 m-0">
            <TokenInstanceMigrationListTable
              tokensInstances={tokensInstances}
              accountAddress={accountAddress}
              targetAddress={targetAddress}
              tokensInstancesListTablePropsHandlers={tokensInstancesListTablePropsHandlers}
            />
        </div>

      </div>
</div>
  </>
  );
}

// ------------------------------

export default Step3;