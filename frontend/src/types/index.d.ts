// --------------------------------------------------------------
// Enums defined in frontend/src/app/js/constants/enums.ts
// >---------------------------------------------------------------
enum EChainTokensListLoadState {
  notLoaded = 0,
  contracts = 1,
  sourceBalances = 2,
  sourceTransferAbility = 3,
  decimals = 4,
  names = 5,
  symbols = 6,
  targetBalances = 7,
  targetTransferAbility = 8,
}

enum ETokenTransferState {
  none = -1, // not processed yet
  
  processing = 0, // pending processing
  processed = 1, // success
  skipped = 2, // skipped by user
  error = 3, // error during processing

  previous_processed = processed + 10, // previous success
  previous_skipped = skipped + 10, // previous skipped by user
  previous_error = error + 10, // previous error during processing
}

// <--------------------------------------------------------------
// Enums defined in frontend/src/app/js/constants/enums.ts
// --------------------------------------------------------------

// Types & Interfaces

type TAvatarComponent = any;
type TAvatarImgUri = string|undefined;
type TAvatarSvg = any;

interface iLanguage {
  key: string;
  name: string;
  flagCountryCode: string; // corresponding country-flag-icons library code (https://www.npmjs.com/package/country-flag-icons , https://gitlab.com/catamphetamine/country-flag-icons#readme)
}

interface iFlagIconProps {
  flagIconCountryCode: string;
}

type TUUID = string;
type TAddressString = `0x${string}` ;
type TAddressStringNullUndef = TAddressString | TNullUndef ;
type TAddressStringEmpty = TAddressString | "" ;
type TAddressStringEmptyNullUndef = TAddressStringNullUndef | "" ;
type TAddressStringUndef = TAddressString | undefined ;
type TTxHash = TAddressString;

type TTokenContractAddress = TAddressString;
type TTokenContractAddressNullUndef = TTokenContractAddress | TNullUndef ;

type TTokenContractNullableAddress = TokenContractAddress|null;



type TGlobalAppContext = {
  globalAppData: TGlobalAppDataContext,
  globalAppDataHandlers:TGlobalAppDataHandlersContext,
}

type TGlobalAppDataContext = {
  language:         string,
  address:          TAddressStringUndef,
}

type TGlobalAppDataHandlersContext = {
  getLanguage: () => void,
  setLanguage: (lang:string) => void,
  getAvatarComponent: () => TAvatarComponent,
  getAddress: () => Address,
  setAddress: (address:Address) => void,
}

type TMoveTokensAppContext = {
  moveTokensAppData: TMoveTokensAppDataContext,
  moveTokensAppDataHandlers:TMoveTokensAppDataHandlersContext,
}

type TMoveTokensAppDataContext = {
    step:             number,
    minStep:          number,
    maxStep:          number,
    tokensLists: TTokensLists|null|undefined
    // language:         string,
}

type TMoveTokensAppDataHandlersContext = {
  nextStep: () => void,
  prevStep: () => void,
  resetToInitialStep: () => void,
}

// Tokens list


type TNullUndef = null|undefined;
type TStringNullUndef = string|TNullUndef;
type TTimeStamp = TStringNullUndef|number;

type TTokenName = TStringNullUndef;
type TTokenSymbol = TStringNullUndef;
type TTokenDecimals = number;
type TTokenAmount = bigint;
type TTokenSupply = number|null|undefined;


type TNullableStringArray = string[]|TNullUndef;
type TTokensListKeywords = TNullableStringArray|TNullUndef;

type TTokensLists = TTokensList[]|TNullUndef;
type TTokensListType = "URI"|"META-URI"|"API"
type TChainIdArray = TChainId[]|TNullUndef;
type TChainId = number;
type TChainIdNullUndef = TChainId|TNullUndef;

type TTokensListStatus = "notLoaded"|"notFound"|"loadedError"|"ok"|"error"|"unsupported"|"unprocessed"|TNullUndef;
type TTokensListError = TStringNullUndef;

type TTokensListId = string;

type TI18NString = string;

type TtokenCount = number;

type TTokensListVersion = {
  major: number,
  minor: number,
  patch: number,
}

type PageProps = {
  children: ReactNode
}
type TSelectableTokensLists = TSelectableTokensList[]|TNullUndef;

