// Tokens Lists

// Coingecko 
// Ethereum Mainnet
// const TOKENS_LIST__COINGECKO__ETHEREUM = 'https://tokens.coingecko.com/ethereum/all.json'
// Gnosis (xDAI)
// const TOKENS_LIST__COINGECKO__GNOSIS = 'https://tokens.coingecko.com/xdai/all.json'

// RealT API
// BASE URL
const API__REALT_PUBLIC__BASE_URL='https://api.realt.community/'
// Tokens
const API__REALT_PUBLIC__LIST_ALL_TOKENS='v1/token'
const TOKENS_LIST_REALT_API_LOGO = 'https://yt3.googleusercontent.com/ytc/AOPolaQLI9Vbm8mEvFilGnLm0wcbiKNF6RQxkKXJt9n5=s176-c-k-c0x00ffffff-no-rj'

// Tokenlistooor Token List
// const TOKENS_LIST__TOKENLISTOOOR = 'https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/tokenlistooor.json'

// const TOKENS_LIST__1INCH = 'https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/1inch.json'


// const META_TOKENS_LIST__TOKENLISTOOOR =  'https://api.github.com/repos/migratooor/tokenlists/commits?sha=main&per_page=1'
// `https://raw.githubusercontent.com/Migratooor/tokenLists/${sha}/lists/summary.json`


const TOKENS_LISTS_SOURCES: TTokensLists = [
  /* 
  {
    // Intentionnaly broken list
    id: '0',
    name: 'Coin list error test',
    description: null,
    timestamp: null,
    source: 'source url error',
    type: 'URI',
    chains: [1],
    URI: TOKENS_LIST__COINGECKO__GNOSIS+'zfkzêk^',
    status: 'notLoaded',
    logoURI: undefined,
  },
  {
    id: '1',
    name: 'Ethereum tokens',
    description: null,
    timestamp: null,
    source: 'Coingecko',
    type: 'URI',
    chains: [1],
    URI: TOKENS_LIST__COINGECKO__ETHEREUM,
    status: 'notLoaded',
    logoURI: undefined,
  },
  {
    id: '2',
    name: 'Coingecko',
    description: "Coingecko Gnosis (xDAI)",
    timestamp: null,
    source: 'Coingecko',
    type: 'URI',
    chains: [1],
    URI: TOKENS_LIST__COINGECKO__GNOSIS, // test: mismatch between chaind id (1) and file content (100)
    status: 'notLoaded',
    logoURI: undefined,
  },
  */

  {
    id: '3',
    name: 'RealT',
    description: "RealT API",
    timestamp: null,
    source: 'RealT API',
    type: 'API',
    chains: [1,100],
    URI: `${API__REALT_PUBLIC__BASE_URL}${API__REALT_PUBLIC__LIST_ALL_TOKENS}`,
    status: 'notLoaded',
    logoURI: TOKENS_LIST_REALT_API_LOGO,
  },
/* 
  {
    id: '4',
    name: 'Tokenlistooor',
    description: "Tokenlistooor Token List",
    timestamp: null,
    source: 'Tokenlistooor',
    type: 'URI',
    chains: [1,10, 56, 100,137,250,8453,42161,43114],
    URI: TOKENS_LIST__TOKENLISTOOOR,
    status: 'notLoaded',
    logoURI: null,
  },

  {
    id: '5',
    name: '1inch Token List',
    description: "SmolDapp|1inch Token List",
    timestamp: null,
    source: 'SmolDapp|1inch',
    type: 'URI',
    chains: [1,10,56,100,137,250,42161,43114],
    URI: TOKENS_LIST__1INCH,
    status: 'notLoaded',
    logoURI: null,
  },

  {
    id: '6',
    name: 'SmolDapp Meta Token List',
    description: "SmolDapp Meta Token List",
    timestamp: null,
    source: 'SmolDapp|Github',
    type: 'META-URI',
    chains: [],
    URI: META_TOKENS_LIST__TOKENLISTOOOR,
    summaryURI: 'https://raw.githubusercontent.com/Migratooor/tokenLists/!SHA!/lists/summary.json',
    status: 'notLoaded',
    logoURI: null,
  },
 */
]

export default TOKENS_LISTS_SOURCES;