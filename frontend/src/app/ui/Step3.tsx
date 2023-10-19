// import { useEffect, useCallback, useState } from "react";

// ------------------------------


const Step3 = ( { setShowProgressBar, setProgressBarPercentage }: IStep3Props ) => {

  console.debug(`Step3.tsx render`)
 
  // ---

  setShowProgressBar(true)
  setProgressBarPercentage(0)

  // ---


  return (
    <>
      <div className="bg-neutral w-full m-2 p-2 rounded-box border border-neutral-content">
          <p className="text-sm sm:text-base md:text-lg overflow-hidden text-center text-accent">
            {"COMING"}
            {/* getAddress()={getAddress()} */}
          </p>&nbsp;
          <p className="text-sm sm:text-base md:text-lg overflow-hidden text-center text-warning font-extrabold">
            {"SOON"}
            {/* getAddress()={getAddress()} */}
          </p>
      </div>
    </>
  );
}



// ------------------------------

export default Step3;