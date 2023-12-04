// React
import { useEffect } from "react";

export default function StepError (
  { setpreviousDisabled, setNextDisabled }: IStepErrorProps ) {

  useEffect( () => {
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