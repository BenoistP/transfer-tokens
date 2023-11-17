// tokensListsUtils.ts

import { EChainTokensListLoadState } from "@jsconsts/enums";

const isValidUri = async( URI:TStringNullUndef ):Promise<boolean> => {
  try {
      // console.log('isValidUri');
    if (URI && URI.trim().length>0) {
      return ((await fetch(URI))?.status == 200);
    }
  }
  catch (error) {
    // console.warn('isValidUri: error fetching logoUriFetched=', error);
  }
  return false
} // isValidUri

// ---

const getTokenListLogoUri = async(fetchedTokensList_logoURI:TStringNullUndef, tokensList_logoURI:TStringNullUndef):Promise<TStringNullUndef> => {
  let logoUriFetched: TStringNullUndef // undefined
  try {
    // try fetching tokenlist logo from fetched list
    if (fetchedTokensList_logoURI) {
      if (await isValidUri(fetchedTokensList_logoURI)) {
        logoUriFetched = fetchedTokensList_logoURI;
      }
    }
    // try fetching tokenlist logo if any defined
    if (!logoUriFetched && tokensList_logoURI)
    {
      if (await isValidUri(tokensList_logoURI)) {
        logoUriFetched = tokensList_logoURI;
      }
    }
    return logoUriFetched;
  } catch (error) {
    console.error('moveTokens2._index.tsx: getTokenListLogo: error=', error);
    return logoUriFetched;
  }
  // finally {
  // }
  } // getTokenListLogoUri

// ---

/*
const getAsTokensList_TokenData = async(tokensList: any):Promise<TTokensList_TokenData> => {
  try {

    const newTokensList = tokensList?.map( (token:any) => {
      // console.log('getTokensLists_TokenData: token=', token);

      const { chainId, address, name, symbol, decimals, logoURI } = token
      const tokenList_TokenData = {
        chainId, address, name, symbol, decimals, logoURI
      }
      return tokenList_TokenData as TTokenList_TokenData

    }) // tokens?.map
    // console.dir()

    return newTokensList

  } catch (error) {
    console.error('moveTokens2._index.tsx: getAsTokensList_TokenData: error=', error);
  }
  return null;
}
*/

const getTokensList_TokenDataAsTokenChainDataArray = async(tokensList: any):Promise<TTokenChainDataArray> => {
  try
  {

    const newTokensListPromises = tokensList?.map( async(token:any) =>
    {
      try {
        const { chainId, address, name, symbol, decimals/* , logoURI */ } = token
        // let {logoURI_} = token
        // const logoURI = await isValidUri(logoURI_)?logoURI_:null
        const tokenChainData = {
          chainId, address,
          basicData: {
            name, symbol, decimals: (decimals?decimals:18),
          },
          extraData: {
            // logoURI: logoURI, // takes too long on huge lists, check only after //(await isValidUri(logoURI)?logoURI:null),
            // totalSupply: null,
            type: 'ERC20',
          } as TTokenExtraData,
          contract: null,
        }
        return tokenChainData as TTokenChainData
      } catch (error) {
        console.error('moveTokens2._index.tsx: getAsTokensList_TokenData: error=', error);
      }
    }) // tokens?.map

    if (newTokensListPromises)  {
      const newTokensList = await Promise.all(newTokensListPromises as Promise<TTokenChainData>[]);
      const newTokensListFiltered = newTokensList.filter( (tokenChainData:TTokenChainData) => tokenChainData!=null )
      return newTokensListFiltered as TTokenChainDataArray
    }

  } catch (error) {
    console.error('moveTokens2._index.tsx: getAsTokensList_TokenData: error=', error);
  }
}

// ---

const getChainArray_from_tokensChainDataArray = (tokenChainDataArray: TTokenChainDataArray):TChainIdArray => {
    try
  {
    const tokensListChainIds: TChainIdArray = []
    tokenChainDataArray?.forEach( (tokenChainData:TTokenChainData) =>
    {
      // const { chainId } = tokenChainData?
      // if (chainId && !tokensListChainIds.includes(chainId)) {
      //   tokensListChainIds.push(chainId)
      // }
      if (tokenChainData && tokenChainData.chainId && !tokensListChainIds.includes(tokenChainData.chainId)) {
        tokensListChainIds.push(tokenChainData.chainId)
      }
    }) // tokens?.forEach

    return tokensListChainIds

  } catch (error) {
    console.error('moveTokens2._index.tsx: getChainArray_from_tokensChainDataArray: error=', error);
  }
}

// ---
/*
* Get Chain Id array from tokens lists
*/
const getChainArray_from_tokensLists = (tokensLists: TTokensLists):TChainIdArray => {
  try
  {
    const tokensListChainIds: TChainIdArray = []
    tokensLists?.forEach( (tokensList:TTokensList) =>
    {
      const { allTokensChainData } = tokensList
      if (allTokensChainData && allTokensChainData.length>0) {
        const tokensListChainIds_ = getChainArray_from_tokensChainDataArray(allTokensChainData)
        tokensListChainIds_?.forEach( (chainId:TChainId) => {
          if (chainId && !tokensListChainIds.includes(chainId)) {
            tokensListChainIds.push(chainId)
          }
        }) // tokensListChainIds_.forEach
      }
    }) // tokensLists?.forEach

    return tokensListChainIds

  } catch (error) {
    console.error('moveTokens2._index.tsx: getChainArray_from_tokensChainDataArray: error=', error);
  }
}

// ---

/*
* Get ChainData array from tokens lists
* sends back an TTokenChainDataArray from TTokensList array
* for use with a META-URI list
*/

const getTokenChainDataArray_from_tokensLists = (tokensLists: TTokensLists):TTokenChainDataArray => {
  const start:number = Date.now()
  let countTotal:number = 0
  // let countDuplicates:number = 0
  let count = 0
  let countForEachTokensLists = 0
  let countForEachTokensChainData = 0
  try
  {
    const tokenChainDataArray: TTokenChainDataArray = []
    // First Loop: for each list
    tokensLists?.forEach( (tokensList:TTokensList/* , index:number */) =>
    {
      countForEachTokensLists++
      const { allTokensChainData } = tokensList
      // console.debug(`getTokenChainDataArray_from_tokensLists: LIST index=${index} tokensList.name=${tokensList.name} tokens?.length=${allTokensChainData?.length}` )
      if (allTokensChainData && allTokensChainData.length>0) {
        allTokensChainData?.forEach( (tokenChainData_curr:TTokenChainData) => {
          // Inner Loop: for each token
          countForEachTokensChainData++
          if (tokenChainData_curr) {
            // Check for duplicates before inserting
            // if (!tokenChainDataArray.some( tokenChainData => {tokenChainData_curr.address === tokenChainData?.address && tokenChainData_curr.chainId === tokenChainData?.chainId } ))
            // {
            //   tokenChainDataArray.push(tokenChainData_curr)
            // }
            // // DEBUG
            // else
            // {
            //   // console.debug(`getTokenChainDataArray_from_tokensLists: tokenChainData_curr.address=${tokenChainData_curr.address} already in tokenChainDataArray`)
            //   const tokenChainData_found = tokenChainDataArray.find( tokenChainData => tokenChainData_curr.address === tokenChainData?.address )
            //   if (tokenChainData_found) {
            //     const { address, chainId } = tokenChainData_found
            //     console.debug(`getTokenChainDataArray_from_tokensLists: tokenChainData_curr.address=${tokenChainData_curr.address} already in tokenChainDataArray tokenChainData_found address, chainId=${address}, ${chainId}`)
            //   }
            //   countDuplicates++
            // }
            tokenChainDataArray.push(tokenChainData_curr)
            count++
          }
        }) // tokensListChainIds_.forEach
      }
      // throw("exit"); // TODO: remove
    }) // tokens?.forEach

    countTotal = tokenChainDataArray.length
    return tokenChainDataArray

  } catch (error) {
    console.error('getTokenChainDataArray_from_tokensLists: error=', error);
  }
  finally {
    const elapsed = Date.now() - start
    // console.debug(`getTokenChainDataArray_from_tokensLists: countTotal=${countTotal} countDuplicates=${countDuplicates} elapsed=${elapsed} DONE` );
    console.debug(`getTokenChainDataArray_from_tokensLists: countTotal=${countTotal} count=${count} countForEachTokensLists=${countForEachTokensLists} countForEachTokensChainData=${countForEachTokensChainData} elapsed=${elapsed} DONE` );
    // console.debug(`getTokenChainDataArray_from_tokensLists: elapsed=${elapsed} DONE` );
  }
} // getTokenChainDataArray_from_tokensLists



