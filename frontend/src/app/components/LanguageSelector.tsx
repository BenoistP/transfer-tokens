// React
import {useCallback, useEffect, useState} from "react"
// Context
import { useGlobalAppContext } from "@Providers/GlobalAppProvider/GlobalAppContext"
// Translation
import { useTranslation } from "react-i18next"
import {SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE} from "@uiconsts/languages"
// Cookies
import { useCookies } from "react-cookie"
import { COOKIE_LANGUAGE } from "@uiconsts/misc"
// country-flag-icons
import { GB, FR } from 'country-flag-icons/react/3x2'
// Styles
import {clsFlagIcon} from "@uiconsts/twDaisyUiStyles"

// ------------------------------
/* 
const FlagIcon = ({flagIconCountryCode = ""}: FlagIconProps) => {
    return (
        <span
            className={`ml-2 fi fis fiCircle inline-block mr-2 fi-${flagIconCountryCode}`}
        />
    );
}
 */
const FlagIcon = ({flagIconCountryCode = ""}: FlagIconProps) => {
  console.debug(`FlagIcon.tsx render flagIconCountryCode=${flagIconCountryCode}`)
  return (
      <span>
          { flagIconCountryCode=="GB" &&
              <GB title="United Kingdom" className={clsFlagIcon}/>
          }
          { flagIconCountryCode=="FR" &&
              <FR title="France" className={clsFlagIcon}/>
          }
      </span>
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
      setupLanguages();
    } catch (error) {
      console.error(`LanguageSelector.tsx error=${error}`);
    }
}, []);

  useEffect( () =>
    {
      setLanguage(i18n.language)
    },
    [i18n.language, setLanguage]);

  // ---

  const getFlagIconCountryCode = useCallback( (languageKey:string) =>
    {
      try {
        if (languages && languages.length > 0) {
            for (let index = 0; index < languages.length; index++) {
                if (languages[index].key == languageKey) return languages[index].flagCountryCode // flagIconCountryCode;
            }
            // console.warn(`getFlagIconCountryCode: languageKey not found: ${languageKey}`)
        }
      } catch (error) {
        console.error(`LanguageSelector.tsx error=${error}`);
      }
      return DEFAULT_LANGUAGE.flagCountryCode // DEFAULT_LANGUAGE.flagIconCountryCode;
    },
    [languages],
  ) // getFlagIconCountryCode

  // ---

  //  console.debug(`LanguageSelector.tsx render i18n.language=${i18n.language} getFlagIconCountryCode=${getFlagIconCountryCode(i18n.language)}`)

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
                        <FlagIcon flagIconCountryCode={language.flagCountryCode} />
                    </div>
                    <div className=" text-accent-content opacity-100">
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