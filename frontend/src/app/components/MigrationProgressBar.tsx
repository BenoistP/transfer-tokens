// React

// ------------------------------

const MigrationProgressBar = ({ showProgressBar=false, migrationState }: ITF_ProgressBar ) => {

  console.debug(`MigrationProgressBar.tsx render showProgressBar=${showProgressBar} migrationState=`)
  console.dir(migrationState)

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
            Succes: {migrationState.successItemsCount} / {migrationState.totalItemsCount}
          </div>
          <div className="flex-grow">
          <progress className="progress progress-success w-full" value={migrationState.successItemsCount} max={migrationState.totalItemsCount}></progress>
          </div>
        </div>

        <div className="flex w-full pr-2">
          <div className="px-2">
            Skipped: {migrationState.skippedItemsCount} / {migrationState.totalItemsCount}
          </div>
          <div className="flex-grow">
            <progress className="progress w-full" value={migrationState.skippedItemsCount} max={migrationState.totalItemsCount}></progress>
          </div>
        </div>

        <div className="flex w-full pr-2">
          <div className="px-2">
            Failed: {migrationState.errorItemsCount} / {migrationState.totalItemsCount}
          </div>
          <div className="flex-grow">
            <progress className="progress progress-error w-full" value={migrationState.errorItemsCount} max={migrationState.totalItemsCount}></progress>
          </div>
        </div>

        <div className="flex-grow px-2">
            <progress className="progress progress-info w-full" value={migrationState.errorItemsCount+migrationState.skippedItemsCount+migrationState.successItemsCount} max={migrationState.totalItemsCount}></progress>
        </div>

      </div>
  );
};

// ------------------------------

export default MigrationProgressBar;