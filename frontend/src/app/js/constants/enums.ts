
export enum EChainTokensListLoadState {
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

export enum EStepsLoadTokensData {
  contracts = 0,
  sourceBalances = 1,
  sourceTransferAbility = 2,
  decimals = 3,
  names = 4,
  symbols = 5,
  targetBalances = 6,
  targetTransferAbility = 7,
}

export enum ESteps {
  tokenLists = 0,
  targetAddress = 1,
  tokensToMigrate = 2,
  migration = 3,
}

export enum ETokenTransferState {
  none = -1, // not processed yet
  
  processing = 0, // pending processing
  processed = 1, // success
  skipped = 2, // skipped by user
  error = 3, // error during processing

  previous_processed = processed + 10, // previous success
  previous_skipped = skipped + 10, // previous skipped by user
  previous_error = error + 10, // previous error during processing
}