type TSelectableTokensList = {
  tokensList: TTokensList,
  chainId: TChainId,
  selectable: boolean,
  selected: boolean,
  currentChainTokensCount: TtokenCount,
}

type TTokensListMetaInfoGenerationMethod = string;

type TTokensListMetaInfo = {
  metadata: {
    supportedChains: TChainIdArray,
    generationMethod: TTokensListMetaInfoGenerationMethod,
  }
}

type TMetaTokensListUriCommit = {
  sha: TSha,
}

type TTokensMetaLists = TTokensMetaList[]|TNullUndef;

type TTokensMetaList = TTokensList & TTokensListMetaInfo;

type TSha = string;

type TTokensListNullUndef = TTokensList | TNullUndef;

type TTokensList = {
  id: TTokensListId,
  name: TStringNullUndef, // RealTokens, Coingecko Ethereum, Coingecko Gnosis
  description: TStringNullUndef,
  version?: TTokensListVersion,
  timestamp: TTimeStamp,
  sha?: TSha,
  fetchLen?: number,
  source?: TStringNullUndef, // Coingecko, RealT
  keywords?: TTokensListKeywords, // [ "default", "list", "cowswap" ]
  type: TTokensListType,
  tokensCount?: TtokenCount,
  chains: TChainIdArray,
  URI: TTokenListUri,
  summaryURI?: TTokenListUri,
  status: TTokensListStatus,
  error?: TTokensListError,
  logoURI?: TTokenList_TokensListImageUri,
  allTokensChainData?: TTokenChainDataArray, // for temporary data: hold all tokens for all chains before dipatching them in chainsTokenLists
  lists?: TTokensMetaLists,
  listsCount?: number,
  chainsTokenLists?: TChainsTokensListArrayNullUndef,
}

type TChainsTokensListArrayNullUndef = TChainTokensListNullUndef[]|TNullUndef;

type TChainTokensListNullUndef = TChainTokensList|TNullUndef;

type TChainTokensList = {
  tokensListId: TTokensListId,
  chainId: TChainId,
  tokensCount: TtokenCount,
  tokens: TTokenChainDataArray,
  tokensInstances: TTokensInstances,
  loadState: EChainTokensListLoadState,
}

type TMetaTokensListUri = {
  URI: TTokenListUri,
  sha: TSha,
}

type TTokenListUri = TStringNullUndef;
type TTokenList_TokensListImageUri = TStringNullUndef;
type TTokenList_TokenImageUri = TStringNullUndef;

type TTokenChainDataArray = TTokenChainData[]|TNullUndef;

type TTokenChainData = {
  chainId: TChainId;
  address: TTokenContractAddressNullUndef;
  basicData: TTokenBasicData;
  extraData: TTokenExtraData;
  contract: any; // Wagmi contract
} | TNullUndef

type TTokenBasicData = {
  name: TTokenName;
  symbol: TTokenSymbol;
  decimals: TTokenDecimals;
}

type TTokenType = "ERC20"|"COINBRIDGE"
type TTokenExtraData = {
  type: TTokenType;
  totalSupply?: TTokenSupply;
  // ...
}

type TTokensList_TokenData = TTokenList_TokenData[]|TNullUndef;

type TTokenList_TokenData = {
  chainId: TChainId,
  address: TTokenContractAddressNullUndef,
  name: TTokenName,
  symbol: TTokenSymbol,
  decimals: TTokenDecimals,
  logoURI: TTokenList_TokenImageUri
}

type TRealTokenReferenceData = {
  fullName: string,
  shortName: string,
  symbol: string,
  tokenPrice: number,
  currency: string,
  uuid: TUUID,
  ethereumContract: TTokenContractAddressNullUndef,
  xDaiContract: TTokenContractAddressNullUndef,
  gnosisContract: TTokenContractAddressNullUndef,
  lastUpdate: {
    date: LastUpdateDate,
    timezone_type: Timezone_type,
    timezone: Timezone,
  }
}

type TTokensListsLoaderStatus = "notLoaded"|"loadedError"|"ok"|"error"|TNullUndef;

type TokensListsLoaderData = {
  tokensLists: TTokensLists,
  status: TTokensListsLoaderStatus,
  error?: TI18NString
  errorDetails?: string
}

type TreactSetState_boolean = React.Dispatch<React.SetStateAction<boolean>>;

