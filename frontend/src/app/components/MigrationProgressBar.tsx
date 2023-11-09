// React
// ---
// Translation
import { useTranslation } from "react-i18next";

// ------------------------------

const MigrationProgressBar = ({ migrationState }: ITF_TransferProgressBar ) => {

  const { t } = useTranslation();

  const processed = migrationState.errorItemsCount+migrationState.skippedItemsCount+migrationState.successItemsCount;

  return (
      <div className="w-full h-full ">

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

      </div>
  );
};

// ------------------------------

export default MigrationProgressBar;