import { EChainTokensListLoadState } from "@jsconsts/enums";

/**
 * 
 * @param URI 
 * @returns 
 */
const isValidUri = async( URI:TStringNullUndef ):Promise<boolean> => {
  try {
    if (URI && URI.trim().length>0) {
      return ((await fetch(URI))?.status == 200);
    }
  }
  catch (error) {
    // error: URI not valid
  }
  return false
}

/**
 * 
 * @param fetchedTokensList_logoURI 
 * @param tokensList_logoURI 
 * @returns 
 */
const getTokenListLogoUri = async(fetchedTokensList_logoURI:TStringNullUndef, tokensList_logoURI:TStringNullUndef):Promise<TStringNullUndef> => {
  let logoUriFetched: TStringNullUndef // undefined
  try {
    if (fetchedTokensList_logoURI) {
      if (await isValidUri(fetchedTokensList_logoURI)) {
        logoUriFetched = fetchedTokensList_logoURI;
      }
    }
    if (!logoUriFetched && tokensList_logoURI)
    {
      if (await isValidUri(tokensList_logoURI)) {
        logoUriFetched = tokensList_logoURI;
      }
    }
    return logoUriFetched;
  } catch (error) {
    console.error('tokensListsUtils.ts: getTokenListLogo: error=', error);
    return logoUriFetched;
  }
}

  /**
   * 
   * @param tokensList 
   * @returns 
   */
const getTokensList_TokenDataAsTokenChainDataArray = async(tokensList: any):Promise<TTokenChainDataArray> => {
  try {
    const newTokensListPromises = tokensList?.map( async(token:any) =>
    {
      try {
        const {chainId, address, name, symbol, decimals} = token
        const tokenChainData = {
          chainId, address,
          basicData: {
            name, symbol, decimals: (decimals?decimals:18),
          },
          extraData: {
            type: 'ERC20',
          } as TTokenExtraData,
          contract: null,
        }
        return tokenChainData as TTokenChainData
      } catch (error) {
        console.error('tokensListsUtils.ts: getAsTokensList_TokenData: error=', error);
      }
    })

    if (newTokensListPromises)  {
      const newTokensList = await Promise.all(newTokensListPromises as Promise<TTokenChainData>[]);
      const newTokensListFiltered = newTokensList.filter( (tokenChainData:TTokenChainData) => tokenChainData!=null )
      return newTokensListFiltered as TTokenChainDataArray
    }
  } catch (error) {
    console.error('tokensListsUtils.ts: getAsTokensList_TokenData: error=', error);
  }
}

/**
 * Build an array of chain ids from a TTokenChainDataArray
 * @param tokenChainDataArray 
 * @returns TChainIdArray
 */
const getChainArray_from_tokensChainDataArray = (tokenChainDataArray: TTokenChainDataArray):TChainIdArray => {
    try
  {
    const tokensListChainIds: TChainIdArray = []
    tokenChainDataArray?.forEach( (tokenChainData:TTokenChainData) => {
      if (tokenChainData && tokenChainData.chainId && !tokensListChainIds.includes(tokenChainData.chainId)) {
        tokensListChainIds.push(tokenChainData.chainId)
      }
    })
    return tokensListChainIds
  } catch (error) {
    console.error('tokensListsUtils.ts: getChainArray_from_tokensChainDataArray: error=', error);
  }
}

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
        })
      }
    })
    return tokensListChainIds
  } catch (error) {
    console.error('tokensListsUtils.ts: getChainArray_from_tokensChainDataArray: error=', error);
  }
}

/*
* Get ChainData array from tokens lists
* sends back an TTokenChainDataArray from TTokensList array
* for use with a META-URI list
*/
const getTokenChainDataArray_from_tokensLists = (tokensLists: TTokensLists):TTokenChainDataArray => {
  try
  {
    const tokenChainDataArray: TTokenChainDataArray = []
    tokensLists?.forEach( (tokensList:TTokensList) => {
      const { allTokensChainData } = tokensList
      if (allTokensChainData && allTokensChainData.length>0) {
        allTokensChainData?.forEach( (tokenChainData_curr:TTokenChainData) => {
          if (tokenChainData_curr) {
            tokenChainDataArray.push(tokenChainData_curr)
          }
        })
      }
    })
    return tokenChainDataArray
  } catch (error) {
    console.error('getTokenChainDataArray_from_tokensLists: error=', error);
  }
}

/**
 * 
 * @param tokensList 
 * @param fetchTokensListUri_json 
 * @param index 
 * @returns 
 */