type TsetPreviousDisabled = TreactSetState_boolean;
type TsetNextDisabled = TreactSetState_boolean;


type TsetSelectableTokensLists = React.Dispatch<React.SetStateAction<TSelectableTokensLists>>;
type TsetTokensInstances = React.Dispatch<React.SetStateAction<TTokensInstances>>;
type TsettargetAddress = React.Dispatch<React.SetStateAction<TAddressStringEmpty>>


// type TTokenLoadStatus = number;

type TTokensInstances = TTokenInstance[]|TNullUndef;

type TDisplayId = number
type TSelectId = string

type TTokenTransferState = {
  processing: boolean,
  transfer: ETokenTransferState
}

type TTokenInstance = {
  chainTokensList: TChainTokensList;
  index: number;
  chainId: ChainId;
  address: TTokenContractAddress;
  type: TTokenType;
  contract: any; // Wagmi contract
  decimals: TTokenDecimals;
  name: TTokenName;
  symbol: TTokenSymbol;

  // status: TTokenLoadStatus;
  displayed: boolean;
  displayId: TDisplayId;
  selectID: TSelectId;

  selectable: boolean;
  selected: boolean;
  transferAmount: TTokenAmount;
  // transferAmount: bigint;
  // XtransferAmountLock: boolean;
  lockTransferAmount: boolean;

  // testAmount: TTokenAmount; // TODO: REMOVE <----------------- TEST ONLY

  transferState: TTokenTransferState;

  userData: TTokenInstanceUserData[]; // not an array but a dictionnary indexed by strings (adresses 0x... IN UPPERCASE)
}

type TTokenInstanceUserData = {
  balance: TTokenAmount | null
  canTransfer: boolean;
}

type TTokenInstanceIndex = {
  [key: string]: TTokenInstance;
}
type TokenID = string;

type TChecked = {
  checked: boolean;
}

interface IUpdateCheckboxStatus {
  ( id: TokenID,
    value?: TChecked,
  ) : void;
}
interface IUpdateTransferAmount {
  ( id: TokenID,
    amount: TTokenAmount,
  ) : void;
}
interface ITransferAmountLock {
  ( id: TokenID,
    value: boolean,
  ) : void;
}

type TTxResult = {
  hash: TTxHash,
  success: boolean,
  notFound: boolean,
  timeout: boolean,
  error: boolean,
  userSkipped: boolean,
  errorMessage: string,
}

interface ITF_ProgressContainer {
  previousDisabled: boolean;
  nextDisabled: boolean;
  showProgressBar: boolean;
  migrationState: TmigrationState;
}
interface IAddressInputProps {
  sourceAddress: TAddressStringNullUndef,
  targetAddress: TAddressStringEmpty,
  settargetAddress:TsettargetAddress
}

type TSetMigrationState = React.Dispatch<React.SetStateAction<TmigrationState>>

interface IStepsContainerProps {
  tokensLists: TTokensLists|null|undefined,
  chainId: TChainId
  setpreviousDisabled: TsetPreviousDisabled,
  setNextDisabled: TsetNextDisabled,
  isErrorTokensLists: boolean,
  isLoadingTokensLists : boolean,
  setShowProgressBar: TsetShowProgressBar
  setmigrationState: TSetMigrationState
  setshowActivity: TreactSetState_boolean
}

interface IStepErrorProps {
  setpreviousDisabled: TsetPreviousDisabled,
  setNextDisabled: TsetNextDisabled,
}

type TChangeSortOrderCallback = () => void;

interface IStep0Props {
  setNextDisabled: TsetNextDisabled,
  selectableTokensLists: TSelectableTokensLists,
  setselectableTokensLists: TsetSelectableTokensLists,
  accountAddress: TAddressStringNullUndef,
  targetAddress: TAddressStringEmpty,
  tokensInstances: TTokensInstances,
  chainId: ChainId;
  isLoadingTokensLists: boolean,
  isErrorTokensLists: boolean,
  isLoadingTokensInstances: boolean,
  isErrorTokensInstances: boolean,
  isUpdatingTokensInstances: boolean,
  tokensInstancesListTablePropsHandlers: ITokensInstancesListTableStatesHandlers,
}

