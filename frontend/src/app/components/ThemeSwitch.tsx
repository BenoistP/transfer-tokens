// React
import { useCallback, useEffect, useState } from "react";
// Theme switcher hook
import { useTheme } from 'next-themes'
// Icons
import { SunIcon, MoonIcon, HomeIcon } from '@heroicons/react/24/solid'

// ------------------------------

export const ThemeSwitch = () => {

  const { theme, setTheme, themes } = useTheme()

  const findThemeId = () => themes.findIndex((aTheme) => aTheme == theme);

  const [themeId, setthemeId] = useState<number>(findThemeId());

  const themesCount = themes.length;

  const nextTheme = useCallback( () => {
    setthemeId( () => { return ( (themeId + 1)%themesCount ) });
  },
  [themeId, themesCount]
  );

  const swapDefaultChecked = (themeId % 2 != 0);

  const hiddenCls = " hidden";

  const getCls = (icon_Id:number, themeId:number, swapDefaultChecked:boolean) => {
    const swapOff = " swap-off";
    const swapOn = " swap-on";
    const isOn = (swapDefaultChecked? swapOn : swapOff);
    const isOff = (swapDefaultChecked? swapOff : swapOn);
    return (themeId == icon_Id) ? isOn : isOff;
  }

  const iconCls = "fill-base-content w-6 h-6 sm:w-10 sm:h-10 transition-all duration-300 ease-in-out ";

  const [Icon_0_Cls, setIcon_0_Cls] = useState<string>(hiddenCls);
  const [Icon_1_Cls, setIcon_1_Cls] = useState<string>(hiddenCls);
  const [Icon_2_Cls, setIcon_2_Cls] = useState<string>(hiddenCls);

  useEffect(() => {
    setTheme(themes[themeId]);
    setIcon_0_Cls(getCls(0, themeId, swapDefaultChecked));
    setIcon_1_Cls(getCls(1, themeId, swapDefaultChecked));
    setIcon_2_Cls(getCls(2, themeId, swapDefaultChecked));
  }, [setTheme, swapDefaultChecked, themeId, themes])

  const switchTheme = useCallback(() => {
      nextTheme();
  }, [nextTheme]);

  // ------------------------------

/*
theme ThemeId checked?  display Moon           Sun             Home
0      0        N       Moon    SWAP-OFF       swap-on         hidden
1      1        Y       Sun     hidden         SWAP-ON         swap-off
2      2        N       Home    swap-on        swap-on|hidden  SWAP-OFF
3      0        Y       Moon    SWAP-ON        swap-off        swap-off|hidden
4      1        N       Sun     hidden|swap-on swap-on         SWAP-OFF
5      2        Y       Home    swap-off       hidden|swap-off SWAP-ON
...
*/

  return (
    <>
      <label className="btn btn-ghost btn-circle swap swap-rotate scale-75 hover:scale-90 transition-all duration-300 ease-in-out" 
      >
        {/* this hidden checkbox controls the state */}
        <input type="checkbox"
          checked={swapDefaultChecked}
          onClick={switchTheme}
          onChange={ () => {} } // get rid of missing onChange warning
        />
        <MoonIcon className={iconCls+Icon_0_Cls} />
        <SunIcon className={iconCls+Icon_1_Cls} />
        <HomeIcon className={iconCls+Icon_2_Cls} />
      </label>
    </>
  );
};