// Only send back the first 5 tokens of each list
// Only send back the first 5 tokens of each list
// Only send back the first 5 tokens of each list
// Only send back the first 5 tokens of each list
// Only send back the first 5 tokens of each list


/*

const getTokenChainDataArray_from_tokensLists = (tokensLists: TTokensLists):TTokenChainDataArray => {
  const start:number = Date.now()
  let countTotal:number = 0
  let countDuplicates:number = 0
  try
  {
    const tokenChainDataArray: TTokenChainDataArray = []
    if (tokensLists && tokensLists.length>0) {

      for (let index1 = 0; index1 < tokensLists.length // tokensLists.length // 2 //
      ; index1++) {
        const tokensList:TTokensList = tokensLists[index1];
        const { allTokensChainData } = tokensList
        console.debug(`getTokenChainDataArray_from_tokensLists: LIST index=${index1} tokensList.name=${tokensList.name} tokens?.length=${allTokensChainData?.length}` )
        if (allTokensChainData && allTokensChainData.length>0) {
          for (let index2 = 0; index2 < Math.min(allTokensChainData.length, 100_500) // allTokensChainData.length // 5 // 
          ;index2++) {
            const tokenChainData_curr:TTokenChainData = allTokensChainData[index2];
            if (tokenChainData_curr) {
              tokenChainDataArray.push(tokenChainData_curr)
            }
          } // for (let index = 0; index < tokens.length; index++)
        } // if (tokens && tokens.length>0)
      } // for (let index = 0; index < tokensLists.length; index++)

    } // if (tokensLists && tokensLists.length>0)
  
    countTotal = tokenChainDataArray.length
    return tokenChainDataArray

  } catch (error) {
    console.error('moveTokens2._index.tsx: getChainArray_from_tokensChainDataArray: error=', error);
  }
  finally {
    const elapsed = Date.now() - start
    console.debug(`getTokenChainDataArray_from_tokensLists: countTotal=${countTotal} countDuplicates=${countDuplicates} elapsed=${elapsed} DONE` );
    // console.debug(`getTokenChainDataArray_from_tokensLists: elapsed=${elapsed} DONE` );
  }
} // getTokenChainDataArray_from_tokensLists

*/

// ---

const getTokensList_TokenData_fromJsonTokensList = async(tokensList: TTokensList, fetchTokensListUri_json:any,  index:number):Promise<TTokensList>  => {
  // const start:number = Date.now()
  // JSON
  try
  {
    const initialId = tokensList.id
    const {source, type, URI} = tokensList;

    // console.debug(`getTokensList_TokenData_fromJsonTokensList: tokensList.URI=${URI}` )
    // console.dir(fetchTokensListUri_json);

    const nameFetched = fetchTokensListUri_json.name||tokensList.name;
    const descriptionFetched = fetchTokensListUri_json.description||tokensList.description;
    const timestampFetched = fetchTokensListUri_json.timestamp||tokensList.timestamp||Date.now();
    // const chainsFetched = fetchTokensListUri_json.chains;
    const keywordsFetched = fetchTokensListUri_json.keywords;
    const versionFetched = fetchTokensListUri_json.version;
    // const tokenCountFetched = fetchTokensListUri_json.tokenCount;


    const logoURI = await getTokenListLogoUri(fetchTokensListUri_json.logoURI, tokensList.logoURI);
    // console.log(`getTokensList_TokenData_fromJsonTokensList: **** logoUri="${logoURI}"`);

    // const tokensList_TokenData = await getAsTokensList_TokenData(fetchTokensListUri_json.tokens)
    const tokensList_TokenData = await getTokensList_TokenDataAsTokenChainDataArray(fetchTokensListUri_json.tokens)
    // if (tokensList_TokenData && tokensList_TokenData.length > 0) {
    //   console.log(`getTokensList_TokenData_fromJsonTokensList: **** tokensList_TokenData.length="${tokensList_TokenData.length}"`);
    //   console.dir(tokensList_TokenData[tokensList_TokenData.length-1])
    //   console.dir(tokensList_TokenData)
    // }
    const chainsFromTokens = getChainArray_from_tokensChainDataArray(tokensList_TokenData)
    // if (chainsFromTokens && chainsFromTokens.length > 0) {
    //   // console.log(`getTokensList_TokenData_fromJsonTokensList: **** chains.length="${chains.length}"`);
    //   // console.log(`getTokensList_TokenData_fromJsonTokensList: **** chains="${chains}"`);
    //   const includes = chainsFromTokens.includes( chainsFetched )
    //   // console.log(`getTokensList_TokenData_fromJsonTokensList: **** chainsFetched:${chainsFetched} includes="${includes}"`);
    //   if (!includes) {
    //     console.warn(`getTokensList_TokenData_fromJsonTokensList: **** chainsFetched:${chainsFetched} not in chains="${chainsFromTokens}"`);
    //   }
    // }

    const tokenCountSum = tokensList_TokenData?tokensList_TokenData.length:0

    // console.debug('-------------------------------------')
    // console.debug(`getTokensList_TokenData_fromJsonTokensList: tokensList_TokenData?.length=${tokensList_TokenData?.length} tokenCountSum=${tokenCountSum}` );
    // console.debug('-------------------------------------')

    const id = `${initialId}${index>0?'-'+index+'-':''}[${chainsFromTokens}]-${timestampFetched}`
    const chainsTokenLists = await getChainsTokenListsArray(tokensList_TokenData, chainsFromTokens, id)

    // console.debug(`getTokensList_TokenData_fromJsonTokensList: tokensList.URI=${tokensList.URI} tokensList_TokenData?.length=${tokensList_TokenData?.length}` );

    const status = (tokensList_TokenData && tokensList_TokenData?.length>0 ? 'ok' as TTokensListStatus : 'loadedError' as TTokensListStatus)
    const error = (tokensList_TokenData && tokensList_TokenData?.length>0 ? null : "Error parsing tokens" )// TODO: i18n error.message

    return {
      // ...tokensList,
      id,
      name: nameFetched,
      description: descriptionFetched,
      version : versionFetched,
      timestamp: timestampFetched,
      keywords: keywordsFetched,
      source,
      type,
      // tokenCount: tokenCountFetched,
      tokensCount: tokenCountSum,
      URI,
      chains: chainsFromTokens,
      status,
      error,
      logoURI,
      allTokensChainData: tokensList_TokenData, // tokensList_TokenData,
      chainsTokenLists
      // name: fetchTokensListUri_json.
    }

  } // try fetch tokens list
  catch (error)
  {
    return {
      ...tokensList,
      status: 'loadedError' as TTokensListStatus,
      error: "Error parsing list" // TODO: i18n error.message
    }
  } // catch fetch tokens
  finally {
    // const elapsed = Date.now() - start
    // console.debug(`getTokensList_TokenData_fromJsonTokensList: elapsed=${elapsed} DONE` );
  }
} // getTokensList_TokenData_fromJsonTokensList