interface IStep1Props {
  setNextDisabled: TsetNextDisabled,
  accountAddress: TAddressStringNullUndef,
  tokensInstances: TTokensInstances,
  targetAddress: TAddressStringEmpty,
  settargetAddress:TsettargetAddress
  chainId: ChainId;
  isLoadingTokensInstances: boolean,
  isErrorTokensInstances: boolean,
  isUpdatingTokensInstances: boolean,
  tokensInstancesListTablePropsHandlers: ITokensInstancesListTableStatesHandlers,
}

interface IStep2Props {
  setNextDisabled: TsetNextDisabled,
  tokensInstances: TTokensInstances,
  setShowProgressBar: TsetShowProgressBar
  accountAddress: TAddressStringNullUndef,
  targetAddress: TAddressStringEmpty,
  isLoadingTokensInstances: boolean,
  isErrorTokensInstances: boolean,
  isUpdatingTokensInstances: boolean,
  tokensInstancesListTablePropsHandlers: ITokensInstancesListTableStatesHandlers,
}

type TtransferTokens = (TTokensInstances,TAddressStringEmptyNullUndef, TAddressStringEmptyNullUndef) => void;

interface IStep3Props {
  chainId: ChainId;
  setNextDisabled: TsetNextDisabled,
  tokensInstances: TTokensInstances,
  setShowProgressBar: TsetShowProgressBar
  accountAddress: TAddressStringNullUndef,
  targetAddress: TAddressStringEmpty,
  tokensInstancesListTablePropsHandlers: ITokensInstancesListTableStatesHandlers,
  setmigrationState: TSetMigrationState,
  updateTokenOnTransferProcessed: IupdateTokenOnTransferProcessed,
  updateTokenInstanceTransferState: IupdateTokenInstanceTransferState,
}

interface IHandleSwapTokenListSelection {
  (id: string) : void;
 }

interface ITokensListsSelectProps {
  chainId: TChainId
  selectableTokensLists: TSelectableTokensLists,
  setselectableTokensLists: TsetSelectableTokensLists,
  isLoading: boolean,
  isError: boolean,
}

interface ISelectableTokensListsProps
{
  selectableTokensLists: TSelectableTokensLists,
  handleSwapTokenListSelection: IHandleSwapTokenListSelection
}

interface ISelectableTokensListProps
{
  selectableTokensList: TSelectableTokensList,
  handleSwapTokenListSelection: IHandleSwapTokenListSelection
}

type TsortOrder = number;

interface ISortOrderParams {
  displayId: TsortOrder,
  tokenName: TsortOrder,
  tokenBalance: TsortOrder,
}

type TfilterTokenInstance = (filter: ITokenInstanceListFilterStates, tokenInstance: TTokenInstance) => boolean;

interface ITokenInstanceListFilterStates {
  name: string,
  balance: string,
  balanceGt0: boolean,
  address: string,
}

type TsortTokensInstances = any;

interface ITokenListProps {
  tokensInstances: TTokensInstances,
  accountAddress: TAddressStringNullUndef,
  targetAddress: TAddressStringEmpty,
  sortTokensInstances: TsortTokensInstances,
}

interface ITokenListFilteredProps {
  tokensInstances: TTokensInstances,
  accountAddress: TAddressStringNullUndef,
  targetAddress: TAddressStringEmpty,
  enableEditable: boolean,
  tokensInstancesListTablePropsHandlers: ITokensInstancesListTableStatesHandlers,
}

interface ITokenProps {
  tokenInstance : TTokenInstance;
  accountAddress: TAddressStringNullUndef;
  updateCheckboxStatus: IUpdateCheckboxStatus|null;
  updateTransferAmount: IUpdateTransferAmount|null;
  updateTransferAmountLock: ITransferAmountLock|null;
  targetAddress: TAddressStringEmpty,
  enableEditable: boolean,
  showTransferAmountReadOnly: boolean,
}


type Tsetamount = React.Dispatch<React.SetStateAction<TTokenAmount | null>>
type TsetamountLock = TreactSetState_boolean;

interface ITokenInstanceAmountProps {
  selectable: boolean,
  readonly: boolean,
  balance: TTokenAmount,
  amount: TTokenAmount,
  setamount: Tsetamount,
  transferAmountLock: boolean,
  settransferAmountLock: TsetamountLock,

  decimals: number,
  unSelect: () => void,
}

