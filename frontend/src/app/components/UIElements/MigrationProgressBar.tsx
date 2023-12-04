// React

// Translation
import { useTranslation } from "react-i18next";

export default function MigrationProgressBar({ migrationState }: ITF_TransferProgressBar): JSX.Element {

  const { t } = useTranslation();
  const processed = migrationState.errorItemsCount + migrationState.skippedItemsCount + migrationState.successItemsCount;

  return (
    <div className="w-full h-full ">
      <div className="grid grid-cols-8 gap-2">
        <div className="col-span-2 sm:col-span-1 whitespace-nowrap">
          <div className="px-2 text-xs md:text-sm">
            {t('moveTokens.stepThree.migrationProgressBar.success')}: {migrationState.successItemsCount} / {migrationState.totalItemsCount}
          </div>
        </div>
        <div className="col-span-6 sm:col-span-7">
          <div className="px-1">
            <progress className="progress progress-success w-full" value={migrationState.successItemsCount} max={migrationState.totalItemsCount}></progress>
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1 whitespace-nowrap">
          <div className="px-2 text-xs md:text-sm">
            {t('moveTokens.stepThree.migrationProgressBar.skipped')}: {migrationState.skippedItemsCount} / {migrationState.totalItemsCount}
          </div>
        </div>
        <div className="col-span-6 sm:col-span-7">
          <div className="px-1">
            <progress className="progress w-full" value={migrationState.skippedItemsCount} max={migrationState.totalItemsCount}></progress>
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1 whitespace-nowrap">
          <div className="px-2 text-xs md:text-sm">
            {t('moveTokens.stepThree.migrationProgressBar.failed')}: {migrationState.errorItemsCount} / {migrationState.totalItemsCount}
          </div>
        </div>
        <div className="col-span-6 sm:col-span-7">
          <div className="px-1">
            <progress className="progress progress-error w-full" value={migrationState.errorItemsCount} max={migrationState.totalItemsCount}></progress>
          </div>
        </div>
        <div className={"col-span-2 sm:col-span-1" + ((migrationState.paused && !migrationState.stopped) ? " animate-pulse" : "")}>
          <div className={"min-w-20 pl-2 text-sm md:text-base font-semibold hover:whitespace-normal hover:overflow-visible whitespace-nowrap overflow-hidden text-ellipsis " + (processed == migrationState.totalItemsCount ? "text-info" : "text-warning")}>
            {t('moveTokens.stepThree.migrationProgressBar.status.label')}: {(processed != migrationState.totalItemsCount && !migrationState.stopped) ? t('moveTokens.stepThree.migrationProgressBar.status.progress') : t('moveTokens.stepThree.migrationProgressBar.status.completed')}
          </div>
        </div>
        <div className="col-span-6 sm:col-span-7">
          <div className="px-1">
            <progress className={"progress progress-info w-full" + ((migrationState.paused && !migrationState.stopped) ? " animate-pulse" : "")} value={processed} max={migrationState.totalItemsCount}></progress>
          </div>
        </div>
      </div>
    </div>
  );
}