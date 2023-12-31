// Tokens Lists

// Coingecko 
// Ethereum Mainnet
const TOKENS_LIST__COINGECKO__ETHEREUM = 'https://tokens.coingecko.com/ethereum/all.json'
// Gnosis (xDAI)
const TOKENS_LIST__COINGECKO__GNOSIS = 'https://tokens.coingecko.com/xdai/all.json'


// RealT API
// BASE URL
const DEFAULT_API__REALT_PUBLIC__BASE_URL='https://api.realt.community/'
// Tokens
const DEFAULT_API__REALT_PUBLIC__LIST_ALL_TOKENS='v1/token'
// Logo
const DEFAULT_TOKENS_LIST_REALT_API_LOGO = 'realtlogo-list-alpha.webp'

const DEFAULT_TOKENS_LIST_COINGECKO_LOGO = 'https://avatars.githubusercontent.com/u/7111837'

const API__REALT_PUBLIC__BASE_URL = import.meta.env.PUBLIC_REALT_API_BASE_URL || DEFAULT_API__REALT_PUBLIC__BASE_URL
const API__REALT_PUBLIC__LIST_ALL_TOKENS = import.meta.env.PUBLIC_REALT_API_LIST_ALL_TOKENS || DEFAULT_API__REALT_PUBLIC__LIST_ALL_TOKENS

const TOKENS_LIST_REALT_API_LOGO = import.meta.env.PUBLIC_REALT_API_LOGO || DEFAULT_TOKENS_LIST_REALT_API_LOGO



// Tokenlistooor
// const TOKENS_LIST__TOKENLISTOOOR = 'https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/tokenlistooor.json'
// const META_TOKENS_LIST__TOKENLISTOOOR =  'https://api.github.com/repos/migratooor/tokenlists/commits?sha=main&per_page=1'
// `https://raw.githubusercontent.com/Migratooor/tokenLists/${sha}/lists/summary.json`

// 1inch
// const TOKENS_LIST__1INCH = 'https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/1inch.json'


const TOKENS_LISTS_SOURCES: TTokensLists = [
  {
    id: 'cgEth',
    name: 'Ethereum tokens',
    description: "Coingecko Ethereum",
    timestamp: null,
    source: 'Coingecko',
    type: 'URI',
    chains: [1],
    URI: TOKENS_LIST__COINGECKO__ETHEREUM,
    status: 'notLoaded',
    logoURI: DEFAULT_TOKENS_LIST_COINGECKO_LOGO,
  },
  {
    id: 'cgGnosis',
    name: 'Coingecko',
    description: "Coingecko Gnosis (xDAI)",
    timestamp: null,
    source: 'Coingecko',
    type: 'URI',
    chains: [100],
    URI: TOKENS_LIST__COINGECKO__GNOSIS,
    status: 'notLoaded',
    logoURI: DEFAULT_TOKENS_LIST_COINGECKO_LOGO,
  },
  {
    id: 'realtAPI',
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
    chains: [1,10, 56, 100, 137, 250, 8453, 42161, 43114],
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