const getTokensList_TokenData_fromJsonTokensList = async(tokensList: TTokensList, fetchTokensListUri_json:any,  index:number):Promise<TTokensList>  => {
  try {
    const initialId = tokensList.id
    const {source, type, URI} = tokensList;
    const nameFetched = fetchTokensListUri_json.name||tokensList.name;
    const descriptionFetched = fetchTokensListUri_json.description||tokensList.description;
    const timestampFetched = fetchTokensListUri_json.timestamp||tokensList.timestamp||Date.now();
    const keywordsFetched = fetchTokensListUri_json.keywords;
    const versionFetched = fetchTokensListUri_json.version;
    const logoURI = await getTokenListLogoUri(fetchTokensListUri_json.logoURI, tokensList.logoURI);
    const tokensList_TokenData = await getTokensList_TokenDataAsTokenChainDataArray(fetchTokensListUri_json.tokens)
    const chainsFromTokens = getChainArray_from_tokensChainDataArray(tokensList_TokenData)
    const tokenCountSum = tokensList_TokenData?tokensList_TokenData.length:0
    const id = `${initialId}${index>0?'-'+index+'-':''}[${chainsFromTokens}]-${timestampFetched}`
    const chainsTokenLists = await getChainsTokenListsArray(tokensList_TokenData, chainsFromTokens, id)
    const status = (tokensList_TokenData && tokensList_TokenData?.length>0 ? 'ok' as TTokensListStatus : 'loadedError' as TTokensListStatus)
    const error = (tokensList_TokenData && tokensList_TokenData?.length>0 ? null : "Error parsing tokens" )// TODO: i18n error.message
    return {
      id,
      name: nameFetched,
      description: descriptionFetched,
      version : versionFetched,
      timestamp: timestampFetched,
      keywords: keywordsFetched,
      source,
      type,
      tokensCount: tokenCountSum,
      URI,
      chains: chainsFromTokens,
      status,
      error,
      logoURI,
      allTokensChainData: tokensList_TokenData,
      chainsTokenLists
    }
  }
  catch (error) {
    return {...tokensList, status: 'loadedError' as TTokensListStatus, error: "Error parsing list"} // TODO: i18n error.message
  }
}

/**
 * 
 * @param tokensList 
 * @param index 
 * @returns 
 */
const getTokensList_TokenData_fromUri = async(tokensList: TTokensList, index:number):Promise<TTokensList>  => {
  try {
    if (tokensList.type.toUpperCase() == "URI" && tokensList.URI)
    {
      const fetchTokensListUri_res:Response = await fetch(tokensList.URI);
      const fetchTokensListUri_json = await fetchTokensListUri_res.json()
      const timestampFetched = fetchTokensListUri_json.timestamp;
      if (tokensList.status == 'ok' && timestampFetched == tokensList.timestamp) {
        return tokensList // up-to-date: RETURN
      }
      return await getTokensList_TokenData_fromJsonTokensList(tokensList, fetchTokensListUri_json, index)
    }
    console.warn(`getTokensList_TokenData_fromUri: not an URI list: tokensList.type=${tokensList.type} tokensList.URI=${tokensList.URI}` )
    return {...tokensList, status: 'unprocessed' as TTokensListStatus, error: "Error unprocessed"} // TODO: i18n error.message
  }
  catch (error)
  {
    return {...tokensList, status: 'notFound' as TTokensListStatus, error: "Error fetching tokens list"} // TODO: i18n error.message
  }
}

/**
 * 
 * @param URI 
 * @returns 
 */
const getMetaTokensListUriCommitFromTokensListURI = async (URI:TTokenListUri):Promise<TMetaTokensListUriCommit|undefined> => {
  try {
    if (URI) {
      const res = await fetch(URI)
      const json = await res.json()
      const sha = json && json[0] && json[0].sha
      return {sha}
    }
  } catch (error) {
    console.error(`getMetaTokensListUriCommitFromTokensListURI: error=${error}` );
  }
}

/**
 * 
 * @param URI 
 * @param summaryURI 
 * @returns 
 */
const getMetaTokensListUriFromTokensListMetaURI = async (URI:TTokenListUri, summaryURI:TTokenListUri):Promise<TMetaTokensListUri|undefined> => {
  try {
    if (URI && summaryURI) {
      const metaTokensListUriCommit = await getMetaTokensListUriCommitFromTokensListURI(URI)
      if (metaTokensListUriCommit) {
        const {sha} = metaTokensListUriCommit
        const metaListURI = summaryURI.replace(/!SHA!/g, sha)
        return { URI: metaListURI, sha }
      }
    }
  } catch (error) {
    console.error(`getMetaTokensListUriFromTokensListMetaURI: error=${error}` );
  }
}

