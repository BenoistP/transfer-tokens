import { createContext, useCallback, useContext, useMemo, useState } from 'react'
// import {
//   AvatarComponent,
// } from '@rainbow-me/rainbowkit';
import { useTranslation } from "react-i18next";

// Avatars
import { createAvatar } from '@dicebear/core';
import { identicon } from '@dicebear/collection';
import { LockClosedIcon } from '@heroicons/react/24/solid'

const GlobalAppContext = createContext<TGlobalAppContext>(
  {
    // Initial context
    globalAppData: {
        language: 'en',
        address:  undefined,
    },
    globalAppDataHandlers: {
        getLanguage: () => {},
        setLanguage: (lang:string) => {},
        getAvatarComponent: () => { return undefined },
        getAddress: () => { return undefined },
        setAddress: (address:Address) => { /* return undefined */ },
      }
  })

GlobalAppContext.displayName = 'GlobalApp_Context'

const GlobalAppProvider = ( { children }:any ) => {
  const { i18n } = useTranslation()
  const lockAvatar = useMemo(() => {
    return <LockClosedIcon className="w-6 h-6 text-primary base-content" />
    }, [])

  const initialGlobalAppData: TGlobalAppDataContext = {
    language:         'en',
    address           : undefined,
}

  const [globalAppData, setglobalAppData] = useState<TGlobalAppDataContext>(initialGlobalAppData);

  const defaultAvatarAddress = '0x';

  const avatarImgUri = useCallback((/* _address:Address */) =>
  {
    // console.debug(`GlobalAppProvider: useCallback: avatarImgUri globalAppData.address=${globalAppData.address}`);
    return createAvatar(identicon, {
      seed: (globalAppData.address?globalAppData.address:(defaultAvatarAddress)),
      size: 128,
      // ... other options
    }).toDataUriSync();
  },
  [globalAppData.address])

  const DefaultAvatarComponent = () => 
    <div className='flex justify-center items-center'>
        {lockAvatar}
    </div>

  const ImgAvatarComponent = () => 
  <div className='flex justify-center items-center'>
      <img src={avatarImgUri()} alt='avatar' />
  </div>

  const AvatarComponent = useMemo(() => {
    // console.debug(`GlobalAppProvider: useCallback: AvatarComponent globalAppData.address=${globalAppData.address}`);
    return (
      globalAppData.address?
        ImgAvatarComponent
      :
        DefaultAvatarComponent
      );
    // return undefined
  },
  [globalAppData.address])


  const globalAppDataHandlers = useMemo( () => ({

  // const globalAppDataHandlers = {
    
      getLanguage: () => {
        return globalAppData.language;
      },
      setLanguage: (lang:string) => {
        setglobalAppData( (prevGlobalAppData) => {
          return {
            ...prevGlobalAppData,
            language: lang,
          }
        })
      },
      getAvatarComponent: () => {
        return AvatarComponent

      },
      getAddress: () => {
        return globalAppData.address;
      },
      setAddress: (newAddress:Address) => {
        setglobalAppData( (prevGlobalAppData) => {
          const newData = {
            ...prevGlobalAppData,
            address: newAddress,
          }
          return newData;
        })
      }, // setAddress
    }),
    [globalAppData.address]
  ) // globalAppDataHandlers

  // } // globalAppDataHandlers

  return (
    <GlobalAppContext.Provider value={{globalAppData:globalAppData, globalAppDataHandlers:globalAppDataHandlers}}>
      {children}
    </GlobalAppContext.Provider>
  )

}

const useGlobalAppContext = () => {
  if (!GlobalAppContext) throw new Error('useGlobalAppContext must be used within a GlobalAppProvider')
  return useContext(GlobalAppContext)
}

export {GlobalAppProvider, useGlobalAppContext /* , GlobalAppContext, GlobalAppConsumer */ };