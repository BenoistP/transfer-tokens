import { useEffect, useCallback, useState } from "react";

// ------------------------------

const StepError = ( { setpreviousDisabled, setNextDisabled }: IStepErrorProps ) => {

  console.debug(`StepError.tsx render`)
 
  useEffect( () => {
    console.debug(`StepError.tsx useEffect`)
    setpreviousDisabled(true)
    setNextDisabled(true)
  }, [setpreviousDisabled, setNextDisabled] )



  return (
    <>
      <div className=" text-red-500">
        <p className="text-sm sm:text-base md:text-lg overflow-hidden text-ellipsis">
          {"TODO STEP ERROR"}
        </p>
      </div>
    </>
  );
}



// ------------------------------

export default StepError;