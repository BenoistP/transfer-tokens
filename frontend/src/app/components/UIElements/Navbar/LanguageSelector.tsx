// React
import { useCallback, useEffect, useState } from "react"
// Context
import { useGlobalAppContext } from "@Providers/GlobalAppProvider/GlobalAppContext"
// Translation
import { useTranslation } from "react-i18next"
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from "@uiconsts/languages"
// Cookies
import { useCookies } from "react-cookie"
import { COOKIE_LANGUAGE } from "@uiconsts/misc"
// country-flag-icons
import { GB, FR, ES } from 'country-flag-icons/react/3x2'
// Styles
import { clsFlagIcon } from "@uiconsts/twDaisyUiStyles"

const FlagIcon = ({ flagIconCountryCode = "" }: iFlagIconProps): JSX.Element => {
  return (
    <span>
      {flagIconCountryCode == "GB" &&
        <GB title="United Kingdom" className={clsFlagIcon} />
      }
      {flagIconCountryCode == "FR" &&
        <FR title="France" className={clsFlagIcon} />
      }
      {flagIconCountryCode == "ES" &&
        <ES title="España" className={clsFlagIcon} />
      }
    </span>
  );
}

export default function LanguageSelector(): JSX.Element {

  const { i18n } = useTranslation();
  const [languages, setLanguages] = useState<iLanguage[]>([]);
  const [cookies, setCookie] = useCookies();
  const { globalAppDataHandlers: { setLanguage } } = useGlobalAppContext()

  /**
   * Get flag icon country code
   * @param languageKey
   */
  const getFlagIconCountryCode = useCallback(
    (languageKey: string) => {
      try {
        for (let index = 0; index < languages?.length; index++) {
          if (languages[index].key == languageKey) return languages[index].flagCountryCode;
        }
      } catch (error) {
        console.error(`LanguageSelector.tsx error=${error}`);
      }
      return DEFAULT_LANGUAGE.flagCountryCode;
    },
    [languages]
  )

  /**
   * Language change handler
   * @param language 
   */
  const handleLanguageChange = async (language: iLanguage) => {
    try {
      await i18n.changeLanguage(language.key);
      if (cookies[COOKIE_LANGUAGE] != language) setCookie(COOKIE_LANGUAGE, language.key, { path: '/' });
      setLanguage(language.key)
      // Force close daisyUI dropdown on click
      const elem = document.activeElement as HTMLElement;
      elem?.blur();
    } catch (error) {
      console.error(`LanguageSelector.tsx error=${error}`);
    }
  };

  /**
   * Setup languages
   */
  useEffect(() => { const setupLanguages = async () => setLanguages(SUPPORTED_LANGUAGES); setupLanguages(); }, []);

  /**
   * Set current language
   */
  useEffect(() => setLanguage(i18n.language), [i18n.language, setLanguage]);

  return (
    <div className="dropdown bg-base-200">
      <label tabIndex={0} className="btn btn-ghost btn-circle">
        <FlagIcon flagIconCountryCode={getFlagIconCountryCode(i18n.language)} />
      </label>
      <ul tabIndex={0} className="menu menu-sm dropdown-content mt-2 z-[1] p-2 shadow-lg rounded w-36 bg-base-300 ">
        {languages.map(language => (
          <li key={language.key} className="flex  ">
            <button onClick={() => handleLanguageChange(language)}>
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
}