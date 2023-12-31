import { useTranslation } from "react-i18next";

export default function StepProgressBar({ step }: any): JSX.Element {

  const { t } = useTranslation();
  const clsStepBase = "step "
  const clsStepPreviousCurrent = clsStepBase + "step-neutral "
  const clsStepCurrent = clsStepPreviousCurrent + "text-accent-content"
  const clsStepNext = clsStepBase + "font-light"
  const clsStep0 = step === 0 ? clsStepCurrent : clsStepPreviousCurrent
  const clsStep1 = step === 1 ? clsStepCurrent : step > 1 ? clsStepPreviousCurrent : clsStepNext
  const clsStep2 = step === 2 ? clsStepCurrent : step > 2 ? clsStepPreviousCurrent : clsStepNext
  const clsStep3 = step === 3 ? clsStepCurrent : clsStepNext

  return (
    <>
      <div className="flex justify-center text-xs sm:text-sm md:text-md transition-all m-0 my-1 p-0">
        <ul className="w-full steps steps-horizontal step-neutral bg-base rounded-box bg-base-200 px-2 m-0 shadow-xl">
          <li className={clsStep0}>{t("moveTokens.stepZero.titleStep")}</li>
          <li className={clsStep1}>{t("moveTokens.stepOne.titleStep")}</li>
          <li className={clsStep2}>{t("moveTokens.stepTwo.titleStep")}</li>
          <li className={clsStep3}>{t("moveTokens.stepThree.titleStep")}</li>
        </ul>
      </div>
    </>
  );
}