interface IsortTokensInstancesOrdersStates {
  sortOrderTokenDisplayId: TsortOrder,
  sortOrderTokenName: TsortOrder,
  sortOrderTokenBalance: TsortOrder,
}

interface IsortTokensInstancesMethods {
  sortByTokenDisplayId: TChangeSortOrderCallback
  sortByTokenName: TChangeSortOrderCallback,
  sortByTokenBalance: TChangeSortOrderCallback,
  sortTokensInstances: TsortTokensInstances
}

interface IselectTokensInstancesMethods {
  handleCheckSelectAll: (boolean?) => void,
  handleInvertAllChecks: (boolean?) => void,
  updateCheckboxStatus: IUpdateCheckboxStatus,
  updateTransferAmount: IUpdateTransferAmount,
  updateTransferAmountLock: ITransferAmountLock;
}

interface IselectTokensInstancesStates {
  selectAll: boolean,
  selectAllVisible: boolean,
}

interface IfilterTokenInstanceMethods {
  tokenInstanceFilterParamsUpdaters: ItokenInstanceFilterParamsUpdaters,
  filterTokenInstance: IfilterTokenInstance,
}

interface ITokensInstancesListTableStatesHandlers {
  sortStates: IsortTokensInstancesOrdersStates,
  sortHandlers: IsortTokensInstancesMethods,
  selectStates: IselectTokensInstancesStates,
  updateHandlers: IselectTokensInstancesMethods,
  filterStates: ITokenInstanceListFilterStates,
  filterHandlers: IfilterTokenInstanceMethods,
}

interface ITokenInstancesMigrationListTableProps {
  tokensInstances:TTokensInstances;
  accountAddress:TAddressStringNullUndef;
  targetAddress: TAddressStringEmpty,
  tokensInstancesListTablePropsHandlers: ITokensInstancesListTableStatesHandlers
}

interface ISortIconProps {
  sortOrder: TsortOrder,
  changeSortFnCb: TChangeSortOrderCallback
}

interface IfilterTokenInstance {
  (tokenInstance: TTokenInstance) : boolean;
}

interface ItokenInstanceFilterParamsUpdaters {
  updateNameFilter: (e: React.FormEvent<HTMLInputElement>) => void,
  updateBalanceFilter: (e: React.FormEvent<HTMLInputElement>) => void,
  switchBalanceGt0Filter: () => void,
  updateAddressFilter: (e: React.FormEvent<HTMLInputElement>) => void,
  clearAllFilters: () => void,
}

interface ITokensListTableFilteredProps {
  tokensInstances:TTokensInstances;
  accountAddress:TAddressStringNullUndef;
  enableCheckboxes: boolean;
  targetAddress: TAddressStringEmpty,
  isLoadingTokensInstances: boolean,
  isErrorTokensInstances: boolean,
  isUpdatingTokensInstances: boolean,
  enableEditable: boolean,
  tokensInstancesListTablePropsHandlers: ITokensInstancesListTableStatesHandlers
}

interface ITokensInstancesListTableProps {
  tokensInstances:TTokensInstances;
  accountAddress:TAddressStringNullUndef;
  targetAddress: TAddressStringEmpty,
  isLoading: boolean,
  isError: boolean,
  tokensInstancesListTablePropsHandlers: ITokensInstancesListTableStatesHandlers
}


type TmigrationState = {
  totalItemsCount: number;
  successItemsCount: number;
  errorItemsCount: number;
  skippedItemsCount: number;
  paused: boolean;
  stopped: boolean;
}

interface ITF_TransferProgressBar {
  migrationState: TmigrationState;
}

interface iFooter {
  showActivity: boolean;
}
interface iFooterStatus {
  showActivity: boolean;
}

interface IupdateTokenOnTransferProcessed {
  ( tokenInstance: TTokenInstance,
    fromADDRESS: TAddressStringNullUndef,
    toADDRESS: TAddressStringUndef,
    delay?:number,
    processedState?: ETokenTransferState,
  ) : void;
}

interface IupdateTokenInstanceTransferState {
  (tokenInstanceAddress: TAddressString, processedState: ETokenTransferState) : void;
}

type TTokensAmountStrings = {
  long: string,
  short: string,
  shortDisplayIsZero: boolean // true if short does not contain sufficient decimals to display any value
}