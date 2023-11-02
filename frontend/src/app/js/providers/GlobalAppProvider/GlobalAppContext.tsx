import { createContext, useCallback, useContext, useMemo, useState } from 'react'
// Avatars
import { createAvatar } from '@dicebear/core';
import { identicon } from '@dicebear/collection';
// Icons
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
        setLanguage: (/* lang:string */) => {},
        getAvatarComponent: () => { return undefined },
        getAddress: () => { return undefined },
        setAddress: (/* address:TAddressUndef */) => { /* return undefined */ },
      }
  })

GlobalAppContext.displayName = 'GlobalApp_Context'

const GlobalAppProvider = ( { children }:any ) => {

  const lockAvatar = useMemo(() => {
    return <LockClosedIcon className="w-6 h-6 sm:w-8 sm:h-8 text-base-content text-xs" />
    }, [])

  const initialGlobalAppData: TGlobalAppDataContext = {
    language:         'en',
    address           : undefined,
}

  const [globalAppData, setglobalAppData] = useState<TGlobalAppDataContext>(initialGlobalAppData);

  const defaultAvatarAddress = '0x';

  const avatarImgUri = useCallback((/* _address:Address */) =>
  {
    return createAvatar(identicon, {
      seed: (globalAppData.address?globalAppData.address:(defaultAvatarAddress)),
      size: 128,
      // ... other options
    }).toDataUriSync();
  },
  [globalAppData.address])

  const DefaultAvatarComponent = useCallback( () => 
    <div className='flex justify-center items-center transition-all duration-300 ease-in-out'>
        {lockAvatar}
    </div>,
    [lockAvatar]
  );

  const ImgAvatarComponent = useCallback( () => 
    <div className='flex justify-center items-center transition-all duration-300 ease-in-out'>
        <img src={avatarImgUri()} alt='avatar' />
    </div>,
    [avatarImgUri]
  )

  const AvatarComponent = useMemo(() => {
    return (
      globalAppData.address?
        ImgAvatarComponent
      :
        DefaultAvatarComponent
      );
  },
  [globalAppData.address, DefaultAvatarComponent, ImgAvatarComponent])


  const globalAppDataHandlers = useMemo( () =>
    ({
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
      setAddress: (newAddress:TAddressUndef) => {
        setglobalAppData( (prevGlobalAppData) => {
          const newData = {
            ...prevGlobalAppData,
            address: newAddress,
          }
          return newData;
        })
      }, // setAddress
    }),
    [AvatarComponent, globalAppData.address, globalAppData.language]
  ) // globalAppDataHandlers

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