/**
 * 
 * @param tokensList 
 * @param index 
 * @returns 
 */
const getTokensList_TokenData_fromMetaUri = async(tokensList: TTokensList, index:number):Promise<TTokensList>  => {
  try {
    if (tokensList.type.toUpperCase() == "META-URI" && tokensList.URI && tokensList.summaryURI) {
      const initialId = tokensList.id
      const {source, type, URI, summaryURI} = tokensList;
      const metaTokensListUri = await getMetaTokensListUriFromTokensListMetaURI(URI, summaryURI)
      if (metaTokensListUri) {
        const {URI:metaListURI, sha} = metaTokensListUri
        if (sha == tokensList.sha && tokensList.status == 'ok') {
          return tokensList // up-to-date: RETURN
        }
        if (metaListURI) {
          const fetchTokensMetaListUri_res:Response = await fetch(metaListURI);
          const fetchTokensMetaListUri_json = await fetchTokensMetaListUri_res.json()
          const nameFetched = fetchTokensMetaListUri_json.name||tokensList.name;
          const descriptionFetched = fetchTokensMetaListUri_json.description||tokensList.description;
          const timestampFetched = fetchTokensMetaListUri_json.timestamp
          const keywordsFetched = fetchTokensMetaListUri_json.keywords;
          const versionFetched = fetchTokensMetaListUri_json.version;
          if (timestampFetched) {
            if (timestampFetched == tokensList.timestamp) {
              return tokensList // up-to-date: RETURN
            }
          } else {
            console.warn(`getTokensList_TokenData_fromMetaUri: NO timestampFetched  tokensList.URI=${tokensList.URI} metaListURI=${metaListURI}` );
          }
          const logoURI = await getTokenListLogoUri(fetchTokensMetaListUri_json.logoURI, tokensList.logoURI);
          let chainsFromAllTokensListsTokens:TChainIdArray = []
          const tokensLists = await getTokensList_TokenData_FromJsonLists(fetchTokensMetaListUri_json.lists)
          if (tokensLists && tokensLists.length > 0) {
            chainsFromAllTokensListsTokens = getChainArray_from_tokensLists(tokensLists)
          }
          let allTokensChainData:TTokenChainDataArray = []
          allTokensChainData = getTokenChainDataArray_from_tokensLists(tokensLists)
          const tokenCountSum:number = allTokensChainData?allTokensChainData.length:0
          const listsCount = fetchTokensMetaListUri_json.lists?fetchTokensMetaListUri_json.lists.length:0
          const id = `${initialId}${index>0?'-'+index+'-':''}[${chainsFromAllTokensListsTokens}]-${timestampFetched}`
          const chainsTokenLists = await getChainsTokenListsArray(allTokensChainData, chainsFromAllTokensListsTokens, id)
          const status = (tokenCountSum ? 'ok' as TTokensListStatus : 'loadedError' as TTokensListStatus)
          const error = (tokenCountSum ? null : "Error parsing meta-uri tokens" )// TODO: i18n error.message
          return {
            id,
            name: nameFetched,
            description: descriptionFetched,
            version : versionFetched,
            timestamp: timestampFetched,
            sha,
            keywords: keywordsFetched,
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
            allTokensChainData: null,
            listsCount
          }
        }
        console.warn(`getTokensList_TokenData_fromMetaUri: metaListURI empty: tokensList.type=${tokensList.type} tokensList.URI=${tokensList.URI} tokensList.summaryURI=${tokensList.summaryURI}` )
      }
      console.warn(`getTokensList_TokenData_fromMetaUri: metaTokenListUri empty: tokensList.type=${tokensList.type} tokensList.URI=${tokensList.URI} tokensList.summaryURI=${tokensList.summaryURI}` )
    }
    console.warn(`getTokensList_TokenData_fromMetaUri: not an META-URI list: tokensList.type=${tokensList.type} tokensList.URI=${tokensList.URI} tokensList.summaryURI=${tokensList.summaryURI}` )
    return {...tokensList, status: 'unprocessed' as TTokensListStatus, error: "Error unprocessed"} // RETURN ERROR  // TODO: i18n error.message
  }
  catch (error) {
    return {...tokensList, status: 'notFound' as TTokensListStatus, error: "Error fetching tokens list"} // RETURN ERROR  // TODO: i18n error.message
  }
}

/**
 * 
 * @param tokensLists 
 * @returns 
 */
