import {useCallback, useEffect, useState} from "react";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
import { COOKIE_LANGUAGE } from "~/js/constants/misc";
import SUPPORTED_LANGUAGES from "@i18n/languages";
import { useGlobalAppContext } from "@Providers/GlobalAppProvider/GlobalAppContext";

// ---

function FlagIcon({flagIconCountryCode = ""}: FlagIconProps) {

    return (
        <span
            className={`ml-2 fi fis fiCircle inline-block mr-2 fi-${flagIconCountryCode}`}
        />
    );
}

// ---

export const LanguageSelector = () => {
    const {i18n} = useTranslation();
    const [languages, setLanguages] = useState<iLanguage[]>([]);
    const [cookies, setCookie] = useCookies();
    const {globalAppDataHandlers: {setLanguage}} = useGlobalAppContext()

// ---

const handleLanguageChange = async (language: iLanguage) => {
    try {
        await i18n.changeLanguage(language.key);
        if (cookies[COOKIE_LANGUAGE] != language) {
            setCookie(COOKIE_LANGUAGE, language.key, { path: '/' } )
        }
        setLanguage(language.key)
        // Force close daisyUI dropdown on click
        const elem = document.activeElement as HTMLElement;
        if(elem){
        elem?.blur();
        }
    } catch (error) {
        console.error(error);
    }
};

// ---

useEffect(() => {
    const setupLanguages = async () => {
        setLanguages(SUPPORTED_LANGUAGES);
    };
    // const setupCookies = () => {
    // };
    setupLanguages();
    // setupCookies();
}, []);

useEffect(() => {
    setLanguage(i18n.language)
}, [/* i18n.language */]); // eslint-disable-line react-hooks/exhaustive-deps
// ---

const getFlagIconCountryCode = useCallback(
  (languageKey:string) => {
    if (languages && languages.length > 0) {
        for (let index = 0; index < languages.length; index++) {
            if (languages[index].key == languageKey) return languages[index].flagIconCountryCode;
        }
        console.warn(`getFlagIconCountryCode: languageKey not found: ${languageKey}`)
    }
    return '';
  },
  [languages],
)

// ---

return (
    <div className="dropdown bg-base-200">
      <label tabIndex={0} className="btn btn-ghost btn-circle">
        <FlagIcon flagIconCountryCode={getFlagIconCountryCode(i18n.language)} />
      </label>
      <ul tabIndex={0} className="menu menu-sm dropdown-content mt-2 z-[1] p-2 shadow-lg rounded w-36 bg-base-300 ">
        { languages.map(language => (
            <li key={language.key} className="flex  ">
                <button
                    className=""
                    onClick={() => handleLanguageChange(language)}
                >
                    <div className="">
                        <FlagIcon flagIconCountryCode={language.flagIconCountryCode} />
                    </div>
                    <div className="bg-base-300 text-accent-content opacity-100">
                        {language.name}
                    </div>
                </button>
            </li>
        ))
        }
      </ul>
    </div>
    );
};