// ---

const getTokensList_TokenData_fromUri = async(tokensList: TTokensList, index:number):Promise<TTokensList>  => {
  // const start:number = Date.now()
  try
  {
    // console.log('getTokensList_TokenData_fromUri: tokensList=', tokensList);
    // console.debug(`getTokensList_TokenData_fromUri: tokensList.URI=${tokensList.URI} tokensList.type=${tokensList.type} tokensList.timestamp=${tokensList.timestamp} tokensList.status=${tokensList.status} tokensList.error=${tokensList.error}` )

    if (tokensList.type.toUpperCase() == "URI" && tokensList.URI)
    {
      // TODO: check if not already loaded & up-to-date
      // TODO: check if not already loaded & up-to-date
      // TODO: check if not already loaded & up-to-date
      // TODO: check if not already loaded & up-to-date
      // TODO: check if not already loaded & up-to-date
      // TODO: check if not already loaded & up-to-date
      // TODO: check if not already loaded & up-to-date
      // && tokensList.status == 'ok'

      // let elapsed = Date.now() - start
      // console.debug(`getTokensList_TokenData_fromUri: Before FETCH ${tokensList.URI} elapsed=${elapsed} DONE` );

      const fetchTokensListUri_res:Response = await fetch(tokensList.URI);
      // elapsed = Date.now() - start
      // console.debug(`getTokensList_TokenData_fromUri: After FETCH ${tokensList.URI} elapsed=${elapsed} DONE` );


      const fetchTokensListUri_json = await fetchTokensListUri_res.json()
      // elapsed = Date.now() - start
      // console.debug(`getTokensList_TokenData_fromUri: After fetch TO JSON ${tokensList.URI} elapsed=${elapsed} DONE` );

      const timestampFetched = fetchTokensListUri_json.timestamp;
      // console.debug('-------------------------------------')
      // console.debug(`getTokensList_TokenData_fromUri: timestampFetched=${timestampFetched}` );

      if (tokensList.status == 'ok' && timestampFetched == tokensList.timestamp) {
        // console.debug(`getTokensList_TokenData_fromUri: timestampFetched==tokensList.timestamp UP-TO-DATE tokensList.URI=${tokensList.URI}`);
        return tokensList // up-to-date: RETURN
      }
        // console.debug(`getTokensList_TokenData_fromUri: timestampFetched!=tokensList.timestamp UPDATING  tokensList.URI=${tokensList.URI}` );

      // if (timestampFetched) {
      //   if (timestampFetched == tokensList.timestamp) {
      //     console.debug(`getTokensList_TokenData_fromUri: timestampFetched==tokensList.timestamp UP-TO-DATE tokensList.URI=${tokensList.URI}`);
      //     return tokensList
      //   }
      //   console.debug(`getTokensList_TokenData_fromUri: timestampFetched!=tokensList.timestamp UPDATING  tokensList.URI=${tokensList.URI}` );
      // }
// console.debug('-------------------------------------')

      return await getTokensList_TokenData_fromJsonTokensList(tokensList, fetchTokensListUri_json, index)
    } // if (tokensList.type == "URI" && tokensList.URI)

    console.warn(`getTokensList_TokenData_fromUri: not an URI list: tokensList.type=${tokensList.type} tokensList.URI=${tokensList.URI}` )
    // console.dir(tokensList)
    return {
      ...tokensList,
      // status: "error",
      status: 'unprocessed' as TTokensListStatus,
      error: "Error unprocessed" // TODO: i18n error.message
    }
  } // try fetch tokens list
  catch (error)
  {
    return {
      ...tokensList,
      status: 'notFound' as TTokensListStatus,
      error: "Error fetching tokens list" // TODO: i18n error.message
    }
  } // catch fetch tokens list
  finally {
    // const elapsed = Date.now() - start
    // console.debug(`getTokensList_TokenData_fromUri: ${tokensList.URI} elapsed=${elapsed} DONE` );
  }
} // getTokensList_TokenData_fromUri

// ---

const getMetaTokensListUriCommitFromTokensListURI = async (URI:TTokenListUri):Promise<TMetaTokensListUriCommit|undefined> => {
  try {
    // console.debug(`getMetaTokensListUriCommitFromTokensListURI: URI=${URI}` )
    if (URI) {
      const res = await fetch(URI)
      const json = await res.json()
      // console.debug(`getMetaTokensListUriCommitFromTokensListURI: json.sha=${json.sha}` )
      // console.dir(json[0].sha)
      const sha = json && json[0] && json[0].sha
      // return "cbfc9802bf590c21c88087638eda16ad83431ed8"
      return {sha} // as TMetaTokensListUriCommit
    }
  } catch (error) {
    console.error(`getMetaTokensListUriCommitFromTokensListURI: error=${error}` );
  }
} // getMetaTokensListUriCommitFromTokensListURI

// ---

const getMetaTokensListUriFromTokensListMetaURI = async (URI:TTokenListUri, summaryURI:TTokenListUri):Promise<TMetaTokensListUri|undefined> => {
  try {
    // console.debug(`getMetaTokensListUriCommitFromTokensListURI: URI=${URI}` )
    if (URI && summaryURI) {
      const metaTokensListUriCommit = await getMetaTokensListUriCommitFromTokensListURI(URI)
      if (metaTokensListUriCommit) {
        const {sha} = metaTokensListUriCommit
        // console.debug(`getMetaTokensListUriFromTokensListMetaURI: sha=${sha}` )
        const metaListURI = summaryURI.replace(/!SHA!/g, sha)
        // console.debug(`getMetaTokensListUriFromTokensListMetaURI: metaListURI=${metaListURI}` )
        return { URI: metaListURI, sha } // as TMetaTokensListUri
      }
    } // if (URI && summaryURI)
  } catch (error) {
    console.error(`getMetaTokensListUriFromTokensListMetaURI: error=${error}` );
  }
} // getMetaTokensListUriFromTokensListMetaURI

// ---