const getTokensLists_TokenData = async(tokensLists: TTokensLists):Promise<TTokensLists>  => {
  try {
    const tokensListsPromises:Promise<TTokensList>[] | undefined = tokensLists?.map( async( tokensList, index ) =>
    {
      try
      {
        const tokensListType = tokensList.type.toUpperCase()
        if (tokensListType == "URI" && tokensList.URI)
          return getTokensList_TokenData_fromUri(tokensList, index)
        else if (tokensListType == "API" && tokensList.URI)
          return getTokensList_TokenData_fromApi(tokensList, index)
        else if (tokensListType == "META-URI" && tokensList.URI)
          return getTokensList_TokenData_fromMetaUri(tokensList, index)
        else {
          // Catch-all
          console.warn(`getTokensLists_TokenData: unsupported tokensListType="${tokensListType}" `);
          console.dir(tokensList);
          return {...tokensList, status: 'unsupported' as TTokensListStatus}
        }
      } catch (error) {
        console.error(`getTokensLists_TokenData: (loop=${index}) error=${error}` );
        return {...tokensList, status: 'notFound' as TTokensListStatus, error: "Error fetching tokens list"} // TODO: i18n error.message
      }
    })
    if (tokensListsPromises)  {
      const tokensListsResolved = await Promise.all(tokensListsPromises as Promise<TTokensList>[]);
      const tokensLists = tokensListsResolved.map( (tokensList:TTokensList) => {
        tokensList.allTokensChainData = null
        return tokensList;
      })
      return tokensLists
    }
  } catch (error) {
    console.error(`getTokensLists_TokenData: error=${error}` );
  }
}


/*
* @param: tokensListsJson: any (array of tokens list in JSON format)
* @return: TTokensLists (array of tokens list with token data)
*/
const getTokensList_TokenData_FromJsonLists = async(tokensListsJson: any):Promise<TTokensLists>  => {
  try {
    // create URI lists from JSON lists
    const uriTokensLists:TTokensList[] | undefined = tokensListsJson?.map( ( tokensList:any, ) =>
    {
      return {...tokensList, type: "URI"}
    })
    if (uriTokensLists)  {
      const tokensListsPromises = uriTokensLists.map( async (tokensList:TTokensList, index:number) => {
        const tokensList_TokenData = await getTokensList_TokenData_fromUri(tokensList, index)
        return tokensList_TokenData
      })
      const tokensLists = await Promise.all(tokensListsPromises as Promise<TTokensList>[]);
      return tokensLists

    }
  } catch (error) {
    console.debug(`getTokensList_FromJsonLists: error=${error}` );
  }
}

/**
 * 
 * @param tokensList 
 * @param index 
 * @returns 
 */
const getTokensList_TokenData_fromApi = async(tokensList: TTokensList, index:number):Promise<TTokensList>  => {
  try
  {
    if (tokensList.type.toUpperCase() == "API" && tokensList.URI)
    {
      const fetchTokensListUri_res:Response = await fetch(tokensList.URI);
      if (fetchTokensListUri_res.status != 200) {
        console.warn(`getTokensList_TokenData_fromApi: tokensList.id=${tokensList.id} tokensList.URI=${tokensList.URI} fetchTokensListUri_res.status=${fetchTokensListUri_res.status}` )
        return {...tokensList, status: 'notFound' as TTokensListStatus, error: "Error fetching tokens list"} // TODO: i18n error.message
      }
      const text = await fetchTokensListUri_res.text()
      const fetchLen = text.length
      if (tokensList.fetchLen == fetchLen && tokensList.status == 'ok') {
        return tokensList
      }
      const fetchTokensListUri_json = JSON.parse(text)
      const tokensListUpdatedWithTokenData: TTokensList = await getTokensList_TokenData_fromJsonAPI(tokensList, fetchTokensListUri_json, index)
      const tokensListUpdated = {...tokensListUpdatedWithTokenData, fetchLen}
      return tokensListUpdated
    }
    console.warn(`getTokensList_TokenData_fromApi: not an API list: tokensList.type=${tokensList.type} tokensList.URI=${tokensList.URI}` )
    return {...tokensList, status: 'unprocessed' as TTokensListStatus, error: "Error unprocessed"} // TODO: i18n error.message
  }
  catch (error) {
    return {...tokensList, status: 'notFound' as TTokensListStatus, error: "Error fetching tokens list"} // TODO: i18n error.message
  }
}

/**
 * 
 * @param tokensList 
 * @param fetchTokensListUri_json 
 * @param index 
 * @returns 
 */
