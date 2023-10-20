
import TOKENS_LISTS_SOURCES from '@utils/constants/tokensLists'
import { getTokensLists_TokenData } from '~/js/utils/tokensListsUtils';

// console.debug(`tokensLists.ts`)

const getTokenLists = async(tokenLists:TTokensLists) => {
  const tokensLists_TokenData = await getTokensLists_TokenData(tokenLists)
  return tokensLists_TokenData;
}

const tokenListsData = await getTokenLists(TOKENS_LISTS_SOURCES);

export { tokenListsData };