const getTokensList_TokenData_fromMetaUri = async(tokensList: TTokensList, index:number):Promise<TTokensList>  => {
  const start:number = Date.now()
  try
  {
    // console.log('getTokensList_TokenData_fromMetaUri: tokensList=', tokensList);

    if (tokensList.type.toUpperCase() == "META-URI" && tokensList.URI && tokensList.summaryURI) {

      const initialId = tokensList.id // getTokensList_TokenData_fromMetaUri
      const {source, type, URI, summaryURI} = tokensList;
      const metaTokensListUri = await getMetaTokensListUriFromTokensListMetaURI(URI, summaryURI)

      // console.debug(`getTokensList_TokenData_fromMetaUri: metaTokenListUri=${metaTokensListUri}` )
      // console.dir(metaTokensListUri)

      if (metaTokensListUri) {
        const {URI:metaListURI, sha} = metaTokensListUri
        // console.debug(`getTokensList_TokenData_fromMetaUri: sha=${sha} tokensList.status=${tokensList.status}` )

        if (sha == tokensList.sha && tokensList.status == 'ok') {
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          // console.debug(`getTokensList_TokenData_fromMetaUri: sha==tokensList.sha` )
          return tokensList // up-to-date: RETURN
        }

        // console.debug(`=======================================================` );
        // console.debug(`getTokensList_TokenData_fromMetaUri: metaListURI=${metaListURI}`)
        // console.debug(`=======================================================` );

        if (metaListURI) {
          const fetchTokensMetaListUri_res:Response = await fetch(metaListURI);
          const fetchTokensMetaListUri_json = await fetchTokensMetaListUri_res.json()

          // console.debug(`getTokensList_TokenData_fromMetaUri: fetchTokensMetaListUri_json=${fetchTokensMetaListUri_json}` )
          // console.dir(fetchTokensMetaListUri_json)

          const nameFetched = fetchTokensMetaListUri_json.name||tokensList.name;
          const descriptionFetched = fetchTokensMetaListUri_json.description||tokensList.description;
          const timestampFetched = fetchTokensMetaListUri_json.timestamp/* ||Date.now() */;
          const keywordsFetched = fetchTokensMetaListUri_json.keywords;
          const versionFetched = fetchTokensMetaListUri_json.version;
  
          // console.debug(`getTokensList_TokenData_fromMetaUri: timestampFetched=${timestampFetched}` );
  
          if (timestampFetched) {
            // console.debug(`getTokensList_TokenData_fromMetaUri: timestampFetched=${timestampFetched}` );
  
            if (timestampFetched == tokensList.timestamp) {
              // console.debug(`getTokensList_TokenData_fromMetaUri: timestampFetched==tokensList.timestamp UP-TO-DATE tokensList.URI=${tokensList.URI} metaListURI=${metaListURI}`);
              return tokensList
            }
            // DEBUG
            else {
              // console.debug(`getTokensList_TokenData_fromMetaUri: timestampFetched!=tokensList.timestamp UPDATING  tokensList.URI=${tokensList.URI} metaListURI=${metaListURI}` );
            }
          } else {
            console.warn(`getTokensList_TokenData_fromMetaUri: NO timestampFetched  tokensList.URI=${tokensList.URI} metaListURI=${metaListURI}` );
          } // if (timestampFetched)

          const logoURI = await getTokenListLogoUri(fetchTokensMetaListUri_json.logoURI, tokensList.logoURI);
          let chainsFromAllTokensListsTokens:TChainIdArray = []
          const tokensLists = await getTokensList_TokenData_FromJsonLists(fetchTokensMetaListUri_json.lists)
          if (tokensLists && tokensLists.length > 0) {
            // console.debug(`getTokensList_TokenData_fromMetaUri: --> tokensLists.length=${tokensLists.length}` );
            // Merge chain ids arrays
            chainsFromAllTokensListsTokens = getChainArray_from_tokensLists(tokensLists)
            // console.debug('*****************************************' )
            // console.debug('*****************************************' )
            // console.debug(`getTokensList_TokenData_fromMetaUri: chainsFromAllTokensListsTokens.length=${chainsFromAllTokensListsTokens?.length}` );
            // console.dir(chainsFromAllTokensListsTokens)
            // console.debug('*****************************************' )
            // console.debug('*****************************************' )
          } // if (tokensLists && tokensLists.length > 0)
  
          let allTokensChainData:TTokenChainDataArray = []
          allTokensChainData = getTokenChainDataArray_from_tokensLists(tokensLists)
  
          // USELESS
          // remove/clean sublists tokens
          // fetchTokensMetaListUri_json.lists = fetchTokensMetaListUri_json.lists.map( (tokensList:TTokensList, index:number) => {
          //   console.debug(`CLEAN ${index}` )
          //   tokensList.tokens = null
          // })
  
          // fetchTokensMetaListUri_json.lists?.forEach( (tokensList:TTokensList) => {
          //   console.debug('*****************************************' )
          //   console.debug(`tokensList.name=${tokensList.name}` )
          //   console.dir(tokensList)
          //   console.debug('*****************************************' )
          // })
  
          // console.debug(`getTokensList_TokenData_fromMetaUri: allTokensChainData?.length=${allTokensChainData?.length}` );
          // console.debug(`getTokensList_TokenData_fromMetaUri: allTokensChainData=${allTokensChainData?true:false} allTokensChainData?.length=${allTokensChainData?.length}` );

          const tokenCountSum:number = allTokensChainData?allTokensChainData.length:0
          const listsCount = fetchTokensMetaListUri_json.lists?fetchTokensMetaListUri_json.lists.length:0

          const id = `${initialId}${index>0?'-'+index+'-':''}[${chainsFromAllTokensListsTokens}]-${timestampFetched}`
          const chainsTokenLists = await getChainsTokenListsArray(allTokensChainData, chainsFromAllTokensListsTokens, id)
          const status = (tokenCountSum ? 'ok' as TTokensListStatus : 'loadedError' as TTokensListStatus)
          const error = (tokenCountSum ? null : "Error parsing meta-uri tokens" )// TODO: i18n error.message

          return {
            // ...tokensList,
            id,
            name: nameFetched,
            description: descriptionFetched,
            version : versionFetched,
            timestamp: timestampFetched,
            sha,
            keywords: keywordsFetched,
            // tokenCount: tokenCountSum,
            tokensCount: tokenCountSum,
            chainsTokenLists,
            source,
            type,
            chains: chainsFromAllTokensListsTokens,
            URI,
            summaryURI,
            status,
            error,
            logoURI,
            allTokensChainData: null,// tokensList_TokenData,
            listsCount
            // name: fetchTokensListUri_json.
          } // RETURN OK
  
        } // if (metaListURI)
  
        console.warn(`getTokensList_TokenData_fromMetaUri: metaListURI empty: tokensList.type=${tokensList.type} tokensList.URI=${tokensList.URI} tokensList.summaryURI=${tokensList.summaryURI}` )

      } // if (metaTokenListUri)

      console.warn(`getTokensList_TokenData_fromMetaUri: metaTokenListUri empty: tokensList.type=${tokensList.type} tokensList.URI=${tokensList.URI} tokensList.summaryURI=${tokensList.summaryURI}` )

    } // if (tokensList.type == "META-URI" && tokensList.URI && tokensList.summaryURI)

    console.warn(`getTokensList_TokenData_fromMetaUri: not an META-URI list: tokensList.type=${tokensList.type} tokensList.URI=${tokensList.URI} tokensList.summaryURI=${tokensList.summaryURI}` )

    return {
      ...tokensList,
      // status: "error",
      status: 'unprocessed' as TTokensListStatus,
      error: "Error unprocessed" // TODO: i18n error.message
    } // RETURN ERROR

  } // try fetch tokens list
  catch (error)
  {
    
    return {
      ...tokensList,
      status: 'notFound' as TTokensListStatus,
      error: "Error fetching tokens list" // TODO: i18n error.message
    } // RETURN ERROR
  } // catch fetch tokens list
  finally {
    const elapsed = Date.now() - start
    console.debug(`getTokensList_TokenData_fromMetaUri: elapsed=${elapsed} DONE` );
  }
} // getTokensList_TokenData_fromMetaUri

// ---

