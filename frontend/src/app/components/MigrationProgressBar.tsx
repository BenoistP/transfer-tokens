// React

// ------------------------------

const MigrationProgressBar = ({ showProgressBar=false, migrationState }: ITF_ProgressBar ) => {

  console.debug(`MigrationProgressBar.tsx render showProgressBar=${showProgressBar} migrationState=`)
  console.dir(migrationState)

  return (
      <div className="w-full h-full ">
        {/* <progress className="progress w-full"></progress> */}
        <progress className="progress progress-info w-full" value={migrationState.errorItemsCount+migrationState.skippedItemsCount+migrationState.successItemsCount} max={migrationState.totalItemsCount}></progress>
        <progress className="progress progress-success w-full" value={migrationState.successItemsCount} max={migrationState.totalItemsCount}></progress>
        <progress className="progress w-full" value={migrationState.skippedItemsCount} max={migrationState.totalItemsCount}></progress>
        <progress className="progress progress-error w-full" value={migrationState.errorItemsCount} max={migrationState.totalItemsCount}></progress>
      </div>
  );
};

// ------------------------------

export default MigrationProgressBar;