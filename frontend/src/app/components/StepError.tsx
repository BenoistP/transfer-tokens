// React
import { useEffect } from "react";

export default function StepError(
  { setpreviousDisabled, setNextDisabled }: IStepErrorProps): JSX.Element {

  useEffect(() => {
    setpreviousDisabled(true)
    setNextDisabled(true)
  }, [setpreviousDisabled, setNextDisabled])

  return (
    <>
      <div className=" text-red-500">
        <p className="text-sm sm:text-base md:text-lg overflow-hidden text-ellipsis">
          {"moveTokens.stepError.label"}
        </p>
      </div>
    </>
  );
}