const getTokensLists_TokenData = async(tokensLists: TTokensLists):Promise<TTokensLists>  => {
  const start:number = Date.now()
  try {
    const tokensListsPromises:Promise<TTokensList>[] | undefined = tokensLists?.map( async( tokensList, index ) =>
    {
      // const startLoop:number = Date.now()
      try
      {
        // console.log('getTokensLists_TokenData: tokensList=', tokensList);
        const tokensListType = tokensList.type.toUpperCase()

        if (tokensListType == "URI" && tokensList.URI)
        {
          // // console.debug(`getTokensLists_TokenData: (loop=${index}) tokensList.URI=${tokensList.URI}` )
          // const tokensListUpdated = await getTokensList_TokenData_fromUri(tokensList, index)
          // // set null on allTokensChainData
          // return {
          //   ...tokensListUpdated,
          //   allTokensChainData: null
          // }
          return getTokensList_TokenData_fromUri(tokensList, index)
        }
        else if (tokensListType == "API" && tokensList.URI)
        {
          return getTokensList_TokenData_fromApi(tokensList, index)
        }
        else if (tokensListType == "META-URI" && tokensList.URI)
        {
          return getTokensList_TokenData_fromMetaUri(tokensList, index)
        }
        else // Catch-all
        {
          console.error(`getTokensLists_TokenData: unsupported tokensListType == "${tokensListType}" `);
          console.error(`getTokensLists_TokenData: unsupported tokensList=`);
          console.dir(tokensList);
          return {
            ...tokensList,
            status: 'unsupported' as TTokensListStatus,
          }
        }
      } // try
      catch (error)
      {
        console.error(`getTokensLists_TokenData: (loop=${index}) error=${error}` );
        return {
          ...tokensList,
          status: 'notFound' as TTokensListStatus,
          error: "Error fetching tokens list" // TODO: i18n error.message
        }
      } // catch fetch tokens list
      finally {
        // var elapsedLoop = Date.now() - startLoop
        // console.debug(`getTokensLists_TokenData: (loop=${index}) elapsedLoop=${elapsedLoop} DONE` );
      }
    }) // tokensLists?.map

    if (tokensListsPromises)  {
      const tokensListsResolved = await Promise.all(tokensListsPromises as Promise<TTokensList>[]);

      // console.debug(`getTokensLists_TokenData: ------------` );
      // tokensLists.forEach( (tokensList:TTokensList) => {
      //   console.debug(`getTokensLists_TokenData: tokensList name=${tokensList.name} id=${tokensList.id} description=${tokensList.description} tokens?.length=${tokensList.tokens?.length} status=${tokensList.status} name=${tokensList.name} version=${JSON.stringify(tokensList.version)} URI=${tokensList.URI}` );
      // })
      // console.debug(`getTokensLists_TokenData: ------------` );

      const tokensLists = tokensListsResolved.map( (tokensList:TTokensList) => {
        tokensList.allTokensChainData = null
        // return {
        //   ...tokensList,
        //   allTokensChainData: null
        // }
        return tokensList;
      })

      return tokensLists



    } // if (tokensListsPromises)
  } catch (error) {
    console.error(`getTokensLists_TokenData: error=${error}` );
  }
  finally {
    const elapsed = Date.now() - start
    // console.debug(`getTokensLists_TokenData: elapsed=${elapsed} DONE` );
    console.log(`Loading token lists took:${elapsed}` );
  }
}// getTokensLists_TokenData


// ---
/*
* @dev: getTokensList_TokenData_FromJsonLists
* @param: tokensListsJson: any (array of tokens list in JSON format)
* @return: TTokensLists (array of tokens list with token data)
*/
const getTokensList_TokenData_FromJsonLists = async(tokensListsJson: any):Promise<TTokensLists>  => {
  const startLoop:number = Date.now()
  try {
    /*
    const tokensListsPromises:Promise<TTokensList>[] | undefined = tokensListsJson?.map( async( tokensList:any, ) =>
    {
        return {
          ...tokensList,
          type: "uri",
        } // as TTokensList
    }) // tokensListsJson?.map

    if (tokensListsPromises)  {
      const tokensLists = await Promise.all(tokensListsPromises as Promise<TTokensList>[]);
      // console.debug(`getTokensList_FromJsonLists: ------------` );
      // tokensLists.forEach( (tokensList:TTokensList) => {
      //   console.debug(`getTokensList_FromJsonLists: tokensList name=${tokensList.name} id=${tokensList.id} description=${tokensList.description} tokens?.length=${tokensList.tokens?.length} status=${tokensList.status} name=${tokensList.name} version=${JSON.stringify(tokensList.version)} URI=${tokensList.URI}` );
      // })
      // console.debug(`getTokensList_FromJsonLists: ------------` );
      return getTokensLists_TokenData(tokensLists)
    } // if (tokensListsPromises)
    */

    // create URI lists from JSON lists
    const uriTokensLists:TTokensList[] | undefined = tokensListsJson?.map( ( tokensList:any, ) =>
    {
        return {
          ...tokensList,
          type: "URI",
        } as TTokensList
    }) // tokensListsJson?.map

    uriTokensLists?.forEach( (uriTokensList:TTokensList) => {
      console.debug(`getTokensList_FromJsonLists: uriTokensList name=${uriTokensList.name} id=${uriTokensList.id} description=${uriTokensList.description} tokensChainData?.length=${uriTokensList.allTokensChainData?.length} status=${uriTokensList.status} URI=${uriTokensList.URI}` );
    })

    if (uriTokensLists)  {
      console.debug(`getTokensList_FromJsonLists: uriTokensLists.length=${uriTokensLists.length}` );
      // return await getTokensLists_TokenData(uriTokensLists)

      const tokensListsPromises = uriTokensLists.map( async (tokensList:TTokensList, index:number) => {
        const tokensList_TokenData = await getTokensList_TokenData_fromUri(tokensList, index)
        return tokensList_TokenData
      }) // tokensLists?.map

      const tokensLists = await Promise.all(tokensListsPromises as Promise<TTokensList>[]);

      // tokensLists.forEach( (tokensList:TTokensList) => {
      //   // console.debug(`getTokensList_FromJsonLists: tokensList name=${tokensList.name} id=${tokensList.id} description=${tokensList.description} allTokensChainData?.length=${tokensList.allTokensChainData?.length} status=${tokensList.status} URI=${tokensList.URI}` );
      // })

      return tokensLists

    } // if (uriTokensLists)
    const elapsedLoop = Date.now() - startLoop
    console.debug(`getTokensList_FromJsonLists: elapsedLoop=${elapsedLoop} DONE` );

  } catch (error) {
    console.debug(`getTokensList_FromJsonLists: error=${error}` );
    const elapsedLoop = Date.now() - startLoop
    console.debug(`getTokensList_FromJsonLists: elapsedLoop=${elapsedLoop} DONE` );
  }
  // finally {
  //   var elapsedLoop = Date.now() - startLoop
  //   console.debug(`getTokensList_FromJsonLists: elapsedLoop=${elapsedLoop} DONE` );
  // }
} // getTokensList_TokenData_FromJsonLists

// ---

