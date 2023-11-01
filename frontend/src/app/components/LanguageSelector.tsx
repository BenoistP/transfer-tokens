// React
import {useCallback, useEffect, useState} from "react";
// Context
import { useGlobalAppContext } from "@Providers/GlobalAppProvider/GlobalAppContext";
// Translation
import { useTranslation } from "react-i18next";
import {SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE} from "@uiconsts/languages";
// Cookies
import { useCookies } from "react-cookie";
import { COOKIE_LANGUAGE } from "@uiconsts/misc";

// ------------------------------

const FlagIcon = ({flagIconCountryCode = ""}: FlagIconProps) => {
    console.debug(`LanguageSelector.tsx FlagIcon flagIconCountryCode=${flagIconCountryCode}`)
    return (
        <span
            className={`ml-2 fi fis fiCircle inline-block mr-2 fi-${flagIconCountryCode}`}
        />
    );
}

// ---

export const LanguageSelector = () =>
{
  const {i18n} = useTranslation();
  const [languages, setLanguages] = useState<iLanguage[]>([]);
  const [cookies, setCookie] = useCookies();
  const {globalAppDataHandlers: {setLanguage}} = useGlobalAppContext()

  // ---

  const handleLanguageChange = async (language: iLanguage) =>
  {
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
      console.error(`LanguageSelector.tsx error=${error}`);
    }
  };

  // ---

  useEffect(() =>
  {
    try {
      const setupLanguages = async () => {
        setLanguages(SUPPORTED_LANGUAGES);
      };
      // const setupCookies = () => {
      // };
      setupLanguages();
      // setupCookies();
    } catch (error) {
      console.error(`LanguageSelector.tsx error=${error}`);
    }
}, []);

  useEffect( () =>
    {
      console.debug(`LanguageSelector.tsx useEffect [i18n.language, setLanguage] i18n.language=${i18n.language}`)
        setLanguage(i18n.language)
    },
    // X eslint-disable-line react-hooks/exhaustive-deps
    [i18n.language, setLanguage]);

  // ---

  const getFlagIconCountryCode = useCallback( (languageKey:string) =>
    {
      try {
        if (languages && languages.length > 0) {
            for (let index = 0; index < languages.length; index++) {
                if (languages[index].key == languageKey) return languages[index].flagIconCountryCode;
            }
            console.warn(`getFlagIconCountryCode: languageKey not found: ${languageKey}`)
        }
      } catch (error) {
        console.error(`LanguageSelector.tsx error=${error}`);
      }
      return DEFAULT_LANGUAGE.flagIconCountryCode;
    },
    [languages],
  ) // getFlagIconCountryCode

// ---
console.debug(`LanguageSelector.tsx render i18n.language=${i18n.language} getFlagIconCountryCode=${getFlagIconCountryCode(i18n.language)}`)

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