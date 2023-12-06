// React

// Components
import FooterStatus from "@UIElements/FooterStatus";
// Translation
import { useTranslation } from "react-i18next";

export default function Footer({ showActivity }: iFooter): JSX.Element {

  const { t } = useTranslation();

  return (
    <>
      <div className="w-full justify-center items-center fixed inset-x-0 bottom-0 shadow-xs opacity-90 z-10 mt-2 mb-0 pb-0" id="currentbottom">

        <div className=" w-full bg-base-300 text-base-content" >
          <div className="flex flex-row justify-between items-center text-xs sm:text-sm md:text-base transition-all">
            <div className=" font-light ">

              <div className="tooltip tooltip-right text-base-content text-xs sm:text-sm md:text-base font-normal" data-tip={t('moveTokens.Footer.info.text')} >
                <span className="badge badge-ghost badge-sm bg-neutral text-neutral-content border border-neutral-content">
                  {t('moveTokens.Footer.info.title')}
                </span>
              </div>
            </div>
            <div className="font-light ">
              <div className=" flex flex-row justify-center items-center">
              </div>
            </div>
            <div className="w-32">
              <FooterStatus showActivity={showActivity} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}