const getTokensList_TokenData_fromApi = async(tokensList: TTokensList, index:number):Promise<TTokensList>  => {
  try
  {
    // console.log(`getTokensList_TokenData_fromApi:`)
    if (tokensList.type.toUpperCase() == "API" && tokensList.URI)
    {
      const fetchTokensListUri_res:Response = await fetch(tokensList.URI);

      if (fetchTokensListUri_res.status != 200) {
        console.warn(`getTokensList_TokenData_fromApi: tokensList.id=${tokensList.id} tokensList.URI=${tokensList.URI} fetchTokensListUri_res.status=${fetchTokensListUri_res.status}` )
        return {
          ...tokensList,
          status: 'notFound' as TTokensListStatus,
          error: "Error fetching tokens list" // TODO: i18n error.message
        }
      }
      // console.debug(`getTokensList_TokenData_fromApi: tokensList.URI=${tokensList.URI} fetchTokensListUri_res=${fetchTokensListUri_res}`)
      // console.dir(fetchTokensListUri_res);
      // console.debug(`getTokensList_TokenData_fromApi: fetchTokensListUri_res.status=${fetchTokensListUri_res.status} fetchTokensListUri_res.statusText=${fetchTokensListUri_res.statusText}`)
      // console.debug(`getTokensList_TokenData_fromApi: fetchTokensListUri_res.ok=${fetchTokensListUri_res.ok} fetchTokensListUri_res.text()=${await fetchTokensListUri_res.text()}`)
      // const fetchTokensListUri_json = await fetchTokensListUri_res.json()
      const text = await fetchTokensListUri_res.text()
      const fetchLen = text.length

      if (tokensList.fetchLen == fetchLen && tokensList.status == 'ok') {
        // console.debug(`getTokensList_TokenData_fromApi: tokensList.id=${tokensList.id} tokensList.URI=${tokensList.URI} fetchLen=${fetchLen} UP-TO-DATE` )
        return tokensList
      }
      // console.debug(`getTokensList_TokenData_fromApi: tokensList.id=${tokensList.id} tokensList.URI=${tokensList.URI} fetchLen=${fetchLen} LOADING` )

      const fetchTokensListUri_json = JSON.parse(text)
      const tokensListUpdatedWithTokenData: TTokensList = await getTokensList_TokenData_fromJsonAPI(tokensList, fetchTokensListUri_json, index)

      const tokensListUpdated = {
        ...tokensListUpdatedWithTokenData,
        fetchLen
      }
      // console.debug(`getTokensList_TokenData_fromApi: tokensListUpdated.name=${tokensListUpdated.name} tokensListUpdated.tokens?.length=${tokensListUpdated.tokens?.length}` )
      // console.dir(tokensListUpdated)
      return tokensListUpdated
    } // if (tokensList.type == "URI" && tokensList.URI)

    console.warn(`getTokensList_TokenData_fromApi: not an API list: tokensList.type=${tokensList.type} tokensList.URI=${tokensList.URI}` )
    return {
      ...tokensList,
      // status: "error",
      status: 'unprocessed' as TTokensListStatus,
      error: "Error unprocessed" // TODO: i18n error.message
    }
  } // try fetch tokens list
  catch (error)
  {
    return {
      ...tokensList,
      status: 'notFound' as TTokensListStatus,
      error: "Error fetching tokens list" // TODO: i18n error.message
    }
  } // catch fetch tokens list
  finally {
    // const elapsed = Date.now() - start
    // console.debug(`getTokensList_TokenData_fromApi: elapsed=${elapsed} DONE` );
  }
} // getTokensList_TokenData_fromApi

// ---

const getTokensList_TokenData_fromJsonAPI = async(tokensList: TTokensList, fetchTokensListUri_json:any,  index:number):Promise<TTokensList>  => {
  // const start:number = Date.now()
  // JSON
  try
  {
    if (fetchTokensListUri_json) {

      const initialId = tokensList.id
      const timestamp = /* fetchTokensListUri_json.timestamp|| */tokensList.timestamp||Date.now()/1_000;

      const tokensListPromisesEth:Promise<TTokenChainData>[] | undefined = fetchTokensListUri_json?.map( async( realTokenReferenceData:TRealTokenReferenceData ) =>
      {
        const { shortName, symbol, ethereumContract,
          // fullName,
        } = realTokenReferenceData
        if (!ethereumContract)
          return null
        return {
          chainId: 1,
          address: ethereumContract,
          basicData: {
            name: shortName,
            symbol,
            decimals: 18,
          },
          extraData: {
            type: 'COINBRIDGE',
          }
          // logoURI
        } as TTokenChainData
      }) // tokensLists?.map

      const tokensListPromisesGno:Promise<TTokenChainData>[] | undefined = fetchTokensListUri_json?.map( async( realTokenReferenceData:TRealTokenReferenceData ) =>
      {
        const { shortName, symbol, xDaiContract, gnosisContract,
          // fullName,
        } = realTokenReferenceData

        if (!xDaiContract && !gnosisContract)
          return null
        return {
          chainId: 100,
          address: xDaiContract||gnosisContract,
          basicData: {
            name: shortName,
            symbol,
            decimals: 18,
          },
          extraData: {
            type: 'COINBRIDGE',
          }
          // logoURI
          } as TTokenChainData

      }) // tokensLists?.map

      // fetchTokensListUri_json.forEach( (token:TRealTokenReferenceData) => {
      // })

      let tokensListETH_TokenData = await Promise.all(tokensListPromisesEth as Promise<TTokenChainData>[])
      tokensListETH_TokenData = tokensListETH_TokenData.filter( (tokenChainData:TTokenChainData) => tokenChainData!=null )
      let tokensListGNO_TokenData = await Promise.all(tokensListPromisesGno as Promise<TTokenChainData>[])
      tokensListGNO_TokenData = tokensListGNO_TokenData.filter( (tokenChainData:TTokenChainData) => tokenChainData!=null )
      const tokensList_TokenData = tokensListETH_TokenData.concat(tokensListGNO_TokenData)
      const chainsFromTokens = getChainArray_from_tokensChainDataArray(tokensList_TokenData)
      const id = `${initialId}${index>0?'-'+index+'-':''}[${chainsFromTokens}]-${timestamp}`
      const chainsTokenLists = await getChainsTokenListsArray(tokensList_TokenData, chainsFromTokens, id)
      const tokenCountSum = tokensList_TokenData?.length||0

      return {
        ...tokensList,
        allTokensChainData: null, // tokensList_TokenData,
        chainsTokenLists,
        tokensCount: tokenCountSum,
        timestamp,
        id,
        status: 'ok' as TTokensListStatus,
        error: null
      } // RETURN

    } // if (fetchTokensListUri_json)

    return {
      ...tokensList,
      status: 'loadedError' as TTokensListStatus,
      error: "Error parsing list" // TODO: i18n error.message
    } // RETURN
  } // try fetch tokens list
  catch (error)
  {
    return {
      ...tokensList,
      status: 'loadedError' as TTokensListStatus,
      error: "Error parsing list" // TODO: i18n error.message
    } // RETURN
  } // catch fetch tokens
  finally {
    // const elapsed = Date.now() - start
    // console.debug(`getTokensList_TokenData_fromJsonAPI: elapsed=${elapsed} DONE` );
  }
} // getTokensList_TokenData_fromJsonAPI

