
import TOKENS_LISTS_SOURCES from '@jsconsts/tokensListsSource'
import { getTokensLists_TokenData } from '@jsutils/tokensListsUtils';

// Top-level await is not available in the configured target environment
export async function getTokenLists() {
  return await getTokensLists_TokenData(TOKENS_LISTS_SOURCES)
}