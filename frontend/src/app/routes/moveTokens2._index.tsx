
import AppMoveTokens2 from "~/ui/AppMoveTokens2";

// Remix Loader, json
import { json, LoaderFunction, LoaderArgs } from "@remix-run/node";

import TOKENS_LISTS from '~/js/tokensLists/tokensLists'

import {
  getTokensLists_TokenData,
} from '~/js/utils/tokensListsUtils';

// let loaderTimestamp:number = 0;
// const loaderInterval = (1_000 * 60 * (60 * 12)); // 12 hours

let loaderTokensListsCache:TTokensLists = null

// ------------------------------

export const loader: LoaderFunction = async( { request }: LoaderArgs ) => {

  try
  {
    console.log('moveTokens2._index.tsx: loader');
    // loaderTimestamp = Date.now();

    let loaderTokensListsCacheNew:TTokensLists = null

    if (loaderTokensListsCache) {
      console.debug(`moveTokens2._index.tsx: loader: loaderTokensListsCache is defined`);

      // console.debug(`moveTokens2._index.tsx: loader: SLEEP 5 seconds ============================`);
      // await sleep(5_000)

      loaderTokensListsCacheNew = await getTokensLists_TokenData(loaderTokensListsCache)
      if (!loaderTokensListsCacheNew) {
        console.warn(`moveTokens2._index.tsx: loader: loaderTokensListsCacheNew is undefined`);
        loaderTokensListsCacheNew = loaderTokensListsCache
      }
    } else {
      console.debug(`moveTokens2._index.tsx: loader: loaderTokensListsCache is undefined`);
      const tokensLists = await getTokensLists_TokenData(TOKENS_LISTS)  
      if (tokensLists) {
        loaderTokensListsCacheNew = tokensLists
      } else {
        console.warn(`moveTokens2._index.tsx: loader: tokensLists is undefined`);
      }
    }

    if (!loaderTokensListsCacheNew) {
      console.error(`moveTokens2._index.tsx: loader: loaderTokensListsCacheNew is undefined`);
    } else {
      console.debug(`moveTokens2._index.tsx: loader: loaderTokensListsCacheNew is defined`);
      loaderTokensListsCache = loaderTokensListsCacheNew
    }

    // TODO: store tokens lists in context get tokens lists from context

    // const tokensLists = /* await */ getTokensLists_TokenData_Stripped(loaderTokensListsCache)

    const loaderData: TokensListsLoaderData = {
      // tokensLists: loaderTokensListsCacheNew
      // tokensLists: loaderTokensListsCache
      status: "ok",
      tokensLists: loaderTokensListsCache
    };
    // console.debug(`moveTokens2._index.tsx: loader: ${JSON.stringify(loaderData)}}`);
    // console.debug(`moveTokens2._index.tsx: loader: loaderData=`);
    // console.dir(loaderData)

    // console.debug(`moveTokens2._index.tsx: loader: loaderData.tokensLists=`);
    // displayTokensList(loaderData.tokensLists)

    return json( loaderData )

/*
    const tokensLists = await getTokensLists_TokenData(TOKENS_LISTS)
    if (tokensLists)  {
      const loaderData: TokensListsLoaderData = {
        tokensLists: tokensLists
      };
      return json( loaderData )

    } else {
      console.error('moveTokens2._index.tsx: loader: tokensListsPromises is undefined');
      const loaderData: TokensListsLoaderData = {
        tokensLists: null
      }
      return json( loaderData )
    }
*/  
  } catch (error) {
    console.error(`moveTokens2._index.tsx: loader: ERROR *********************************`);
    console.error(`moveTokens2._index.tsx: loader: error= ${error}`);
    console.error(`moveTokens2._index.tsx: loader: ERROR *********************************`);
    const loaderData: TokensListsLoaderData = {
        status: "error",
        tokensLists: null,
        error: "error",
        errorDetails:  (error instanceof Error) ? error.toString():""
      };
      return json( loaderData )
  }

};

// ------------------------------

/*
// export async function action() {
//   // await saveSomeStuff();
//   return { ok: true };
// }

// ------------------------------

export const shouldRevalidate: ShouldRevalidateFunction = ({
  // actionResult,
  // currentParams,
  // currentUrl,
  defaultShouldRevalidate,
  // formAction,
  // formData,
  // formEncType,
  // formMethod,
  // nextParams,
  // nextUrl,
  }) => {

  // // Refresh every 5 minutes
  // if (Date.now() - loaderTimestamp > loaderInterval ) {
  //   console.debug(`moveTokens2._index.tsx shouldRevalidate: REFRESH`)
  //   return true;
  // }

console.debug(`moveTokens2._index.tsx shouldRevalidate: defaultShouldRevalidate=${defaultShouldRevalidate}`)

console.debug(`moveTokens2._index.tsx shouldRevalidate: DON'T REFRESH`)
console.debug(`moveTokens2._index.tsx shouldRevalidate: DON'T REFRESH`)
console.debug(`moveTokens2._index.tsx shouldRevalidate: DON'T REFRESH`)
console.debug(`moveTokens2._index.tsx shouldRevalidate: DON'T REFRESH`)
console.debug(`moveTokens2._index.tsx shouldRevalidate: DON'T REFRESH`)
console.debug(`moveTokens2._index.tsx shouldRevalidate: DON'T REFRESH`)
console.debug(`moveTokens2._index.tsx shouldRevalidate: DON'T REFRESH`)
console.debug(`moveTokens2._index.tsx shouldRevalidate: DON'T REFRESH`)

return false;
  // return defaultShouldRevalidate;
};


// export function shouldRevalidate({
//   actionResult,
//   // defaultShouldRevalidate,
// }) {
//   if (actionResult?.ok) {
//     return false;
//   }
//   // return defaultShouldRevalidate;
//   return false
// }

*/

// ------------------------------

export default function MoveTokens2IndexRoute() {

  // console.debug(`moveTokens2._index.tsx render` )

  // // const [selectableTokensLists, setselectableTokensLists] = useState<TSelectableTokensLists>()
  // const [tokensLists, settokensLists] = useState<TTokensLists>(loaderTokensLists)
  // // const [tokensLists, settokensLists] = useState<TTokensLists>(null)

  // if (!tokensLists) {
  //   const {tokensLists: loaderTokensLists} = useLoaderData<typeof loader>();
  //   settokensLists(loaderTokensLists)
  // }
  // console.debug(`TokenListSelect.tsx render: tokensLists=${tokensLists}`)
  // console.dir(tokensLists)


/*
    useEffect( () => {
      console.debug(`moveTokens2._index.tsx useEffect`)
      // if (tokensLists) {
      //   console.log('moveTokens2._index.tsx: useEffect: useLoaderData: tokensLists=');
      //   console.dir(tokensLists);
      // }
  
      // const tokensLists_ = tokensLists?.map( (tokensList: TTokensList) => {
      //   return {
      //     tokensList,
      //     selected: false
      //   } // as TSelectableTokensList
      // })

      // console.log('moveTokens2._index.tsx: useLoaderData: tokensLists=');
      // console.dir(tokensLists);
      settokensLists(loaderTokensLists)

    }, [loaderTokensLists])
*/

  return (
    <>
      <AppMoveTokens2 />
    </>
  );

}
