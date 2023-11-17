
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
  // watchTransfers = , // TODO
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
  // watchTransfers, // TODO
}

export enum Steps {
  tokenLists = 0,
  targetAddress,
  tokensToMigrate,
  migration,
}