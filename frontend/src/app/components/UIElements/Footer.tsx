// React

// Components
import FooterStatus from "@UIElements/FooterStatus";
// Translation
import { useTranslation } from "react-i18next";
import { clsTextLight } from "@uiconsts/twDaisyUiStyles";

export default function Footer({ showActivity }: iFooter): JSX.Element {

  const { t } = useTranslation();

  return (
    <>
      <div className="w-full justify-center items-center fixed inset-x-0 bottom-0 opacity-90 z-10 mt-2 mb-0 pb-0" id="currentbottom">
        <div className="w-full bg-base-300" >
          <div className={`flex flex-row justify-between items-center ${clsTextLight} transition-all`}>
              <div className="dropdown dropdown-top">
                <div tabIndex={0} role="button" className="btn btn-xs m-1">{t('moveTokens.footer.info.title')}</div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-52 border border-neutral">
                  <li>{t('moveTokens.footer.info.text')}</li>
                </ul>
              </div>
              <div className=" flex flex-row justify-center items-center">
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