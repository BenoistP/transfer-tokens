import { createContext, useContext/*, useState*/ } from "react";

// export const UserContext = createContext(null)
/*
const userContext = createContext( {user: null} )
userContext.displayName = 'User Context'

export { userContext }

*/

/*
  const login = (userDetails) => {
    setUser(userDetails);
    navigate("/admin/dashboard");
  };

  const logout = () => {
    setUser({});
    navigate("/");
  };
*/
const UserContext = createContext(
  {
    userData: { 
      isLoggedIn: false   // user logged in / authentified
      /*
        isLoggedIn: false   // user logged in / authentified
        address:undefined   // user wallet public address
        email: undefined    // user email
        connectionProviderName: undefined // wallet/authent connection provider
        connectionProviderInstance: undefined,// provider instance in use
        connectionProviderMetadata: undefined,// provider metadata in use
        username:undefined
        chainId: undefined  // current blockchain chain id
        language: undefined // current language


        isDbDataLoaded: false     // is data loaded from db available ?
        // Data saved to / loaded from DB
        dbData:   // undefined
          {
            ID: undefined
            username: undefined

            connectionProviderName: undefined
            connectionProviderMetadata: // wallet/authent  metaData. e.g. magic.link:
              {
                issuer: "did:ethr:0x",
                publicAddress:"0x",
                email: 

              }
            ,
            userPrefs: {
              chainId: undefined  // saved blockchain chain id
              language: undefined // saved language
            }

          }

      */
    },
    isAuthenticated: false, // TODO : remove
    /* eslint-disable @typescript-eslint/no-empty-function */
    setuserData: () => {},
    logoutUserFromApp: () => {},
    isUserLoggedInApp: () => {},
    getUserConnectionProviderName: () => {},
    getUserConnectionProviderInstance: () => {},
    resetUserData: () => { },
    getUserAddress: () => { },
    getUserLanguage: () => { },
    setUserLanguage: () => { },
    
  })

UserContext.displayName = 'User_Context'

const UserProvider = UserContext.Provider
const UserConsumer = UserContext.Consumer

const useUserContext = () => {
  return useContext(UserContext);
}

export { /*UserContext,*/ UserProvider, UserConsumer, useUserContext }