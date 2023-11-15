// React
// ---
// Components
import { FooterStatus } from "@Components/FooterStatus";
// Translation
import { useTranslation } from "react-i18next";

// Router
// import { Link } from "react-router-dom";
// Icons
// import { ChevronUpIcon, ChevronDownIcon, ChevronDoubleDownIcon, ChevronDoubleUpIcon } from '@heroicons/react/24/solid'

// ----------------------------------------------------------------------

export const Footer = ({showActivity}:iFooter) => {

    const { t } = useTranslation();

    // ------------------------------

    return (
        <>
            <div className="w-full justify-center items-center sticky bottom-0 shadow-xs opacity-90 z-10 mt-2 mb-0 pb-0" id="currentbottom">

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

{/* 
                                <Link to="#">
                                    <ChevronDoubleUpIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" />
                                </Link>
                                <Link to="#currenttop">
                                    <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" />
                                </Link>
                                <Link to="#currentbottom">
                                    <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" />
                                </Link>
                                <Link to="#bottom">
                                    <ChevronDoubleDownIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current" />
                                </Link>
 */}
                            </div>
                        </div>
                        <div className="w-32">
                            <FooterStatus showActivity={showActivity}/>
                        </div>
                    </div>
               </div>
            </div>
        </>
    );
};