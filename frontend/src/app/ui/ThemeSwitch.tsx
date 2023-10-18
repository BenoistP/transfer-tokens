import React, {useCallback, useEffect, useState} from "react";
import { useTranslation } from "react-i18next";
import { SunIcon, MoonIcon, HomeIcon } from '@heroicons/react/24/solid'

import { useTheme } from 'next-themes'

// ------------------------------

export const ThemeSwitch = () => {

    const { t } = useTranslation();
    const { theme, setTheme, themes } = useTheme()

    const findThemeId = () => themes.findIndex((aTheme) => aTheme == theme);

    const [themeId, setthemeId] = useState<number>(findThemeId());

    const themesCount = themes.length;

    const nextTheme = () => {
      setthemeId( () => { return ( (themeId + 1)%themesCount ) });
    };


  const swapDefaultChecked = (themeId % 2 != 0);

  const hiddenCls = " hidden";

  const getCls = (icon_Id:number, themeId:number, /* themeCount:number, oddThemeCount:number, */ swapDefaultChecked:boolean) => {
    const swapOff = " swap-off";
    const swapOn = " swap-on";
    const isOn = (swapDefaultChecked? swapOn : swapOff);
    const isOff = (swapDefaultChecked? swapOff : swapOn);
    return (themeId == icon_Id) ? isOn : isOff;
  }

  const iconCls = "fill-base-content w-6 h-6 sm:w-10 sm:h-10 transition-all duration-300 ease-in-out ";

  const [Icon_0_Cls, setIcon_0_Cls] = useState<String>(hiddenCls);
  const [Icon_1_Cls, setIcon_1_Cls] = useState<String>(hiddenCls);
  const [Icon_2_Cls, setIcon_2_Cls] = useState<String>(hiddenCls);

  useEffect(() => {
    // console.debug(`ThemeSwitch.tsx: useEffect:themeId="${themeId}"`);
    setTheme(themes[themeId]);
    setIcon_0_Cls(getCls(0, themeId, /* themesCount, oddThemeCount, */ swapDefaultChecked));
    setIcon_1_Cls(getCls(1, themeId, /* themesCount, oddThemeCount, */ swapDefaultChecked));
    setIcon_2_Cls(getCls(2, themeId, /* themesCount, oddThemeCount, */ swapDefaultChecked));
    
    // return () => {
    //   // cleanup
    // }
  }, [themeId])

  const switchTheme = useCallback(() => {
      // console.log("----------------------switchTheme----------------------");
      nextTheme();
      // setTheme(theme === 'dark' ? 'realOrange' : 'dark');

      // console.log(`switchTheme:themeId="${themeId}"`);
  }, [theme]);

  // ------------------------------

/*
theme ThemeId checked?  display Moon           Sun             Home
0      0        N       Moon    SWAP-OFF       swap-on         hidden
1      1        Y       Sun     hidden         SWAP-ON         swap-off
2      2        N       Home    swap-on        swap-on|hidden  SWAP-OFF
3      0        Y       Moon    SWAP-ON        swap-off        swap-off|hidden
4      1        N       Sun     hidden|swap-on swap-on         SWAP-OFF
5      2        Y       Home    swap-off       hidden|swap-off SWAP-ON

6             Moon    swap-off  swap-on   hidden
...
*/

// console.log(`ThemeSwitch.tsx: theme=${theme} themeId=${themeId} swapDefaultChecked=${swapDefaultChecked} \nMoon=${/* iconCls+ */Icon_0_Cls}\nSun=${/* iconCls+ */Icon_1_Cls}\nHome=${/* iconCls+ */Icon_2_Cls}`);
// console.log(`ThemeSwitch.tsx render`);

  
  return (
    <>
      <label className="btn btn-ghost btn-circle swap swap-rotate scale-75 hover:scale-90 transition-all duration-300 ease-in-out" 
          // defaultChecked={swapDefaultChecked}
      >
        {/* this hidden checkbox controls the state */}
        <input type="checkbox"
          checked={swapDefaultChecked}
          onClick={switchTheme}
          onChange={ () => {} } // get rid of warning
        />
        {/* Moon icon */}
        {/* <svg className="swap-off fill-primary-content w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/></svg> */}
        {/* <MoonIcon className={iconCls+" swap-off"} /> */}
        <MoonIcon className={iconCls+Icon_0_Cls} />
        
        {/* Sun icon */}
        {/* <svg className="swap-on fill-primary-content w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/></svg> */}
        {/* <SunIcon className={iconCls+" swap-on"} /> */}
        <SunIcon className={iconCls+Icon_1_Cls} />
        

        {/* Home icon */}
        {/* <HomeIcon className={iconCls+" swap-off"} /> */}
        <HomeIcon className={iconCls+Icon_2_Cls} />

      </label>

    </>
  );
};