const getTokensList_TokenData_fromJsonAPI = async(tokensList: TTokensList, fetchTokensListUri_json:any,  index:number):Promise<TTokensList>  => {
  try
  {
    if (fetchTokensListUri_json) {
      const initialId = tokensList.id
      const timestamp = tokensList.timestamp||Date.now()/1_000;

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
        }
      })

      const tokensListPromisesGno:Promise<TTokenChainData>[] | undefined = fetchTokensListUri_json?.map( async( realTokenReferenceData:TRealTokenReferenceData ) =>
      {
        const { shortName, symbol, xDaiContract, gnosisContract} = realTokenReferenceData
        if (!xDaiContract && !gnosisContract) return null
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
        }
      })
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
        allTokensChainData: null,
        chainsTokenLists,
        tokensCount: tokenCountSum,
        timestamp,
        id,
        status: 'ok' as TTokensListStatus,
        error: null
      }
    }
    return {...tokensList, status: 'loadedError' as TTokensListStatus, error: "Error parsing list"} // TODO: i18n error.message
  }
  catch (error)
  {
    return {...tokensList, status: 'loadedError' as TTokensListStatus, error: "Error parsing list"} // RETURN // TODO: i18n error.message
  }
}

/**
 * 
 * @param tokens 
 * @param chainId 
 * @returns 
 */
const filterTokensListByChain = (tokens:TTokenChainDataArray, chainId:TChainIdNullUndef):TTokenChainDataArray  =>
{
  try {
    const tokensChainDataArray:TTokenChainDataArray = tokens?.map( (tokenChainData:TTokenChainData) => {
      if (tokenChainData?.chainId == chainId) {
        return tokenChainData
      }
    })
    if (tokensChainDataArray) {
      const tFiltered = tokensChainDataArray?.filter( (tokenChainData:TTokenChainData) => tokenChainData!=null )
      return tFiltered
    }
    return null
  } catch (error) {
    console.error(`filterTokensListByChain: error=${error}` );
  }
}

/**
 * 
 * @param tokens 
 * @param chains 
 * @param _tokensListId 
 * @returns 
 */
const getChainsTokenListsArray = async(tokens: TTokenChainDataArray, chains: TChainIdArray, _tokensListId:TTokensListId):Promise<TChainsTokensListArrayNullUndef>  =>
{
  try {
    if (!tokens) {
      console.warn(`getChainsTokenListsArray: !tokens` )
    }
    const chainTokensLists = chains?.map( (chainId:TChainId) => {
      const filteredTokenChainDataArray = filterTokensListByChain(tokens, chainId)
      return {
        tokensListId: _tokensListId,
        chainId,
        tokens: filteredTokenChainDataArray,
        tokensCount: (filteredTokenChainDataArray?filteredTokenChainDataArray.length:0),
        tokensInstances: null,
        loadState: EChainTokensListLoadState.notLoaded,
      }
    })
    if (chainTokensLists)  {
      const chainTokensListArray:TChainTokensList[] = []
      chainTokensLists.forEach( (chainTokensList:TChainTokensList) => {
        if (chainTokensList.tokens && chainTokensList.tokens.length > 0) {
          chainTokensListArray.push(chainTokensList)
        }
      })
      return chainTokensListArray
    }
    return null
  } catch (error) {
    console.error(`getChainsTokenListsArray: error=${error}` );
  }
}

/**
 * 
 * @param tokensList 
 * @param chainId 
 * @returns 
 */
const getChainTokensList = (tokensList:TTokensList, chainId:TChainId):TChainTokensListNullUndef  => {
  try {
    if (tokensList.chainsTokenLists && tokensList.chainsTokenLists.length > 0)  {
      for (const chainTokensList of tokensList.chainsTokenLists) {
        if (chainTokensList?.chainId == chainId) {
          return chainTokensList
        }
      }
    }
  } catch (error) {
    console.error(`getChainTokensList: error=${error}` );
  }
  return null
}

/**
 * displayTokensList (DEBUG)
 * @param tokensList 
 */
/*
const displayTokensList = (tokensLists:TTokensLists):void => {
  try {
    console.debug(`\n\n\ndisplayTokensList: START ==========================================================================\n` );
    tokensLists?.forEach( ( tokensList, index ) =>
    {
      try {
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
      }
      catch (error)
      {
        console.error(`displayTokensList: (loop=${index}) error=${error}` );
        return {...tokensList, status: 'notFound' as TTokensListStatus, error: "Error fetching tokens list"} // TODO: i18n error.message
      }
    })
  } catch (error) {
    console.error(`displayTokensList: error=${error}` );
  }
  finally {
    console.debug(`\n\n\ndisplayTokensList: DONE ==========================================================================\n` );
  }
}
*/
export {getTokensLists_TokenData, getChainTokensList}