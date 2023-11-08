// React

// Components
import ProgressStepBar from "@Components/ProgressStepBar";
// import ProgressBar from "@Components/ProgressBar";
import MigrationProgressBar from "./MigrationProgressBar"; "@Components/MigrationProgressBar";

// Context
import { useMoveTokensAppContext } from '@Providers/MoveTokensAppProvider/MoveTokensAppContext'

// Translation
import { useTranslation } from 'react-i18next';

// ------------------------------

const ProgressContainer = ( {
  previousDisabled, nextDisabled, showProgressBar, migrationState
  // progressBarPercentage
  }: ITF_ProgressContainer ) => {

  // console.debug(`ProgressContainer.tsx render previousNextDisabled=${previousNextDisabled}`)
  // console.debug(`ProgressContainer.tsx render`)

  const { moveTokensAppData: { step = -1, minStep , maxStep, } , moveTokensAppDataHandlers: { nextStep, prevStep } } = useMoveTokensAppContext()
  const { t } = useTranslation();


  const disablePrevious = previousDisabled || (step <= minStep)
  const disableNext = nextDisabled || (step >= maxStep)

  // const clsBtnRounding = "flex-nowrap rounded-t-lg rounded-r-lg"
  // const clsBtnRounding = "flex-nowrap"
  // const clsBtnRing = "ring-1 ring-black "
  const clsBtnBase = ""// clsBtnRounding + " " // + clsBtnRing + " "

  const clsBtnNextPrevious = clsBtnBase + "btn btn-neutral btn-outline shadow-xl text py-2 px-1 sm:px-1 md:px-2 m-1 md:m-2" +
  " ease-in-out duration-300 sm:h-10 md:h-12" +
  " disabled:btn disabled:btn-disabled disabled:cursor-no-drop"

   const clsBtnSize = " w-20 sm:w-32 md:w-36"
   const clsBtnPrevious = clsBtnNextPrevious + clsBtnSize
   const clsBtnNext = clsBtnNextPrevious + clsBtnSize
 
   const clsBtnTextSize = " text-xs sm:text-sm md:text-base "
   const clsBtnText = "p-0 m-0 overflow-hidden text-ellipsis normal-case font-medium" + clsBtnTextSize
  //  const clsBtnText = "p-0 m-0 overflow-hidden text-xs sm:text-sm inline "
  //  const clsBtnTextEllipsis = "p-0 m-0 overflow-hidden text-xs sm:text-sm  text-ellipsis"


  return (
    <>
      <div className="w-full grid gap-0 grid-cols-10 grid-rows-2 sm:grid-cols-10 sm:grid-rows-1 bg-base-100 text-base-content rounded-lg">

        <div className={"col-start-1 col-span-2 sm:col-span-2 flex justify-self-start base-100"}>
            <button className={clsBtnPrevious}
              onClick={prevStep}
              disabled={disablePrevious}
            >
              <p className={clsBtnText}>⬅&nbsp;{t("moveTokens.progress.previous")}</p>
              {/* <div className={clsBtnText}>⬅</div><div className={clsBtnTextEllipsis}>{t("moveTokens.progress.previous")}&nbsp;</div> */}
            </button>

        </div>
{/*         
        <div className="w-full col-start-3 sm:col-start-3 col-span-8 sm:col-span-6 row-span-2 sm:row-span-1 justify-self-center sm:justify-self-stretch base-100">
        <ProgressStep step={step} />
        </div>
 */}

        <div className="w-full col-start-3 sm:col-start-3 col-span-8 sm:col-span-6 row-span-1 sm:row-span-1 justify-self-start sm:justify-self-start base-100 px-2">
          <ProgressStepBar step={step} />
          {/* <ProgressBar progressPercentage={100} /> */}
       </div>
{/* 
       <div className="w-full col-start-3 sm:col-start-3 col-span-8 sm:col-span-6 row-span-2 sm:row-span-1 justify-self-start sm:justify-self-start base-100 px-2">
          <ProgressBar progressPercentage={100} />
       </div>
 */}
        <div className={"col-start-1 sm:col-start-10 col-span-2 sm:col-span-2 justify-self-start sm:justify-self-end base-100 "}>
          <button className={clsBtnNext}
            onClick={nextStep}
            disabled={disableNext}
          >
            <p className={clsBtnText}>{t("moveTokens.progress.next")}&nbsp;➡</p>
            {/* <div className={clsBtnTextEllipsis}>{t("moveTokens.progress.next")}&nbsp;</div><div className={clsBtnText}>➡</div> */}
          </button>
        </div>

{/* 
        <div className="flex flex-wrap content-center w-full col-start-3 sm:col-start-1 col-span-8 sm:col-span-10 row-span-2 sm:row-span-1 sm:mt-1 justify-self-center sm:justify-self-center base-100 px-2">
          <ProgressBar showProgressBar={showProgressBar} progressPercentage={progressBarPercentage} />
        </div>
 */}

        {/* <div className="col-start-4 sm:col-start-4 col-span-5 sm:col-span-5 row-span-2 sm:row-span-1 justify-stretch base-100 m-1"> */}
          {/* <ProgressBarColor progressPercentage={ (step+1 - minStep) / (maxStep+1 - minStep) * 100} /> */}
          {/* <ProgressStepBar step={step} /> */}
        {/* </div> */}


 {/* TODO: Transfer(s) progress */}
{/* 
        <div className="grid-cols-1 sm:grid-cols-3 bg-blue-600">
          <ProgressBar progressPercentage={ 0  } />
        </div>
*/}

        { (showProgressBar /* TODO: remove || true */ || true) &&
        <div className="grid-cols-1 col-span-8 sm:grid-cols-3 sm:col-span-10 mt-1">
          <MigrationProgressBar /* showProgressBar={showProgressBar} */ migrationState={migrationState} />
        </div>
        }
      </div>
    </>
  );
}

// ------------------------------

export default ProgressContainer;