// ---
/*
// const filteredTokensListsFromTokensLists = async(tokensLists:TTokensLists, chainId:TChainIdNullUndef):Promise<TFilteredTokensListsNullUndef>  =>
const filterTokensListByChain = (tokensList:TTokensList, chainId:TChainIdNullUndef):TChainsTokensListNullUndef  =>
{
  try {
    console.debug(`filterTokensListByChain: chainId=${chainId} tokensList.URI=${tokensList.URI} tokensList.chains=${tokensList.chains}` )
    const tokensChainDataArray:TTokenChainDataArray = tokensList.tokens?.map( (tokenChainData:TTokenChainData) => {
      if (tokenChainData?.chainId == chainId) {
        return tokenChainData
      } // if (chainsTokenList.chainId == chainId)
    }) // tokensList.chainsTokenLists?.map
    if (tokensChainDataArray) {
      const tFiltered = tokensChainDataArray?.filter( (tokenChainData:TTokenChainData) => tokenChainData!=null )
      console.debug(`filterTokensListByChain: chainId=${chainId} tokensList.URI=${tokensList.URI} tFiltered.length=${tFiltered?.length}`)
      const res = {
        chainId,
        tokens: tFiltered
      } as TChainTokensList
      return res // RETURN
    } // if (tokensChainDataArray)
    return null // RETURN
  } catch (error) {
    console.error(`filterTokensListByChain: error=${error}` );
  }
}
  // ---

// const filteredTokensListsFromTokensLists = async(tokensLists:TTokensLists, chainId:TChainIdNullUndef):Promise<TFilteredTokensListsNullUndef>  =>
const filterTokensListsByChain = async(tokensLists:TTokensLists, chainId:TChainId):Promise<TTokensLists>  =>
{
  try {
    console.debug(`filterTokensListsByChain: chainId=${chainId}` )

    // if (!chainId || !tokensLists) {
    //   if (!tokensLists) {
    //     if (!chainId) {
    //       console.debug(`filterTokensListsByChain: !chainId && !tokensLists chainId=${chainId} tokensLists=${tokensLists}` )
    //     } else {
    //       console.debug(`filterTokensListsByChain: !tokensLists chainId=${chainId} tokensLists=${tokensLists}` )
    //     }
    //   } else {
    //     console.debug(`filterTokensListsByChain: !chainId chainId=${chainId} tokensLists=${tokensLists}` )
    //   }
    //   return null // RETURN
    // }
    if (!tokensLists) {
        console.debug(`filterTokensListsByChain: !tokensLists chainId=${chainId} tokensLists=${tokensLists}` )
    }


    const tokensListsPromises:Promise<TTokensList>[] | undefined = tokensLists?.map( async( tokensList ) =>
    {
      try
      {
        const chains = tokensList.chains
        if (chains && chains.length > 0)
        {
          const includes = chains.includes( chainId )
          if (!includes)
          {
            console.debug(`filterTokensListsByChain: !includes chainId=${chainId} chains=${chains}` )
            // return tokensList // RETURN
          }
          else
          {
            console.debug(`filterTokensListsByChain: includes chainId=${chainId} chains=${chains}` )

            const filteredTokensByChain = filterTokensListByChain(tokensList, chainId)
            if (filteredTokensByChain) {
              if (!tokensList.chainsTokenLists) {
                tokensList.chainsTokenLists = new Array<TChainTokensList>()
              }
              // UPDATE tokensList.chainsTokenLists
              tokensList.chainsTokenLists[chainId] = filteredTokensByChain
              // return {
              //   ...tokensList,
              //   // chainsTokenLists: ...tokensList.chainsTokenLists,
              // } // RETURN
            } // if (filteredTokensByChain)
          }
        }
        else
        {
          console.debug(`filterTokensListsByChain: !chains chainId=${chainId} chains=${chains}` )
          // return tokensList // RETURN
        }
        // return tokensList // RETURN
      } // try
      catch (error) {
        console.error(`filterTokensListsByChain: error=${error}` );
      }
      return tokensList // RETURN
      
    }) // tokensLists?.map

    if (tokensListsPromises)  {
      const tokensLists = await Promise.all(tokensListsPromises as Promise<TTokensList>[]);
      return tokensLists // RETURN
    } // if (tokensListsPromises)

    console.debug(`filterTokensListsByChain: !tokensListsPromises` )
    return null // RETURN

  } catch (error) {
    console.error(`filterTokensListsByChain: error=${error}` );
  }
}
*/

const filterTokensListByChain = (tokens:TTokenChainDataArray, chainId:TChainIdNullUndef):TTokenChainDataArray  =>
{
  try {
    // console.debug(`filterTokensListByChain: chainId=${chainId} tokens?.length=${tokens?.length}` )
    const tokensChainDataArray:TTokenChainDataArray = tokens?.map( (tokenChainData:TTokenChainData) => {
      if (tokenChainData?.chainId == chainId) {
        return tokenChainData
      } // if (chainsTokenList.chainId == chainId)
    }) // tokensList.chainsTokenLists?.map
    if (tokensChainDataArray) {
      // console.debug(`filterTokensListByChain: chainId=${chainId} tokensChainDataArray.length=${tokensChainDataArray?.length}`)
      const tFiltered = tokensChainDataArray?.filter( (tokenChainData:TTokenChainData) => tokenChainData!=null )
      // console.debug(`filterTokensListByChain: chainId=${chainId} tFiltered.length=${tFiltered?.length}`)
      // const res = {
      //   chainId,
      //   tokens: tFiltered
      // } as TChainTokensList
      // return res // RETURN
      return tFiltered // RETURN
    } // if (tokensChainDataArray)
    return null // RETURN
  } catch (error) {
    console.error(`filterTokensListByChain: error=${error}` );
  }
}
  // ---

// const filteredTokensListsFromTokensLists = async(tokensLists:TTokensLists, chainId:TChainIdNullUndef):Promise<TFilteredTokensListsNullUndef>  =>
const getChainsTokenListsArray = async(tokens: TTokenChainDataArray, chains: TChainIdArray/* tokensList:TTokensList */, _tokensListId:TTokensListId):Promise<TChainsTokensListArrayNullUndef>  =>
{
  try {
    // console.debug(`getChainsTokenListsArray: tokensList.URI=${tokensList.URI}` )

    // if (!chainId || !tokensLists) {
    //   if (!tokensLists) {
    //     if (!chainId) {
    //       console.debug(`getChainsTokenListsArray: !chainId && !tokensLists chainId=${chainId} tokensLists=${tokensLists}` )
    //     } else {
    //       console.debug(`getChainsTokenListsArray: !tokensLists chainId=${chainId} tokensLists=${tokensLists}` )
    //     }
    //   } else {
    //     console.debug(`getChainsTokenListsArray: !chainId chainId=${chainId} tokensLists=${tokensLists}` )
    //   }
    //   return null // RETURN
    // }
    // if (tokensList) {
    //     console.warn(`getChainsTokenListsArray: !tokensList` )
    // }
    // if (!tokensList.chains) {
    //   console.warn(`getChainsTokenListsArray: !tokensList.chains tokensList.URI=${tokensList.URI}` )
    // }
    if (!tokens) {
      console.warn(`getChainsTokenListsArray: !tokens` )
    }
  
    const chainTokensLists = chains?.map( (chainId:TChainId) => {
      // console.debug(`getChainsTokenListsArray: chainId=${chainId}` )
      const filteredTokenChainDataArray = filterTokensListByChain(tokens, chainId)
      // if (filteredTokenChainDataArray) {
      //   console.debug(`getChainsTokenListsArray: chainId=${chainId} filteredTokenChainDataArray.length=${filteredTokenChainDataArray?.length}`)
      // }
      return { // RETURN
        tokensListId: _tokensListId,
        chainId,
        tokens: filteredTokenChainDataArray,
        tokensCount: (filteredTokenChainDataArray?filteredTokenChainDataArray.length:0),
        tokensInstances: null,
        loadState: EChainTokensListLoadState.notLoaded,
      } // as TChainTokensList
    }) // tokensLists?.map

    // console.debug(`getChainsTokenListsArray: chainTokensLists.length=${chainTokensLists?.length}` )

    if (chainTokensLists)  {
      // const chainTokensListArrayIndexed = new Array<TChainTokensList>()
      const chainTokensListArray:TChainTokensList[] = []
      chainTokensLists.forEach( (chainTokensList:TChainTokensList) => {
        if (chainTokensList.tokens && chainTokensList.tokens.length > 0) {
          // chainTokensListArrayIndexed[chainTokensList.chainId] = chainTokensList
          chainTokensListArray.push(chainTokensList)
        }
      })
      // return chainTokensListArrayIndexed // RETURN
      return chainTokensListArray // RETURN
    } // if (chainTokensLists)

    console.debug(`getChainsTokenListsArray: !tokensListsPromises` )
    return null // RETURN

  } catch (error) {
    console.error(`getChainsTokenListsArray: error=${error}` );
  }
}

// ---

