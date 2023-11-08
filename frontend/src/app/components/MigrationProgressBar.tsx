// React
// import { useEffect, useState } from "react";
// Translation
import { useTranslation } from "react-i18next";

// ------------------------------

const MigrationProgressBar = ({ migrationState }: ITF_TransferProgressBar ) => {

  const { t } = useTranslation();
  // console.debug(`MigrationProgressBar.tsx render migrationState=`)
  // console.dir(migrationState)

  // const [total, settotal] = useState(migrationState.totalItemsCount)
  // const [success, setsuccess] = useState(migrationState.successItemsCount)
  // const [skipped, setskipped] = useState(migrationState.skippedItemsCount)
  // const [error, seterror] = useState(migrationState.errorItemsCount)

  // useEffect(() =>
  //   {
  //     console.debug(`MigrationProgressBar.tsx useEffect migrationState=`)
  //     console.dir(migrationState)
  //     settotal(migrationState.totalItemsCount)
  //     setsuccess(migrationState.successItemsCount)
  //     setskipped(migrationState.skippedItemsCount)
  //     seterror(migrationState.errorItemsCount)
  //   }, [migrationState, migrationState.errorItemsCount, migrationState.skippedItemsCount, migrationState.successItemsCount, migrationState.totalItemsCount]
  // )
  const processed = migrationState.errorItemsCount+migrationState.skippedItemsCount+migrationState.successItemsCount;

  return (
      <div className="w-full h-full ">
        {/* <progress className="progress w-full"></progress> */}
{/*         
        <div className="flex w-full">
          <div className="px-2">
            Progress: {migrationState.errorItemsCount+migrationState.skippedItemsCount+migrationState.successItemsCount} / {migrationState.totalItemsCount}
          </div>
          <div className="flex-grow">
            <progress className="progress progress-info w-full" value={migrationState.errorItemsCount+migrationState.skippedItemsCount+migrationState.successItemsCount} max={migrationState.totalItemsCount}></progress>
          </div>
        </div>
 */}

        <div className="flex w-full pr-2">
          <div className="px-2">
            {t('moveTokens.stepThree.migrationProgressBar.success')}: {migrationState.successItemsCount} / {migrationState.totalItemsCount}
          </div>
          <div className="flex-grow">
            <progress className="progress progress-success w-full" value={migrationState.successItemsCount} max={migrationState.totalItemsCount}></progress>
          </div>
        </div>

        <div className="flex w-full pr-2">
          <div className="px-2">
            {t('moveTokens.stepThree.migrationProgressBar.skipped')}: {migrationState.skippedItemsCount} / {migrationState.totalItemsCount}
          </div>
          <div className="flex-grow">
            <progress className="progress w-full" value={migrationState.skippedItemsCount} max={migrationState.totalItemsCount}></progress>
          </div>
        </div>

        <div className="flex w-full pr-2">
          <div className="px-2">
            {t('moveTokens.stepThree.migrationProgressBar.failed')}: {migrationState.errorItemsCount} / {migrationState.totalItemsCount}
          </div>
          <div className="flex-grow">
            <progress className="progress progress-error w-full" value={migrationState.errorItemsCount} max={migrationState.totalItemsCount}></progress>
          </div>
        </div>

        <div className="flex w-full pr-2">
          <div className={"px-2 text-base font-semibold "+(processed==migrationState.totalItemsCount?"text-info":"text-warning")}>
            {t('moveTokens.stepThree.migrationProgressBar.status.label')}: {processed!=migrationState.totalItemsCount?t('moveTokens.stepThree.migrationProgressBar.status.progress'):t('moveTokens.stepThree.migrationProgressBar.status.completed')}
          </div>
          <div className="flex-grow">
            <progress className="progress progress-info w-full" value={processed} max={migrationState.totalItemsCount}></progress>
          </div>
        </div>

{/* 
        <div className="flex w-full pr-2">
          <div className="px-2">
            Succes: {success} / {total}
          </div>
          <div className="flex-grow">
          <progress className="progress progress-success w-full" value={success} max={total}></progress>
          </div>
        </div>

        <div className="flex w-full pr-2">
          <div className="px-2">
            Skipped: {skipped} / {total}
          </div>
          <div className="flex-grow">
            <progress className="progress w-full" value={skipped} max={total}></progress>
          </div>
        </div>

        <div className="flex w-full pr-2">
          <div className="px-2">
            Failed: {error} / {total}
          </div>
          <div className="flex-grow">
            <progress className="progress progress-error w-full" value={error} max={total}></progress>
          </div>
        </div>

        <div className="flex-grow px-2">
            <progress className="progress progress-info w-full" value={error+skipped+success} max={total}></progress>
        </div>
 */}
      </div>
  );
};

// ------------------------------

export default MigrationProgressBar;