const getChainTokensList = (tokensList:TTokensList, chainId:TChainId):TChainsTokensListNullUndef  => {
  try {
    // console.debug(`getChainTokensList: chainId=${chainId} tokensList.URI=${tokensList.URI}`)
/*
    console.debug(`getChainTokensList: chainId=${chainId} tokensList.URI=${tokensList.URI}`)

    if (tokensList.chainsTokenLists) {
      console.debug(`getChainTokensList: tokensList.chainsTokenLists IS NOT NULL`)
      console.debug(`getChainTokensList: tokensList.chainsTokenLists?.length=${tokensList.chainsTokenLists?.length}`)
      console.dir(tokensList.chainsTokenLists)
      if (tokensList.chainsTokenLists[chainId]) {
        console.debug(`getChainTokensList: tokensList.chainsTokenLists[${chainId}] IS NOT NULL`)
        const chainTokensList = tokensList.chainsTokenLists[chainId]
        if (chainTokensList.tokens) {
          console.debug(`getChainTokensList: chainTokensList.tokens IS NOT NULL`)
          console.debug(`getChainTokensList: chainTokensList.chainId=${chainTokensList.chainId}`)
          console.debug(`getChainTokensList: chainTokensList.tokens.length=${chainTokensList.tokens.length}`)
        }
        else {
          console.debug(`getChainTokensList: chainTokensList.tokens IS NULL`)
        }
      }
    } else {
      console.debug(`getChainTokensList: tokensList.chainsTokenLists IS NULL`)
    }
*/  
    // console.debug(`getChainTokensList: tokensList?.chainsTokenLists?.length=${tokensList?.chainsTokenLists?.length}`)
    if (tokensList.chainsTokenLists && tokensList.chainsTokenLists.length > 0)  {
      // console.debug(`getChainTokensList: tokensList.chainsTokenLists && tokensList.chainsTokenLists.length > 0`)

      // tokensList.chainsTokenLists.forEach( (chainTokensList:TChainTokensList) => {
      //   if (chainTokensList.chainId == chainId) {
      //     console.debug(`getChainTokensList: chainTokensList.chainId == chainId FOUND`)
      //     return chainTokensList // RETURN
      //   }
      // })

      for (const chainTokensList of tokensList.chainsTokenLists) {
        // console.log(chainTokensList);
        if (chainTokensList?.chainId == chainId) {
          // console.debug(`getChainTokensList: chainTokensList.chainId == chainId FOUND`)
          return chainTokensList // RETURN
        }
      } // if (tokensList.chainsTokenLists)


    } // if tokensList.chainsTokenLists.length > 0
    // if (tokensList.chainsTokenLists && tokensList.chainsTokenLists[chainId]) {
    //   return tokensList.chainsTokenLists[chainId]
    // }
  } catch (error) {
    console.error(`getChainTokensList: error=${error}` );
  }
  return null // RETURN
} // getChainTokensList

// ---

/**
 * DEBUG
 * @param tokensList 
 */

const displayTokensList = (tokensLists:TTokensLists):void => {
  // const start:number = Date.now()
  try {
    console.debug(`\n\n\ndisplayTokensList: START ==========================================================================\n` );
    tokensLists?.forEach( ( tokensList, index ) =>
    {
      // const startLoop:number = Date.now()
      try
      {
        // console.log('displayTokensList: tokensList=', tokensList);
        // console.debug(`\n---------------------------\n` );
        console.debug(`displayTokensList: tokensList name=${tokensList.name} id=${tokensList.id} type=${tokensList.type} description=${tokensList.description} tokensChainData?.length=${tokensList.allTokensChainData?.length} status=${tokensList.status} error=${tokensList.error} name=${tokensList.name} version=${JSON.stringify(tokensList.version)} URI=${tokensList.URI}` );
        console.debug(`displayTokensList: tokensList name=${tokensList.name} id=${tokensList.id} tokensCount=${tokensList.tokensCount} timestamp=${tokensList.timestamp} summaryURI=${tokensList.summaryURI} sha=${tokensList.sha}` );
        console.debug(`displayTokensList: tokensList chains=` );
        console.dir(tokensList.chains)
        let foundChainTokensListNotEmpty = false
        tokensList.chainsTokenLists?.forEach( (chainTokensList) => {
          foundChainTokensListNotEmpty = foundChainTokensListNotEmpty || (chainTokensList?.tokens && chainTokensList.tokens.length > 0?true:false)
        })
        if (!foundChainTokensListNotEmpty) {
        console.debug(`displayTokensList: tokensList chainsTokenLists=` );
        console.dir(tokensList.chainsTokenLists)
        }
        tokensList.chainsTokenLists?.forEach( (chainTokensList) => {
          console.debug(`displayTokensList: chainTokensList chainId=${chainTokensList?.chainId} tokensCount=${chainTokensList?.tokensCount} chainTokensList.tokens?.length=${chainTokensList?.tokens?.length}` );
        })
        console.debug(`\n---------------------------\n` );

      } // try
      catch (error)
      {
        console.error(`displayTokensList: (loop=${index}) error=${error}` );
        return {
          ...tokensList,
          status: 'notFound' as TTokensListStatus,
          error: "Error fetching tokens list" // TODO: i18n error.message
        }
      } // catch fetch tokens list
      finally {
        // var elapsedLoop = Date.now() - startLoop
        // console.debug(`displayTokensList: (loop=${index}) elapsedLoop=${elapsedLoop} DONE` );
      }
    }) // tokensLists?.forEach

  } catch (error) {
    console.error(`displayTokensList: error=${error}` );
  }
  finally {
    // const elapsed = Date.now() - start
    // console.debug(`displayTokensList: elapsed=${elapsed} DONE` );
    console.debug(`\n\n\ndisplayTokensList: DONE ==========================================================================\n` );
  }
} // displayTokensList

// ---

// const getTokensLists_TokenData_Stripped = async(tokensLists:TTokensLists):Promise<TTokensLists> => {
const getTokensLists_TokenData_Stripped = (tokensLists:TTokensLists):TTokensLists => {
    // const start:number = Date.now()
  try {
    // const tokensListsStrippedPromises = tokensLists?.map( async ( tokensList ) =>
    const tokensListsStripped = tokensLists?.map( ( tokensList ) =>
    {
      const chainsTokenListsStripped = tokensList.chainsTokenLists?.map( (chainTokensList) => {
        return {
          tokensListId: chainTokensList?.tokensListId,
          chainId: chainTokensList?.chainId,
          tokensCount: chainTokensList?.tokensCount,
          tokens: null,
          tokensInstances: null,
          loadState: EChainTokensListLoadState.notLoaded,
        } // as TChainTokensList
      })
      const tokensListStripped = {
        id: tokensList.id,
        name: tokensList.name,
        description: tokensList.description,
        type: tokensList.type,

        status: tokensList.status,
        error: tokensList.error,

        URI: tokensList.URI,
        summaryURI: tokensList.summaryURI,
        logoURI: tokensList.logoURI,
        sha: tokensList.sha,
        timestamp: tokensList.timestamp,
        version: tokensList.version,

        tokensCount: tokensList.tokensCount,
        chains: tokensList.chains,
        // tokens: null,
        allTokensChainData: null,
        chainsTokenLists: chainsTokenListsStripped,
      } as TTokensList

      // console.log('getTokensLists_TokenData_Stripped: tokensList=', tokensList);
      // console.log('getTokensLists_TokenData_Stripped: tokensListStripped=', tokensListStripped);
      return tokensListStripped
    }) // tokensLists?.map

    // if (tokensListsStrippedPromises)  {
    //   const tokensListsStripped = await Promise.all(tokensListsStrippedPromises as Promise<TTokensList>[]);
    //   return tokensListsStripped
    // } // if (tokensListsStrippedPromises)
    return tokensListsStripped
  } catch (error) {
    console.error(`getTokensLists_TokenData_Stripped: error=${error}` );
  }
  finally {
    // const elapsed = Date.now() - start
    // console.debug(`getTokensLists_TokenData_Stripped: elapsed=${elapsed} DONE` );
    console.debug(`getTokensLists_TokenData_Stripped: DONE` );
  }
} // getTokensLists_TokenData_Stripped


// ----------------------------------------------

export { getTokensLists_TokenData, getTokensLists_TokenData_Stripped, getChainTokensList, displayTokensList }